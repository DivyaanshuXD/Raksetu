import { useState, useEffect } from 'react';
import { AlertTriangle, Calendar, Check, Phone, MapPin, Clock, Users } from 'lucide-react';
import Modal from './Modal';
import { db, auth } from '../utils/firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  updateDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  increment
} from 'firebase/firestore';

export default function HomeSection({ setActiveSection, isLoggedIn, userLocation, setShowAuthModal, setAuthMode, userProfile }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [localBloodDrives, setLocalBloodDrives] = useState([]);
  const [loading, setLoading] = useState({
    banks: true,
    drives: true
  });
  const [selectedBank, setSelectedBank] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [registeredDrives, setRegisteredDrives] = useState((userProfile?.registeredDrives?.map(drive => drive.id) || []) || []);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch blood banks from Firestore
  useEffect(() => {
    setLoading(prev => ({ ...prev, banks: true }));
    
    const bloodBanksQuery = query(
      collection(db, 'bloodBanks'),
      orderBy('name', 'asc')
    );
    
    const unsubscribe = onSnapshot(bloodBanksQuery, (snapshot) => {
      const banks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBloodBanks(banks);
      setLoading(prev => ({ ...prev, banks: false }));
    }, (error) => {
      console.error("Error fetching blood banks:", error);
      setLoading(prev => ({ ...prev, banks: false }));
    });
    
    return () => unsubscribe();
  }, []);

  // Use blood drives from props if available, otherwise fetch from Firestore
  useEffect(() => {
    if (bloodDrives && bloodDrives.length > 0) {
      setLocalBloodDrives(bloodDrives);
      setLoading(prev => ({ ...prev, drives: false }));
    } else {
      setLoading(prev => ({ ...prev, drives: true }));
      
      const bloodDrivesQuery = query(
        collection(db, 'bloodDrives'),
        where('endDate', '>=', new Date()),
        orderBy('endDate', 'asc')
      );
      
      const unsubscribe = onSnapshot(bloodDrivesQuery, (snapshot) => {
        const drives = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            startDate: data.startDate?.toDate().toISOString() || data.startDate,
            endDate: data.endDate?.toDate().toISOString() || data.endDate,
          };
        });
        
        setLocalBloodDrives(drives);
        setLoading(prev => ({ ...prev, drives: false }));
      }, (error) => {
        console.error("Error fetching blood drives:", error);
        setLoading(prev => ({ ...prev, drives: false }));
      });
      
      return () => unsubscribe();
    }
  }, [bloodDrives]);
  
  // Check user's registered drives from their profile
  useEffect(() => {
    if (userProfile && userProfile.registeredDrives) {
      setRegisteredDrives(userProfile.registeredDrives.map(drive => drive.id));
    } else {
      setRegisteredDrives([]);
    }
  }, [userProfile]);

  const handleScheduleVisit = (bank) => {
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
      if (!currentUser) {
        setAuthMode('login');
        setShowAuthModal(true);
        return;
      }
      
      const appointmentRef = await addDoc(collection(db, 'appointments'), {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        bankId: selectedBank.id,
        bankName: selectedBank.name,
        date: appointmentDate,
        time: appointmentTime,
        status: 'scheduled',
        createdAt: serverTimestamp()
      });
      
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        let appointments = userSnap.data().appointments || [];
        appointments.push({
          id: appointmentRef.id,
          bankId: selectedBank.id,
          bankName: selectedBank.name,
          date: appointmentDate,
          time: appointmentTime,
          status: 'scheduled'
        });
        
        await updateDoc(userRef, { appointments });
      }
      
      const bankRef = doc(db, 'bloodBanks', selectedBank.id);
      await updateDoc(bankRef, {
        appointmentCount: increment(1)
      });
      
      setSuccessMessage(`Appointment scheduled at ${selectedBank.name} on ${appointmentDate} at ${appointmentTime}`);
      setShowSuccessModal(true);
      setShowScheduleModal(false);
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("There was an error scheduling your appointment. Please try again.");
    }
  };

  const handleRegisterForDrive = async (drive) => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    
    try {
      const currentUser = auth.currentUser;
      
      if (registeredDrives.includes(drive.id)) {
        alert("You are already registered for this blood drive.");
        return;
      }
      
      await addDoc(collection(db, 'userDrives'), {
        userId: currentUser.uid,
        userName: userProfile?.name || currentUser.displayName || 'Anonymous',
        userEmail: currentUser.email,
        driveId: drive.id,
        driveName: drive.name || drive.title,
        organizer: drive.organizer || drive.organization,
        date: drive.date || drive.startDate,
        time: drive.time || '09:00 AM',
        location: drive.location,
        registeredAt: serverTimestamp()
      });
      
      if (drive.source !== 'external') {
        const driveRef = doc(db, 'bloodDrives', drive.id);
        await updateDoc(driveRef, {
          registered: increment(1)
        });
      }
      
      const userRef = doc(db, 'users', currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        let drives = userSnap.data().registeredDrives || [];
        drives.push({
          id: drive.id,
          name: drive.name || drive.title,
          organizer: drive.organizer || drive.organization,
          date: drive.date || drive.startDate,
          time: drive.time || '09:00 AM',
          location: drive.location
        });
        
        await updateDoc(userRef, { registeredDrives: drives });
      }
      
      setRegisteredDrives(prev => [...prev, drive.id]);
      
      setSuccessMessage(`Successfully registered for ${drive.name || drive.title} on ${drive.date || new Date(drive.startDate).toLocaleDateString()}`);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error registering for drive:", error);
      alert("There was an error registering for this blood drive. Please try again.");
    }
  };
  
  const isUserRegistered = (driveId) => {
    return registeredDrives.includes(driveId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Donate Blood</h2>
          <div className="text-sm text-gray-500">raksetu.live</div>
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
              onClick={() => document.getElementById('blood-banks').scrollIntoView({ behavior: 'smooth' })}
            >
              <Check size={16} />
              Schedule Donation
            </button>
          </div>
        </div>

        <div className="mb-10" id="blood-banks">
          <h3 className="text-xl font-semibold mb-4">Nearby Blood Banks</h3>
          {loading.banks ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
              <p>Loading blood banks...</p>
            </div>
          ) : bloodBanks.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600">No blood banks found in your area.</p>
              <button 
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bloodBanks.map((bank) => (
                <div key={bank.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <h4 className="font-medium mb-1">{bank.name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin size={14} className="mr-1" /> {bank.location} ({bank.distance || 'Unknown'})
                  </div>

                  <div className="mb-3">
                    <div className="text-sm font-medium mb-2">Blood Availability:</div>
                    <div className="grid grid-cols-4 gap-2">
                      {bank.availability && Object.entries(bank.availability).map(([type, count]) => (
                        <div key={type} className="text-center">
                          <div
                            className={`text-sm font-bold rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                              count < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {type}
                          </div>
                          <div className="text-xs mt-1">{count} units</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                      onClick={() => handleScheduleVisit(bank)}
                    >
                      Schedule Visit
                    </button>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      onClick={() => window.open(`tel:${bank.phone || '1234567890'}`)}
                    >
                      <Phone size={16} />
                    </button>
                    <button 
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      onClick={() => window.open(`https://maps.google.com/?q=${bank.location}`)}
                    >
                      <MapPin size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-10" id="blood-drives">
          <h3 className="text-xl font-semibold mb-4">Upcoming Blood Drives</h3>
          {loading.drives ? (
            <div className="text-center py-10">
              <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
              <p>Loading blood drives...</p>
            </div>
          ) : localBloodDrives.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl shadow-sm">
              <p className="text-gray-600">No upcoming blood drives found.</p>
              <button 
                className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localBloodDrives.map((drive) => (
                <div key={drive.id} className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h4 className="font-medium">{drive.name || drive.title}</h4>
                      <div className="text-sm text-gray-500 mb-2">{drive.organizer || drive.organization}</div>

                      <div className="text-sm mb-3">
                        <div className="flex items-center mb-1">
                          <MapPin size={14} className="mr-1 text-gray-500" />
                          <span>{drive.location}</span>
                        </div>
                        <div className="flex items-center mb-1">
                          <Calendar size={14} className="mr-1 text-gray-500" />
                          <span>{drive.date || formatDate(drive.startDate)}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1 text-gray-500" />
                          <span>{drive.time || '09:00 AM'}</span>
                        </div>
                      </div>

                      <div className="flex items-center text-sm mb-3">
                        <Users size={14} className="mr-1 text-gray-500" />
                        <span>{drive.registered || 0} people registered</span>
                      </div>

                      <button 
                        className={`${
                          isUserRegistered(drive.id) 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-red-600 hover:bg-red-700'
                        } text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
                        onClick={() => !isUserRegistered(drive.id) && handleRegisterForDrive(drive)}
                        disabled={isUserRegistered(drive.id)}
                      >
                        {isUserRegistered(drive.id) ? (
                          <>
                            <Check size={16} />
                            Registered
                          </>
                        ) : (
                          'Register'
                        )}
                      </button>
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
            <button 
              className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              onClick={() => setActiveSection('about')}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Schedule Donation at {selectedBank?.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Date</label>
              <input 
                type="date" 
                className="w-full border border-gray-300 rounded-lg p-2"
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Time</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2"
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
                onClick={() => setShowScheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
                onClick={handleSubmitAppointment}
                disabled={!appointmentDate || !appointmentTime}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Success!</h3>
            <p className="mb-6">{successMessage}</p>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded-lg transition-colors font-medium"
              onClick={() => setShowSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}