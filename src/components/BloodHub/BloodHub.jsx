import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, where, getDocs } from 'firebase/firestore';
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
import AllBloodBanks from './AllBloodBanks';
import Settings from './Settings';

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
  const [isUserProfileLoading, setIsUserProfileLoading] = useState(true);

  // Auth state listener with FCM subscription, donations listener, and real-time user profile updates
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsUserProfileLoading(true);
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // Set up real-time listener for user profile
          const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const profileData = doc.data();
              const updatedProfile = {
                id: user.uid,
                name: profileData.name || user.displayName || 'User',
                email: profileData.email || user.email || 'user@example.com',
                phone: profileData.phone || user.phoneNumber || '',
                photoURL: profileData.photoURL || user.photoURL || '', // Ensure photoURL is always defined
                bloodType: profileData.bloodType || '',
                dob: profileData.dob || '',
                lastDonated: profileData.lastDonated || '',
                address: profileData.address || '',
                city: profileData.city || '',
                createdAt: profileData.createdAt || new Date().toISOString(),
                updatedAt: profileData.updatedAt || new Date().toISOString()
              };
              setUserProfile(updatedProfile);
              console.log('Real-time user profile updated:', updatedProfile);
            } else {
              // If user document doesn't exist, create it
              const userData = {
                name: user.displayName || 'User',
                email: user.email,
                bloodType: '',
                phone: user.phoneNumber || '',
                photoURL: user.photoURL || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              setDoc(userDocRef, userData).then(() => {
                const newProfile = {
                  id: user.uid,
                  ...userData
                };
                setUserProfile(newProfile);
                console.log('New user profile created:', newProfile);
              }).catch(error => {
                console.error('Error creating user profile:', error);
              });
            }
          }, (error) => {
            console.error('Error listening to user profile:', error);
            setUserProfile(null);
          });

          // FCM subscription for blood type notifications
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            if (profileData.bloodType) {
              try {
                const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY });
                fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
                  method: 'POST',
                  headers: { 'Authorization': `key=${import.meta.env.VITE_SERVER_KEY}` },
                  body: JSON.stringify({
                    to: `/topics/bloodType_${profileData.bloodType}`,
                    registration_tokens: [token]
                  })
                }).catch((error) => console.error('FCM subscription error:', error));
              } catch (fcmError) {
                console.warn('FCM subscription failed:', fcmError);
              }
            }
          }

          // Listen to user appointments
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

          // Listen to user drives
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

          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', user.uid);

          // Cleanup listeners
          return () => {
            unsubscribeProfile();
            appointmentsUnsubscribe();
            userDrivesUnsubscribe();
          };
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserProfile(null);
        } finally {
          setIsUserProfileLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserProfile(null);
        setDonations([]);
        
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        setIsUserProfileLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (storedLoggedIn) {
      setIsLoggedIn(storedLoggedIn);
    }
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyBloodBanks(latitude, longitude);
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
          fetchNearbyBloodBanks(28.6139, 77.2090);
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
      fetchNearbyBloodBanks(28.6139, 77.2090);
    }
  }, []);

  const fetchNearbyBloodBanks = async (lat, lng) => {
    try {
      const bloodBanksSnapshot = await getDocs(collection(db, 'bloodBanks'));
      const bloodBanksList = bloodBanksSnapshot.docs.map(doc => {
        const data = doc.data();
        let coordinates = { latitude: data.coordinates?.latitude || data.coordinates?.lat || 28.6139, longitude: data.coordinates?.longitude || data.coordinates?.lng || 77.2090 };
        const distance = calculateDistance(lat, lng, coordinates.latitude, coordinates.longitude);
        return { id: doc.id, ...data, coordinates, distance };
      });

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

  useEffect(() => {
    const fetchBloodDrives = async () => {
      try {
        const localDrivesQuery = query(
          collection(db, 'bloodDrives'),
          where('endDate', '>=', new Date().toISOString()),
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

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const statsDoc = await getDoc(doc(db, 'statistics', 'global'));
        if (statsDoc.exists()) {
          const statsData = statsDoc.data();
          setStats({
            totalDonors: statsData.totalDonors || 0,
            totalDonations: statsData.totalDonations || 0,
            livesImpacted: statsData.livesImpacted || 0,
            activeRequests: emergencyRequests.length
          });
        }
      } catch (error) {
        console.error('Error fetching statistics:', error);
      }
    };

    fetchStatistics();
  }, [emergencyRequests.length]);

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
            <TestimonialsSection 
              userProfile={userProfile}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
            />
            <CTASection
              setActiveSection={setActiveSection}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
              isLoggedIn={isLoggedIn}
            />
          </>
        )}
        {activeSection === 'profile' && (
          <ErrorBoundary>
            <ProfileSection 
              userProfile={userProfile} 
              setUserProfile={setUserProfile} // Pass setUserProfile to update parent state
              isLoading={isUserProfileLoading}
            />
          </ErrorBoundary>
        )}
        {activeSection === 'emergency' && (
          <EmergencySection
            setShowEmergencyModal={setShowEmergencyModal}
            getUrgencyColor={getUrgencyColor}
            emergencyRequests={emergencyRequests}
            userLocation={userLocation}
            userProfile={userProfile}
            isLoggedIn={isLoggedIn}
            setShowAuthModal={setShowAuthModal}
            setAuthMode={setAuthMode}
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
            isLoggedIn={isLoggedIn}
            setDonations={setDonations}
            donations={donations}
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
        {activeSection === 'all-blood-banks' && (
          <AllBloodBanks
            userLocation={userLocation}
            setActiveSection={setActiveSection}
          />
        )}
        {activeSection === 'settings' && ( // Add Settings section
          <ErrorBoundary>
            <Settings
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModal}
              setAuthMode={setAuthMode}
            />
          </ErrorBoundary>
        )}
      </main>
      <Footer setActiveSection={setActiveSection} /> {/* Pass setActiveSection to Footer */}
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
        isLoggedIn={isLoggedIn}
        setShowAuthModal={setShowAuthModal}
        setAuthMode={setAuthMode}
      />
      <RequestSuccessModal
        show={showRequestSuccessModal}
        setShow={setShowRequestSuccessModal}
        setShowEmergencyModal={setShowEmergencyModal}
      />
    </div>
  );
}