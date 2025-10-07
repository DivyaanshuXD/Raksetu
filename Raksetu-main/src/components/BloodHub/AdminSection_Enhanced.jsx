import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, getDoc, updateDoc, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { logger } from '../../utils/logger';
import { 
  ChevronDown, ChevronUp, Trash2, ArrowLeft, Users, MessageSquare, Shield, Activity, 
  TrendingUp, Search, X, Plus, Edit, Check, AlertCircle, MapPin, Phone, Mail, 
  Building, Calendar, Download, Filter, RefreshCw, Eye, EyeOff, Heart, Droplet,
  Bell, Clock, CheckCircle, XCircle, BarChart3, Database, Trophy, Brain, AlertTriangle, Target, PlayCircle, History, Handshake
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  exportDonationHistoryCSV, 
  exportEmergencyRequestsCSV, 
  exportBloodBanksCSV, 
  exportUsersCSV, 
  exportTestimonialsCSV 
} from '../../services/csvExportService';
import { seedBloodBanks, getSeedingStats } from '../../services/mockDataSeeder';
import { seedInitialChallenges, checkExistingChallenges } from '../../scripts/seedChallenges';
import AdminChallengesSection from './AdminChallengesSection';
import CommunityEventsSeeder from './CommunityEventsSeeder';

