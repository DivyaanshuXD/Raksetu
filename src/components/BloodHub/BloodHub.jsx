import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
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
import ErrorBoundary from './ErrorBoundary';
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
  const [bloodBanks, setBloodBanks] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    livesImpacted: 0,
    activeRequests: 0
  });

  // Auth state listener with FCM subscription and donations listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const profileData = userDoc.data();
          setUserProfile({
            ...profileData,
            name: profileData.name || user.displayName || 'User',
            email: profileData.email || user.email || 'user@example.com',
            id: user.uid
          });

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
        } else {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName || 'User',
            email: user.email,
            bloodType: '',
            phone: ''
          });
          setUserProfile({
            name: user.displayName || 'User',
            email: user.email,
            id: user.uid
          });
        }

        // Listen to appointments
        const appointmentsQuery = query(
          collection(db, 'appointments'),
          where('userId', '==', user.uid)
        );

        let appointmentsList = [];
        let drivesList = [];

        const appointmentsUnsubscribe = onSnapshot(appointmentsQuery, (snapshot) => {
          appointmentsList = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'appointment',
            ...doc.data()
          }));
          setDonations([...appointmentsList, ...drivesList]);
          console.log('Fetched Appointments:', appointmentsList);
        }, (error) => console.error('Error fetching appointments:', error));

        // Listen to userDrives
        const userDrivesQuery = query(
          collection(db, 'userDrives'),
          where('userId', '==', user.uid)
        );

        const userDrivesUnsubscribe = onSnapshot(userDrivesQuery, (snapshot) => {
          drivesList = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'drive',
            ...doc.data()
          }));
          setDonations([...appointmentsList, ...drivesList]);
          console.log('Fetched User Drives:', drivesList);
        }, (error) => console.error('Error fetching user drives:', error));

        return () => {
          appointmentsUnsubscribe();
          userDrivesUnsubscribe();
        };
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setDonations([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Get user location and fetch nearby blood banks
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyBloodBanks(latitude, longitude);
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi
          fetchNearbyBloodBanks(28.6139, 77.2090);
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      fetchNearbyBloodBanks(28.6139, 77.2090);
    }
  }, []);

  // Fetch nearby blood banks
  const fetchNearbyBloodBanks = async (lat, lng) => {
    try {
      const bloodBanksSnapshot = await getDocs(collection(db, 'bloodBanks'));
      const bloodBanksList = bloodBanksSnapshot.docs.map(doc => {
        const data = doc.data();
        let coordinates = { latitude: data.coordinates?.latitude || data.coordinates?.lat || 28.6139, longitude: data.coordinates?.longitude || data.coordinates?.lng || 77.2090 };
        const distance = calculateDistance(lat, lng, coordinates.latitude, coordinates.longitude);
        return { id: doc.id, ...data, coordinates, distance };
      });

      // Sort by distance and filter (e.g., within 100 km)
      const nearby = bloodBanksList
        .filter(bank => bank.distance <= 100)
        .sort((a, b) => a.distance - b.distance);

      setBloodBanks(nearby);
      console.log('Fetched Blood Banks:', nearby);
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      setBloodBanks([]);
    }
  };

  // Emergency requests listener
  useEffect(() => {
    const emergencyQuery = query(
      collection(db, 'emergencyRequests'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(emergencyQuery, (snapshot) => {
      const requestsList = snapshot.docs.map(doc => {
        const data = doc.data();
        let normalizedCoordinates = { latitude: 28.6139, longitude: 77.2090 };
        if (data.coordinates) {
          normalizedCoordinates = {
            latitude: data.coordinates.latitude || data.coordinates.lat || 28.6139,
            longitude: data.coordinates.longitude || data.coordinates.lng || 77.2090
          };
        }
        return {
          id: doc.id,
          ...data,
          coordinates: normalizedCoordinates
        };
      });
      console.log('Fetched Emergency Requests:', requestsList);
      requestsList.forEach((req, index) => {
        console.log(`Request ${index} Coordinates:`, req.coordinates);
      });
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

  // Fetch blood drives from Firestore only (removed external fetch)
  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
        const localDrivesQuery = query(
          collection(db, 'bloodDrives'),
          where('endDate', '>=', new Date()),
          orderBy('endDate', 'asc')
        );

        const localDrivesSnapshot = await getDocs(localDrivesQuery);
        const localDrives = localDrivesSnapshot.docs.map(doc => {
          const data = doc.data();
          let normalizedCoordinates = { latitude: 28.6139, longitude: 77.2090 };
          if (data.coordinates) {
            normalizedCoordinates = {
              latitude: data.coordinates.latitude || data.coordinates.lat || 28.6139,
              longitude: data.coordinates.longitude || data.coordinates.lng || 77.2090
            };
          }
          return {
            id: doc.id,
            source: 'raksetu',
            ...data,
            coordinates: normalizedCoordinates
          };
        });

        console.log('Fetched Blood Drives:', localDrives);
        localDrives.forEach((drive, index) => {
          console.log(`Blood Drive ${index} Coordinates:`, drive.coordinates);
        });
        setBloodDrives(localDrives);
      } catch (error) {
        console.error('Error fetching blood drives:', error);
        setBloodDrives([]);
      }
    };

    fetchBloodDrives();
    const interval = setInterval(fetchBloodDrives, 900000);
    return () => clearInterval(interval);
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
            <ErrorBoundary>
              <EmergencyMapSection
                userLocation={userLocation}
                emergencyRequests={emergencyRequests}
                bloodDrives={bloodDrives}
                bloodBanks={bloodBanks}
                setActiveSection={setActiveSection}
              />
            </ErrorBoundary>
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
            bloodBanks={bloodBanks}
          />
        )}
        {activeSection === 'track' && (
          <TrackDonationsSection
            isLoggedIn={isLoggedIn}
            setShowAuthModal={setShowAuthModal}
            setAuthMode={setAuthMode}
            donations={donations}
            setDonations={setDonations}
            userProfile={userProfile}
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