import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot, query, orderBy, where, getDocs, limit } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import { MapPin, Droplet, Bell, Menu, X, LogIn, ArrowLeft } from 'lucide-react';
import { auth, db, messaging } from '../utils/firebase';
import { calculateDistance } from '../utils/geolocation';

// Lazy load components
const Header = lazy(() => import('./Header'));
const HeroSection = lazy(() => import('./HeroSection'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const EmergencyMapSection = lazy(() => import('./EmergencyMapSection'));
const StatsSection = lazy(() => import('./StatsSection'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const EmergencySection = lazy(() => import('./EmergencySection'));
const DonateBloodSection = lazy(() => import('./DonateBloodSection'));
const TrackDonationsSection = lazy(() => import('./TrackDonationsSection'));
const AboutSection = lazy(() => import('./AboutSection'));
const Footer = lazy(() => import('./Footer'));
const AuthModal = lazy(() => import('./AuthModal'));
const EmergencyRequestModal = lazy(() => import('./EmergencyRequestModal'));
const RequestSuccessModal = lazy(() => import('./RequestSuccessModal'));
const CTASection = lazy(() => import('./CTASection'));
const ErrorBoundary = lazy(() => import('./ErrorBoundary'));
const ProfileSection = lazy(() => import('./ProfileSection'));
const AllBloodBanks = lazy(() => import('./AllBloodBanks'));
const Settings = lazy(() => import('./Settings'));

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
  const [recentDonations, setRecentDonations] = useState([]); // Add this state

  const [isUserProfileLoading, setIsUserProfileLoading] = useState(true);

  // Callback for handling donation confirmations
  const handleDonationConfirmed = useCallback((donationDetails) => {
  setRecentDonations((prev) => [...prev, donationDetails]);
}, []);

  // Memoize functions to prevent re-renders
  const setActiveSectionCallback = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const setShowEmergencyModalCallback = useCallback((value) => {
    setShowEmergencyModal(value);
  }, []);

  const setShowAuthModalCallback = useCallback((value) => {
    setShowAuthModal(value);
  }, []);

  const setAuthModeCallback = useCallback((mode) => {
    setAuthMode(mode);
  }, []);

  // Auth state listener with FCM subscription, donations listener, and real-time user profile updates
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsUserProfileLoading(true);
      if (user) {
        setIsLoggedIn(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          
          // Real-time listener for user profile
          const unsubscribeProfile = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
              const profileData = doc.data();
              const updatedProfile = {
                id: user.uid,
                name: profileData.name || user.displayName || 'User',
                email: profileData.email || user.email || 'user@example.com',
                phone: profileData.phone || user.phoneNumber || '',
                photoURL: profileData.photoURL || user.photoURL || '',
                bloodType: profileData.bloodType || '',
                dob: profileData.dob || '',
                lastDonated: profileData.lastDonated || '',
                address: profileData.address || '',
                city: profileData.city || '',
                createdAt: profileData.createdAt || new Date().toISOString(),
                updatedAt: profileData.updatedAt || new Date().toISOString()
              };
              setUserProfile(updatedProfile);
            } else {
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
              });
            }
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
                });
              } catch (fcmError) {
                console.warn('FCM subscription failed:', fcmError);
              }
            }
          }

          // Listen to user appointments and drives
          const appointmentsQuery = query(
            collection(db, 'appointments'),
            where('userId', '==', user.uid),
            limit(10)
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
          });

          const userDrivesQuery = query(
            collection(db, 'userDrives'),
            where('userId', '==', user.uid),
            limit(10)
          );

          const userDrivesUnsubscribe = onSnapshot(userDrivesQuery, (snapshot) => {
            drivesList = snapshot.docs.map(doc => ({
              id: doc.id,
              type: 'drive',
              ...doc.data()
            }));
            setDonations([...appointmentsList, ...drivesList]);
          });

          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userId', user.uid);

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
        },
        () => {
          setUserLocation({ lat: 28.6139, lng: 77.2090 });
        }
      );
    } else {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }
  }, []);

  // Batch fetch bloodBanks, bloodDrives, and statistics
  useEffect(() => {
    const fetchInitialData = async (lat, lng) => {
      try {
        // Fetch Blood Drives with onSnapshot (replacing polling)
        const localDrivesQuery = query(
          collection(db, 'bloodDrives'),
          where('endDate', '>=', new Date().toISOString()),
          orderBy('endDate', 'asc'),
          limit(10)
        );

        const unsubscribeDrives = onSnapshot(localDrivesQuery, (snapshot) => {
          const localDrives = snapshot.docs.map(doc => {
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
          setBloodDrives(localDrives);
        });

        // Fetch Blood Banks
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

        // Fetch Statistics
        const statsDoc = await getDoc(doc(db, 'statistics', 'global'));
        if (statsDoc.exists()) {
          const statsData = statsDoc.data();
          setStats(prev => ({
            ...prev,
            totalDonors: statsData.totalDonors || 0,
            totalDonations: statsData.totalDonations || 0,
            livesImpacted: statsData.livesImpacted || 0
          }));
        }

        return () => unsubscribeDrives();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setBloodBanks([]);
        setBloodDrives([]);
      }
    };

    if (userLocation) {
      fetchInitialData(userLocation.lat, userLocation.lng);
    }
  }, [userLocation]);

  // Emergency Requests with debouncing and distance calculation
  useEffect(() => {
    const emergencyQuery = query(
      collection(db, 'emergencyRequests'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    let debounceTimeout;
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
        const distance = userLocation
          ? calculateDistance(
              userLocation.lat,
              userLocation.lng,
              normalizedCoordinates.latitude,
              normalizedCoordinates.longitude
            ).toFixed(2) + ' km'
          : 'N/A';
        
        const timePosted = data.timestamp && typeof data.timestamp.toDate === 'function'
          ? data.timestamp.toDate().toISOString()
          : data.timestamp || 'Unknown';

        return {
          id: doc.id,
          ...data,
          coordinates: normalizedCoordinates,
          distance,
          timePosted
        };
      });

      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        setEmergencyRequests(requestsList);
        setStats(prev => ({
          ...prev,
          activeRequests: requestsList.length
        }));
      }, 500);
    });

    return () => {
      unsubscribe();
      clearTimeout(debounceTimeout);
    };
  }, [userLocation]);

  const getUrgencyColor = useCallback((urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }, []);

  const memoizedEmergencyRequests = useMemo(() => emergencyRequests, [emergencyRequests]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Suspense fallback={<div>Loading...</div>}>
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSectionCallback}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setShowAuthModal={setShowAuthModalCallback}
          setAuthMode={setAuthModeCallback}
          userProfile={userProfile}
        />
        <main>
          {activeSection === 'home' && (
            <>
              <HeroSection
                setActiveSection={setActiveSectionCallback}
                setShowEmergencyModal={setShowEmergencyModalCallback}
                emergencyRequests={memoizedEmergencyRequests}
              />
              <FeaturesSection />
              <ErrorBoundary>
                <EmergencyMapSection
                  userLocation={userLocation}
                  emergencyRequests={memoizedEmergencyRequests}
                  bloodDrives={bloodDrives}
                  bloodBanks={bloodBanks}
                  setActiveSection={setActiveSectionCallback}
                />
              </ErrorBoundary>
              <StatsSection stats={stats} />
              <TestimonialsSection 
                userProfile={userProfile}
                isLoggedIn={isLoggedIn}
                setShowAuthModal={setShowAuthModalCallback}
                setAuthMode={setAuthModeCallback}
              />
              <CTASection
                setActiveSection={setActiveSectionCallback}
                setShowAuthModal={setShowAuthModalCallback}
                setAuthMode={setAuthModeCallback}
                isLoggedIn={isLoggedIn}
              />
            </>
          )}
          {activeSection === 'profile' && (
            <ErrorBoundary>
              <ProfileSection 
                userProfile={userProfile} 
                setUserProfile={setUserProfile}
                isLoading={isUserProfileLoading}
              />
            </ErrorBoundary>
          )}
          {activeSection === 'emergency' && (
            <EmergencySection
              setShowEmergencyModal={setShowEmergencyModalCallback}
              getUrgencyColor={getUrgencyColor}
              emergencyRequests={memoizedEmergencyRequests}
              userLocation={userLocation}
              userProfile={userProfile}
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModalCallback}
              setAuthMode={setAuthModeCallback}
              onDonationConfirmed={handleDonationConfirmed}
            />
          )}
          {activeSection === 'donate' && (
            <DonateBloodSection
              setActiveSection={setActiveSectionCallback}
              userProfile={userProfile}
              setShowAuthModal={setShowAuthModalCallback}
              setAuthMode={setAuthModeCallback}
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
              setShowAuthModal={setShowAuthModalCallback}
              setAuthMode={setAuthModeCallback}
              donations={donations}
              setDonations={setDonations}
              userProfile={userProfile}
              onDonationConfirmed={handleDonationConfirmed}
            />
          )}
          {activeSection === 'about' && (
            <AboutSection
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModalCallback}
              setAuthMode={setAuthModeCallback}
            />
          )}
          {activeSection === 'all-blood-banks' && (
            <AllBloodBanks
              userLocation={userLocation}
              setActiveSection={setActiveSectionCallback}
            />
          )}
          {activeSection === 'settings' && (
            <ErrorBoundary>
              <Settings
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                isLoggedIn={isLoggedIn}
                setShowAuthModal={setShowAuthModalCallback}
                setAuthMode={setAuthModeCallback}
              />
            </ErrorBoundary>
          )}
        </main>
        <Footer setActiveSection={setActiveSectionCallback} />
        <AuthModal
          show={showAuthModal}
          setShow={setShowAuthModalCallback}
          authMode={authMode}
          setAuthMode={setAuthModeCallback}
          setIsLoggedIn={setIsLoggedIn}
        />
        <EmergencyRequestModal
          show={showEmergencyModal}
          setShow={setShowEmergencyModalCallback}
          setShowSuccess={setShowRequestSuccessModal}
          userLocation={userLocation}
          isLoggedIn={isLoggedIn}
          setShowAuthModal={setShowAuthModalCallback}
          setAuthMode={setAuthModeCallback}
        />
        <RequestSuccessModal
          show={showRequestSuccessModal}
          setShow={setShowRequestSuccessModal}
          setShowEmergencyModal={setShowEmergencyModalCallback}
        />
      </Suspense>
    </div>
  );
}