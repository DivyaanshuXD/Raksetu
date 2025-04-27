import { useEffect, useState } from 'react';
import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin, Trash2 } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import SuccessModal from './SuccessModal';

export default function TrackDonationsSection({ isLoggedIn, setShowAuthModal, setAuthMode, userProfile, donations, setDonations, onDonationConfirmed }) {
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [completedDonations, setCompletedDonations] = useState([]);
  const [bloodBanks] = useState([
    { id: 1, name: "Raksetu Central Blood Bank", location: "Sector 12, Delhi" },
    { id: 2, name: "Apollo Blood Center", location: "MG Road, Bangalore" },
    { id: 3, name: "Fortis Blood Bank", location: "Andheri, Mumbai" },
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleDonationConfirmed = (donationData) => {
    setCompletedDonations(prev => [...prev, donationData]);
    if (auth.currentUser) {
      addDoc(collection(db, 'emergencyDonations'), {
        userId: auth.currentUser.uid,
        ...donationData,
        createdAt: serverTimestamp(),
      });
    }
  };

  useEffect(() => {
    setLoading(false);
  }, [donations]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const completedDonationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(completedDonationsQuery, (snapshot) => {
      const completedList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompletedDonations(completedList);
      console.log('Fetched Completed Donations:', completedList);
    }, (error) => console.error('Error fetching completed donations:', error));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;

    const emergencyDonationsQuery = query(
      collection(db, 'emergencyDonations'),
      where('userId', '==', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(emergencyDonationsQuery, (snapshot) => {
      const emergencyDonations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCompletedDonations(prev => [...prev, ...emergencyDonations]);
    }, (error) => console.error('Error fetching emergency donations:', error));

    return () => unsubscribe();
  }, []);

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

      setModalHeading('Appointment Scheduled Successfully!');
      setModalMessage(`Appointment scheduled at ${selectedBank.name} on ${appointmentDate} at ${appointmentTime}`);
      setShowSuccessModal(true);
      setShowScheduleModal(false);
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      setModalHeading('Error');
      setModalMessage('There was an error scheduling your appointment. Please try again.');
      setShowSuccessModal(true);
    }
  };

  const generateCertificate = () => {
    const totalDonations = completedDonations.length;
    const totalImpactPoints = totalDonations * 10;
    const bloodType = userProfile?.bloodType || 'Not specified';
    const username = userProfile?.name || 'Anonymous';
    const today = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    let badgeLabel = 'First Donor';
    if (totalDonations >= 10) {
      badgeLabel = 'Platinum Lifesaver';
    } else if (totalDonations >= 5) {
      badgeLabel = 'Gold Lifesaver';
    } else if (totalDonations >= 2) {
      badgeLabel = 'Emergency Hero';
    }
    
    const certificate = document.createElement('div');
    certificate.style.width = '794px';
    certificate.style.height = '1123px';
    certificate.style.position = 'relative';
    certificate.style.overflow = 'hidden';
    certificate.style.boxSizing = 'border-box';
    
    certificate.innerHTML = `
      <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
           background-color: white; z-index: 1;"></div>
      
      <div style="position: relative; width: 100%; height: 100%; 
           border: 5px solid #d32f2f; margin: 0; padding: 40px; z-index: 3; 
           box-sizing: border-box; display: flex; flex-direction: column; 
           font-family: 'Times New Roman', serif; color: #333333;">
        
        <div style="text-align: center; margin-bottom: 40px; margin-top: 20px;">
          <div style="display: inline-block; width: 80px; height: 80px;
               background-color: #d32f2f; border-radius: 50%; position: relative;">
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
                 font-size: 40px; color: white; font-weight: bold;">R</div>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 60px;">
          <h1 style="margin: 0; font-size: 36px; color: #d32f2f; text-transform: uppercase; 
               letter-spacing: 2px; font-weight: normal;">Certificate of</h1>
          <h1 style="margin: 0; font-size: 36px; color: #d32f2f; text-transform: uppercase; 
               letter-spacing: 2px; font-weight: normal;">Appreciation</h1>
          <div style="width: 60%; margin: 15px auto; height: 1px; background-color: #d32f2f;"></div>
        </div>
        
        <div style="text-align: center; flex-grow: 1; display: flex; flex-direction: column; 
             justify-content: flex-start; margin-bottom: 40px;">
          <p style="font-size: 18px; margin-bottom: 20px;">This certifies that</p>
          <h2 style="font-size: 36px; margin: 5px 0 30px; font-family: 'Brush Script MT', cursive;">${username}</h2>
          <p style="font-size: 18px; margin-bottom: 25px; line-height: 1.5; padding: 0 40px;">
            has demonstrated exceptional generosity and compassion through the selfless act of
            blood donation, directly contributing to saving lives in our community.
          </p>
          
          <div style="display: flex; justify-content: space-around; margin: 60px 0;">
            <div style="text-align: center; width: 120px;">
              <div style="font-size: 36px; font-weight: bold; color: #d32f2f;">${totalDonations}</div>
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Donations</div>
            </div>
            <div style="text-align: center; width: 120px;">
              <div style="font-size: 36px; font-weight: bold; color: #d32f2f;">${totalDonations}</div>
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Lives Saved</div>
            </div>
            <div style="text-align: center; width: 120px;">
              <div style="font-size: 36px; font-weight: bold; color: #d32f2f;">${totalImpactPoints}</div>
              <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Impact Points</div>
            </div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 20px 80px; font-size: 16px;">
            <div><strong>Blood Type:</strong> ${bloodType}</div>
            <div><strong>Date Issued:</strong> ${today}</div>
          </div>
          
          <div style="background-color: rgba(211, 47, 47, 0.05); border: 1px solid #d32f2f; 
               border-radius: 8px; padding: 10px; margin: 30px auto; width: 60%;">
            <p style="margin: 0; font-size: 16px;"><strong>Achievement:</strong> ${badgeLabel}</p>
          </div>
        </div>
        
        <div style="margin-top: auto; text-align: center;">
          <p style="font-style: italic; margin-bottom: 25px;">Thank you for your life-saving contribution!</p>
          <div style="display: flex; justify-content: center; align-items: flex-end;">
            <div style="margin: 0 40px; text-align: center;">
              <div style="border-top: 1px solid #333; padding-top: 5px; width: 200px;">
                <strong>Raksetu Team</strong><br>
                <span style="font-size: 12px;">Blood Donation Initiative</span>
              </div>
            </div>
            <div style="margin: 0 40px; text-align: center;">
              <div style="border-top: 1px solid #333; padding-top: 5px; width: 200px; font-size: 12px;">
                Certificate ID: ${Date.now().toString(36).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(certificate);
    
    html2canvas(certificate, { 
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Raksetu_Donor_Certificate_${username}.pdf`);
      document.body.removeChild(certificate);
    });
  };

  const totalDonations = completedDonations.length;
  const totalImpactPoints = totalDonations * 10;
  const bloodType = userProfile?.bloodType || 'Not specified';
  const username = userProfile?.name || 'Anonymous';

  const registeredDrives = donations.filter(d => d.type === 'drive');
  const appointments = donations.filter(d => d.type === 'appointment');

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown Date';
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      if (isNaN(date.getTime())) return 'Unknown Date';
      return date.toISOString().split('T')[0];
    } catch {
      return 'Unknown Date';
    }
  };

  const handleClearAll = async () => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }

    try {
      const currentUser = auth.currentUser;

      const appointmentsQuery = query(collection(db, 'appointments'), where('userId', '==', currentUser.uid));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentDeletions = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(appointmentDeletions);

      const userDrivesQuery = query(collection(db, 'userDrives'), where('userId', '==', currentUser.uid));
      const userDrivesSnapshot = await getDocs(userDrivesQuery);
      const userDrivesDeletions = userDrivesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(userDrivesDeletions);

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        appointments: [],
        registeredDrives: []
      });

      setDonations([]);
      setModalHeading('Cleared Successfully!');
      setModalMessage('All scheduled donations and registered blood drives have been cleared.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error clearing data:', error);
      setModalHeading('Error');
      setModalMessage('There was an error clearing your data. Please check your Firestore permissions or try again.');
      setShowSuccessModal(true);
    }
  };

  const handleShowClearModal = () => {
    if (!auth.currentUser) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowClearModal(true);
  };

  const handleConfirmClear = async () => {
    await handleClearAll();
    setShowClearModal(false);
  };

  return (
    <section className="py-6 md:py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Track Your Donations</h2>

        {isLoggedIn ? (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                  {bloodType}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{username}</h3>
                  <div className="text-gray-600">{totalDonations}x Donor • {totalImpactPoints} Impact Points</div>
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{totalDonations}</div>
                  <div className="text-gray-600">Donations</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{totalDonations}</div>
                  <div className="text-gray-600">Lives Saved</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{totalImpactPoints}</div>
                  <div className="text-gray-600">Impact Points</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">{bloodType}</div>
                  <div className="text-gray-600">Blood Type</div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  onClick={() => handleScheduleVisit(bloodBanks[0])}
                >
                  Schedule Next Donation
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  onClick={generateCertificate}
                >
                  <Download size={16} /> Download Certificate
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Registered Blood Drives</h3>
                <button
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  onClick={handleShowClearModal}
                >
                  <Trash2 size={16} /> Clear All
                </button>
              </div>
              {registeredDrives.length > 0 ? (
                <div className="space-y-4">
                  {registeredDrives.map((drive) => (
                    <div key={drive.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">{drive.driveName}</div>
                          <div className="text-sm text-gray-500">{formatDate(drive.date)} at {drive.time}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" /> {drive.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No blood drives registered yet.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Scheduled Blood Bank Visits</h3>
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appt) => (
                    <div key={appt.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">{appt.bankName}</div>
                          <div className="text-sm text-gray-500">{formatDate(appt.date)} at {appt.time}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" /> {appt.location || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No scheduled visits yet.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Donation History</h3>
              {completedDonations.length > 0 ? (
                <div className="space-y-4">
                  {completedDonations.map((donation) => (
                    <div key={donation.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">
                            {donation.type === 'appointment' ? 
                              `Donation at ${donation.bankName}` : 
                              donation.type === 'emergency' ? 
                              `Emergency Donation at ${donation.hospital}` : 
                              `Blood Drive: ${donation.driveName}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(donation.date)} at {donation.time || 'Not specified'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {donation.location || donation.hospital || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No completed donations yet.</p>
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Impact Recognition</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${totalDonations > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Heart size={32} />
                  </div>
                  <div className="font-medium">First Donation</div>
                  <div className="text-xs text-gray-500">{totalDonations > 0 ? 'Achieved' : 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${totalDonations >= 2 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                    <Users size={32} />
                  </div>
                  <div className="font-medium">Emergency Hero</div>
                  <div className="text-xs text-gray-500">{totalDonations >= 2 ? 'Achieved' : 'Locked (2 donations)'}</div>
                </div>
                <div className="text-center">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${totalDonations >= 5 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                    <Check size={32} />
                  </div>
                  <div className="font-medium">Regular Donor</div>
                  <div className="text-xs text-gray-500">{totalDonations >= 5 ? 'Achieved' : 'Locked (5 donations)'}</div>
                </div>
                <div className="text-center">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-2 ${totalDonations >= 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 opacity-40'}`}>
                    <Award size={32} />
                  </div>
                  <div className="font-medium">Silver Saver</div>
                  <div className="text-xs text-gray-500">{totalDonations >= 10 ? 'Achieved' : 'Locked (10 donations)'}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
              <UserCircle size={40} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign in to track your donations</h3>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              Sign in to view your donation history, track the impact of your donations,
              and manage your upcoming donations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                Sign In
              </button>
              <button
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                onClick={() => {
                  setAuthMode('register');
                  setShowAuthModal(true);
                }}
              >
                Create Account
              </button>
            </div>
          </div>
        )}

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

        {showClearModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
              <h3 className="text-xl font-semibold mb-2">Clear All Scheduled Activities</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to clear all scheduled donations and registered blood drives? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-colors font-medium"
                  onClick={() => setShowClearModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
                  onClick={handleConfirmClear}
                >
                  Confirm Clear
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
      </div>
    </section>
  );
}