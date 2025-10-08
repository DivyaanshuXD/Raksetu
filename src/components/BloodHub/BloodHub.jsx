import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { doc, getDoc, collection, onSnapshot, orderBy, where, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { calculateDistance } from '../utils/geolocation';
import { useAuth } from '../../context/AuthContext';
import { useEmergencyContext } from '../../context/EmergencyContext';
import { useDonations } from '../../hooks/useDonations';
import { URGENCY_COLORS } from '../../constants';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorBoundary from './ErrorBoundary'; // Load immediately - can't be lazy
import { listenForForegroundMessages, getNotificationPermission, isNotificationSupported } from '../../utils/pushNotifications';
import { useToast } from '../../context/ToastContext';

// CRITICAL: Preload emergency components immediately for life-saving scenarios
const EmergencySection = lazy(() => {
  const component = import('./EmergencySection');
  // Preload in background
  component.then(mod => {
    // Component cached, will load instantly on second access
  });
  return component;
});

const EmergencyMapSection = lazy(() => import('./EmergencyMapSection'));

// Lazy load non-critical components
const Header = lazy(() => import('./Header'));
const HeroSection = lazy(() => import('./HeroSection'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const TestimonialsSection = lazy(() => import('./TestimonialsSection'));
const DonateBloodSection = lazy(() => import('./DonateBloodSection'));
const TrackDonationsSection = lazy(() => import('./TrackDonationsSection'));
const AboutSection = lazy(() => import('./AboutSection'));
const Footer = lazy(() => import('./Footer'));
const AuthModal = lazy(() => import('./AuthModal'));
const EmergencyRequestModal = lazy(() => import('./EmergencyRequestModal'));
const RequestSuccessModal = lazy(() => import('./RequestSuccessModal'));
const CTASection = lazy(() => import('./CTASection'));
const ProfileSection = lazy(() => import('./ProfileSection'));
const AllBloodBanks = lazy(() => import('./AllBloodBanks'));
const Settings = lazy(() => import('./Settings'));
const AdminSection = lazy(() => import('./AdminSection_Enhanced'));
const NotificationCenter = lazy(() => import('./NotificationCenter'));
const MedicalResourcesMap = lazy(() => import('./MedicalResourcesMap'));
const PWAInstallPrompt = lazy(() => import('./PWAInstallPrompt'));
const EmergencyFloatingButton = lazy(() => import('./EmergencyFloatingButton'));
const EligibilityChatbot = lazy(() => import('./EligibilityChatbot'));
const BloodInventoryDashboard = lazy(() => import('./BloodInventoryDashboard'));
const NotificationPermissionPrompt = lazy(() => import('./NotificationPermissionPrompt'));
const VoiceAssistant = lazy(() => import('./VoiceAssistant'));
const CommunitySection = lazy(() => import('./CommunitySection'));

export default function BloodHub() {
  // Use new context hooks
  const { isLoggedIn, userProfile, isLoading: isUserProfileLoading } = useAuth();
  const { emergencies: emergencyRequests, userLocation } = useEmergencyContext();
  const { donations } = useDonations(userProfile?.id);
  const toast = useToast();

  // Local state for UI
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Persist active section across refreshes
  const [activeSection, setActiveSection] = useState(() => {
    const saved = sessionStorage.getItem('activeSection');
    return saved || 'home';
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [bloodDrives, setBloodDrives] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalDonations: 0,
    livesImpacted: 0,
    totalBloodBanks: 0,
    activeRequests: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);

  // Callback for handling donation confirmations
  const handleDonationConfirmed = useCallback((donationDetails) => {
    setRecentDonations((prev) => [...prev, donationDetails]);
  }, []);

  // Memoize functions to prevent re-renders
  const setActiveSectionCallback = useCallback((section) => {
    setActiveSection(section);
    // Save to sessionStorage for page refresh persistence
    sessionStorage.setItem('activeSection', section);
    
    // Push state to browser history for back button support
    window.history.pushState({ section }, '', `#${section}`);
  }, []);

  // Handle browser back/forward button
  useEffect(() => {
    // Set initial history state
    const currentSection = activeSection || 'home';
    window.history.replaceState({ section: currentSection }, '', `#${currentSection}`);

    const handlePopState = (event) => {
      if (event.state && event.state.section) {
        setActiveSection(event.state.section);
        sessionStorage.setItem('activeSection', event.state.section);
      } else {
        // If no state, check hash
        const hash = window.location.hash.slice(1);
        if (hash) {
          setActiveSection(hash);
          sessionStorage.setItem('activeSection', hash);
        } else {
          // Default to home if no hash
          setActiveSection('home');
          sessionStorage.setItem('activeSection', 'home');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Also handle initial hash on load
    const initialHash = window.location.hash.slice(1);
    if (initialHash && initialHash !== activeSection) {
      setActiveSection(initialHash);
      sessionStorage.setItem('activeSection', initialHash);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
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

  // Setup push notification listeners
  useEffect(() => {
    if (!isLoggedIn || !userProfile) return;

    // Listen for foreground messages
    listenForForegroundMessages((message) => {
      console.log('📨 Received notification:', message);
      
      // Show toast notification
      toast.info(message.title, {
        description: message.body,
        duration: 6000
      });

      // If it's an emergency notification, maybe show a modal or navigate
      if (message.data?.type === 'emergency_match') {
        // Could add emergency to highlighted list or show modal
        console.log('Emergency notification for:', message.data.emergencyId);
      }
    });
  }, [isLoggedIn, userProfile, toast]);

  // Auto-prompt for notification permission after login (once per session)
  useEffect(() => {
    if (!isLoggedIn || !userProfile) {
      return;
    }

    const permission = getNotificationPermission();
    const hasPrompted = sessionStorage.getItem('notificationPrompted');
    const dismissed = localStorage.getItem('notificationPromptDismissed');
    
    // Don't prompt if not supported
    if (!isNotificationSupported()) {
      return;
    }

    // Don't prompt if already granted, already prompted this session, or dismissed recently (7 days)
    if (permission === 'granted') {
      return;
    }
    
    if (hasPrompted) {
      return;
    }
    
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Show prompt after 5 seconds (let user settle in first)
    const timer = setTimeout(() => {
      setShowNotificationPrompt(true);
      sessionStorage.setItem('notificationPrompted', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoggedIn, userProfile]);

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

        // Fetch Real-time Statistics from actual collections
        // Count total users (active donors)
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const totalDonors = usersSnapshot.size;

        // Count total blood banks
        const totalBloodBanks = bloodBanksSnapshot.size;

        // Count total donations from donationsDone
        const donationsSnapshot = await getDocs(
          query(collection(db, 'donationsDone'), where('status', '==', 'completed'))
        );
        const totalDonations = donationsSnapshot.size;
        const livesImpacted = totalDonations * 3; // Each donation saves ~3 lives

        setStats(prev => ({
          ...prev,
          totalDonors,
          totalBloodBanks,
          totalDonations,
          livesImpacted
        }));

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

  // Update stats based on emergency requests
  useEffect(() => {
    setStats(prev => ({
      ...prev,
      activeRequests: emergencyRequests?.length || 0
    }));
  }, [emergencyRequests]);

  const getUrgencyColor = useCallback((urgency) => {
    const colors = URGENCY_COLORS[urgency];
    if (colors) {
      return `${colors.bg.replace('bg-', 'bg-').replace('-500', '-100')} ${colors.text.replace('text-', 'text-').replace('-500', '-800')}`;
    }
    return 'bg-blue-100 text-blue-800';
  }, []);

  const memoizedEmergencyRequests = useMemo(() => emergencyRequests, [emergencyRequests]);

  // Show loading spinner while auth is being checked
  if (isUserProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <Suspense fallback={<LoadingSpinner size="lg" text="Loading content..." className="min-h-screen flex items-center justify-center" />}>
        <Header
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          activeSection={activeSection}
          setActiveSection={setActiveSectionCallback}
          isLoggedIn={isLoggedIn}
          setShowAuthModal={setShowAuthModalCallback}
          setAuthMode={setAuthModeCallback}
          userProfile={userProfile}
          setShowNotificationCenter={setShowNotificationCenter}
        />
        <main>
          {activeSection === 'home' && (
            <>
              <HeroSection
                setActiveSection={setActiveSectionCallback}
                setShowEmergencyModal={setShowEmergencyModalCallback}
                emergencyRequests={memoizedEmergencyRequests}
                stats={stats}
              />
              <FeaturesSection />
              <ErrorBoundary>
                <EmergencyMapSection
                  userLocation={userLocation}
                  emergencyRequests={memoizedEmergencyRequests}
                  bloodDrives={bloodDrives}
                  userProfile={userProfile}
                  bloodBanks={bloodBanks}
                  setActiveSection={setActiveSectionCallback}
                />
              </ErrorBoundary>
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
                isLoading={isUserProfileLoading}
                setActiveSection={setActiveSectionCallback}
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
          {activeSection === 'medical-resources' && (
            <ErrorBoundary>
              <MedicalResourcesMap />
            </ErrorBoundary>
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
              donations={donations}
            />
          )}
          {activeSection === 'track' && (
            <TrackDonationsSection
              isLoggedIn={isLoggedIn}
              setShowAuthModal={setShowAuthModalCallback}
              setAuthMode={setAuthModeCallback}
              donations={donations}
              userProfile={userProfile}
              onDonationConfirmed={handleDonationConfirmed}
            />
          )}
          {activeSection === 'community' && (
            <ErrorBoundary>
              <CommunitySection
                userProfile={userProfile}
                setShowAuthModal={setShowAuthModalCallback}
                isLoggedIn={isLoggedIn}
              />
            </ErrorBoundary>
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
                isLoggedIn={isLoggedIn}
                setShowAuthModal={setShowAuthModalCallback}
                setAuthMode={setAuthModeCallback}
              />
            </ErrorBoundary>
          )}
          {activeSection === 'admin' && (
            <ErrorBoundary>
              <AdminSection
                setActiveSection={setActiveSectionCallback}
                userProfile={userProfile}
              />
            </ErrorBoundary>
          )}
          {activeSection === 'inventory' && (
            <ErrorBoundary>
              <BloodInventoryDashboard />
            </ErrorBoundary>
          )}
        </main>
        <Footer setActiveSection={setActiveSectionCallback} />
        <AuthModal
          show={showAuthModal}
          setShow={setShowAuthModalCallback}
          authMode={authMode}
          setAuthMode={setAuthModeCallback}
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
        
        {/* Notification Center */}
        {showNotificationCenter && isLoggedIn && (
          <NotificationCenter
            user={{ uid: userProfile?.id }}
            userProfile={userProfile}
            onClose={() => setShowNotificationCenter(false)}
          />
        )}
        
        {/* PWA Install Prompt */}
        <PWAInstallPrompt />
        
        {/* Emergency Floating Action Button - Always visible */}
        <EmergencyFloatingButton 
          setShowEmergencyModal={setShowEmergencyModalCallback}
          setShowAuthModal={setShowAuthModalCallback}
          setAuthMode={setAuthModeCallback}
          isLoggedIn={isLoggedIn}
        />
        
        {/* AI Eligibility Chatbot - Always available */}
        <ErrorBoundary>
          <EligibilityChatbot />
        </ErrorBoundary>

        {/* Voice Assistant - Specialized for blood donation queries */}
        <ErrorBoundary>
          <VoiceAssistant
            userProfile={userProfile}
            onNavigate={(section) => setActiveSection(section)}
            onCreateEmergency={(data) => {
              // Pre-fill emergency modal with voice data
              setShowEmergencyModal(true);
            }}
            onShowBloodBanks={(location) => {
              setActiveSection('bloodbanks');
            }}
          />
        </ErrorBoundary>

        {/* Notification Permission Prompt */}
        {showNotificationPrompt && (
          <NotificationPermissionPrompt 
            onClose={() => setShowNotificationPrompt(false)}
          />
        )}
      </Suspense>
    </div>
  );
}