export default function AdminSectionEnhanced({ setActiveSection, userProfile }) {
  // State management
  const [users, setUsers] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [donations, setDonations] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [partnershipApplications, setPartnershipApplications] = useState([]);
  
  const [loading, setLoading] = useState({
    users: true,
    testimonials: true,
    bloodBanks: true,
    emergencies: true,
    donations: true,
    challenges: true,
    partnerships: true
  });
  
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, testimonials, bloodbanks, emergencies, analytics
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, pending, rejected
  const [showModal, setShowModal] = useState({ show: false, type: '', data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', id: '' });
  const [formData, setFormData] = useState({});
  const [seeding, setSeeding] = useState(false);
  const [seedingResult, setSeedingResult] = useState(null);
  const [seedingChallenges, setSeedingChallenges] = useState(false);
  const [challengeSeedingResult, setChallengeSeedingResult] = useState(null);
  
  // ML Dashboard state
  const [atRiskDonors, setAtRiskDonors] = useState([]);
  const [mlStats, setMlStats] = useState(null);
  const [campaignHistory, setCampaignHistory] = useState([]);
  const [loadingML, setLoadingML] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [campaignConfig, setCampaignConfig] = useState({ maxNotifications: 10, dryRun: false });

  // Real-time data fetching
  useEffect(() => {
    const unsubscribers = [];

    // Fetch Users
    const usersQuery = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    unsubscribers.push(onSnapshot(usersQuery, 
      (snapshot) => {
        const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(usersList);
        setLoading(prev => ({ ...prev, users: false }));
      },
      (err) => {
        logger.error('Error fetching users:', err);
        setError(`Failed to load users: ${err.message}`);
        setLoading(prev => ({ ...prev, users: false }));
      }
    ));

    // Fetch Testimonials
    const testimonialsQuery = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    unsubscribers.push(onSnapshot(testimonialsQuery,
      async (snapshot) => {
        const testimonialsList = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let userName = 'Anonymous';
            if (data.userId) {
              try {
                const userDoc = await getDoc(doc(db, 'users', data.userId));
                if (userDoc.exists()) userName = userDoc.data().name || 'Anonymous';
              } catch (err) {
                logger.error('Error fetching user:', err);
              }
            }
            return {
              id: docSnap.id,
              ...data,
              userName,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date()
            };
          })
        );
        setTestimonials(testimonialsList);
        setLoading(prev => ({ ...prev, testimonials: false }));
      },
      (err) => {
        logger.error('Error fetching testimonials:', err);
        setLoading(prev => ({ ...prev, testimonials: false }));
      }
    ));

    // Fetch Blood Banks - Don't order by createdAt as it may not exist on all documents
    const bloodBanksQuery = query(collection(db, 'bloodBanks'));
    unsubscribers.push(onSnapshot(bloodBanksQuery,
      (snapshot) => {
        const banksList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        logger.info('✅ Blood Banks loaded:', banksList.length, 'banks');
        setBloodBanks(banksList);
        setLoading(prev => ({ ...prev, bloodBanks: false }));
      },
      (err) => {
        logger.error('❌ Error fetching blood banks:', err);
        setLoading(prev => ({ ...prev, bloodBanks: false }));
      }
    ));

    // Fetch Emergency Requests (Collection name: emergencyRequests)
    const emergenciesQuery = query(collection(db, 'emergencyRequests'), orderBy('createdAt', 'desc'));
    unsubscribers.push(onSnapshot(emergenciesQuery,
      (snapshot) => {
        const emergenciesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date()
        }));
        logger.info('✅ Emergency Requests loaded:', emergenciesList.length, 'requests');
        setEmergencyRequests(emergenciesList);
        setLoading(prev => ({ ...prev, emergencies: false }));
      },
      (err) => {
        logger.error('❌ Error fetching emergencies:', err);
        setLoading(prev => ({ ...prev, emergencies: false }));
      }
    ));

    // Fetch Donations
    const donationsQuery = query(collection(db, 'donationsDone'), orderBy('date', 'desc'));
    unsubscribers.push(onSnapshot(donationsQuery,
      (snapshot) => {
        const donationsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date?.toDate ? doc.data().date.toDate() : new Date()
        }));
        logger.info('✅ Donations loaded:', donationsList.length, 'donations');
        setDonations(donationsList);
        setLoading(prev => ({ ...prev, donations: false }));
      },
      (err) => {
        logger.error('❌ Error fetching donations:', err);
        setLoading(prev => ({ ...prev, donations: false }));
      }
    ));

    // Fetch Challenges
    const challengesQuery = query(collection(db, 'challenges'), orderBy('createdAt', 'desc'));
    unsubscribers.push(onSnapshot(challengesQuery,
      (snapshot) => {
        const challengesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        logger.info('✅ Challenges loaded:', challengesList.length, 'challenges');
        setChallenges(challengesList);
        setLoading(prev => ({ ...prev, challenges: false }));
      },
      (err) => {
        logger.error('❌ Error fetching challenges:', err);
        setLoading(prev => ({ ...prev, challenges: false }));
      }
    ));

    // Fetch Partnership Applications
    const partnershipsQuery = query(collection(db, 'partnershipApplications'), orderBy('appliedAt', 'desc'));
    unsubscribers.push(onSnapshot(partnershipsQuery,
      (snapshot) => {
        const partnershipsList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          appliedAt: doc.data().appliedAt?.toDate ? doc.data().appliedAt.toDate() : new Date(),
          reviewedAt: doc.data().reviewedAt?.toDate ? doc.data().reviewedAt.toDate() : null
        }));
        logger.info('✅ Partnerships loaded:', partnershipsList.length, 'applications');
        setPartnershipApplications(partnershipsList);
        setLoading(prev => ({ ...prev, partnerships: false }));
      },
      (err) => {
        logger.error('❌ Error fetching partnerships:', err);
        setLoading(prev => ({ ...prev, partnerships: false }));
      }
    ));

    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  // Initialize form data when editing inventory
  useEffect(() => {
    if (showModal.show && showModal.type === 'editInventory' && showModal.data) {
      const inventory = showModal.data.inventory || {};
      setFormData({
        'O+': inventory['O+'] || 0,
        'O-': inventory['O-'] || 0,
        'A+': inventory['A+'] || 0,
        'A-': inventory['A-'] || 0,
        'B+': inventory['B+'] || 0,
        'B-': inventory['B-'] || 0,
        'AB+': inventory['AB+'] || 0,
        'AB-': inventory['AB-'] || 0
      });
    } else if (!showModal.show) {
      setFormData({});
    }
  }, [showModal]);

  // Fetch ML Dashboard Data
  useEffect(() => {
    const fetchMLData = async () => {
      setLoadingML(true);
      try {
        // Fetch at-risk donors
        const donorsResponse = await fetch('http://localhost:3000/api/ml/at-risk-donors?threshold=0.5&limit=50');
        if (donorsResponse.ok) {
          const donorsData = await donorsResponse.json();
          setAtRiskDonors(donorsData.donors || []);
        }

        // Fetch ML stats
        const statsResponse = await fetch('http://localhost:3000/api/ml/reengagement/stats');
        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setMlStats(statsData);
        }

        // Fetch campaign history
        const historyResponse = await fetch('http://localhost:3000/api/ml/reengagement/history?limit=10');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setCampaignHistory(historyData.campaigns || []);
        }
      } catch (error) {
        logger.error('Error fetching ML data:', error);
      } finally {
        setLoadingML(false);
      }
    };

    if (activeTab === 'mlDashboard') {
      fetchMLData();
    }
  }, [activeTab]);

  // Handle manual campaign trigger
  const handleRunCampaign = async () => {
    setLoadingML(true);
    try {
      const response = await fetch('http://localhost:3000/api/ml/reengagement/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignConfig)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Campaign ${campaignConfig.dryRun ? 'simulation' : 'execution'} complete!\n\nProcessed: ${result.processed}\nNotified: ${result.notified}\nErrors: ${result.errors}`);
        
        // Refresh campaign history
        const historyResponse = await fetch('http://localhost:3000/api/ml/reengagement/history?limit=10');
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setCampaignHistory(historyData.campaigns || []);
        }
      } else {
        alert('Failed to run campaign');
      }
    } catch (error) {
      logger.error('Error running campaign:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoadingML(false);
      setShowCampaignModal(false);
    }
  };

  // Computed statistics
  const stats = useMemo(() => {
    const totalDonations = donations.length;
    const totalBloodBanks = bloodBanks.length;
    
    // Debug: Log emergency requests to see their status values
    logger.info('📊 Emergency Requests Debug:', emergencyRequests.map(e => ({ 
      id: e.id, 
      status: e.status,
      patientName: e.patientName 
    })));
    
    const activeEmergencies = emergencyRequests.filter(e => e.status === 'active').length;
    const pendingEmergencies = emergencyRequests.filter(e => e.status === 'pending').length;
    const fulfilledEmergencies = emergencyRequests.filter(e => e.status === 'fulfilled').length;
    
    logger.info('📊 Stats Breakdown:', {
      total: emergencyRequests.length,
      active: activeEmergencies,
      pending: pendingEmergencies,
      fulfilled: fulfilledEmergencies
    });
    
    // Calculate growth (mock data - replace with actual comparison)
    const userGrowth = users.length > 0 ? '+12%' : '0%';
    const donationGrowth = totalDonations > 0 ? '+8%' : '0%';

    // Blood type distribution
    const bloodTypeDistribution = {};
    users.forEach(user => {
      const bloodType = user.bloodType || 'Unknown';
      bloodTypeDistribution[bloodType] = (bloodTypeDistribution[bloodType] || 0) + 1;
    });

    return {
      totalUsers: users.length,
      totalTestimonials: testimonials.length,
      totalDonations,
      totalBloodBanks,
      activeEmergencies,
      pendingEmergencies,
      fulfilledEmergencies,
      userGrowth,
      donationGrowth,
      bloodTypeDistribution
    };
  }, [users, testimonials, donations, bloodBanks, emergencyRequests]);

  // Chart data
  const chartData = useMemo(() => {
    // Monthly donations
    const monthlyDonations = {};
    donations.forEach(donation => {
      const month = donation.date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      monthlyDonations[month] = (monthlyDonations[month] || 0) + 1;
    });

    const donationChartData = Object.entries(monthlyDonations)
      .slice(-6)
      .map(([month, count]) => ({ month, donations: count }));

    // Blood type distribution for pie chart
    const bloodTypePieData = Object.entries(stats.bloodTypeDistribution).map(([name, value]) => ({
      name,
      value
    }));

    // Emergency status distribution
    const emergencyStatusData = [
      { name: 'Active', value: stats.activeEmergencies, color: '#ef4444' },
      { name: 'Pending', value: stats.pendingEmergencies, color: '#f59e0b' },
      { name: 'Fulfilled', value: stats.fulfilledEmergencies, color: '#10b981' }
    ];

    return {
      donationChartData,
      bloodTypePieData,
      emergencyStatusData
    };
  }, [donations, stats]);

  // Handlers
  const handleDelete = useCallback(async (collectionName, itemId) => {
    try {
      await deleteDoc(doc(db, collectionName, itemId));
      setDeleteConfirm({ show: false, type: '', id: '' });
    } catch (err) {
      logger.error(`Error deleting item:`, err);
      setError(`Failed to delete: ${err.message}`);
    }
  }, []);

  const handleSeedBloodBanks = async () => {
    setSeeding(true);
    setSeedingResult(null);
    try {
      const result = await seedBloodBanks();
      setSeedingResult(result);
      setSeeding(false);
    } catch (error) {
      setSeedingResult({ 
        success: false, 
        message: 'Failed to seed blood banks', 
        error: error.message 
      });
      setSeeding(false);
    }
  };

  const handleSeedChallenges = async () => {
    setSeedingChallenges(true);
    setChallengeSeedingResult(null);
    try {
      const existingCount = await checkExistingChallenges();
      if (existingCount > 0) {
        setChallengeSeedingResult({
          success: false,
          message: `Found ${existingCount} existing challenges. Please delete them first if you want to reseed.`,
          count: existingCount
        });
        setSeedingChallenges(false);
        return;
      }

      const result = await seedInitialChallenges();
      setChallengeSeedingResult(result);
      setSeedingChallenges(false);
    } catch (error) {
      setChallengeSeedingResult({ 
        success: false, 
        message: 'Failed to seed challenges', 
        error: error.message 
      });
      setSeedingChallenges(false);
    }
  };

  const handleUpdateEmergency = useCallback(async (emergencyId, status) => {
    try {
      await updateDoc(doc(db, 'emergencies', emergencyId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      logger.error('Error updating emergency:', err);
      setError(`Failed to update emergency: ${err.message}`);
    }
  }, []);

  const handleAddBloodBank = useCallback(async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'bloodBanks'), {
        ...formData,
        status: 'active',
        createdAt: serverTimestamp(),
        verified: false
      });
      setShowModal({ show: false, type: '', data: null });
      setFormData({});
    } catch (err) {
      logger.error('Error adding blood bank:', err);
      setError(`Failed to add blood bank: ${err.message}`);
    }
  }, [formData]);

  // Handler for updating blood bank inventory
  const handleUpdateInventory = useCallback(async (e) => {
    e.preventDefault();
    try {
      const bankId = showModal.data.id;
      const inventory = {
        'O+': parseInt(formData['O+'] || 0),
        'O-': parseInt(formData['O-'] || 0),
        'A+': parseInt(formData['A+'] || 0),
        'A-': parseInt(formData['A-'] || 0),
        'B+': parseInt(formData['B+'] || 0),
        'B-': parseInt(formData['B-'] || 0),
        'AB+': parseInt(formData['AB+'] || 0),
        'AB-': parseInt(formData['AB-'] || 0)
      };

      await updateDoc(doc(db, 'bloodBanks', bankId), {
        inventory,
        updatedAt: serverTimestamp()
      });

      setShowModal({ show: false, type: '', data: null });
      setFormData({});
    } catch (err) {
      logger.error('Error updating inventory:', err);
      setError(`Failed to update inventory: ${err.message}`);
    }
  }, [formData, showModal.data]);

  // Handler for quick inventory adjustments
  const handleQuickAdjust = (bloodType, amount) => {
    const currentValue = parseInt(formData[bloodType] || 0);
    const newValue = Math.max(0, currentValue + amount);
    setFormData({ ...formData, [bloodType]: newValue });
  };

  // Handle Partnership Application Review
  const handlePartnershipReview = useCallback(async (applicationId, status, notes = '') => {
    try {
      const applicationRef = doc(db, 'partnershipApplications', applicationId);
      const application = partnershipApplications.find(app => app.id === applicationId);
      
      if (!application) {
        alert('Application not found');
        return;
      }

      // Update application status
      await updateDoc(applicationRef, {
        status,
        reviewedAt: serverTimestamp(),
        reviewedBy: userProfile?.name || 'Admin',
        notes
      });

      // If approved, update user's profile with partnership details
      if (status === 'approved' && application.userId) {
        const userRef = doc(db, 'users', application.userId);
        await updateDoc(userRef, {
          partnershipStatus: {
            active: true,
            tier: application.partnershipTier,
            approvedAt: serverTimestamp(),
            benefits: getPartnershipBenefits(application.partnershipTier)
          }
        });
      }

      alert(`Partnership application ${status}!`);
    } catch (error) {
      logger.error('Error reviewing partnership:', error);
      alert('Failed to review partnership application');
    }
  }, [partnershipApplications, userProfile]);

  // Get partnership benefits based on tier
  const getPartnershipBenefits = (tier) => {
    const benefits = {
      'Healthcare Partner': [
        'Priority blood request listings',
        'Verified partner badge',
        'Direct donor matching',
        'Email support'
      ],
      'NGO Alliance': [
        'Campaign co-creation',
        'Joint fundraising events',
        'Volunteer database access',
        'Social media promotion'
      ],
      'Corporate Partner': [
        'Employee engagement programs',
        'Unlimited blood donation drives',
        'CSR documentation',
        'Brand visibility in app'
      ]
    };
    return benefits[tier] || [];
  };

  // Filtered data
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' || 
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [users, searchTerm]);

  const filteredEmergencies = useMemo(() => {
    return emergencyRequests.filter(emergency => {
      const matchesFilter = filterStatus === 'all' || emergency.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        (emergency.patientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emergency.bloodType || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [emergencyRequests, filterStatus, searchTerm]);

  // Render different tabs
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full">{stats.userGrowth}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalUsers}</h3>
          <p className="text-blue-100 text-xs sm:text-sm">Total Users</p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Droplet className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full">{stats.donationGrowth}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalDonations}</h3>
          <p className="text-red-100 text-xs sm:text-sm">Total Donations</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Building className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalBloodBanks}</h3>
          <p className="text-green-100 text-xs sm:text-sm">Blood Banks</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <Bell className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full">Urgent</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-1">{emergencyRequests.length}</h3>
          <p className="text-orange-100 text-xs sm:text-sm">
            Total Emergencies
            {stats.activeEmergencies > 0 && <span className="block text-xs mt-1">({stats.activeEmergencies} active)</span>}
          </p>
        </div>

        <div 
          onClick={() => setActiveTab('seeder')}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <Database className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
            <span className="text-xs sm:text-sm bg-white/20 px-2 py-1 rounded-full">🌱</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold mb-1">Data Seeder</h3>
          <p className="text-purple-100 text-xs sm:text-sm">Click to seed</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Donation Trend */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
            Donation Trends
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.donationChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="donations" fill="#ef4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Type Distribution */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Droplet className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
            Blood Type Distribution
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={chartData.bloodTypePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.bloodTypePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'][index % 8]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          Recent Activity
        </h3>
        <div className="space-y-3">
          {emergencyRequests.slice(0, 5).map(emergency => (
            <div key={emergency.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${emergency.status === 'active' ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <div>
                  <p className="font-medium text-gray-900">{emergency.patientName}</p>
                  <p className="text-sm text-gray-600">{emergency.bloodType} • {emergency.hospital}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                emergency.status === 'active' ? 'bg-red-100 text-red-700' :
                emergency.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {emergency.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Partnerships Tab
  const renderPartnershipsTab = () => {
    const pendingApplications = partnershipApplications.filter(app => app.status === 'pending');
    const approvedApplications = partnershipApplications.filter(app => app.status === 'approved');
    const rejectedApplications = partnershipApplications.filter(app => app.status === 'rejected');

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-800">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mt-2">{pendingApplications.length}</p>
              </div>
              <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-800">Approved</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-2">{approvedApplications.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 sm:p-6 rounded-xl border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-red-800">Rejected</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-900 mt-2">{rejectedApplications.length}</p>
              </div>
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-800">Total</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-2">{partnershipApplications.length}</p>
              </div>
              <Handshake className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-lg">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Handshake className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" />
            Partnership Applications
          </h3>

          {loading.partnerships ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ) : partnershipApplications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Handshake className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No partnership applications yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnershipApplications.map(application => (
                <div 
                  key={application.id} 
                  className={`border-2 rounded-xl p-6 transition-all ${ 
                    application.status === 'pending' ? 'border-yellow-300 bg-yellow-50' : 
                    application.status === 'approved' ? 'border-green-300 bg-green-50' : 
                    'border-red-300 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{application.organizationName}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ 
                          application.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                          application.status === 'approved' ? 'bg-green-200 text-green-800' : 
                          'bg-red-200 text-red-800'
                        }`}>
                          {application.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Type:</strong> {application.partnershipTier} ({application.fee})
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Contact:</strong> {application.contactPerson}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <Mail className="inline w-3 h-3 mr-1" />
                        {application.email} | <Phone className="inline w-3 h-3 mr-1 ml-2" />
                        {application.phone}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        {application.city}{application.state && `, ${application.state}`}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Applied:</strong> {application.appliedAt?.toLocaleDateString()}
                      </p>
                      {application.reviewedAt && (
                        <p className="text-sm text-gray-600">
                          <strong>Reviewed:</strong> {application.reviewedAt.toLocaleDateString()} by {application.reviewedBy}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Expandable Description */}
                  <details className="mb-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-700 hover:text-gray-900">
                      View Details
                    </summary>
                    <div className="mt-3 space-y-2 text-sm text-gray-600 pl-4">
                      {application.description && (
                        <p><strong>Description:</strong> {application.description}</p>
                      )}
                      {application.goals && (
                        <p><strong>Goals:</strong> {application.goals}</p>
                      )}
                      {application.expectedImpact && (
                        <p><strong>Expected Impact:</strong> {application.expectedImpact}</p>
                      )}
                      {application.organizationSize && (
                        <p><strong>Organization Size:</strong> {application.organizationSize}</p>
                      )}
                      {application.yearsOperating && (
                        <p><strong>Years Operating:</strong> {application.yearsOperating}</p>
                      )}
                      {application.website && (
                        <p><strong>Website:</strong> <a href={application.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{application.website}</a></p>
                      )}
                      {application.notes && (
                        <p><strong>Admin Notes:</strong> {application.notes}</p>
                      )}
                    </div>
                  </details>

                  {/* Action Buttons */}
                  {application.status === 'pending' && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const notes = prompt('Add review notes (optional):');
                          if (notes !== null) {
                            handlePartnershipReview(application.id, 'approved', notes);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve Partnership
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Reason for rejection:');
                          if (reason) {
                            handlePartnershipReview(application.id, 'rejected', reason);
                          }
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}

                  {application.status === 'approved' && (
                    <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-sm text-green-800">
                      ✅ This organization is now an active partner on Raksetu platform
                    </div>
                  )}

                  {application.status === 'rejected' && application.notes && (
                    <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
                      ❌ Rejection Reason: {application.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUsersTab = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Users className="w-6 h-6 mr-2 text-blue-600" />
          User Management
          <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{filteredUsers.length}</span>
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportUsersCSV(filteredUsers)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {loading.users ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{(user.name || 'U')[0].toUpperCase()}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-600">{user.email || 'No email'}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{user.bloodType || 'N/A'}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{user.role || 'donor'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowModal({ show: true, type: 'viewUser', data: user })}
                  className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: true, type: 'users', id: user.id })}
                  className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderEmergenciesTab = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Bell className="w-6 h-6 mr-2 text-red-600" />
          Emergency Requests
          <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">{filteredEmergencies.length}</span>
        </h3>
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <button
            onClick={() => exportEmergencyRequestsCSV(filteredEmergencies)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="fulfilled">Fulfilled</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {loading.emergencies ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        </div>
      ) : filteredEmergencies.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No emergency requests found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredEmergencies.map(emergency => (
            <div key={emergency.id} className="p-5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{emergency.patientName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      emergency.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                      emergency.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {emergency.urgency} urgency
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      emergency.status === 'active' ? 'bg-red-100 text-red-700' :
                      emergency.status === 'fulfilled' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {emergency.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Droplet className="w-4 h-4 text-red-500" />
                      <span>Blood Type: <strong className="text-gray-900">{emergency.bloodType}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Building className="w-4 h-4 text-blue-500" />
                      <span>{emergency.hospital}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>{emergency.contactNumber}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>{emergency.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  {emergency.message && (
                    <p className="mt-3 text-sm text-gray-700 bg-white p-3 rounded-lg border border-gray-200">
                      {emergency.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                <button
                  onClick={() => handleUpdateEmergency(emergency.id, 'active')}
                  disabled={emergency.status === 'active'}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Active
                </button>
                <button
                  onClick={() => handleUpdateEmergency(emergency.id, 'fulfilled')}
                  disabled={emergency.status === 'fulfilled'}
                  className="px-4 py-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark Fulfilled
                </button>
                <button
                  onClick={() => setDeleteConfirm({ show: true, type: 'emergencies', id: emergency.id })}
                  className="ml-auto px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-medium transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderBloodBanksTab = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Building className="w-6 h-6 mr-2 text-green-600" />
          Blood Banks
          <span className="ml-3 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">{bloodBanks.length}</span>
        </h3>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportBloodBanksCSV(bloodBanks)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={() => setShowModal({ show: true, type: 'addBloodBank', data: null })}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Bank</span>
          </button>
        </div>
      </div>

      {loading.bloodBanks ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      ) : bloodBanks.length === 0 ? (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No blood banks found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bloodBanks.map(bank => (
            <div key={bank.id} className="p-5 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{bank.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span>{bank.address || 'Address not provided'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      <span>{bank.phone || 'Phone not provided'}</span>
                    </div>
                    {bank.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        <span>{bank.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Blood Inventory Display */}
                  {bank.inventory && Object.keys(bank.inventory).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <Droplet className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-gray-700">Current Inventory</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {Object.entries(bank.inventory).map(([type, count]) => (
                          <div key={type} className={`text-center px-2 py-1 rounded text-xs font-medium ${
                            count === 0 ? 'bg-gray-100 text-gray-400' :
                            count <= 10 ? 'bg-red-100 text-red-700' :
                            count <= 25 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            <div className="font-bold">{count}</div>
                            <div className="text-[10px]">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {bank.verified ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Pending</span>
                  )}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowModal({ show: true, type: 'editInventory', data: bank })}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-600 transition-all"
                      title="Edit Inventory"
                    >
                      <Droplet className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm({ show: true, type: 'bloodBanks', id: bank.id })}
                      className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                      title="Delete Bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderSeederTab = () => (
    <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Database className="w-6 h-6 mr-2 text-purple-600" />
        Mock Data Seeder
      </h3>

      {/* Seeding Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-blue-600 text-xs font-medium">Blood Banks</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{getSeedingStats().totalBanks}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-green-600 text-xs font-medium">Cities Covered</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{getSeedingStats().totalCities}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-purple-600 text-xs font-medium">States Covered</p>
          <p className="text-2xl font-bold text-purple-700 mt-1">{getSeedingStats().totalStates}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <p className="text-orange-600 text-xs font-medium">Categories</p>
          <p className="text-sm font-medium text-orange-700 mt-1">
            Gov: {getSeedingStats().categories.government} | 
            Pvt: {getSeedingStats().categories.private} | 
            NGO: {getSeedingStats().categories.ngo}
          </p>
        </div>
      </div>

      {/* Seeding Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
          📋 What This Does:
        </h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Seeds <strong>{getSeedingStats().totalBanks} realistic blood banks</strong> across {getSeedingStats().totalCities} major Indian cities</li>
          <li>• Generates <strong>time-based inventory patterns</strong> (lower in evenings, weekends)</li>
          <li>• Includes <strong>all major hospitals</strong>: AIIMS, Apollo, Fortis, Max, Lilavati, CMC, etc.</li>
          <li>• Adds <strong>complete metadata</strong>: address, phone, email, facilities, ratings</li>
          <li>• Creates <strong>realistic inventory</strong> for all 8 blood types (O+, O-, A+, A-, B+, B-, AB+, AB-)</li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handleSeedBloodBanks}
          disabled={seeding}
          className={`
            px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center space-x-2
            ${seeding 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {seeding ? (
            <>
              <div className="w-5 h-5 border-3 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Seeding Database...</span>
            </>
          ) : (
            <>
              <Database size={20} />
              <span>🌱 Seed Blood Banks Now</span>
            </>
          )}
        </button>
      </div>

      {/* Result Message */}
      {seedingResult && (
        <div className={`
          p-4 rounded-lg border-2
          ${seedingResult.success 
            ? 'bg-green-50 border-green-300' 
            : 'bg-red-50 border-red-300'
          }
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              w-3 h-3 rounded-full animate-pulse
              ${seedingResult.success ? 'bg-green-500' : 'bg-red-500'}
            `}></div>
            <div>
              <p className={`font-semibold ${seedingResult.success ? 'text-green-900' : 'text-red-900'}`}>
                {seedingResult.success ? '✅ Success!' : '❌ Error'}
              </p>
              <p className={`text-sm ${seedingResult.success ? 'text-green-700' : 'text-red-700'}`}>
                {seedingResult.message}
              </p>
              {seedingResult.success && seedingResult.successCount && (
                <p className="text-xs text-green-600 mt-1">
                  Successfully added {seedingResult.successCount} blood banks to Firebase!
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
        <p className="text-xs text-yellow-800 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <strong>⚠️ Note:</strong> If blood banks already exist, you'll be prompted to confirm before adding more.
          Each blood bank includes realistic inventory that updates based on time of day and day of week.
        </p>
      </div>

      {/* Challenge Seeding Section */}
      <div className="mt-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-orange-600" />
          Dynamic Challenges Seeder
        </h3>

        {/* Challenge Info */}
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-orange-600" />
            🏆 What This Does:
          </h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Seeds <strong>8 diverse challenges</strong> to encourage engagement</li>
            <li>• Includes <strong>6 challenge types</strong>: Monthly Streak, Community Goal, Referral, Speed Demon, Distance Warrior, Emergency Hero</li>
            <li>• Sets <strong>realistic targets & rewards</strong> (200-1000 points)</li>
            <li>• Creates <strong>difficulty tiers</strong>: Easy, Medium, Hard</li>
            <li>• Adds <strong>time-limited challenges</strong> (30, 60, 90 days)</li>
          </ul>
        </div>

        {/* Challenge Preview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 border border-orange-200">
            <p className="text-orange-900 font-semibold text-sm">🔥 Donation Warrior</p>
            <p className="text-xs text-orange-700">6-month streak · 1000 pts · Hard</p>
          </div>
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-200">
            <p className="text-blue-900 font-semibold text-sm">🏙️ City Heroes</p>
            <p className="text-xs text-blue-700">500 units goal · 300 pts · Medium</p>
          </div>
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border border-purple-200">
            <p className="text-purple-900 font-semibold text-sm">🤝 Blood Ambassador</p>
            <p className="text-xs text-purple-700">5 referrals · 800 pts · Hard</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg p-3 border border-yellow-200">
            <p className="text-yellow-900 font-semibold text-sm">⚡ Lightning Responder</p>
            <p className="text-xs text-yellow-700">10 quick responses · 600 pts · Hard</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-center mb-6">
          <button
            onClick={handleSeedChallenges}
            disabled={seedingChallenges}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center space-x-2
              ${seedingChallenges 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {seedingChallenges ? (
              <>
                <div className="w-5 h-5 border-3 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                <span>Creating Challenges...</span>
              </>
            ) : (
              <>
                <Activity size={20} />
                <span>🏆 Seed Challenges Now</span>
              </>
            )}
          </button>
        </div>

        {/* Result Message */}
        {challengeSeedingResult && (
          <div className={`
            p-4 rounded-lg border-2 mb-6
            ${challengeSeedingResult.success 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
            }
          `}>
            <div className="flex items-center space-x-3">
              <div className={`
                w-3 h-3 rounded-full animate-pulse
                ${challengeSeedingResult.success ? 'bg-green-500' : 'bg-red-500'}
              `}></div>
              <div>
                <p className={`font-semibold ${challengeSeedingResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {challengeSeedingResult.success ? '✅ Success!' : '❌ Error'}
                </p>
                <p className={`text-sm ${challengeSeedingResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {challengeSeedingResult.message}
                </p>
                {challengeSeedingResult.success && challengeSeedingResult.count && (
                  <p className="text-xs text-green-600 mt-1">
                    Successfully created {challengeSeedingResult.count} challenges!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-xs text-yellow-800 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            <strong>⚠️ Note:</strong> Challenges will be checked for duplicates before seeding.
            Users will automatically track progress as they donate blood!
          </p>
        </div>
      </div>

      {/* Community Events Seeder Section */}
      <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Database className="w-6 h-6 mr-2 text-purple-600" />
          Community Events Seeder
        </h3>
        <CommunityEventsSeeder />
      </div>
    </div>
  );

  // Render ML Dashboard Tab
  const renderMLDashboard = () => (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <Brain className="w-6 h-6 mr-2 text-purple-600" />
        ML Donor Retention Analytics
        <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">AI-Powered</span>
      </h3>

      <div className="space-y-6">
        {/* ML Stats Cards */}
        {mlStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={16} className="text-red-600" />
                <p className="text-red-600 text-xs font-medium">High Risk</p>
              </div>
              <p className="text-2xl font-bold text-red-700">{mlStats.byRiskLevel?.high || 0}</p>
              <p className="text-xs text-red-600 mt-1">Churn prob &gt; 70%</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-yellow-600" />
                <p className="text-yellow-600 text-xs font-medium">Medium Risk</p>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{mlStats.byRiskLevel?.medium || 0}</p>
              <p className="text-xs text-yellow-600 mt-1">Churn prob 40-70%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-green-600" />
                <p className="text-green-600 text-xs font-medium">Low Risk</p>
              </div>
              <p className="text-2xl font-bold text-green-700">{mlStats.byRiskLevel?.low || 0}</p>
              <p className="text-xs text-green-600 mt-1">Churn prob &lt; 40%</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <History size={16} className="text-purple-600" />
                <p className="text-purple-600 text-xs font-medium">Campaigns Run</p>
              </div>
              <p className="text-2xl font-bold text-purple-700">{mlStats.totalCampaigns || 0}</p>
              <p className="text-xs text-purple-600 mt-1">Last 30 days</p>
            </div>
          </div>
        )}

        {/* Manual Campaign Trigger */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <PlayCircle size={20} className="text-indigo-600" />
                Run Re-engagement Campaign
              </h3>
              <p className="text-sm text-gray-600 mt-1">Manually trigger ML-powered donor outreach</p>
            </div>
            <button
              onClick={() => setShowCampaignModal(!showCampaignModal)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
              {showCampaignModal ? 'Close' : 'Configure & Run'}
            </button>
          </div>

          {showCampaignModal && (
            <div className="mt-4 bg-white rounded-lg p-4 border border-indigo-200">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Notifications</label>
                  <input
                    type="number"
                    value={campaignConfig.maxNotifications}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, maxNotifications: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    min="1"
                    max="100"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="dryRun"
                    checked={campaignConfig.dryRun}
                    onChange={(e) => setCampaignConfig({ ...campaignConfig, dryRun: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="dryRun" className="text-sm font-medium text-gray-700">
                    Dry Run (Simulation only)
                  </label>
                </div>
                <button
                  onClick={handleRunCampaign}
                  disabled={loadingML}
                  className="w-full px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                >
                  {loadingML ? '⏳ Running Campaign...' : '🚀 Run Campaign Now'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* At-Risk Donors Table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 rounded-t-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle size={20} />
              At-Risk Donors (Churn Probability &gt; 50%)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Donor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Blood Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Churn %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Donation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loadingML ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full"></div>
                        Loading...
                      </div>
                    </td>
                  </tr>
                ) : atRiskDonors.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      🎉 No at-risk donors found!
                    </td>
                  </tr>
                ) : (
                  atRiskDonors.slice(0, 10).map((donor, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{donor.userName || 'Anonymous'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          {donor.features?.bloodType || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          donor.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                          donor.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {donor.riskLevel?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {Math.round(donor.churnProbability * 100)}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {donor.features?.daysSinceLastDonation || 0} days
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {donor.features?.totalDonations || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Campaign History */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4 rounded-t-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <History size={20} />
              Campaign History
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Processed</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Success</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {campaignHistory.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      📭 No campaigns yet
                    </td>
                  </tr>
                ) : (
                  campaignHistory.map((campaign, idx) => {
                    const successRate = campaign.processed > 0 
                      ? Math.round((campaign.notified / campaign.processed) * 100) 
                      : 0;
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm">{new Date(campaign.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            campaign.type === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {campaign.type === 'auto' ? '🤖 AUTO' : '👤 MANUAL'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{campaign.processed}</td>
                        <td className="px-4 py-3 text-sm text-green-600">{campaign.notified}</td>
                        <td className="px-4 py-3 text-sm font-medium">{successRate}%</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-purple-900">
            <strong>💡 About:</strong> Neural network (95.25% accuracy) predicts churn. High-risk donors get re-engagement notifications. Auto campaigns run Monday 10 AM.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-50 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-100 rounded-full opacity-30"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveSection('home')}
              className="p-3 rounded-xl bg-white hover:bg-red-500 transition-all transform hover:scale-105 shadow-lg border border-gray-200 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-white" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-red-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Comprehensive management and analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <Activity className="w-4 h-4 text-green-600 inline mr-2" />
              <span className="text-green-700 text-sm font-medium">System Online</span>
            </div>
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-lg p-2">
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {[
              { key: 'overview', label: 'Overview', icon: BarChart3 },
              { key: 'users', label: 'Users', icon: Users, count: users.length },
              { key: 'emergencies', label: 'Emergencies', icon: Bell, count: emergencyRequests.length },
              { key: 'partnerships', label: 'Partnerships', icon: Handshake, count: partnershipApplications.length },
              { key: 'challenges', label: 'Challenges', icon: Trophy, count: challenges.length },
              { key: 'bloodbanks', label: 'Blood Banks', icon: Building, count: bloodBanks.length },
              { key: 'mlDashboard', label: 'ML Dashboard', icon: Brain },
              { key: 'testimonials', label: 'Testimonials', icon: MessageSquare, count: testimonials.length }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap text-sm sm:text-base ${
                    activeTab === tab.key
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="inline sm:hidden">{tab.label.split(' ')[0]}</span>
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.key ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'users' && renderUsersTab()}
          {activeTab === 'emergencies' && renderEmergenciesTab()}
          {activeTab === 'partnerships' && renderPartnershipsTab()}
          {activeTab === 'challenges' && <AdminChallengesSection />}
          {activeTab === 'bloodbanks' && renderBloodBanksTab()}
          {activeTab === 'mlDashboard' && renderMLDashboard()}
          {activeTab === 'seeder' && renderSeederTab()}
          {activeTab === 'testimonials' && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <MessageSquare className="w-6 h-6 mr-2 text-purple-600" />
                Testimonials
                <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">{testimonials.length}</span>
              </h3>
              {loading.testimonials ? (
                <div className="flex justify-center py-12">
                  <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                </div>
              ) : testimonials.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No testimonials yet</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{testimonial.userName[0]}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{testimonial.userName}</p>
                              <p className="text-xs text-gray-500">{testimonial.createdAt.toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border border-gray-100">
                            "{testimonial.message || 'No message'}"
                          </p>
                        </div>
                        <button
                          onClick={() => setDeleteConfirm({ show: true, type: 'testimonials', id: testimonial.id })}
                          className="ml-4 p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this {deleteConfirm.type.slice(0, -1)}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-all"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, type: '', id: '' })}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Blood Bank Modal */}
      {showModal.show && showModal.type === 'addBloodBank' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="notranslate bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Blood Bank</h3>
            <form onSubmit={handleAddBloodBank} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all"
                >
                  Add Bank
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal({ show: false, type: '', data: null })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {showModal.show && showModal.type === 'editInventory' && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="notranslate bg-white rounded-2xl p-6 max-w-4xl w-full shadow-2xl my-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Edit Blood Inventory</h3>
                <p className="text-gray-600 mt-1">{showModal.data.name}</p>
              </div>
              <button
                onClick={() => setShowModal({ show: false, type: '', data: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleUpdateInventory}>
              <div className="grid md:grid-cols-2 gap-6">
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bloodType) => {
                  const currentValue = formData[bloodType] !== undefined 
                    ? formData[bloodType] 
                    : (showModal.data.inventory?.[bloodType] || 0);
                  
                  return (
                    <div key={bloodType} className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border-2 border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center border-2 border-red-300">
                            <span className="text-lg font-bold text-red-700">{bloodType}</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">Blood Type</p>
                            <p className="text-xs text-gray-500">{bloodType === 'O-' ? 'Universal Donor' : bloodType === 'AB+' ? 'Universal Recipient' : 'Standard'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Units Available</label>
                        <input
                          type="number"
                          min="0"
                          value={currentValue}
                          onChange={(e) => setFormData({ ...formData, [bloodType]: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-lg font-semibold text-center"
                        />
                      </div>

                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(bloodType, -10)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors"
                          >
                            -10
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(bloodType, -5)}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium text-sm transition-colors"
                          >
                            -5
                          </button>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(bloodType, 5)}
                            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm transition-colors"
                          >
                            +5
                          </button>
                          <button
                            type="button"
                            onClick={() => handleQuickAdjust(bloodType, 10)}
                            className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm transition-colors"
                          >
                            +10
                          </button>
                        </div>
                      </div>

                      {currentValue <= 10 && (
                        <div className="mt-2 px-2 py-1 bg-red-100 border border-red-300 rounded text-xs text-red-700 font-medium">
                          ⚠️ Critical Level
                        </div>
                      )}
                      {currentValue > 10 && currentValue <= 25 && (
                        <div className="mt-2 px-2 py-1 bg-orange-100 border border-orange-300 rounded text-xs text-orange-700 font-medium">
                          ⚠️ Low Level
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex space-x-3 pt-6 mt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Update Inventory</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal({ show: false, type: '', data: null })}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
