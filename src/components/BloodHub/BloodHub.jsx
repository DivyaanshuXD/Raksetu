import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, getDocs } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { MapPin, Droplet, Bell, Menu, X, LogIn, ArrowLeft } from 'lucide-react';
import { auth, db, messaging } from '../utils/firebase';
import { calculateDistance } from '../utils/geolocation';
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
  
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [bloodDrives, setBloodDrives] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    livesImpacted: 0,
    activeRequests: 0
  });

  // Auth state listener with FCM subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile(profileData);

          if (profileData.bloodType) {
            const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY });
            fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
              method: 'POST',
              headers: { 'Authorization': `key=${import.meta.env.VITE_SERVER_KEY}` },
              body: JSON.stringify({
                to: `/topics/bloodType_${profileData.bloodType}`,
                registration_tokens: [token]
              })
            }).catch((error) => console.error('FCM subscription error:', error));
          }
        }
        
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
      orderBy('timestamp', 'desc') // Order by timestamp
    );
    
    const unsubscribe = onSnapshot(emergencyQuery, (snapshot) => {
      const requestsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Fetched Emergency Requests:', requestsList); // Debug log
      setEmergencyRequests(requestsList);
      
      setStats(prev => ({
        ...prev,
        activeRequests: requestsList.length
      }));
    }, (error) => {
      console.error('Error fetching emergency requests:', error);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch blood drives from backend API
  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
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
        
        const externalDrives = await fetch('https://raksetu-backend.vercel.app/blood-drives')
          .then(response => response.json())
          .catch(error => {
            console.error('Error fetching external blood drives:', error);
            return [];
          });
        
        setBloodDrives([...localDrives, ...externalDrives]);
      } catch (error) {
        console.error('Error fetching blood drives:', error);
      }
    };
    
    fetchBloodDrives();
    const interval = setInterval(fetchBloodDrives, 900000);
    return () => clearInterval(interval);
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
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
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
            userProfile={userProfile}
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