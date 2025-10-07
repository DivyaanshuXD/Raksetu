import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import EmergencyRequestModal from './EmergencyRequestModal';
import { 
  MapPin, Layers, Maximize2, Minimize2, Navigation, 
  AlertTriangle, Droplet, Phone, Clock, User, MapPinned,
  Filter, RefreshCw, Heart, Building2, Sliders, Zap
} from 'lucide-react';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Utility function to calculate distance using Haversine formula (in kilometers)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Function to fetch location name using Nominatim API
const fetchLocationName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
      { headers: { 'User-Agent': 'RaksetuApp/1.0' } }
    );
    const data = await response.json();
    if (data && data.address) {
      const city = data.address.city || data.address.town || data.address.village || '';
      const state = data.address.state || '';
      const country = data.address.country || '';
      return [city, state, country].filter(Boolean).join(', ') || 'Unknown Location';
    }
    return 'Unknown Location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return null;
  }
};

// Professional clean icons - NO GRADIENTS
const createProfessionalIcon = (type, pulse = false) => {
  const configs = {
    emergency: {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: '🆘',
      size: pulse ? 40 : 36
    },
    normal: {
      color: '#ef4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      icon: '🆘',
      size: pulse ? 40 : 36
    },
    critical: {
      color: '#dc2626',
      bgColor: 'rgba(220, 38, 38, 0.2)',
      icon: '🚨',
      size: 44
    },
    bloodbank: {
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.15)',
      icon: '🏥',
      size: 36
    },
    user: {
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      icon: '📍',
      size: 40
    }
  };

  const config = configs[type.toLowerCase()] || configs.emergency;
  const iconHTML = `
    <div style="position: relative; width: ${config.size}px; height: ${config.size}px;">
      ${pulse ? `<div style="position: absolute; inset: 0; background: ${config.bgColor}; border-radius: 50%; animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
      <div style="
        position: relative;
        width: 100%;
        height: 100%;
        background: ${config.color};
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${config.size * 0.5}px;
      ">
        ${config.icon}
      </div>
    </div>
  `;

  return L.divIcon({
    html: iconHTML,
    className: 'custom-map-marker',
    iconSize: [config.size, config.size],
    iconAnchor: [config.size / 2, config.size / 2],
    popupAnchor: [0, -config.size / 2]
  });
};

const emergencyIcon = createProfessionalIcon('emergency', true);
const criticalIcon = createProfessionalIcon('critical', true);
const bloodBankIcon = createProfessionalIcon('bloodbank');
const userLocationIcon = createProfessionalIcon('user');

// Component to handle map updates with smooth animations - Optimized with memo
const MapUpdater = memo(({ userLocation, filteredEmergencies, viewMode, bloodBanks }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !map.getContainer()) return;
    const timeoutId = setTimeout(() => {
      try {
        map.setView([userLocation.lat, userLocation.lng], 12, {
          animate: false  // Disable animation to prevent position errors
        });
      } catch (error) {
        console.error('Error setting map view:', error);
      }
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [map, userLocation.lat, userLocation.lng]);

  useEffect(() => {
    if (!map || !map.getContainer()) return;
    
    const timeoutId = setTimeout(() => {
      const bounds = [[userLocation.lat, userLocation.lng]];

      if (viewMode === 'emergencies' || viewMode === 'both') {
        filteredEmergencies.forEach(emergency => {
          if (emergency.coordinates) {
            bounds.push([emergency.coordinates.latitude, emergency.coordinates.longitude]);
          }
        });
      }

      if (viewMode === 'bloodbanks' || viewMode === 'both') {
        bloodBanks.forEach(bank => {
          if (bank.coordinates) {
            bounds.push([bank.coordinates.latitude, bank.coordinates.longitude]);
          }
        });
      }

      if (bounds.length > 1) {
        try {
          // Check if map is still valid before trying to fit bounds
          if (!map || !map.getContainer()) {
            console.warn('Map not ready yet, skipping fitBounds');
            return;
          }
          
          const leafletBounds = L.latLngBounds(bounds);
          map.fitBounds(leafletBounds, { 
            padding: [50, 50], 
            maxZoom: 14,
            animate: false,  // Disable animation to prevent position errors
            duration: 0
          });
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      }
    }, 300); // Debounce by 300ms

    return () => clearTimeout(timeoutId);
  }, [map, userLocation.lat, userLocation.lng, filteredEmergencies.length, viewMode, bloodBanks.length]);

  return null;
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary rerenders
  return (
    prevProps.userLocation.lat === nextProps.userLocation.lat &&
    prevProps.userLocation.lng === nextProps.userLocation.lng &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.filteredEmergencies.length === nextProps.filteredEmergencies.length &&
    prevProps.bloodBanks.length === nextProps.bloodBanks.length
  );
});

const EmergencyMapSection = memo(({ userProfile }) => {
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('both');
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [userLocation, setUserLocation] = useState({ lat: 17.3850, lng: 78.4867 });
  const [locationName, setLocationName] = useState('Loading location...');
  const [mapStyle, setMapStyle] = useState('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchRadius, setSearchRadius] = useState(70); // Default 70km
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);
  const mapRef = useRef(null);
  const [mapKey, setMapKey] = useState(Date.now());

  // Force remount map on component mount to prevent reuse errors
  useEffect(() => {
    setMapKey(Date.now());
  }, []);

  // Fetch user's real-time location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const name = await fetchLocationName(latitude, longitude);
          setLocationName(name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error fetching location:', error);
          // Fallback to default location
          setLocationName('Hyderabad, Telangana, India');
          setError('Location access denied. Using default location.');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation not supported by browser');
      setLocationName('Hyderabad, Telangana, India');
    }
  }, []);

  // Fetch real-time emergency requests
  useEffect(() => {
    setLoading(true);
    const emergenciesRef = collection(db, 'emergencyRequests');
    const unsubscribe = onSnapshot(
      emergenciesRef,
      (snapshot) => {
        const emergencies = snapshot.docs
          .map(doc => {
            const data = doc.data();
            if (!data.coordinates?.latitude || !data.coordinates?.longitude) return null;
            
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              data.coordinates.latitude,
              data.coordinates.longitude
            );
            
            return {
              id: doc.id,
              ...data,
              distance,
              timestamp: data.timestamp || { seconds: Date.now() / 1000 }
            };
          })
          .filter(Boolean);

        const filteredByRadius = emergencies.filter(e => e.distance <= searchRadius);
        const filtered = bloodTypeFilter === 'All'
          ? filteredByRadius
          : filteredByRadius.filter(e => e.bloodType === bloodTypeFilter);

        setFilteredEmergencies(filtered);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching emergencies:', err);
        setError('Failed to load emergency requests');
        setFilteredEmergencies([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userLocation, searchRadius, bloodTypeFilter]);

  // Fetch real-time blood banks
  useEffect(() => {
    const bloodBanksRef = collection(db, 'bloodBanks');
    const unsubscribe = onSnapshot(
      bloodBanksRef,
      (snapshot) => {
        const banks = snapshot.docs
          .map(doc => {
            const data = doc.data();
            // Handle both data structures: coordinates object or direct lat/lng
            const lat = data.coordinates?.latitude || data.latitude;
            const lng = data.coordinates?.longitude || data.longitude;
            
            if (!lat || !lng) {
              console.warn('Blood bank missing coordinates:', doc.id, data.name);
              return null;
            }
            
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lng,
              lat,
              lng
            );
            
            // Normalize data structure for consistent access
            return { 
              id: doc.id, 
              ...data, 
              coordinates: { latitude: lat, longitude: lng },
              latitude: lat,
              longitude: lng,
              distance 
            };
          })
          .filter(Boolean)
          .filter(b => b.distance <= searchRadius);

        console.log(`✅ Loaded ${banks.length} blood banks within ${searchRadius}km`);
        setBloodBanks(banks);
      },
      (err) => console.error('Error fetching blood banks:', err)
    );

    return () => unsubscribe();
  }, [userLocation, searchRadius]);

  // Memoize expensive calculations for better performance
  const urgencyStats = useMemo(() => ({
    critical: filteredEmergencies.filter(e => e.urgency === 'Critical').length,
    high: filteredEmergencies.filter(e => e.urgency === 'High').length,
    medium: filteredEmergencies.filter(e => e.urgency === 'Medium').length,
    total: filteredEmergencies.length
  }), [filteredEmergencies]);

  const getTileLayerUrl = useMemo(() => {
    return mapStyle === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  }, [mapStyle]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Refresh geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          const name = await fetchLocationName(latitude, longitude);
          setLocationName(name || `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
        },
        (error) => {
          console.error('Error refreshing location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    setTimeout(() => setIsRefreshing(false), 1000);
  }, []);

  const getUrgencyBadge = useCallback((urgency) => {
    const badges = {
      Critical: 'bg-red-500 text-white',
      High: 'bg-orange-500 text-white',
      Medium: 'bg-yellow-500 text-white',
      Low: 'bg-green-500 text-white'
    };
    return badges[urgency] || badges.Medium;
  }, []);

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'py-20 bg-gray-50'}`}>
      <div className={`${isFullscreen ? 'min-h-full p-6' : 'container mx-auto px-4'}`}>
        
        {/* Clean Professional Header */}
        <div className={`${isFullscreen ? 'mb-6' : 'mb-10'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Live Emergency Map
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Real-time blood emergency tracking • Connect with donors instantly
              </p>
            </div>
            
            {/* Status Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className={`w-2.5 h-2.5 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-semibold text-gray-700">
                  {loading ? 'Loading' : error ? 'Error' : 'Live'}
                </span>
              </div>
              
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300 disabled:opacity-50"
                title="Refresh map data"
              >
                <RefreshCw size={20} className={`text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-gray-300"
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? <Minimize2 size={20} className="text-gray-700" /> : <Maximize2 size={20} className="text-gray-700" />}
              </button>

              <button
                onClick={() => setShowReportModal(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
              >
                <AlertTriangle size={18} />
                <span className="hidden sm:inline">Report Emergency</span>
              </button>
            </div>
          </div>
        </div>

        {/* Professional Control Panel */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            
            {/* Blood Type Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2.5">
                <Droplet size={16} className="text-red-600" />
                Blood Type
              </label>
              <select
                value={bloodTypeFilter}
                onChange={(e) => setBloodTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 font-medium"
              >
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* View Mode */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2.5">
                <Layers size={16} className="text-blue-600" />
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white text-gray-900 font-medium"
              >
                <option value="emergencies">🆘 Emergencies Only</option>
                <option value="bloodbanks">🏥 Blood Banks Only</option>
                <option value="both">🌐 Show Both</option>
              </select>
            </div>

            {/* Map Style */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2.5">
                <MapPinned size={16} className="text-purple-600" />
                Map Style
              </label>
              <select
                value={mapStyle}
                onChange={(e) => setMapStyle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all bg-white text-gray-900 font-medium"
              >
                <option value="default">🗺️ Default</option>
                <option value="satellite">🛰️ Satellite</option>
              </select>
            </div>

            {/* Search Radius */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2.5">
                <Navigation size={16} className="text-green-600" />
                Search Radius: {searchRadius}km
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowRadiusSlider(!showRadiusSlider)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-all bg-white text-gray-900 font-medium text-left flex items-center justify-between"
                >
                  <span>{searchRadius}km radius</span>
                  <Sliders size={18} className="text-gray-600" />
                </button>
                
                {showRadiusSlider && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-xl shadow-lg border-2 border-gray-200 z-10">
                    <input
                      type="range"
                      min="10"
                      max="1500"
                      step="10"
                      value={searchRadius}
                      onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>10km</span>
                      <span>1500km</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t-2 border-gray-100">
            <div className="text-center p-4 bg-red-50 rounded-xl border-2 border-red-100">
              <div className="text-3xl font-extrabold text-red-600">{filteredEmergencies.length}</div>
              <div className="text-xs font-semibold text-gray-700 mt-1.5">Active Emergencies</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
              <div className="text-3xl font-extrabold text-blue-600">{bloodBanks.length}</div>
              <div className="text-xs font-semibold text-gray-700 mt-1.5">Blood Banks</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl border-2 border-green-100">
              <div className="text-3xl font-extrabold text-green-600">{searchRadius}</div>
              <div className="text-xs font-semibold text-gray-700 mt-1.5">Radius (km)</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
              <div className="text-3xl font-extrabold text-purple-600">
                <MapPin size={24} className="inline" />
              </div>
              <div className="text-xs font-semibold text-gray-700 mt-1.5">Your Location</div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div 
          id="emergency-map-container"
          className={`${isFullscreen ? 'h-[85vh]' : 'h-[650px]'} rounded-2xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-gray-200`}
        >
          {!loading && (
            <MapContainer
              key={mapKey}
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
              zoomControl={true}
            >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url={getTileLayerUrl}
            />

            <MapUpdater
              userLocation={userLocation}
              filteredEmergencies={filteredEmergencies}
              viewMode={viewMode}
              bloodBanks={bloodBanks}
            />

            {/* User Location Marker */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Popup>
                <div className="p-3 min-w-[220px]">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User size={20} className="text-green-600" />
                    </div>
                    <div className="font-bold text-gray-900">Your Location</div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{locationName}</p>
                </div>
              </Popup>
            </Marker>

            {/* Emergency Markers */}
            {(viewMode === 'emergencies' || viewMode === 'both') && filteredEmergencies.map(emergency => (
              <Marker
                key={emergency.id}
                position={[emergency.coordinates.latitude, emergency.coordinates.longitude]}
                icon={emergency.urgency === 'Critical' ? criticalIcon : emergencyIcon}
              >
                <Popup>
                  <div className="p-4 min-w-[300px]">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle size={24} className="text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{emergency.patientName}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full font-bold ${getUrgencyBadge(emergency.urgency)}`}>
                            {emergency.urgency}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-gray-800">
                        <Droplet size={16} className="text-red-500" />
                        <span className="font-bold text-red-600 text-base">{emergency.bloodType}</span>
                        <span className="font-semibold">• {emergency.units} units needed</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-800">
                        <Building2 size={16} />
                        <span className="font-semibold">{emergency.hospital}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-700">
                        <MapPin size={16} />
                        <span className="text-xs">{emergency.location}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-800">
                        <User size={16} />
                        <span className="font-medium">{emergency.contactName}</span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-800">
                        <Phone size={16} />
                        <a href={`tel:${emergency.contactPhone}`} className="text-blue-600 hover:underline font-semibold">
                          {emergency.contactPhone}
                        </a>
                      </div>
                      
                      <div className="flex items-center gap-3 text-gray-800">
                        <Navigation size={16} />
                        <span className="font-bold text-green-600">{emergency.distance} km away</span>
                      </div>
                    </div>

                    {emergency.notes && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-100">
                        <p className="text-xs text-gray-700 italic font-medium">{emergency.notes}</p>
                      </div>
                    )}

                    <a
                      href={`tel:${emergency.contactPhone}`}
                      className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-md"
                    >
                      <Phone size={18} />
                      Call Now
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Blood Bank Markers */}
            {(viewMode === 'bloodbanks' || viewMode === 'both') && bloodBanks.map(bank => {
              const inventory = bank.inventory || bank.availability || {};
              const distance = bank.distance || calculateDistance(
                userLocation.lat, 
                userLocation.lng,
                bank.coordinates?.latitude || bank.latitude || 0,
                bank.coordinates?.longitude || bank.longitude || 0
              );
              
              return (
                <Marker
                  key={bank.id}
                  position={[
                    bank.coordinates?.latitude || bank.latitude, 
                    bank.coordinates?.longitude || bank.longitude
                  ]}
                  icon={bloodBankIcon}
                >
                  <Popup className="compact-blood-bank-popup">
                    <div className="p-2 min-w-[220px] max-w-[280px]">
                      {/* Compact Header */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 size={16} className="text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{bank.name}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Navigation size={10} />
                            {distance.toFixed(1)} km away
                          </p>
                        </div>
                      </div>

                      {/* Compact Blood Availability */}
                      <div className="mb-2">
                        <p className="text-xs font-semibold text-gray-600 mb-1.5">Available Blood:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(inventory)
                            .filter(([_, count]) => count > 0)
                            .slice(0, 4)
                            .map(([type, count]) => {
                              const isUserBloodType = userProfile?.bloodType === type;
                              return (
                                <span
                                  key={type}
                                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-bold ${
                                    isUserBloodType
                                      ? 'bg-green-500 text-white ring-2 ring-green-300'
                                      : count < 5 
                                      ? 'bg-orange-100 text-orange-700' 
                                      : 'bg-green-100 text-green-700'
                                  }`}
                                >
                                  {type}: {count}
                                  {isUserBloodType && ' ✓'}
                                </span>
                              );
                            })}
                          {Object.entries(inventory).filter(([_, count]) => count > 0).length > 4 && (
                            <span className="text-xs text-gray-500 font-medium">
                              +{Object.entries(inventory).filter(([_, count]) => count > 0).length - 4} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Compact Actions */}
                      <div className="flex gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        {bank.phone && (
                          <a
                            href={`tel:${bank.phone}`}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md"
                          >
                            <Phone size={14} className="text-white" />
                            <span>Call</span>
                          </a>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${bank.coordinates?.latitude || bank.latitude},${bank.coordinates?.longitude || bank.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-md"
                        >
                          <MapPin size={12} />
                          Directions
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Search Radius Circle */}
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={searchRadius * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '10, 10'
              }}
            />
          </MapContainer>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-200 p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
            <Filter size={20} />
            Map Legend
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">🆘</div>
              <span className="text-sm font-semibold text-gray-800">Emergency</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">🚨</div>
              <span className="text-sm font-semibold text-gray-800">Critical</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">🏥</div>
              <span className="text-sm font-semibold text-gray-800">Blood Bank</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">📍</div>
              <span className="text-sm font-semibold text-gray-800">You</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showReportModal && (
        <EmergencyRequestModal
          show={showReportModal}
          setShow={setShowReportModal}
          setShowSuccess={setShowSuccess}
          userLocation={userLocation}
        />
      )}

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          display: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
});

EmergencyMapSection.displayName = 'EmergencyMapSection';

export default EmergencyMapSection;
