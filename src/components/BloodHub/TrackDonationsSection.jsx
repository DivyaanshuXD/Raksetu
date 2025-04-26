import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db, auth } from '../utils/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function TrackDonationsSection({ isLoggedIn, setShowAuthModal, setAuthMode, userProfile }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [registeredDrives, setRegisteredDrives] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bloodBanks] = useState([
    { id: 1, name: "Raksetu Central Blood Bank", location: "Sector 12, Delhi" },
    { id: 2, name: "Apollo Blood Center", location: "MG Road, Bangalore" },
    { id: 3, name: "Fortis Blood Bank", location: "Andheri, Mumbai" },
  ]);

  useEffect(() => {
    if (!isLoggedIn || !auth.currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'donations'), where('userId', '==', auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userDonations = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.seconds ? new Date(doc.data().timestamp.seconds * 1000) : doc.data().date
      }));
      setDonations(userDonations);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching donations:", error);
      setLoading(false);
    });

    // Fetch registered drives and appointments
    const fetchUserData = async () => {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setRegisteredDrives(data.registeredDrives || []);
        setAppointments(data.appointments || []);
      }
    };
    fetchUserData();

    return () => unsubscribe();
  }, [isLoggedIn]);

  const totalDonations = donations.length;
  const totalImpactPoints = donations.reduce((sum, d) => sum + (d.impactPoints || 0), 0);
  const bloodType = userProfile?.bloodType || 'Unknown';
  const username = userProfile?.name || 'Anonymous';

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
      await addDoc(collection(db, 'appointments'), {
        userId: currentUser.uid,
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
    const certificate = document.createElement('div');
    certificate.style.padding = '20px';
    certificate.style.fontFamily = 'Arial, sans-serif';
    certificate.innerHTML = `
      <h1 style="text-align: center; color: #d32f2f;">Donor Certificate</h1>
      <h2 style="text-align: center;">${username}</h2>
      <p style="text-align: center;">Blood Type: ${bloodType}</p>
      <p style="text-align: center;">Date: ${new Date().toLocaleDateString()}</p>
      <hr style="border: 1px solid #d32f2f; margin: 20px 0;">
      <p><strong>Total Donations:</strong> ${totalDonations}</p>
      <p><strong>Lives Saved:</strong> ${totalDonations}</p>
      <p><strong>Impact Points:</strong> ${totalImpactPoints}</p>
      <p><strong>Milestone Badge:</strong> ${totalDonations >= 2 ? 'Emergency Hero' : 'First Donor'}</p>
      <div style="text-align: center; margin-top: 20px;">
        <img src="https://via.placeholder.com/100" alt="QR Code" style="width: 100px; height: 100px;">
        <p>Scan to view donor profile</p>
      </div>
      <p style="text-align: center; font-style: italic;">Thank you for your life-saving contribution!</p>
    `;

    document.body.appendChild(certificate);
    html2canvas(certificate).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Donor_Certificate_${username}.pdf`);
      document.body.removeChild(certificate);
    });
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
                  onClick={() => handleScheduleVisit(bloodBanks[0])} // Default to first bank
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
              <h3 className="text-lg font-semibold mb-4">Your Donation History</h3>

              {loading ? (
                <div className="text-center py-10">
                  <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
                  <p>Loading donations...</p>
                </div>
              ) : donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="border-b border-gray-100 pb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-red-100 text-red-600 font-bold text-sm h-8 w-8 rounded-full flex items-center justify-center">
                            {donation.bloodType}
                          </div>
                          <div>
                            <div className="font-medium">{donation.hospital || 'Unknown Hospital'}</div>
                            <div className="text-sm text-gray-500">{donation.timestamp?.toLocaleDateString() || 'Unknown Date'}</div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                            {donation.status || 'Pending'}
                          </span>
                          <span className="text-sm text-gray-500">+{donation.impactPoints || 0} pts</span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-600 pl-10">
                        Your donation helped a {donation.recipientAge || 'Unknown'}-year-old patient with {donation.recipientCondition || 'Unknown Condition'}.
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No donations recorded yet.</p>
                </div>
              )}

              <div className="mt-4 text-center">
                <button className="text-red-600 font-medium text-sm hover:text-red-800 transition-colors">
                  View All Donations
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Registered Blood Drives</h3>
              {registeredDrives.length > 0 ? (
                <div className="space-y-4">
                  {registeredDrives.map((drive) => (
                    <div key={drive.id} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">{drive.name}</div>
                          <div className="text-sm text-gray-500">{drive.date} at {drive.time}</div>
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
                  {appointments.map((appt, index) => (
                    <div key={index} className="border-b border-gray-100 pb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <div>
                          <div className="font-medium">{appt.bankName}</div>
                          <div className="text-sm text-gray-500">{appt.date} at {appt.time}</div>
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
              <h3 className="text-lg font-semibold mb-4">Impact Recognition</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                    <Heart size={32} />
                  </div>
                  <div className="font-medium">First Donation</div>
                  <div className="text-xs text-gray-500">{donations.length > 0 ? donations[0].timestamp?.toLocaleDateString() : 'N/A'}</div>
                </div>
                <div className="text-center">
                  <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                    <Users size={32} />
                  </div>
                  <div className="font-medium">Emergency Hero</div>
                  <div className="text-xs text-gray-500">{totalDonations >= 2 ? 'Achieved' : 'Locked (2 donations)'}</div>
                </div>
                <div className="text-center opacity-40">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <Check size={32} />
                  </div>
                  <div className="font-medium">Regular Donor</div>
                  <div className="text-xs text-gray-500">Locked (5 donations)</div>
                </div>
                <div className="text-center opacity-40">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                    <Award size={32} />
                  </div>
                  <div className="font-medium">Silver Saver</div>
                  <div className="text-xs text-gray-500">Locked (10 donations)</div>
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
    </section>
  );
}