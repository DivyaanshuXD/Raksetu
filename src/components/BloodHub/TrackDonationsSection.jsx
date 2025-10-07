import { useEffect, useState, Component } from 'react';
import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin, Trash2, Plus, TrendingUp } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, addDoc, query, where, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, errorMessage: '' };

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center">
          <h3 className="font-semibold">Something went wrong</h3>
          <p>{this.state.errorMessage}</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TrackDonationsSection({ onDonationConfirmed, isLoggedIn, setShowAuthModal, setAuthMode, donations, setDonations, userProfile }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedBloodBank, setSelectedBloodBank] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();
  const user = auth.currentUser;

  // Check if user is logged in
  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
    }
  }, [isLoggedIn]);

  // Fetch completed and pending donations in real-time
  useEffect(() => {
    if (!user) {
      setCompletedDonations([]);
      setLoading(false);
      return;
    }
    const completedDonationsRef = query(
      collection(db, 'donationsDone'),
      where('userId', '==', user.uid),
      where('status', 'in', ['completed', 'pending'])
    );
    const unsubscribe = onSnapshot(
      completedDonationsRef,
      (snapshot) => {
        const completed = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date ? (data.date.toDate ? data.date.toDate() : new Date(data.date)) : new Date(),
            points: data.points || 0,
          };
        });
        setCompletedDonations(completed);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching completed donations:', error.message, error.code);
        setCompletedDonations([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Fetch upcoming donations in real-time and check for completion
  useEffect(() => {
    if (!user) {
      setDonations([]);
      return;
    }
    const donationsRef = query(
      collection(db, 'donationsDone'),
      where('userId', '==', user.uid),
      where('status', '==', 'upcoming')
    );
    const unsubscribe = onSnapshot(
      donationsRef,
      (snapshot) => {
        const upcoming = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: data.date ? (data.date.toDate ? data.date.toDate() : new Date(data.date)) : new Date(),
          };
        });

        const now = new Date();
        upcoming.forEach(async (donation) => {
          try {
            const donationDateTime = new Date(`${donation.date.toISOString().split('T')[0]} ${donation.time}`);
            if (donationDateTime < now) {
              await updateDoc(doc(db, 'donationsDone', donation.id), {
                status: 'completed',
                points: donation.points || 150,
              });
            }
          } catch (error) {
            console.error('Error updating donation status:', error.message, error.code);
          }
        });

        setDonations(
          upcoming.filter((donation) => {
            const donationDateTime = new Date(`${donation.date.toISOString().split('T')[0]} ${donation.time}`);
            return donationDateTime >= now;
          })
        );
      },
      (error) => {
        console.error('Error fetching upcoming donations:', error.message, error.code);
        setDonations([]);
      }
    );
    return () => unsubscribe();
  }, [user, setDonations]);

  const totalDonations = completedDonations.length;
  const totalImpactPoints = completedDonations.reduce((sum, donation) => sum + (donation.points || 0), 0);
  const bloodType = userProfile?.bloodType || 'Not specified';
  const username = userProfile?.name || 'Anonymous';

  const registeredDrives = donations.filter((d) => d.type === 'drive');
  const appointments = donations.filter((d) => d.type === 'appointment');

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown Date';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Unknown Date';
    }
  };

  const getBadgeInfo = () => {
    if (totalDonations >= 10)
      return {
        label: 'Platinum Lifesaver',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        gradient: 'linear-gradient(135deg, #e6e6fa, #dda0dd)',
      };
    if (totalDonations >= 5)
      return {
        label: 'Gold Lifesaver',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      };
    if (totalDonations >= 2)
      return {
        label: 'Emergency Hero',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        gradient: 'linear-gradient(135deg, #87ceeb, #4682b4)',
      };
    return {
      label: 'First Donor',
      color: 'bg-green-100 text-green-700 border-green-200',
      gradient: 'linear-gradient(135deg, #90ee90, #32cd32)',
    };
  };

  const badgeInfo = getBadgeInfo();

  const achievements = [
    { icon: Heart, title: 'First Donation', threshold: 1, achieved: totalDonations >= 1 },
    { icon: Users, title: 'Emergency Hero', threshold: 2, achieved: totalDonations >= 2 },
    { icon: Check, title: 'Regular Donor', threshold: 5, achieved: totalDonations >= 5 },
    { icon: Award, title: 'Platinum Saver', threshold: 10, achieved: totalDonations >= 10 },
  ];

  const handleScheduleVisit = () => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    setShowScheduleModal(true);
  };

  const handleSubmitAppointment = async () => {
    if (!user) {
      setModalHeading('Error');
      setModalMessage('You must be logged in to schedule a donation.');
      setShowSuccessModal(true);
      return;
    }
    try {
      const dateTimeString = `${appointmentDate} ${appointmentTime}`;
      const parsedDate = new Date(dateTimeString);
      if (isNaN(parsedDate.getTime())) {
        throw new Error('Invalid date or time format');
      }

      const appointmentData = {
        userId: user.uid,
        type: 'appointment',
        bankName: selectedBloodBank || 'Blood Bank',
        date: parsedDate,
        time: appointmentTime,
        location: 'Not specified',
        status: 'upcoming',
        points: 150,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'donationsDone'), appointmentData);
      setModalHeading('Appointment Scheduled!');
      setModalMessage(
        `Your appointment has been scheduled for ${formatDate(parsedDate)} at ${appointmentTime} with ${
          selectedBloodBank || 'Blood Bank'
        }`
      );
      setShowSuccessModal(true);
      setShowScheduleModal(false);
      setAppointmentDate('');
      setAppointmentTime('');
      setSelectedBloodBank('');
    } catch (error) {
      console.error('Error scheduling appointment:', error.message, error.code);
      setModalHeading('Error');
      setModalMessage(`Failed to schedule appointment: ${error.message}. Please try again.`);
      setShowSuccessModal(true);
    }
  };

  const handleClearAll = async () => {
    if (!user) {
      setModalHeading('Error');
      setModalMessage('You must be logged in to clear activities.');
      setShowSuccessModal(true);
      return;
    }
    try {
      const donationsRef = query(
        collection(db, 'donationsDone'),
        where('userId', '==', user.uid),
        where('status', '==', 'upcoming')
      );
      const snapshot = await new Promise((resolve, reject) => {
        const unsub = onSnapshot(
          donationsRef,
          (snap) => {
            resolve(snap);
            unsub();
          },
          (error) => {
            reject(error);
          }
        );
      });
      if (snapshot.empty) {
        setModalHeading('No Activities');
        setModalMessage('There are no upcoming activities to clear.');
        setShowSuccessModal(true);
        setShowClearModal(false);
        return;
      }
      const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
      setModalHeading('Cleared Successfully!');
      setModalMessage('All scheduled donations have been cleared.');
      setShowSuccessModal(true);
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing donations:', error.message, error.code);
      setModalHeading('Error');
      setModalMessage(`Failed to clear scheduled donations: ${error.message}. Please try again.`);
      setShowSuccessModal(true);
    }
  };

  const handleDownloadCertificate = () => {
    if (!userProfile) {
      setModalHeading('Error');
      setModalMessage('User profile not found. Please ensure you are logged in.');
      setShowSuccessModal(true);
      return;
    }

    try {
      const certificateHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Blood Donation Certificate</title>
            <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                body {
                    font-family: 'Georgia', serif;
                    background: white;
                    width: 1000px;
                    height: 750px;
                    position: relative;
                    margin: 0 auto;
                }

                .certificate-container {
                    background: white;
                    width: 1000px;
                    height: 750px;
                    position: relative;
                    border-radius: 18px;
                    overflow: hidden;
                }

                .certificate-border {
                    position: absolute;
                    top: 25px;
                    left: 25px;
                    right: 25px;
                    bottom: 5px;
                    border: 4px solid #c41e3a;
                    border-radius: 12px;
                }

                .certificate-inner-border {
                    position: absolute;
                    top: 37px;
                    left: 37px;
                    right: 37px;
                    bottom: 17px;
                    border: 1.5px solid #c41e3a;
                    border-radius: 10px;
                }

                .certificate-header {
                    text-align: center;
                    padding-top: 75px;
                    position: relative;
                }

                .certificate-logo {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, #c41e3a, #e74c3c);
                    border-radius: 50%;
                    display: flex;
                    align-items: right;
                    justify-content: center;
                    margin: 0 auto 25px;
                    box-shadow: 0 10px 25px rgba(196, 30, 58, 0.3);
                }

                .logo-heart {
                    width: 45px;
                    height: 45px;
                    background: white;
                    transform: rotate(-45deg);
                    border-radius: 50% 0;
                    position: relative;
                }

                .logo-heart::before,
                .logo-heart::after {
                    content: '';
                    position: absolute;
                    width: 45px;
                    height: 45px;
                    background: white;
                    border-radius: 50%;
                }

                .logo-heart::before {
                    transform: rotate(-45deg);
                    top: -22.5px;
                    left: 0;
                }

                .logo-heart::after {
                    transform: rotate(45deg);
                    top: 0;
                    left: -22.5px;
                }

                .certificate-title {
                    font-size: 52px;
                    font-weight: bold;
                    color: #c41e3a;
                    margin-bottom: 12px;
                    text-shadow: 2.5px 2.5px 5px rgba(0,0,0,0.1);
                    font-family: 'Times New Roman', serif;
                }

                .certificate-subtitle {
                    font-size: 22px;
                    color: #666;
                    margin-bottom: 37px;
                    font-style: italic;
                }

                .certificate-recipient {
                    text-align: center;
                    margin: 37px 0;
                }

                .presented-to {
                    font-size: 20px;
                    color: #666;
                    margin-bottom: 12px;
                }

                .recipient-name {
                    font-size: 45px;
                    font-weight: bold;
                    color: #2c3e50;
                    margin-bottom: 25px;
                    text-decoration: underline;
                    text-decoration-color: #c41e3a;
                    text-underline-offset: 10px;
                    text-decoration-thickness: 2.5px;
                }

                .certificate-body {
                    text-align: center;
                    padding: 0 60px;
                    line-height: 1.6;
                    color: #444;
                    font-size: 18px;
                    margin-bottom: 25px;
                }

                .highlight {
                    color: #c41e3a;
                    font-weight: bold;
                }

                .stats-container {
                    display: flex;
                    justify-content: center;
                    gap: 50px;
                    margin: 45px 0;
                }

                .stat-item {
                    text-align: center;
                }

                .stat-number {
                    font-size: 35px;
                    font-weight: bold;
                    color: #c41e3a;
                    display: block;
                }

                .stat-label {
                    font-size: 15px;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                }

                .certificate-footer {
                    position: absolute;
                    bottom: 50px;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: space-between;
                    padding: 0 80px;
                    align-items: flex-end;
                }

                .signature-section {
                    text-align: center;
                }

                .signature-name {
                    font-family: 'Dancing Script', cursive;
                    font-size: 24px;
                    color: #1a3c5e;
                    transform: rotate(-2deg);
                    margin-bottom: 5px;
                }

                .signature-line {
                    width: 170px;
                    height: 2.5px;
                    background: #c41e3a;
                    margin-bottom: 10px;
                }

                .signature-text {
                    font-size: 17px;
                    color: #666;
                }

                .date-section {
                    text-align: center;
                }

                .date-text {
                    font-size: 17px;
                    color: #666;
                    margin-bottom: 6px;
                }

                .date-value {
                    font-size: 20px;
                    font-weight: bold;
                    color: #2c3e50;
                }

                .decorative-elements {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                    opacity: 0.1;
                }

                .decorative-corner {
                    position: absolute;
                    width: 125px;
                    height: 125px;
                    background: radial-gradient(circle, #c41e3a 20%, transparent 70%);
                }

                .decorative-corner.top-left {
                    top: 50px;
                    left: 50px;
                }

                .decorative-corner.top-right {
                    top: 50px;
                    right: 50px;
                }

                .decorative-corner.bottom-left {
                    bottom: 50px;
                    left: 50px;
                }

                .decorative-corner.bottom-right {
                    bottom: 50px;
                    right: 50px;
                }

                .badge {
                    position: absolute;
                    top: 56px;
                    right: 75px;
                    background: ${badgeInfo.gradient};
                    color: #b8860b;
                    padding: 10px 20px;
                    border-radius: 25px;
                    font-size: 15px;
                    font-weight: bold;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="certificate-border"></div>
                <div class="certificate-inner-border"></div>
                
                <div class="decorative-elements">
                    <div class="decorative-corner top-left"></div>
                    <div class="decorative-corner top-right"></div>
                    <div class="decorative-corner bottom-left"></div>
                    <div class="decorative-corner bottom-right"></div>
                </div>

                <div class="badge">${badgeInfo.label}</div>

                <div class="certificate-header">
                    <div class="certificate-logo">
                        <div class="logo-heart"></div>
                    </div>
                    <h1 class="certificate-title">Certificate of Appreciation</h1>
                    <p class="certificate-subtitle">For Outstanding Service in Blood Donation</p>
                </div>

                <div class="certificate-recipient">
                    <p class="presented-to">This is to certify that</p>
                    <h2 class="recipient-name">${username}</h2>
                </div>

                <div class="certificate-body">
                    <p>Has demonstrated exceptional commitment to saving lives through voluntary blood donation. 
                    Your selfless contribution has made a significant impact on our community and has helped 
                    provide life-saving blood to those in critical need.</p>
                    
                    <div class="stats-container">
                        <div class="stat-item">
                            <span class="stat-number">${totalDonations}</span>
                            <span class="stat-label">Donations</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${totalDonations * 3}</span>
                            <span class="stat-label">Lives Touched</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${bloodType}</span>
                            <span class="stat-label">Blood Type</span>
                        </div>
                    </div>
                </div>

                <div class="certificate-footer">
                    <div class="signature-section">
                        <p class="signature-name">Raksetu</p>
                        <div class="signature-line"></div>
                        <p class="signature-text">Medical Director</p>
                        <p class="signature-text">Raksetu Blood Bank</p>
                    </div>
                    <div class="date-section">
                        <p class="date-text">Date of Issue</p>
                        <p class="date-value">June 08, 2025</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;

      const displayWindow = window.open('', '_blank');
      displayWindow.document.write(certificateHTML);
      displayWindow.document.close();

      setModalHeading('Certificate Generated!');
      setModalMessage(
        'Your certificate has been opened in a new window. You can view it and save it as a PDF using your browser’s print or save options.'
      );
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error generating certificate:', error.message);
      setModalHeading('Error');
      setModalMessage('Failed to generate certificate. Please try again.');
      setShowSuccessModal(true);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!isLoggedIn) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Your Impact</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Sign in to view your donation history and track lives saved
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode('login');
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setAuthMode('signup');
                }}
                className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium border border-gray-300 transition-colors"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <ErrorBoundary>
      <section className="py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Impact Dashboard</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeInfo.color}`}>
              {badgeInfo.label}
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                  {bloodType}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{username}</h3>
                  <p className="text-red-100">
                    {totalDonations} donations • {totalImpactPoints} impact points
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{totalDonations}</div>
                <div className="text-red-100 text-sm">Lives Saved</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{totalDonations}</div>
              <div className="text-gray-600 text-sm">Total Donations</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{totalDonations * 3}</div>
              <div className="text-gray-600 text-sm">Lives Touched</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{totalImpactPoints}</div>
              <div className="text-gray-600 text-sm">Impact Points</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-purple-600">{bloodType}</div>
              <div className="text-gray-600 text-sm">Blood Type</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Upcoming Activities</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleScheduleVisit}
                      className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Schedule new donation"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowClearModal(true)}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      title="Clear all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {[...registeredDrives, ...appointments].length > 0 ? (
                  <div className="space-y-3">
                    {[...registeredDrives, ...appointments].map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {item.driveName || item.bankName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(item.date)} • {item.time}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No upcoming activities</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">Recent Donations</h3>
                </div>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {completedDonations.length > 0 ? (
                  <div className="space-y-3">
                    {completedDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          donation.status === 'pending' ? 'bg-yellow-50 border-yellow-200' : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 mt-0.5 ${
                            donation.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {donation.bankName || donation.hospital || 'Blood Donation'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(donation.date)} • {donation.time}
                          </div>
                          <div
                            className={`text-xs font-medium ${
                              donation.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                            }`}
                          >
                            {donation.status === 'pending' ? 'Pending Confirmation' : '+1 Life Saved'}
                          </div>
                          <div className="text-xs text-gray-500">Points: {donation.points || 0}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No donations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => {
                const Icon = achievement.icon;
                return (
                  <div key={index} className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        achievement.achieved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                    <div className="text-xs text-gray-500">
                      {achievement.achieved ? 'Unlocked' : `${achievement.threshold} donations`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleScheduleVisit}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Schedule Donation
            </button>
            <button
              onClick={handleDownloadCertificate}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Certificate
            </button>
          </div>

          {showScheduleModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Schedule Donation</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Blood Bank</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      value={selectedBloodBank}
                      onChange={(e) => setSelectedBloodBank(e.target.value)}
                    >
                      <option value="">Select a blood bank</option>
                      <option value="Raksetu Blood Bank">Raksetu Blood Bank</option>
                      <option value="City Central Blood Bank">City Central Blood Bank</option>
                      <option value="Northside Community Blood Center">Northside Community Blood Center</option>
                      <option value="Hope Valley Blood Bank">Hope Valley Blood Bank</option>
                      <option value="Unity Blood Services">Unity Blood Services</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      min={new Date().toISOString().split('T')[0]}
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Time</label>
                    <select
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    >
                      <option value="">Select a time</option>
                      {[
                        '09:00 AM',
                        '10:00 AM',
                        '11:00 AM',
                        '12:00 PM',
                        '01:00 PM',
                        '02:00 PM',
                        '03:00 PM',
                        '04:00 PM',
                        '05:00 PM',
                      ].map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors font-medium"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSelectedBloodBank('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                    onClick={handleSubmitAppointment}
                    disabled={!appointmentDate || !appointmentTime || !selectedBloodBank}
                  >
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          )}

          {showClearModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Clear All Activities?</h3>
                <p className="text-gray-600 mb-6">
                  This will remove all scheduled donations and registrations. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors font-medium"
                    onClick={() => setShowClearModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-medium"
                    onClick={handleClearAll}
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{modalHeading}</h3>
                <p className="text-gray-600 mb-6">{modalMessage}</p>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </ErrorBoundary>
  );
}