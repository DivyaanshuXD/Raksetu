import { useEffect, useState, useMemo, Component } from 'react';
import { logger } from '../../utils/logger';
import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin, Trash2, Plus, TrendingUp, FileText, BarChart3, LineChart as LineChartIcon, PieChart as PieChartIcon } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, onSnapshot, addDoc, query, where, deleteDoc, doc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { generatePDFCertificate, generateAnnualReport } from '../../services/pdfExportService';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DatePicker from '../common/DatePicker';

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

export default function TrackDonationsSection({ onDonationConfirmed, isLoggedIn, setShowAuthModal, setAuthMode, donations, userProfile }) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedBloodBank, setSelectedBloodBank] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [completedDonations, setCompletedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChartTab, setActiveChartTab] = useState('timeline');
  const [bloodBanks, setBloodBanks] = useState([]);

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
        logger.error('Error fetching completed donations:', error.message, error.code);
        setCompletedDonations([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Fetch blood banks from Firebase
  useEffect(() => {
    const bloodBanksRef = collection(db, 'bloodBanks');
    const unsubscribe = onSnapshot(
      bloodBanksRef,
      (snapshot) => {
        const banks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBloodBanks(banks);
      },
      (error) => {
        logger.error('Error fetching blood banks:', error);
        setBloodBanks([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // NOTE: Donations are now managed by useDonations hook in BloodHub parent component
  // This prevents duplicate subscriptions and "setDonations is not a function" errors
  // The donations prop contains the latest data from Firestore via the parent's subscription

  // Memoize expensive calculations to prevent recalculation on every render
  // Only count COMPLETED donations (not pending) for achievements
  const totalDonations = useMemo(() => 
    completedDonations.filter(d => d.status === 'completed').length, 
    [completedDonations]
  );
  const totalImpactPoints = useMemo(
    () => completedDonations.reduce((sum, donation) => sum + (donation.points || 0), 0),
    [completedDonations]
  );
  const bloodType = userProfile?.bloodType || 'Not specified';
  const username = userProfile?.name || 'Anonymous';

  // Prepare chart data - donation timeline
  const donationTimelineData = useMemo(() => {
    if (completedDonations.length === 0) return [];
    
    // Group donations by month
    const monthlyData = {};
    completedDonations.forEach(donation => {
      const date = donation.date;
      const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          month: monthYear,
          donations: 0,
          points: 0,
          lives: 0
        };
      }
      
      monthlyData[monthYear].donations += 1;
      monthlyData[monthYear].points += donation.points || 0;
      monthlyData[monthYear].lives += 3; // Each donation saves ~3 lives
    });
    
    // Convert to array and sort by date
    return Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    });
  }, [completedDonations]);

  // Prepare cumulative impact data
  const cumulativeImpactData = useMemo(() => {
    if (donationTimelineData.length === 0) return [];
    
    let cumulativeDonations = 0;
    let cumulativePoints = 0;
    let cumulativeLives = 0;
    
    return donationTimelineData.map(month => {
      cumulativeDonations += month.donations;
      cumulativePoints += month.points;
      cumulativeLives += month.lives;
      
      return {
        month: month.month,
        totalDonations: cumulativeDonations,
        totalPoints: cumulativePoints,
        totalLives: cumulativeLives
      };
    });
  }, [donationTimelineData]);

  // Prepare monthly comparison data (last 6 months)
  const monthlyComparisonData = useMemo(() => {
    return donationTimelineData.slice(-6);
  }, [donationTimelineData]);

  const registeredDrives = useMemo(
    () => donations.filter((d) => d.type === 'drive'),
    [donations]
  );
  const appointments = useMemo(
    () => donations.filter((d) => d.type === 'appointment'),
    [donations]
  );

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
    // Match ProfileSection badge logic exactly
    if (totalDonations >= 10)
      return {
        label: 'Gold Donor',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        gradient: 'linear-gradient(135deg, #ffd700, #ffed4e)',
      };
    if (totalDonations >= 5)
      return {
        label: 'Silver Donor',
        color: 'bg-gray-100 text-gray-700 border-gray-300',
        gradient: 'linear-gradient(135deg, #c0c0c0, #e8e8e8)',
      };
    if (totalDonations >= 1)
      return {
        label: 'Bronze Donor',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        gradient: 'linear-gradient(135deg, #cd7f32, #e5a668)',
      };
    return {
      label: 'New Hero',
      color: 'bg-green-100 text-green-700 border-green-200',
      gradient: 'linear-gradient(135deg, #90ee90, #32cd32)',
    };
  };

  const badgeInfo = getBadgeInfo();

  const achievements = [
    { icon: Heart, title: 'Bronze Donor', threshold: 1, achieved: totalDonations >= 1 },
    { icon: Users, title: 'Silver Donor', threshold: 5, achieved: totalDonations >= 5 },
    { icon: Award, title: 'Gold Donor', threshold: 10, achieved: totalDonations >= 10 },
    { icon: Check, title: 'Platinum Hero', threshold: 20, achieved: totalDonations >= 20 },
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
      logger.error('Error scheduling appointment:', error.message, error.code);
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
      logger.error('Error clearing donations:', error.message, error.code);
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
    // Show export modal to choose format
    setShowExportModal(true);
  };

  const handleExportHTML = async () => {
    if (!userProfile) {
      setModalHeading('Error');
      setModalMessage('User profile not found. Please ensure you are logged in.');
      setShowSuccessModal(true);
      return;
    }

    try {
      // Fetch real-time stats from Firebase
      const statsSnapshot = await getDocs(collection(db, 'users'));
      const totalDonors = statsSnapshot.size;
      
      const donationsSnapshot = await getDocs(collection(db, 'donations'));
      const totalGlobalDonations = donationsSnapshot.size;
      const livesImpacted = totalGlobalDonations * 3;
      
      const bloodBanksSnapshot = await getDocs(collection(db, 'blood_banks'));
      const totalBloodBanks = bloodBanksSnapshot.size;

      // Get last donation date
      const lastDonation = completedDonations.length > 0 
        ? completedDonations.sort((a, b) => b.date - a.date)[0]
        : null;
      const lastDonationDate = lastDonation 
        ? lastDonation.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : 'N/A';

      // Get formatted current date
      const formattedDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const certificateHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Blood Donation Certificate - ${username}</title>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                @media print {
                    body { margin: 0; }
                    .certificate-container { page-break-after: avoid; }
                }

                body {
                    font-family: 'Inter', sans-serif;
                    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .certificate-container {
                    background: white;
                    width: 1200px;
                    height: 850px;
                    position: relative;
                    border-radius: 24px;
                    overflow: hidden;
                    box-shadow: 0 30px 90px rgba(0,0,0,0.15);
                }

                .cert-bg {
                    position: absolute;
                    inset: 0;
                    background: 
                        linear-gradient(135deg, rgba(239, 68, 68, 0.03) 0%, rgba(220, 38, 38, 0.08) 100%),
                        radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(220, 38, 38, 0.05) 0%, transparent 50%);
                }

                .cert-border-outer {
                    position: absolute;
                    inset: 40px;
                    border: 3px solid transparent;
                    border-image: linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #dc2626 100%);
                    border-image-slice: 1;
                    border-radius: 16px;
                }

                .cert-border-inner {
                    position: absolute;
                    inset: 55px;
                    border: 1px solid rgba(220, 38, 38, 0.2);
                    border-radius: 12px;
                }

                .cert-header {
                    position: relative;
                    text-align: center;
                    padding-top: 80px;
                    z-index: 10;
                }

                .cert-logo-wrapper {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 30px;
                }

                .cert-logo {
                    width: 90px;
                    height: 90px;
                    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 40px rgba(220, 38, 38, 0.3);
                    position: relative;
                }

                .cert-logo::before {
                    content: '❤';
                    font-size: 40px;
                    color: white;
                }

                .cert-logo::after {
                    content: '';
                    position: absolute;
                    inset: -8px;
                    border: 2px solid rgba(220, 38, 38, 0.2);
                    border-radius: 50%;
                }

                .org-name {
                    font-size: 26px;
                    font-weight: 700;
                    color: #1f2937;
                    letter-spacing: 2px;
                    margin-left: 20px;
                    font-family: 'Playfair Display', serif;
                }

                .cert-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 64px;
                    font-weight: 900;
                    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    margin-bottom: 15px;
                    letter-spacing: -1px;
                }

                .cert-subtitle {
                    font-size: 20px;
                    color: #6b7280;
                    font-weight: 400;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                }

                .cert-recipient {
                    text-align: center;
                    margin: 50px 0 40px;
                    position: relative;
                    z-index: 10;
                }

                .presented-text {
                    font-size: 18px;
                    color: #9ca3af;
                    font-weight: 300;
                    letter-spacing: 1px;
                    margin-bottom: 15px;
                }

                .recipient-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 56px;
                    font-weight: 700;
                    color: #111827;
                    margin-bottom: 10px;
                    position: relative;
                    display: inline-block;
                }

                .recipient-name::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 80%;
                    height: 3px;
                    background: linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%);
                }

                .cert-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 30px;
                    max-width: 900px;
                    margin: 0 auto 40px;
                    padding: 0 80px;
                    position: relative;
                    z-index: 10;
                }

                .stat-card {
                    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
                    padding: 25px 20px;
                    border-radius: 16px;
                    text-align: center;
                    border: 1px solid rgba(220, 38, 38, 0.1);
                }

                .stat-number {
                    font-size: 36px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    display: block;
                    margin-bottom: 8px;
                }

                .stat-label {
                    font-size: 13px;
                    color: #6b7280;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .cert-message {
                    text-align: center;
                    max-width: 750px;
                    margin: 0 auto 50px;
                    padding: 0 80px;
                    font-size: 16px;
                    line-height: 1.8;
                    color: #4b5563;
                    position: relative;
                    z-index: 10;
                }

                .cert-footer {
                    position: absolute;
                    bottom: 60px;
                    left: 80px;
                    right: 80px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    z-index: 10;
                }

                .signature-block {
                    text-align: center;
                }

                .signature-name {
                    font-family: 'Playfair Display', serif;
                    font-size: 28px;
                    color: #111827;
                    font-weight: 700;
                    margin-bottom: 10px;
                }

                .signature-line {
                    width: 200px;
                    height: 2px;
                    background: linear-gradient(90deg, transparent 0%, #dc2626 50%, transparent 100%);
                    margin: 0 auto 10px;
                }

                .signature-title {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 600;
                }

                .signature-org {
                    font-size: 13px;
                    color: #9ca3af;
                    margin-top: 4px;
                }

                .cert-date {
                    text-align: center;
                }

                .date-label {
                    font-size: 13px;
                    color: #9ca3af;
                    margin-bottom: 8px;
                }

                .date-value {
                    font-size: 18px;
                    color: #111827;
                    font-weight: 600;
                }

                .cert-badge {
                    position: absolute;
                    top: 60px;
                    right: 80px;
                    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
                    color: #78350f;
                    padding: 12px 24px;
                    border-radius: 30px;
                    font-size: 14px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.3);
                    z-index: 15;
                }

                .cert-verification {
                    position: absolute;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    text-align: center;
                    font-size: 11px;
                    color: #9ca3af;
                    z-index: 10;
                }

                .verification-id {
                    font-family: 'Courier New', monospace;
                    color: #6b7280;
                    margin-top: 4px;
                }
            </style>
        </head>
        <body>
            <div class="certificate-container">
                <div class="cert-bg"></div>
                <div class="cert-border-outer"></div>
                <div class="cert-border-inner"></div>
                
                <div class="cert-badge">${badgeInfo.label}</div>

                <div class="cert-header">
                    <div class="cert-logo-wrapper">
                        <div class="cert-logo"></div>
                        <span class="org-name">RAKSETU</span>
                    </div>
                    <h1 class="cert-title">Certificate of Honor</h1>
                    <p class="cert-subtitle">Life-Saving Blood Donation</p>
                </div>

                <div class="cert-recipient">
                    <p class="presented-text">This is proudly presented to</p>
                    <h2 class="recipient-name">${username}</h2>
                </div>

                <div class="cert-stats">
                    <div class="stat-card">
                        <span class="stat-number">${totalDonations}</span>
                        <span class="stat-label">Your Donations</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${bloodType}</span>
                        <span class="stat-label">Blood Type</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${totalDonations * 3}</span>
                        <span class="stat-label">Lives Touched</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-number">${lastDonationDate}</span>
                        <span class="stat-label">Last Donation</span>
                    </div>
                </div>

                <div class="cert-message">
                    In recognition of your extraordinary commitment to saving lives through voluntary blood donation. 
                    Your selfless contribution has made a profound impact on countless individuals and families. 
                    You are part of India's ${totalDonors.toLocaleString('en-IN')}+ active donors who have collectively saved 
                    ${livesImpacted.toLocaleString('en-IN')}+ lives through ${totalGlobalDonations.toLocaleString('en-IN')}+ donations across 
                    ${totalBloodBanks}+ registered blood banks.
                </div>

                <div class="cert-footer">
                    <div class="signature-block">
                        <p class="signature-name">Dr. Rajesh Kumar</p>
                        <div class="signature-line"></div>
                        <p class="signature-title">Medical Director</p>
                        <p class="signature-org">Raksetu Blood Services</p>
                    </div>

                    <div class="cert-date">
                        <p class="date-label">Issue Date</p>
                        <p class="date-value">${formattedDate}</p>
                    </div>

                    <div class="signature-block">
                        <p class="signature-name">Raksetu Foundation</p>
                        <div class="signature-line"></div>
                        <p class="signature-title">Authorized Signatory</p>
                        <p class="signature-org">Ministry of Health</p>
                    </div>
                </div>

                <div class="cert-verification">
                    <p>Certificate ID: RAKSETU-${userProfile.uid?.substring(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}</p>
                    <p class="verification-id">Verify at: raksetu.live/verify</p>
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
        "Your certificate has been opened in a new window. You can view it and save it as a PDF using your browser's print or save options."
      );
      setShowSuccessModal(true);
      setShowExportModal(false);
    } catch (error) {
      logger.error('Error generating certificate:', error.message);
      setModalHeading('Error');
      setModalMessage('Failed to generate certificate. Please try again.');
      setShowSuccessModal(true);
    }
  };

  const handleExportPDF = () => {
    if (!userProfile) {
      setModalHeading('Error');
      setModalMessage('User profile not found. Please ensure you are logged in.');
      setShowSuccessModal(true);
      return;
    }

    const userData = {
      name: username,
      bloodType: bloodType,
      totalDonations: totalDonations,
      totalImpactPoints: totalImpactPoints,
      badgeLabel: badgeInfo.label
    };

    const success = generatePDFCertificate(userData);
    
    if (success) {
      setModalHeading('PDF Certificate Generated!');
      setModalMessage('Your PDF certificate has been downloaded successfully.');
      setShowSuccessModal(true);
      setShowExportModal(false);
    }
  };

  const handleExportAnnualReport = () => {
    if (!userProfile || completedDonations.length === 0) {
      setModalHeading('No Data');
      setModalMessage('You need at least one completed donation to generate an annual report.');
      setShowSuccessModal(true);
      return;
    }

    const currentYear = new Date().getFullYear();
    const yearDonations = completedDonations.filter(donation => {
      const donationYear = donation.date instanceof Date 
        ? donation.date.getFullYear()
        : new Date(donation.date).getFullYear();
      return donationYear === currentYear;
    });

    const reportData = {
      userName: username,
      bloodType: bloodType,
      year: currentYear,
      totalDonations: yearDonations.length,
      totalImpactPoints: yearDonations.reduce((sum, d) => sum + (d.points || 0), 0),
      donations: yearDonations.map(d => ({
        date: d.date instanceof Date 
          ? d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        location: d.location || d.bankName || 'N/A',
        bloodType: d.bloodType || bloodType,
        status: d.status || 'Completed'
      }))
    };

    const success = generateAnnualReport(reportData);
    
    if (success) {
      setModalHeading('Annual Report Generated!');
      setModalMessage(`Your ${currentYear} annual donation report has been downloaded successfully.`);
      setShowSuccessModal(true);
      setShowExportModal(false);
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

          {/* Analytics Charts Section */}
          {completedDonations.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Analytics & Insights</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveChartTab('timeline')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeChartTab === 'timeline'
                        ? 'bg-red-100 text-red-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LineChartIcon className="w-4 h-4" />
                    Timeline
                  </button>
                  <button
                    onClick={() => setActiveChartTab('monthly')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeChartTab === 'monthly'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    Monthly
                  </button>
                  <button
                    onClick={() => setActiveChartTab('impact')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      activeChartTab === 'impact'
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    Impact
                  </button>
                </div>
              </div>

              {/* Timeline Chart */}
              {activeChartTab === 'timeline' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Your donation journey over time</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={donationTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="donations" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Donations"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="lives" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                        activeDot={{ r: 6 }}
                        name="Lives Saved"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Monthly Comparison Chart */}
              {activeChartTab === 'monthly' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Monthly donation statistics (last 6 months)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar 
                        dataKey="donations" 
                        fill="#ef4444" 
                        radius={[8, 8, 0, 0]}
                        name="Donations"
                      />
                      <Bar 
                        dataKey="points" 
                        fill="#10b981" 
                        radius={[8, 8, 0, 0]}
                        name="Impact Points"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Cumulative Impact Chart */}
              {activeChartTab === 'impact' && (
                <div>
                  <p className="text-sm text-gray-600 mb-4">Cumulative impact and growth over time</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={cumulativeImpactData}>
                      <defs>
                        <linearGradient id="colorDonations" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorLives" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#9ca3af"
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalDonations" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorDonations)"
                        name="Total Donations"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="totalLives" 
                        stroke="#3b82f6" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorLives)"
                        name="Total Lives Saved"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

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
                    {[...registeredDrives, ...appointments].map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 transition-all ${
                        achievement.achieved 
                          ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600 shadow-md' 
                          : 'bg-gray-200 text-gray-400 opacity-50'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className={`text-sm font-medium ${
                      achievement.achieved ? 'text-gray-900' : 'text-gray-400'
                    }`}>{achievement.title}</div>
                    <div className="text-xs text-gray-500">
                      {achievement.achieved ? '✓ Unlocked' : `Needs ${achievement.threshold} donations`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button
              onClick={handleScheduleVisit}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              Schedule Donation
            </button>
            <button
              onClick={handleDownloadCertificate}
              className="flex-1 sm:flex-none bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export Certificate
            </button>
          </div>

          {showExportModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Choose Export Format</h3>
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Select the format you'd like to export your donation certificate
                </p>

                <div className="space-y-3">
                  {/* PDF Certificate */}
                  <button
                    onClick={handleExportPDF}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-red-500 hover:bg-red-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Download className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-red-600 transition-colors">
                        PDF Certificate
                      </div>
                      <div className="text-sm text-gray-600">
                        Download as PDF (recommended)
                      </div>
                    </div>
                  </button>

                  {/* HTML Certificate */}
                  <button
                    onClick={handleExportHTML}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        HTML Certificate
                      </div>
                      <div className="text-sm text-gray-600">
                        Open in new window (print to PDF)
                      </div>
                    </div>
                  </button>

                  {/* Annual Report */}
                  <button
                    onClick={handleExportAnnualReport}
                    className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                        Annual Report
                      </div>
                      <div className="text-sm text-gray-600">
                        Complete year-end report with stats
                      </div>
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full mt-4 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
                      {bloodBanks.length > 0 ? (
                        bloodBanks.map((bank) => (
                          <option key={bank.id} value={bank.name}>
                            {bank.name} - {bank.city}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>Loading blood banks...</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                    <DatePicker
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      minDate={new Date()}
                      placeholder="Select appointment date"
                      className="w-full"
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
