import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Check, Phone, MapPin, Clock, Users, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment, getDoc, arrayRemove, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../utils/firebase';
import { calculateDistance } from '../utils/geolocation';
import SuccessModal from './SuccessModal';
import axios from 'axios';
import { Link } from 'react-router-dom'; // For navigation to the new page

export default function DonateBloodSection({ setActiveSection, userProfile, setShowAuthModal, setAuthMode, setDonations }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [bloodDrives, setBloodDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBankSelectionModal, setShowBankSelectionModal] = useState(false);
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [registeredDrives, setRegisteredDrives] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (err) => {
          console.error('Geolocation error:', err);
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  useEffect(() => {
    if (userLocation) {
      const bloodBanksQuery = query(collection(db, 'bloodBanks'));
      const unsubscribeBanks = onSnapshot(bloodBanksQuery, (snapshot) => {
        const banks = snapshot.docs.map(doc => {
          const data = doc.data();
          const coordinates = {
            latitude: data.coordinates?.latitude || userLocation.lat,
            longitude: data.coordinates?.longitude || userLocation.lng,
          };
          const distance = calculateDistance(userLocation.lat, userLocation.lng, coordinates.latitude, coordinates.longitude);
          return {
            id: doc.id,
            ...data,
            coordinates,
            distance,
            location: data.address || 'Hyderabad, Telangana', // Full address for navigation
            displayLocation: `Hyderabad, Telangana (${distance.toFixed(1)} km)`, // Simplified display
            availability: parseAvailability(data.availability),
          };
        }).filter(bank => bank.distance <= 100).sort((a, b) => a.distance - b.distance); // Sort by distance
        setBloodBanks(banks);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching blood banks:', error);
        setError('Failed to load blood banks.');
        setLoading(false);
      });

      const bloodDrivesQuery = query(
        collection(db, 'bloodDrives'),
        where('endDate', '>=', new Date().toISOString())
      );
      const unsubscribeDrives = onSnapshot(bloodDrivesQuery, (snapshot) => {
        const drives = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          registered: doc.data().registered || 0,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            doc.data().coordinates?.latitude || userLocation.lat,
            doc.data().coordinates?.longitude || userLocation.lng
          ),
        })).filter(drive => drive.distance <= 100);
        setBloodDrives(drives);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching blood drives:', error);
        setError('Failed to load blood drives.');
        setLoading(false);
      });

      if (auth.currentUser) {
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setRegisteredDrives(userData.registeredDrives?.map(drive => drive.id) || []);
          }
        }, (error) => console.error('Error fetching user data:', error));

        return () => {
          unsubscribeBanks();
          unsubscribeDrives();
          unsubscribeUser();
        };
      }

      return () => {
        unsubscribeBanks();
        unsubscribeDrives();
      };
    }
  }, [userLocation, auth.currentUser]);

  const parseAvailability = (availabilityString) => {
    // Define all possible blood groups
    const allBloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    // Initialize default availability with 0 units for all blood groups
    const availability = Object.fromEntries(allBloodGroups.map(group => [group, 0]));

    // Parse the availability string if it exists
    if (availabilityString && !availabilityString.includes('Not Available')) {
      const entries = availabilityString.split(',').map(item => {
        const [type, count] = item.trim().split(':');
        return [type.replace('Ve', ''), parseInt(count) || 0];
      });
      entries.forEach(([type, count]) => {
        if (allBloodGroups.includes(type)) {
          availability[type] = count;
        }
      });
    }

    return availability;
  };

  const handleScheduleVisit = (bank = null) => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedBank(bank);
    setShowScheduleModal(true);
  };

  const handleSubmitAppointment = async () => {
    if (!selectedBank || !appointmentDate || !appointmentTime) return;

    try {
      const currentUser = auth.currentUser;
      const dateTimeString = `${appointmentDate} ${appointmentTime}`;
      const parsedDate = new Date(dateTimeString);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date or time format');
      }

      // Add the appointment to the donationsDone collection
      const appointmentData = {
        userId: currentUser.uid,
        type: 'appointment',
        bankName: selectedBank.name,
        date: parsedDate,
        time: appointmentTime,
        location: selectedBank.location,
        status: 'upcoming',
        createdAt: serverTimestamp(),
      };
      const appointmentRef = await addDoc(collection(db, 'donationsDone'), appointmentData);

      // Update the parent component's donations state
      setDonations(prev => [...prev, {
        id: appointmentRef.id,
        type: 'appointment',
        bankName: selectedBank.name,
        date: parsedDate,
        time: appointmentTime,
        location: selectedBank.location,
      }]);

      setModalHeading('Appointment Scheduled Successfully!');
      setModalMessage(`Appointment scheduled at ${selectedBank.name} on ${appointmentDate} at ${appointmentTime}`);
      setShowSuccessModal(true);
      setShowScheduleModal(false);
      setAppointmentDate('');
      setAppointmentTime('');
      setSelectedBank(null);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setModalHeading('Error');
      setModalMessage('There was an error scheduling your appointment. Please try again.');
      setShowSuccessModal(true);
    }
  };

  const handlePreRegister = (drive) => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedDrive({
      ...drive,
      name: drive.title,
      date: drive.startDate.split('T')[0],
    });
    setShowPreRegisterModal(true);
  };

  const handleSendOTP = async () => {
    if (!mobileNumber) {
      setModalHeading('Error');
      setModalMessage('Please enter a mobile number.');
      setShowSuccessModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/send-otp`, {
        mobileNumber,
        driveId: selectedDrive.id,
      }, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
        },
      });

      if (response.data.success) {
        setModalHeading('OTP Sent!');
        setModalMessage(`OTP sent to ${mobileNumber}. Please enter the OTP to verify.`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setModalHeading('Error');
      setModalMessage('Failed to send OTP. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      setModalHeading('Error');
      setModalMessage('Please enter the OTP.');
      setShowSuccessModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/verify-otp`, {
        mobileNumber,
        otp,
        driveId: selectedDrive.id,
      }, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AUTH_TOKEN}`,
        },
      });

      if (response.data.success) {
        await handleRegisterForDrive(selectedDrive);
        setShowPreRegisterModal(false);
        setMobileNumber('');
        setOtp('');
      } else {
        setModalHeading('Error');
        setModalMessage('Invalid OTP. Please try again.');
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setModalHeading('Error');
      setModalMessage('Failed to verify OTP. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegisterForDrive = async (drive) => {
    if (!auth.currentUser || registeredDrives.includes(drive.id)) return;

    setIsProcessing(true);
    try {
      const currentUser = auth.currentUser;
      const driveRef = doc(db, 'bloodDrives', drive.id);
      await addDoc(collection(db, 'userDrives'), {
        userId: currentUser.uid,
        driveId: drive.id,
        driveName: drive.title,
        organizer: drive.organization,
        date: drive.startDate.split('T')[0],
        time: drive.time,
        location: drive.location,
        registeredAt: serverTimestamp(),
      });

      await updateDoc(driveRef, { registered: increment(1) });

      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        let drives = userSnap.data().registeredDrives || [];
        drives.push({
          id: drive.id,
          name: drive.title,
          organizer: drive.organization,
          date: drive.startDate.split('T')[0],
          time: drive.time,
          location: drive.location,
        });
        await updateDoc(userRef, { registeredDrives: drives });
      }

      setRegisteredDrives(prev => [...prev, drive.id]);
      setDonations(prev => [...prev, {
        id: `drive-${Date.now()}`,
        type: 'drive',
        driveName: drive.title,
        date: drive.startDate.split('T')[0],
        time: drive.time,
        location: drive.location,
      }]);
      setModalHeading('Registration Successful!');
      setModalMessage(`Successfully registered for ${drive.title} on ${drive.startDate.split('T')[0]}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error registering for drive:", error);
      setModalHeading('Error');
      setModalMessage('There was an error registering for this blood drive. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnregisterForDrive = async (drive) => {
    if (!auth.currentUser || !registeredDrives.includes(drive.id)) return;

    setIsProcessing(true);
    try {
      const currentUser = auth.currentUser;
      const driveRef = doc(db, 'bloodDrives', drive.id);
      await updateDoc(driveRef, { registered: increment(-1) });

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        registeredDrives: arrayRemove({
          id: drive.id,
          name: drive.title,
          organizer: drive.organization,
          date: drive.startDate.split('T')[0],
          time: drive.time,
          location: drive.location,
        }),
      });

      setRegisteredDrives(prev => prev.filter(id => id !== drive.id));
      setDonations(prev => prev.filter(d => d.type !== 'drive' || d.driveName !== drive.title));
      setModalHeading('Unregistration Successful!');
      setModalMessage(`Successfully unregistered from ${drive.title} on ${drive.startDate.split('T')[0]}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error unregistering from drive:", error);
      setModalHeading('Error');
      setModalMessage('There was an error unregistering from this blood drive. Please try again.');
      setShowSuccessModal(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const isUserRegistered = (driveId) => {
    return registeredDrives.includes(driveId);
  };

  const handleContactUs = () => {
    window.location.href = `mailto:support@raksetu.live?subject=Blood Drive Inquiry&body=Hello, I would like to organize a blood drive.`;
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Donate Blood</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600">
            <h3 className="font-semibold mb-2">Emergency Donation</h3>
            <p className="text-gray-600 text-sm mb-4">
              Respond to urgent blood requests in your area. Your donation could save a life within hours.
            </p>
            <button
              className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => setActiveSection('emergency')}
            >
              <AlertTriangle size={16} />
              View Emergencies
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
            <h3 className="font-semibold mb-2">Blood Drives</h3>
            <p className="text-gray-600 text-sm mb-4">
              Join organized blood donation camps in your community. Help build blood reserves for future needs.
            </p>
            <button 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => document.getElementById('blood-drives').scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar size={16} />
              Find Blood Drives
            </button>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
            <h3 className="font-semibold mb-2">Regular Donation</h3>
            <p className="text-gray-600 text-sm mb-4">
              Schedule recurring donations at your preferred blood bank or hospital. Become a reliable donor.
            </p>
            <button 
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
              onClick={() => handleScheduleVisit(null)}
            >
              <Check size={16} />
              Schedule Donation
            </button>
          </div>
        </div>

        <div className="mb-12" id="blood-banks">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Nearby Blood Banks</h3>
              <p className="text-gray-600">Find blood banks in your area with real-time availability</p>
            </div>
            <div className="hidden md:flex items-center bg-red-50 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              <span className="text-sm font-medium text-red-700">Live Updates</span>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-16">
              <div className="relative">
                <div className="inline-block w-12 h-12 border-4 border-red-100 border-t-red-500 rounded-full animate-spin mb-4"></div>
                <div className="absolute inset-0 w-12 h-12 border-2 border-red-200 rounded-full animate-ping"></div>
              </div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2">Finding Blood Banks</h4>
              <p className="text-gray-500">Searching for nearby locations...</p>
            </div>
          ) : error ? (
            /* Error State */
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-red-700 mb-2">Unable to Load Blood Banks</h4>
                <p className="text-red-600">{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : bloodBanks.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 max-w-md mx-auto">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin size={32} className="text-gray-400" />
                </div>
                <h4 className="text-lg font-semibold text-gray-700 mb-2">No Blood Banks Found</h4>
                <p className="text-gray-500 mb-4">We couldn't find any blood banks in your area.</p>
                <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                  Expand Search Area
                </button>
              </div>
            </div>
          ) : (
            /* Blood Banks Grid */
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bloodBanks
                  .filter(bank => {
                    // Only include blood banks with at least one blood group having count > 0
                    const availableBloodGroups = Object.entries(bank.availability || {}).filter(
                      ([_, count]) => count > 0
                    );
                    return availableBloodGroups.length > 0;
                  })
                  .slice(0, 3)
                  .map((bank, index) => {
                    // Filter available blood groups (count > 0)
                    const availableBloodGroups = Object.entries(bank.availability || {}).filter(
                      ([_, count]) => count > 0
                    );

                    return (
                      <div 
                        key={bank.id} 
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-red-200 overflow-hidden transform hover:-translate-y-1"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 pb-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-red-700 transition-colors">
                                {bank.name}
                              </h4>
                              <div className="flex items-center text-sm text-gray-600">
                                <MapPin size={14} className="mr-2 text-red-500" />
                                <span className="truncate">{bank.displayLocation}</span>
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          
                          {/* Contact Info */}
                          <div className="flex items-center text-sm text-gray-600 mb-4">
                            <Phone size={14} className="mr-2 text-blue-500" />
                            <span className="font-medium">{bank.contactPhone || 'Contact Available'}</span>
                          </div>
                        </div>

                        {/* Blood Availability */}
                        <div className="px-6 py-4">
                          <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                              Blood Availability
                            </h5>
                            {availableBloodGroups.length > 0 ? (
                              <div className="grid grid-cols-4 gap-1.5">
                                {availableBloodGroups.map(([type, count]) => (
                                  <div
                                    key={type}
                                    className={`text-center p-2 rounded-lg border transition-all ${
                                      count < 5 
                                        ? 'bg-orange-50 border-orange-200 text-orange-700' 
                                        : 'bg-green-50 border-green-200 text-green-700'
                                    }`}
                                  >
                                    <div className="font-bold text-sm">{count}</div>
                                    <div className="text-[10px] font-medium uppercase tracking-wide">{type}</div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center p-3 rounded-xl bg-gray-50 border-2 border-gray-200 text-gray-600">
                                <p className="text-sm">No blood units available at this time.</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="px-6 pb-6">
                          <div className="flex items-center gap-3">
                            <button 
                              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                              onClick={() => handleScheduleVisit(bank)}
                            >
                              Schedule Visit
                            </button>
                            <a 
                              href={`tel:${bank.contactPhone || '1234567890'}`} 
                              className="p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
                              aria-label="Call blood bank"
                            >
                              <Phone size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                            </a>
                            <a 
                              href={`https://www.google.com/maps/search/?api=1&query=${bank.coordinates.latitude},${bank.coordinates.longitude}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
                              aria-label="View on map"
                            >
                              <MapPin size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                            </a>
                          </div>
                        </div>

                        {/* Hover Effect Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                      </div>
                    );
                  })}
              </div>

              {/* View More Section */}
              {bloodBanks.filter(bank => {
                const availableBloodGroups = Object.entries(bank.availability || {}).filter(
                  ([_, count]) => count > 0
                );
                return availableBloodGroups.length > 0;
              }).length > 3 && (
                <div className="mt-8 text-center">
                  <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-2xl p-6">
                    <p className="text-gray-600 mb-4">
                      Showing 3 of {bloodBanks.filter(bank => {
                        const availableBloodGroups = Object.entries(bank.availability || {}).filter(
                          ([_, count]) => count > 0
                        );
                        return availableBloodGroups.length > 0;
                      }).length} blood banks in your area
                    </p>
                    <button
                      onClick={() => setActiveSection('all-blood-banks')}
                      className="inline-flex items-center bg-white hover:bg-red-50 text-red-600 font-semibold px-8 py-3 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <span>View All Blood Banks</span>
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="mb-10" id="blood-drives">
          <h3 className="text-xl font-semibold mb-4">Upcoming Blood Drives</h3>
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
              <p>Loading blood drives...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">
              <p>{error}</p>
            </div>
          ) : bloodDrives.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No upcoming blood drives found nearby.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloodDrives.map((drive) => (
                <div key={drive.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium">{drive.title}</h4>
                      <div className="text-sm text-gray-500 mb-2">{drive.organization}</div>

                      <div className="text-sm mb-3">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="mr-1 text-gray-500" />
                          <span>{drive.location} ({drive.distance.toFixed(1)} km)</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Calendar size={14} className="mr-1 text-gray-500" />
                          <span>{drive.startDate.split('T')[0]}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-gray-500" />
                          <span>{drive.time}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm mb-3">
                        <Users size={14} className="mr-1 text-gray-500" />
                        <span>{drive.registered} people registered</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isUserRegistered(drive.id) ? (
                          <>
                            <span className="text-green-600 flex items-center">
                              <Check size={16} className="mr-1" /> Registered
                            </span>
                            <button
                              onClick={() => handleUnregisterForDrive(drive)}
                              disabled={isProcessing}
                              className="text-gray-500 hover:text-gray-700"
                              aria-label={`Unregister from ${drive.title}`}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                            onClick={() => handlePreRegister(drive)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? 'Processing...' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-red-50 p-6 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Want to organize a blood drive?</h3>
              <p className="text-gray-700">
                We provide support for organizing blood donation drives at your workplace, community, or institution through Raksetu.
              </p>
            </div>
            <button className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors" onClick={handleContactUs}>
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Schedule Donation</h3>
            
            {!selectedBank && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1 text-gray-700">Blood Bank</label>
                <select 
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  value={selectedBank ? selectedBank.id : ''}
                  onChange={(e) => {
                    const bank = bloodBanks.find(b => b.id === e.target.value);
                    setSelectedBank(bank);
                  }}
                >
                  <option value="">Select a blood bank</option>
                  {bloodBanks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.name} - {bank.displayLocation}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Time</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
              >
                <option value="">Select a time</option>
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="01:00 PM">01:00 PM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
              </select>
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-colors font-medium"
                onClick={() => {
                  setShowScheduleModal(false);
                  setSelectedBank(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
                onClick={handleSubmitAppointment}
                disabled={!selectedBank || !appointmentDate || !appointmentTime}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Pre-Register for Blood Donation Camp</h3>
            <div className="mb-4">
              <p><strong>Name:</strong> {selectedDrive?.name}</p>
              <p><strong>Location:</strong> {selectedDrive?.location}</p>
              <p><strong>Date:</strong> {selectedDrive?.date}</p>
              <p><strong>Time:</strong> {selectedDrive?.time}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enter Mobile Number:</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enter OTP:</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
              />
            </div>
            <div className="flex gap-3 mb-4">
              <button
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-colors font-medium"
                onClick={() => setShowPreRegisterModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
                onClick={handleSendOTP}
                disabled={isProcessing || !mobileNumber}
              >
                {isProcessing ? 'Sending...' : 'Send OTP'}
              </button>
              <button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
                onClick={handleVerifyOTP}
                disabled={isProcessing || !otp}
              >
                {isProcessing ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        show={showSuccessModal}
        setShow={setShowSuccessModal}
        heading={modalHeading}
        message={modalMessage}
      />
    </section>
  );
}