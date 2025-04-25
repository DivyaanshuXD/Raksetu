import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { MapPin, Droplet, Bell, Menu, X, LogIn, ArrowLeft } from 'lucide-react';
import { auth, db } from '../../firebase';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import EmergencyMapSection from './EmergencyMapSection';
import StatsSection from './StatsSection';
import TestimonialsSection from './TestimonialsSection';
import EmergencySection from './EmergencySection';
import DonateBloodSection from './DonateBloodSection';
import TrackDonationsSection from './TrackDonationsSection';
import AboutSection from './AboutSection';
import Footer from './Footer';
import AuthModal from './AuthModal';
import EmergencyRequestModal from './EmergencyRequestModal';
import RequestSuccessModal from './RequestSuccessModal';
import CTASection from './CTASection';
import ProfileSection from './ProfileSection';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodHub() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // State for real-time data
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [bloodDrives, setBloodDrives] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    livesImpacted: 0,
    activeRequests: 0
  });

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
        
        // Set up user donations listener
        const userDonationsQuery = query(
          collection(db, 'donations'),
          where('donorId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        
        const donationsUnsubscribe = onSnapshot(userDonationsQuery, (snapshot) => {
          const donationsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setDonations(donationsList);
        });
        
        return () => {
          donationsUnsubscribe();
        };
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setDonations([]);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Emergency requests listener
  useEffect(() => {
    const emergencyQuery = query(
      collection(db, 'emergencyRequests'),
      where('status', '==', 'active'),
      orderBy('urgencyLevel', 'desc'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(emergencyQuery, (snapshot) => {
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Ensure coordinates are properly formatted for map
        coordinates: doc.data().coordinates || null
      }));
      setEmergencyRequests(requestsList);
      
      // Update active requests count in stats
      setStats(prev => ({
        ...prev,
        activeRequests: requestsList.length
      }));
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch blood drives from external APIs and combine with Firebase data
  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
        // First get blood drives from our own Firestore database
        const localDrivesQuery = query(
          collection(db, 'bloodDrives'),
          where('endDate', '>=', new Date()),
          orderBy('endDate', 'asc')
        );
        
        const localDrivesSnapshot = await getDocs(localDrivesQuery);
        const localDrives = localDrivesSnapshot.docs.map(doc => ({
          id: doc.id,
          source: 'raksetu',
          ...doc.data()
        }));
        
        // Fetch from external API (mock implementation for now)
        // In production, use a proxy server to avoid CORS issues
        const externalDrives = await fetchExternalBloodDrives();
        
        // Combine and update state
        setBloodDrives([...localDrives, ...externalDrives]);
      } catch (error) {
        console.error('Error fetching blood drives:', error);
      }
    };
    
    fetchBloodDrives();
    // Set up interval to refresh every 15 minutes
    const interval = setInterval(fetchBloodDrives, 900000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Mock function to fetch external blood drives
  // This would be replaced with actual API calls in production
  const fetchExternalBloodDrives = async () => {
    // In production, this would call your backend API that aggregates from multiple sources
    // For now, return mock data
    return [
      {
        id: 'ext1',
        title: 'Red Cross Blood Drive',
        organization: 'Red Cross India',
        location: 'Community Center, Delhi',
        coordinates: { latitude: 28.6280, longitude: 77.2090 },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        source: 'redcross',
        contactPhone: '+91 98765-43210'
      },
      {
        id: 'ext2',
        title: 'Lions Club Blood Donation Camp',
        organization: 'Lions Club',
        location: 'Lions Club Hall, Mumbai',
        coordinates: { latitude: 19.0760, longitude: 72.8777 },
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        source: 'lionsclub',
        contactPhone: '+91 87654-32109'
      }
    ];
  };
  
  // Global stats listener
  useEffect(() => {
    const statsDoc = doc(db, 'stats', 'global');
    
    const unsubscribe = onSnapshot(statsDoc, (doc) => {
      if (doc.exists()) {
        setStats(prevStats => ({
          ...prevStats,
          ...doc.data(),
        }));
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback to Delhi coordinates if geolocation is denied
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      // Fallback for browsers that don't support geolocation
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Header
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
        userProfile={userProfile}
      />
      <main>
        {activeSection === 'home' && (
          <>
            <HeroSection
              setActiveSection={setActiveSection}
              setShowEmergencyModal={setShowEmergencyModal}
              emergencyRequests={emergencyRequests}
            />
            <FeaturesSection />
            <EmergencyMapSection 
              userLocation={userLocation}
              emergencyRequests={emergencyRequests}
              bloodDrives={bloodDrives}
              setActiveSection={setActiveSection}
            />
            <StatsSection stats={stats} />
            <TestimonialsSection />
            <CTASection
              setActiveSection={setActiveSection}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
            />
          </>
        )}
        {activeSection === 'profile' && <ProfileSection userProfile={userProfile} />}
        {activeSection === 'emergency' && (
          <EmergencySection
            setShowEmergencyModal={setShowEmergencyModal}
            getUrgencyColor={getUrgencyColor}
            emergencyRequests={emergencyRequests}
            userLocation={userLocation}
          />
        )}
        {activeSection === 'donate' && (
          <DonateBloodSection
            setActiveSection={setActiveSection}
            userProfile={userProfile}
            setShowAuthModal={setShowAuthModal}
            setAuthMode={setAuthMode}
            bloodDrives={bloodDrives}
          />
        )}
        {activeSection === 'track' && (
          <TrackDonationsSection
            isLoggedIn={isLoggedIn}
            setShowAuthModal={setShowAuthModal}
            setAuthMode={setAuthMode}
            donations={donations}
          />
        )}
        {activeSection === 'about' && <AboutSection />}
      </main>
      <Footer />
      <AuthModal
        show={showAuthModal}
        setShow={setShowAuthModal}
        authMode={authMode}
        setAuthMode={setAuthMode}
        setIsLoggedIn={setIsLoggedIn}
      />
      <EmergencyRequestModal
        show={showEmergencyModal}
        setShow={setShowEmergencyModal}
        setShowSuccess={setShowRequestSuccessModal}
        userLocation={userLocation}
      />
      <RequestSuccessModal
        show={showRequestSuccessModal}
        setShow={setShowRequestSuccessModal}
        setShowEmergencyModal={setShowEmergencyModal}
      />
    </div>
  );
}