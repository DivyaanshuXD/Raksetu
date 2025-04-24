import { useState, useEffect } from 'react';
import { MapPin, Droplet, Clock, Search, Heart, AlertTriangle, Users, ChevronRight, Phone, ArrowRight, Bell, LogIn, Menu, X, Check, ChevronDown, Calendar, UserCircle, ArrowLeft, Filter, User, LifeBuoy, CheckCircle, Compass, List, Info, MessageCircle, Award, Mail } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Sample data
const emergencyData = [
  { id: 1, bloodType: 'O+', hospital: 'City Medical Center', location: 'Sector 12, Delhi', urgency: 'Critical', timePosted: '10 min ago', distance: '2.3 km', units: 3 },
  { id: 2, bloodType: 'A-', hospital: 'Apollo Hospital', location: 'MG Road, Bangalore', urgency: 'High', timePosted: '25 min ago', distance: '4.1 km', units: 2 },
  { id: 3, bloodType: 'B+', hospital: 'Fortis Healthcare', location: 'Andheri, Mumbai', urgency: 'Medium', timePosted: '45 min ago', distance: '5.6 km', units: 4 },
  { id: 4, bloodType: 'AB+', hospital: 'AIIMS Hospital', location: 'Saket, Delhi', urgency: 'High', timePosted: '32 min ago', distance: '3.7 km', units: 1 },
  { id: 5, bloodType: 'O-', hospital: 'Max Hospital', location: 'Gurgaon', urgency: 'Critical', timePosted: '5 min ago', distance: '8.2 km', units: 2 },
];

const donorStats = [
  { label: 'Lives Saved', value: '124,532' },
  { label: 'Donors', value: '58,271' },
  { label: 'Hospitals', value: '1,230' },
  { label: 'Emergencies Resolved', value: '28,471' },
];

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const testimonials = [
  { name: 'Arjun Mehta', bloodType: 'O+', message: 'Raksetu helped me find donors within minutes during my father\'s emergency surgery.' },
  { name: 'Priya Singh', bloodType: 'AB-', message: 'The tracking feature let me know exactly when my donation was used. It\'s incredibly fulfilling.' },
  { name: 'Dr. Sharma', role: 'Cardiac Surgeon', message: 'The real-time availability map has revolutionized how we handle blood requirements during surgeries.' },
];

const bloodBanks = [
  { id: 1, name: 'Red Cross Blood Bank', location: 'Connaught Place, Delhi', distance: '2.1 km', availability: { 'A+': 15, 'A-': 6, 'B+': 12, 'B-': 8, 'AB+': 4, 'AB-': 2, 'O+': 20, 'O-': 7 } },
  { id: 2, name: 'LifeStream Blood Center', location: 'Bandra, Mumbai', distance: '4.5 km', availability: { 'A+': 8, 'A-': 3, 'B+': 10, 'B-': 2, 'AB+': 5, 'AB-': 1, 'O+': 12, 'O-': 4 } },
  { id: 3, name: 'City Blood Bank', location: 'MG Road, Bangalore', distance: '3.2 km', availability: { 'A+': 12, 'A-': 5, 'B+': 8, 'B-': 3, 'AB+': 6, 'AB-': 2, 'O+': 15, 'O-': 6 } },
];

const bloodDrives = [
  { id: 1, name: 'Community Blood Drive', location: 'Central Park, Delhi', date: 'April 15, 2025', time: '10:00 AM - 4:00 PM', organizer: 'Red Cross India', registered: 42 },
  { id: 2, name: 'Corporate Donation Day', location: 'Tech Park, Bangalore', date: 'April 18, 2025', time: '9:00 AM - 5:00 PM', organizer: 'TechCare Foundation', registered: 78 },
  { id: 3, name: 'University Blood Camp', location: 'Delhi University', date: 'April 20, 2025', time: '11:00 AM - 3:00 PM', organizer: 'Youth for Change', registered: 56 },
];

