import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getToken } from 'firebase/messaging'; // Import FCM
import { MapPin, Droplet, Bell, Menu, X, LogIn, ArrowLeft } from 'lucide-react';
import { auth, db, messaging } from '../utils/firebase'; // Updated import
import { calculateDistance } from '../utils/geolocation'; // Import geolocation
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

  // Auth state listener with FCM subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile(profileData);

          // Subscribe to FCM topic based on blood type
          if (profileData.bloodType) {
            const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY });
            fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
              method: 'POST',
              headers: { 'Authorization': `key=${import.meta.env.VITE_SERVER_KEY}` }, // Get from Firebase Console
              body: JSON.stringify({
                to: `/topics/bloodType_${profileData.bloodType}`,
                registration_tokens: [token]
              })
            }).catch((error) => console.error('FCM subscription error:', error));
          }
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

  // Emergency requests listener with geocoding
  useEffect(() => {
    const emergencyQuery = query(
      collection(db, 'emergencyRequests'),
      where('status', '==', 'active'),
      orderBy('urgencyLevel', 'desc'),
      orderBy('timestamp', 'desc')
    );
    
    const unsubscribe = onSnapshot(emergencyQuery, async (snapshot) => {
      const requestsList = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        if (!data.coordinates || !data.coordinates.latitude || !data.coordinates.longitude) {
          const coords = await geocodeLocation(data.location); // Geocode if missing
          await db.collection('emergencyRequests').doc(doc.id).update({ coordinates: coords });
          return { id: doc.id, ...data, coordinates: coords };
        }
        return { id: doc.id, ...data };
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

  // Fetch blood drives from backend API
  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
        // Fetch from Firestore
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
        
        // Fetch from backend API (replace mock with real endpoint)
        const externalDrives = await fetch('http://your-backend-api.com/blood-drives')
          .then(response => response.json())
          .catch(error => {
            console.error('Error fetching external blood drives:', error);
            return [];
          });
        
        // Combine and update state
        setBloodDrives([...localDrives, ...externalDrives]);
      } catch (error) {
        console.error('Error fetching blood drives:', error);
      }
    };
    
    fetchBloodDrives();
    const interval = setInterval(fetchBloodDrives, 900000); // Refresh every 15 minutes
    return () => clearInterval(interval);
  }, []);

  // Geocode location using OpenStreetMap Nominatim
  const geocodeLocation = async (location) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
      const data = await response.json();
      if (data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi
    } catch (error) {
      console.error('Geocoding failed:', error);
      return { latitude: 28.6139, longitude: 77.2090 };
    }
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
            userProfile={userProfile} // Pass userProfile for blood type matching
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