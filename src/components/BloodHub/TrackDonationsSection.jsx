import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TrackDonationsSection({ isLoggedIn, setShowAuthModal, setAuthMode, userProfile, donations, setDonations }) {
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

  useEffect(() => {
    setLoading(false);
  }, [donations]);

  // Listen to completed donations in real-time
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

      setShowScheduleModal(false);
      setAppointmentDate('');
      setAppointmentTime('');
      alert(`Appointment scheduled at ${selectedBank.name} on ${appointmentDate} at ${appointmentTime}`);
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      alert("There was an error scheduling your appointment. Please try again.");
    }
  };

  const generateCertificate = () => {
    const totalDonations = completedDonations.length; // Use completed donations
    const totalImpactPoints = totalDonations * 10;
    const bloodType = userProfile?.bloodType || 'Not specified';
    const username = userProfile?.name || 'Anonymous';

    const certificate = document.createElement('div');
    certificate.style.width = '800px';
    certificate.style.height = '600px';
    certificate.style.padding = '40px';
    certificate.style.background = 'linear-gradient(135deg, #ffe6e6 0%, #fff5f5 100%)';
    certificate.style.border = '10px double #d32f2f';
    certificate.style.borderRadius = '15px';
    certificate.style.fontFamily = "'Georgia', serif";
    certificate.style.position = 'relative';
    certificate.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
    certificate.style.overflow = 'hidden';

    // Add decorative elements
    certificate.innerHTML = `
      <div style="position: absolute; top: 20px; left: 20px; width: 50px; height: 50px; background: url('https://cdn-icons-png.flaticon.com/512/599/599528.png') no-repeat center; background-size: contain; opacity: 0.2;"></div>
      <div style="position: absolute; bottom: 20px; right: 20px; width: 50px; height: 50px; background: url('https://cdn-icons-png.flaticon.com/512/599/599528.png') no-repeat center; background-size: contain; opacity: 0.2;"></div>
      <h1 style="text-align: center; color: #d32f2f; font-size: 36px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Certificate of Appreciation</h1>
      <h2 style="text-align: center; color: #333; font-size: 24px; margin-bottom: 20px;">Awarded to ${username}</h2>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 18px; color: #555;">For your generous contribution to saving lives through blood donation.</p>
        <p style="font-size: 16px; color: #777;">Blood Type: ${bloodType}</p>
        <p style="font-size: 16px; color: #777;">Date: ${new Date().toLocaleDateString()}</p>
      </div>
      <div style="display: flex; justify-content: space-around; margin: 30px 0; text-align: center;">
        <div>
          <p style="font-size: 20px; color: #d32f2f; font-weight: bold;">${totalDonations}</p>
          <p style="font-size: 14px; color: #555;">Total Donations</p>
        </div>
        <div>
          <p style="font-size: 20px; color: #d32f2f; font-weight: bold;">${totalDonations}</p>
          <p style="font-size: 14px; color: #555;">Lives Saved</p>
        </div>
        <div>
          <p style="font-size: 20px; color: #d32f2f; font-weight: bold;">${totalImpactPoints}</p>
          <p style="font-size: 14px; color: #555;">Impact Points</p>
        </div>
      </div>
      <div style="text-align: center; margin: 20px 0;">
        <p style="font-size: 16px; color: #555;"><strong>Milestone Badge:</strong> ${totalDonations >= 2 ? 'Emergency Hero' : 'First Donor'}</p>
        <img src="https://via.placeholder.com/100" alt="QR Code" style="width: 80px; height: 80px; margin-top: 10px;">
        <p style="font-size: 12px; color: #777;">Scan to view donor profile</p>
      </div>
      <div style="position: absolute; bottom: 40px; width: 100%; text-align: center;">
        <p style="font-size: 14px; color: #777; font-style: italic;">Thank you for your life-saving contribution!</p>
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
          <div>
            <p style="font-size: 14px; color: #555;">____________________</p>
            <p style="font-size: 12px; color: #777;">Raksetu Team</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(certificate);
    html2canvas(certificate, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [800, 600]); // Landscape orientation
      pdf.addImage(imgData, 'PNG', 0, 0, 800, 600);
      pdf.save(`Donor_Certificate_${username}.pdf`);
      document.body.removeChild(certificate);
    });
  };

  const totalDonations = completedDonations.length; // Use completed donations for stats
  const totalImpactPoints = totalDonations * 10;
  const bloodType = userProfile?.bloodType || 'Not specified';
  const username = userProfile?.name || 'Anonymous';

  const registeredDrives = donations.filter(d => d.type === 'drive');
  const appointments = donations.filter(d => d.type === 'appointment');

  // Helper function to format dates
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

      // Fetch and delete all appointments
      const appointmentsQuery = query(collection(db, 'appointments'), where('userId', '==', currentUser.uid));
      const appointmentsSnapshot = await getDocs(appointmentsQuery);
      const appointmentDeletions = appointmentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(appointmentDeletions);

      // Fetch and delete all userDrives
      const userDrivesQuery = query(collection(db, 'userDrives'), where('userId', '==', currentUser.uid));
      const userDrivesSnapshot = await getDocs(userDrivesQuery);
      const userDrivesDeletions = userDrivesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(userDrivesDeletions);

      // Clear user profile appointments and registeredDrives
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        appointments: [],
        registeredDrives: []
      });

      // Reset donations state
      setDonations([]);

      alert('All scheduled donations and registered blood drives have been cleared.');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('There was an error clearing your data. Please check your Firestore permissions or try again.');
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
                            {donation.type === 'appointment' ? `Donation at ${donation.bankName}` : `Blood Drive: ${donation.driveName}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(donation.date)} at {donation.time || 'Not specified'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPin size={14} className="mr-1" />
                            {donation.location || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No donations completed yet.</p>
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

      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Clear All Scheduled Activities</h3>
            <p className="mb-6 text-gray-600">Are you sure you want to clear all scheduled donations and registered blood drives? This action cannot be undone.</p>
            
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
    </section>
  );
}