const userDonations = [
  { id: 1, date: 'January 15, 2025', hospital: 'Apollo Hospital', bloodType: 'O+', status: 'Used', recipientAge: '45', recipientCondition: 'Post-surgery recovery', impactPoints: 150 },
  { id: 2, date: 'October 10, 2024', hospital: 'AIIMS Delhi', bloodType: 'O+', status: 'Used', recipientAge: '8', recipientCondition: 'Thalassemia treatment', impactPoints: 150 },
  { id: 3, date: 'July 5, 2024', hospital: 'Max Healthcare', bloodType: 'O+', status: 'Used', recipientAge: '32', recipientCondition: 'Accident victim', impactPoints: 150 },
];

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function NavLink({ active, children, onClick }) {
  return (
    <button
      className={`text-sm font-medium transition-colors ${active ? 'text-red-600' : 'text-gray-600 hover:text-red-600'}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MobileNavLink({ children, onClick }) {
  return (
    <button
      className="py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function EmergencyCard({ emergency, onClick }) {
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
          case 'Critical':
            return 'bg-red-100 text-red-800';
          case 'High':
            return 'bg-orange-100 text-orange-800';
          case 'Medium':
            return 'bg-yellow-100 text-yellow-800';
          default:
            return 'bg-blue-100 text-blue-800';
        }
      };
  return (
    <div
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 text-red-600 font-bold text-xl h-12 w-12 rounded-full flex items-center justify-center">
            {emergency.bloodType}
          </div>
          <div>
            <h4 className="font-medium text-gray-800 text-lg">{emergency.hospital}</h4>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1" /> {emergency.location}
            </div>
          </div>
        </div>
        <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(emergency.urgency)}`}>
          {emergency.urgency}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-b border-gray-100 py-3">
        <div>
          <div className="text-gray-500 text-xs">Units</div>
          <div className="font-semibold">{emergency.units}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Distance</div>
          <div className="font-semibold">{emergency.distance}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Posted</div>
          <div className="font-semibold">{emergency.timePosted}</div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

export default function RaksetuApp() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRequestSuccessModal, setShowRequestSuccessModal] = useState(false);
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [filteredEmergencies, setFilteredEmergencies] = useState(emergencyData);
  const [viewingEmergency, setViewingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState(null);
  const [currentView, setCurrentView] = useState('emergency-list');

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', bloodType: '', phone: '' });
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '',
    hospital: '',
    bloodType: 'A+',
    units: 1,
    urgency: 'Medium',
    contactName: '',
    contactPhone: '',
    notes: '',
  });

  useEffect(() => {
    setTimeout(() => {
      setUserLocation({ lat: 28.6139, lng: 77.2090 });
    }, 1500);

    if (bloodTypeFilter === 'All') {
      setFilteredEmergencies(emergencyData);
    } else {
      setFilteredEmergencies(emergencyData.filter((e) => e.bloodType === bloodTypeFilter));
    }
  }, [bloodTypeFilter]);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  const handleEmergencyRequest = (e) => {
    e.preventDefault();
    setShowEmergencyModal(false);
    setShowRequestSuccessModal(true);
  };

  const handleEmergencyResponse = () => {
    setNearbyDonors({
      count: 8,
      estimatedTime: '15 minutes',
      radius: '5 km',
    });
    setCurrentView('donor-confirmation');
  };

  const confirmDonation = () => {
    setCurrentView('donation-confirmed');
  };

  const backToEmergencies = () => {
    setViewingEmergency(false);
    setSelectedEmergency(null);
    setNearbyDonors(null);
    setCurrentView('emergency-list');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'emergency-list':
        return (
          <div className="space-y-4">
            {filteredEmergencies.map((emergency) => (
              <EmergencyCard
                key={emergency.id}
                emergency={emergency}
                onClick={() => {
                  setSelectedEmergency(emergency);
                  setViewingEmergency(true);
                  setCurrentView('emergency-detail');
                }}
              />
            ))}
          </div>
        );
      case 'emergency-detail':
        return selectedEmergency && (
          <div className="space-y-4">
            <button className="flex items-center text-red-600 mb-4" onClick={backToEmergencies}>
              <ArrowLeft size={18} className="mr-1" /> Back to emergencies
            </button>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-600 font-bold text-xl h-12 w-12 rounded-full flex items-center justify-center">
                    {selectedEmergency.bloodType}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 text-lg">{selectedEmergency.hospital}</h4>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin size={14} className="mr-1" /> {selectedEmergency.location}
                    </div>
                  </div>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(selectedEmergency.urgency)}`}>
                  {selectedEmergency.urgency}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-b border-gray-100 py-3">
                <div>
                  <div className="text-gray-500 text-xs">Units Needed</div>
                  <div className="font-semibold">{selectedEmergency.units}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Distance</div>
                  <div className="font-semibold">{selectedEmergency.distance}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Posted</div>
                  <div className="font-semibold">{selectedEmergency.timePosted}</div>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Details</h5>
                <p className="text-gray-600 text-sm">
                  Urgent need for {selectedEmergency.bloodType} blood for a patient undergoing emergency treatment. The hospital has confirmed critical need with limited supply in their blood bank.
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  onClick={handleEmergencyResponse}
                >
                  <Heart size={16} /> Respond Now
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                  <MessageCircle size={18} />
                </button>
                <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                  <MapPin size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      case 'donor-confirmation':
        return selectedEmergency && nearbyDonors && (
          <div className="space-y-4">
            <button
              className="flex items-center text-red-600 mb-4"
              onClick={() => setCurrentView('emergency-detail')}
            >
              <ArrowLeft size={18} className="mr-1" /> Back to emergency details
            </button>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-center py-4">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-semibold mb-1">Great! Your blood type matches</h3>
                <p className="text-gray-600 mb-4">We found {nearbyDonors.count} potential donors within {nearbyDonors.radius}</p>

                <div className="border-t border-b border-gray-100 py-4 my-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Your blood type:</span>
                    <span className="font-semibold">O+</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Estimated arrival time:</span>
                    <span className="font-semibold">{nearbyDonors.estimatedTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Hospital:</span>
                    <span className="font-semibold">{selectedEmergency.hospital}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  By confirming, you agree to donate blood at {selectedEmergency.hospital}. The hospital staff will guide you through the donation process.
                </p>

                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium"
                  onClick={confirmDonation}
                >
                  Confirm Donation
                </button>

                <button
                  className="w-full mt-2 text-gray-600 py-2"
                  onClick={() => setCurrentView('emergency-detail')}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      case 'donation-confirmed':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} className="text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Donation Confirmed!</h3>
              <p className="text-gray-600 mb-6">
                Thank you for being a lifesaver. The hospital has been notified of your arrival.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Hospital:</span>
                  <span className="font-semibold">{selectedEmergency.hospital}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold">{selectedEmergency.location}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Blood Type:</span>
                  <span className="font-semibold">{selectedEmergency.bloodType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Contact:</span>
                  <span className="font-semibold">Dr. Patel (+91 98765-43210)</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <MapPin size={18} /> Get Directions
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
                  onClick={backToEmergencies}
                >
                  View Other Emergencies
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                <p>You've earned 150 Impact Points for this donation!</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Error: Unknown view</div>;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Droplet className="text-red-600" size={28} />
            <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Raksetu
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink active={activeSection === 'home'} onClick={() => { setActiveSection('home'); setViewingEmergency(false); }}>
              Home
            </NavLink>
            <NavLink active={activeSection === 'donate'} onClick={() => { setActiveSection('donate'); setViewingEmergency(false); }}>
              Donate
            </NavLink>
            <NavLink active={activeSection === 'emergency'} onClick={() => { setActiveSection('emergency'); setViewingEmergency(false); }}>
              Emergency
            </NavLink>
            <NavLink active={activeSection === 'track'} onClick={() => { setActiveSection('track'); setViewingEmergency(false); }}>
              Track
            </NavLink>
            <NavLink active={activeSection === 'about'} onClick={() => { setActiveSection('about'); setViewingEmergency(false); }}>
              About
            </NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-4">
                <button className="relative">
                  <Bell size={20} className="text-gray-600 hover:text-red-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">
                    3
                  </span>
                </button>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm">
                    RM
                  </div>
                  <span className="text-sm font-medium">Rahul M</span>
                </div>
              </div>
            ) : (
              <button
                className="hidden md:flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                <LogIn size={18} className="mr-1" />
                Sign In
              </button>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="container mx-auto px-4 py-2 flex flex-col">
              <MobileNavLink onClick={() => { setActiveSection('home'); setIsMenuOpen(false); }}>Home</MobileNavLink>
              <MobileNavLink onClick={() => { setActiveSection('donate'); setIsMenuOpen(false); }}>Donate</MobileNavLink>
              <MobileNavLink onClick={() => { setActiveSection('emergency'); setIsMenuOpen(false); }}>Emergency</MobileNavLink>
              <MobileNavLink onClick={() => { setActiveSection('track'); setIsMenuOpen(false); }}>Track Donation</MobileNavLink>
              <MobileNavLink onClick={() => { setActiveSection('about'); setIsMenuOpen(false); }}>About</MobileNavLink>

              {isLoggedIn ? (
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <div className="flex items-center py-2">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm mr-2">
                      RM
                    </div>
                    <span className="text-sm font-medium">Rahul Mehta</span>
                  </div>
                  <MobileNavLink onClick={() => {}}>Profile</MobileNavLink>
                  <MobileNavLink onClick={() => {}}>Donations</MobileNavLink>
                  <MobileNavLink onClick={() => {}}>Settings</MobileNavLink>
                  <MobileNavLink onClick={() => setIsLoggedIn(false)}>Sign Out</MobileNavLink>
                </div>
              ) : (
                <div className="mt-4 mb-2">
                  <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {activeSection === 'home' && (
          <>
            {/* Hero Section */}
            <section className="relative py-16 overflow-hidden">
    <video
      autoPlay
      muted
      loop
      className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100"
    >
      <source src="src/assets/login-background.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center">
      <div className="space-y-6 text-white">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
          Save Lives with Every Drop
        </h1>
        <p className="text-lg">
          India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
          Emergency response within minutes, not hours.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            onClick={() => setActiveSection('donate')}
          >
            <Droplet size={20} />
            Donate Now
          </button>
          <button
            className="bg-red-700 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-red-400 flex items-center justify-center gap-2"
            onClick={() => setShowEmergencyModal(true)}
          >
            <AlertTriangle size={20} />
            Request Emergency
          </button>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`w-8 h-8 rounded-full border-2 border-red-600 bg-red-${300 + i * 100}`}></div>
            ))}
          </div>
          <p>Join 58,000+ donors saving lives daily</p>
        </div>
      </div>
      <div className="hidden md:block">
        <div className="relative">
          <div className="bg-white p-6 rounded-xl shadow-lg relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Emergency Alerts</h3>
              <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Live</span>
            </div>
            <div className="space-y-4">
              {emergencyData.slice(0, 3).map((emergency) => (
                <EmergencyCard
                  key={emergency.id}
                  emergency={emergency}
                  onClick={() => {
                    setSelectedEmergency(emergency);
                    setViewingEmergency(true);
                    setActiveSection('emergency');
                    setCurrentView('emergency-detail');
                  }}
                />
              ))}
            </div>
            <button
              className="mt-4 text-red-600 font-medium flex items-center hover:text-red-800 transition-colors"
              onClick={() => setActiveSection('emergency')}
            >
              View all emergencies <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">What Makes Raksetu Different</h2>
                  <p className="text-gray-600 max-w-3xl mx-auto">
                    We're revolutionizing blood donation with unique features designed for India's specific challenges
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <FeatureCard
                    icon={<Clock className="text-red-600" size={32} />}
                    title="Real-time Emergency Response"
                    description="Notify nearby donors instantly during emergencies through our AI-based matching algorithm, reducing response time by 78%."
                  />
                  <FeatureCard
                    icon={<MapPin className="text-red-600" size={32} />}
                    title="Proximity-based Alerts"
                    description="Receive alerts only for emergencies within your commutable distance, with integrated navigation."
                  />
                  <FeatureCard
                    icon={<Bell className="text-red-600" size={32} />}
                    title="Blood Type Rare Alert System"
                    description="Special notification system for rare blood types like Bombay Blood Group, connecting across multiple states."
                  />
                  <FeatureCard
                    icon={<Phone className="text-red-600" size={32} />}
                    title="Works Without Internet"
                    description="Emergency SMS fallback system works even when internet connectivity is unavailable in remote areas."
                  />
                  <FeatureCard
                    icon={<Heart className="text-red-600" size={32} />}
                    title="Impact Tracking"
                    description="See how your donations are used and receive updates about the lives you've helped save."
                  />
                  <FeatureCard
                    icon={<Users className="text-red-600" size={32} />}
                    title="Community Blood Drives"
                    description="Organize and participate in community blood drives with our built-in event management tools."
                  />
                </div>
              </div>
            </section>

            {/* Emergency Map Section */}
            <section className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Live Emergency Map</h2>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Real-time visualization of blood emergencies across India. Find donation opportunities near you.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="aspect-w-16 aspect-h-9 mb-6">
          <MapContainer
            center={[28.6139, 77.2090]} // Default to Delhi
            zoom={10}
            style={{ height: '400px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {filteredEmergencies.map((emergency) => (
              <Marker
                key={emergency.id}
                position={[28.6139 + (Math.random() - 0.5) * 0.1, 77.2090 + (Math.random() - 0.5) * 0.1]} // Random offset for demo
                icon={customIcon}
              >
                <Popup>
                  <div>
                    <h4>{emergency.hospital}</h4>
                    <p>Blood Type: {emergency.bloodType}</p>
                    <p>Urgency: {emergency.urgency}</p>
                    <p>Units: {emergency.units}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {bloodTypes.map((type) => (
            <button
              key={type}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                bloodTypeFilter === type
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setBloodTypeFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">Showing {filteredEmergencies.length} emergencies</div>
          <button
            className="text-red-600 font-medium flex items-center hover:text-red-800 transition-colors"
            onClick={() => setActiveSection('emergency')}
          >
            View all details <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  </section>

            {/* Stats Section */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-4">
                  {donorStats.map((stat, index) => (
                    <div key={index} className="text-center p-6 bg-red-50 rounded-xl">
                      <div className="text-3xl font-bold text-red-600 mb-2">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-red-950 text-white">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-3">Blood Donation Stories</h2>
                  <p className="text-red-100 max-w-3xl mx-auto">
                    Hear from donors, recipients, and healthcare professionals about their experiences with Raksetu
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-maroon p-6 rounded-xl relative">
                      <div className="mb-4 text-lg italic">"{testimonial.message}"</div>
                      <div className="font-medium">{testimonial.name}</div>
                      <div className="text-red-200 text-sm">{testimonial.bloodType || testimonial.role}</div>
                      <div className="absolute top-3 right-4 opacity-20">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M10 11H6C6 7 8 5 10 5V3C6 3 4 7 4 11V17H10V11ZM20 11H16C16 7 18 5 20 5V3C16 3 14 7 14 11V17H20V11Z" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <button className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-colors">
                    Share Your Story
                  </button>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                  <h2 className="text-3xl font-bold mb-4">Ready to Save Lives?</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto mb-8">
                    Join India's largest community of blood donors. Register now to receive emergency alerts
                    and track the impact of your donations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                    >
                      <User size={20} />
                      Register as Donor
                    </button>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      onClick={() => setActiveSection('about')}
                    >
                      <Info size={20} />
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {activeSection === 'emergency' && (
          <section className="py-6 md:py-10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Blood Emergencies</h2>

              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-6">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute top-3 left-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search hospital, location..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <button className="px-4 py-2 border border-gray-200 rounded-lg flex items-center gap-2 bg-white">
                        <Filter size={18} /> Filter <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="flex gap-2">
                      {bloodTypes.slice(0, 3).map((type) => (
                        <button
                          key={type}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            bloodTypeFilter === type
                              ? 'bg-red-600 text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          }`}
                          onClick={() => setBloodTypeFilter(type)}
                        >
                          {type}
                        </button>
                      ))}
                      <button className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200">
                        More...
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 rounded-full">
                    <span>Within 10km</span>
                    <X size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>
                  <div className="flex items-center gap-1 text-sm px-3 py-1 bg-gray-100 rounded-full">
                    <span>Critical & High</span>
                    <X size={14} className="text-gray-400 hover:text-gray-600 cursor-pointer" />
                  </div>
                  <button className="text-sm text-red-600 hover:text-red-800">Clear all filters</button>
                </div>
              </div>

              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-2 xl:col-span-1 space-y-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium mb-3">Blood Types</h3>
                    <div className="space-y-2">
                      {bloodTypes.map((type) => (
                        <button
                          key={type}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            bloodTypeFilter === type ? 'bg-red-50 text-red-600' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => setBloodTypeFilter(type)}
                        >
                          <span>{type}</span>
                          {bloodTypeFilter === type && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium mb-3">Urgency</h3>
                    <div className="space-y-2">
                      {['All', 'Critical', 'High', 'Medium', 'Low'].map((urgency) => (
                        <button
                          key={urgency}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          {urgency}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="font-medium mb-3">Distance</h3>
                    <div className="space-y-2">
                      {['5 km', '10 km', '15 km', '20 km', '50 km'].map((distance) => (
                        <button
                          key={distance}
                          className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          {distance}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={16} className="text-red-600" />
                      <h3 className="font-medium text-red-800">Need Blood Urgently?</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-4">
                      Request emergency blood for a patient and get connected with donors in your area.
                    </p>
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                      onClick={() => setShowEmergencyModal(true)}
                    >
                      Request Emergency
                    </button>
                  </div>
                </div>

                <div className="md:col-span-3 xl:col-span-4">{renderCurrentView()}</div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'donate' && (
          <section className="py-6 md:py-10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Donate Blood</h2>

              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-600">
                  <h3 className="font-semibold mb-2">Emergency Donation</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Respond to urgent blood requests in your area. Your donation could save a life within hours.
                  </p>
                  <button
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    onClick={() => setActiveSection('emergency')}
                  >
                    <AlertTriangle size={16} />
                    View Emergencies
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
                  <h3 className="font-semibold mb-2">Blood Drives</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Join organized blood donation camps in your community. Help build blood reserves for future needs.
                  </p>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Calendar size={16} />
                    Find Blood Drives
                  </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <h3 className="font-semibold mb-2">Regular Donation</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Schedule recurring donations at your preferred blood bank or hospital. Become a reliable donor.
                  </p>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2">
                    <Check size={16} />
                    Schedule Donation
                  </button>
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Nearby Blood Banks</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bloodBanks.map((bank) => (
                    <div key={bank.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <h4 className="font-medium mb-1">{bank.name}</h4>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin size={14} className="mr-1" /> {bank.location} ({bank.distance})
                      </div>

                      <div className="mb-3">
                        <div className="text-sm font-medium mb-2">Blood Availability:</div>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(bank.availability).map(([type, count]) => (
                            <div key={type} className="text-center">
                              <div
                                className={`text-sm font-bold rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                                  count < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {type}
                              </div>
                              <div className="text-xs mt-1">{count} units</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                          Schedule Visit
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                          <Phone size={16} />
                        </button>
                        <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                          <MapPin size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-xl font-semibold mb-4">Upcoming Blood Drives</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bloodDrives.map((drive) => (
                    <div key={drive.id} className="bg-white p-4 rounded-xl shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="bg-red-50 text-red-600 p-2 rounded-lg">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h4 className="font-medium">{drive.name}</h4>
                          <div className="text-sm text-gray-500 mb-2">{drive.organizer}</div>

                          <div className="text-sm mb-3">
                            <div className="flex items-center mb-1">
                              <MapPin size={14} className="mr-1 text-gray-500" />
                              <span>{drive.location}</span>
                            </div>
                            <div className="flex items-center mb-1">
                              <Calendar size={14} className="mr-1 text-gray-500" />
                              <span>{drive.date}</span>
                            </div>
                            <div className="flex items-center">
                              <Clock size={14} className="mr-1 text-gray-500" />
                              <span>{drive.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center text-sm mb-3">
                            <Users size={14} className="mr-1 text-gray-500" />
                            <span>{drive.registered} people registered</span>
                          </div>

                          <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
                            Register
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 p-6 rounded-xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Want to organize a blood drive?</h3>
                    <p className="text-gray-700">
                      We provide support for organizing blood donation drives at your workplace, community, or institution.
                    </p>
                  </div>
                  <button className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeSection === 'track' && (
          <section className="py-6 md:py-10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">Track Your Donations</h2>

              {isLoggedIn ? (
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-xl">
                        O+
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Rahul Mehta</h3>
                        <div className="text-gray-600">3x Donor • 450 Impact Points</div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-600">3</div>
                        <div className="text-gray-600">Donations</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-600">3</div>
                        <div className="text-gray-600">Lives Saved</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-600">450</div>
                        <div className="text-gray-600">Impact Points</div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <div className="text-3xl font-bold text-red-600">O+</div>
                        <div className="text-gray-600">Blood Type</div>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Schedule Next Donation
                      </button>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        Download Certificate
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Your Donation History</h3>

                    <div className="space-y-4">
                      {userDonations.map((donation) => (
                        <div key={donation.id} className="border-b border-gray-100 pb-4">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2">
                              <div className="bg-red-100 text-red-600 font-bold text-sm h-8 w-8 rounded-full flex items-center justify-center">
                                {donation.bloodType}
                              </div>
                              <div>
                                <div className="font-medium">{donation.hospital}</div>
                                <div className="text-sm text-gray-500">{donation.date}</div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                                {donation.status}
                              </span>
                              <span className="text-sm text-gray-500">+{donation.impactPoints} pts</span>
                            </div>
                          </div>

                          <div className="text-sm text-gray-600 pl-10">
                            Your donation helped a {donation.recipientAge}-year-old patient with {donation.recipientCondition}.
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 text-center">
                      <button className="text-red-600 font-medium text-sm hover:text-red-800 transition-colors">
                        View All Donations
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Impact Recognition</h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                          <Heart size={32} />
                        </div>
                        <div className="font-medium">First Donation</div>
                        <div className="text-xs text-gray-500">January 2025</div>
                      </div>
                      <div className="text-center">
                        <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-2">
                          <Users size={32} />
                        </div>
                        <div className="font-medium">Emergency Hero</div>
                        <div className="text-xs text-gray-500">October 2024</div>
                      </div>
                      <div className="text-center opacity-40">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                          <Check size={32} />
                        </div>
                        <div className="font-medium">Regular Donor</div>
                        <div className="text-xs text-gray-500">Locked (5 donations)</div>
                      </div>
                      <div className="text-center opacity-40">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mx-auto mb-2">
                          <Award size={32} />
                        </div>
                        <div className="font-medium">Silver Saver</div>
                        <div className="text-xs text-gray-500">Locked (10 donations)</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center">
                  <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                    <UserCircle size={40} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sign in to track your donations</h3>
                  <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                    Sign in to view your donation history, track the impact of your donations,
                    and manage your upcoming donations.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold transition-colors"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                    >
                      Create Account
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {activeSection === 'about' && (
          <section className="py-6 md:py-10">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-6">About Raksetu</h2>

              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                <p className="text-gray-700 mb-4">
                  Raksetu was founded with a singular mission: to ensure that no life is lost in India due to lack of timely access to blood.
                  We're bridging the gap between blood donors, recipients, and healthcare institutions through technology.
                </p>
                <p className="text-gray-700">
                  Our name "Raksetu" comes from Sanskrit: "Rakta" (blood) + "Setu" (bridge), symbolizing our role as a lifeline connecting
                  those who need blood with those who can provide it.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">The Problem We're Solving</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <AlertTriangle size={18} className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Every 2 seconds, someone in India needs blood, but only 1% of the population donates blood.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle size={18} className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Patients and families often struggle to find donors during emergencies, especially for rare blood types.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle size={18} className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Blood banks face challenges in maintaining optimal inventory and communicating needs to potential donors.</span>
                    </li>
                    <li className="flex items-start">
                      <AlertTriangle size={18} className="text-red-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Many willing donors don't know when or where their donation is most needed.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="text-xl font-semibold mb-4">Our Solution</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <Check size={18} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span>AI-powered emergency response system that matches donors to recipients based on blood type, location, and urgency.</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Real-time blood availability tracker across hospitals and blood banks nationwide.</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Impact tracking system that shows donors exactly how their contributions help save lives.</span>
                    </li>
                    <li className="flex items-start">
                      <Check size={18} className="text-green-600 mr-2 mt-1 flex-shrink-0" />
                      <span>Community-building tools to organize and promote blood donation drives.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-xl font-semibold mb-4">Our Impact</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">67%</div>
                    <div className="text-gray-700">Reduction in emergency response time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">124K+</div>
                    <div className="text-gray-700">Lives saved through our platform</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">280+</div>
                    <div className="text-gray-700">Cities across India</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-red-600 mb-2">42%</div>
                    <div className="text-gray-700">Increase in repeat donations</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                <h3 className="text-xl font-semibold mb-4">Our Team</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <div className="font-semibold">Dr. Anjali Sharma</div>
                    <div className="text-sm text-gray-600">Founder & CEO</div>
                    <div className="text-sm text-gray-600">Former Hematologist, AIIMS</div>
                  </div>
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <div className="font-semibold">Vikram Reddy</div>
                    <div className="text-sm text-gray-600">CTO</div>
                    <div className="text-sm text-gray-600">AI & Healthcare Tech Expert</div>
                  </div>
                  <div className="text-center">
                    <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-3"></div>
                    <div className="font-semibold">Priya Malhotra</div>
                    <div className="text-sm text-gray-600">COO</div>
                    <div className="text-sm text-gray-600">Former Red Cross Director</div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin size={18} className="text-red-600" />
                        <div className="font-medium">Address</div>
                      </div>
                      <div className="text-gray-700 pl-7">
                        Raksetu Technologies<br />
                        Level 5, Tech Park<br />
                        Koramangala, Bangalore 560034
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Phone size={18} className="text-red-600" />
                        <div className="font-medium">Phone</div>
                      </div>
                      <div className="text-gray-700 pl-7">
                        Emergency Helpline: +91 1800-123-4567<br />
                        General Inquiries: +91 080-2345-6789
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Mail size={18} className="text-red-600" />
                        <div className="font-medium">Email</div>
                      </div>
                      <div className="text-gray-700 pl-7">
                        Support: support@raksetu.org<br />
                        Media: media@raksetu.org
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Send us a message</h4>
                    <form className="space-y-3">
                      <div>
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <textarea
                          placeholder="Your Message"
                          rows="4"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        ></textarea>
                      </div>
                      <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium">
                        Send Message
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Droplet className="text-red-500" size={24} />
                <span className="text-xl font-bold">Raksetu</span>
              </div>
              <p className="text-gray-400 mb-4">
                India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.04c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 4c1.76 0 2 .01 2.7.04.71.03 1.2.15 1.63.32.44.17.82.4 1.2.78.38.38.61.76.78 1.2.17.43.29.92.32 1.63.03.7.04.94.04 2.7s-.01 2-.04 2.7c-.03.71-.15 1.2-.32 1.63-.17.44-.4.82-.78 1.2-.38.38-.76.61-1.2.78-.43.17-.92.29-1.63.32-.7.03-.94.04-2.7.04s-2-.01-2.7-.04c-.71-.03-1.2-.15-1.63-.32a3.67 3.67 0 0 1-1.2-.78c-.38-.38-.61-.76-.78-1.2-.17-.43-.29-.92-.32-1.63-.03-.7-.04-.94-.04-2.7s.01-2 .04-2.7c.03-.71.15-1.2.32-1.63.17-.44.4-.82.78-1.2.38-.38.76-.61 1.2-.78.43-.17.92-.29 1.63-.32.7-.03.94-.04 2.7-.04z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2                    .26 2.11a1.79 1.79 0 0 1 1.78 1.78v5.65h-3.11v3.21h3.11v7.11h3.21v-7.11h4.61v-3.21h-4.61v-2.11z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
                <li><a href="#donate" className="hover:text-white transition-colors">Donate</a></li>
                <li><a href="#emergency" className="hover:text-white transition-colors">Emergency</a></li>
                <li><a href="#track" className="hover:text-white transition-colors">Track Donation</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Involved</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Become a Donor</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Host a Blood Drive</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Volunteer</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partnerships</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            <p>&copy; 2025 Raksetu Technologies. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {authMode === 'login' ? 'Sign In' : 'Register'}
              </h3>
              <button onClick={() => setShowAuthModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {authMode === 'register' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={authMode === 'login' ? loginForm.email : registerForm.email}
                  onChange={(e) =>
                    authMode === 'login'
                      ? setLoginForm({ ...loginForm, email: e.target.value })
                      : setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={authMode === 'login' ? loginForm.password : registerForm.password}
                  onChange={(e) =>
                    authMode === 'login'
                      ? setLoginForm({ ...loginForm, password: e.target.value })
                      : setRegisterForm({ ...registerForm, password: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                />
              </div>
              {authMode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">Blood Type</label>
                    <select
                      value={registerForm.bloodType}
                      onChange={(e) => setRegisterForm({ ...registerForm, bloodType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      {bloodTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
              >
                {authMode === 'login' ? 'Sign In' : 'Register'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setAuthMode('register')}
                    className="text-red-600 hover:underline"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    onClick={() => setAuthMode('login')}
                    className="text-red-600 hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Emergency Request Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Request Emergency Blood</h3>
              <button onClick={() => setShowEmergencyModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEmergencyRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Patient Name</label>
                <input
                  type="text"
                  value={emergencyForm.patientName}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, patientName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter patient name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital</label>
                <input
                  type="text"
                  value={emergencyForm.hospital}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, hospital: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Blood Type</label>
                <select
                  value={emergencyForm.bloodType}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, bloodType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Units Needed</label>
                <input
                  type="number"
                  value={emergencyForm.units}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, units: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Urgency</label>
                <select
                  value={emergencyForm.urgency}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, urgency: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                >
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyForm.contactName}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, contactName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter contact name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={emergencyForm.contactPhone}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, contactPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  value={emergencyForm.notes}
                  onChange={(e) => setEmergencyForm({ ...emergencyForm, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter any additional details"
                  rows="3"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
              >
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Request Success Modal */}
      {showRequestSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Request Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">
              Your emergency blood request has been received. We are notifying nearby donors and will update you soon.
            </p>
            <button
              onClick={() => {
                setShowRequestSuccessModal(false);
                setShowEmergencyModal(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}