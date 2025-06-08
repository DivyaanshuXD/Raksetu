import { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import EmergencyRequestModal from './EmergencyRequestModal';
import { MapPin } from 'lucide-react';

// Mock data for fallback
const mockEmergencyRequests = [
  {
    id: 'mock-1',
    hospital: 'Apollo Hospital',
    location: 'Jubilee Hills, Hyderabad',
    bloodType: 'O-',
    urgency: 'Critical',
    units: 3,
    coordinates: { latitude: 17.4065, longitude: 78.4691 },
    timestamp: { seconds: Date.now() / 1000 - 120 },
    distance: 2.3
  },
  {
    id: 'mock-2',
    hospital: 'NIMS Hospital',
    location: 'Punjagutta, Hyderabad',
    bloodType: 'AB+',
    urgency: 'High',
    units: 2,
    coordinates: { latitude: 17.4239, longitude: 78.4738 },
    timestamp: { seconds: Date.now() / 1000 - 600 },
    distance: 5.1
  },
  {
    id: 'mock-3',
    hospital: 'Care Hospital',
    location: 'Banjara Hills, Hyderabad',
    bloodType: 'B+',
    urgency: 'Medium',
    units: 1,
    coordinates: { latitude: 17.4126, longitude: 78.4713 },
    timestamp: { seconds: Date.now() / 1000 - 1200 },
    distance: 3.8
  }
];

const mockBloodBanks = [
  {
    id: 'mock-1',
    name: 'Red Cross Blood Bank',
    location: 'Secunderabad',
    coordinates: { latitude: 17.4399, longitude: 78.4983 },
    distance: 1.2,
    availability: { 'A+': 15, 'O+': 8, 'B+': 12, 'AB+': 3, 'O-': 2 }
  },
  {
    id: 'mock-2',
    name: 'Lions Blood Bank',
    location: 'Himayatnagar',
    coordinates: { latitude: 17.4062, longitude: 78.4738 },
    distance: 4.5,
    availability: { 'A+': 7, 'O+': 20, 'B+': 5, 'AB-': 1, 'A-': 4 }
  }
];

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareBloodTypes = ['O h', 'AB-', 'A-', 'B-', 'O-'];

// Utility function to calculate distance using Haversine formula (in kilometers)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
};

// Function to fetch location name using Nominatim API
const fetchLocationName = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
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
    console.error('Error fetching location name:', error.message);
    return null;
  }
};

// Custom styled icons with consistent style
const createCustomIcon = (color, pulse = false, size = 'normal') => {
  const iconSize = size === 'large' ? [32, 48] : [24, 36];
  let iconHTML;

  if (color === 'blue' || color === 'green') {
    iconHTML = `
      <div class="relative w-8 h-12">
        <div class="absolute inset-0 w-8 h-8 top-0 left-0 rounded-full bg-${color}-400/30 animate-ping"></div>
        <div class="absolute top-0 left-0 w-8 h-8 rounded-full bg-${color}-500 blur-sm opacity-80"></div>
        <div class="relative top-0 left-0 w-8 h-8 rounded-full bg-gradient-to-br from-${color}-400 to-${color}-700 shadow-lg border-2 border-white/50 flex items-center justify-center">
          <div class="w-3 h-3 bg-white rotate-45"></div>
        </div>
        <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-${color}-700"></div>
      </div>
    `;
  } else {
    iconHTML = `
      <div class="relative ${pulse ? 'animate-pulse' : ''}">
        <div class="absolute inset-0 bg-${color}-500 rounded-full blur-sm opacity-60 ${pulse ? 'animate-ping' : ''}"></div>
        <div class="relative bg-gradient-to-br from-${color}-400 to-${color}-600 rounded-full shadow-lg border-2 border-white/30 backdrop-blur-sm w-6 h-6 flex items-center justify-center">
          <div class="w-2 h-2 bg-white rounded-full"></div>
        </div>
      </div>
    `;
  }

  return L.divIcon({
    html: iconHTML,
    className: 'custom-marker',
    iconSize: iconSize,
    iconAnchor: [iconSize[0] / 2, iconSize[1]],
    popupAnchor: [0, -iconSize[1]]
  });
};

const emergencyIcon = createCustomIcon('red', true);
const criticalIcon = createCustomIcon('red', true, 'large');
const bloodBankIcon = createCustomIcon('blue', false);
const userLocationIcon = createCustomIcon('green', false, 'large');

// Component to handle map updates
const MapUpdater = ({ userLocation, filteredEmergencies, viewMode }) => {
  const map = useMap();

  useEffect(() => {
    // Recenter map on user location when it changes
    map.setView([userLocation.lat, userLocation.lng], 12);
  }, [map, userLocation]);

  useEffect(() => {
    // Adjust map bounds to fit all visible markers
    const bounds = [];
    bounds.push([userLocation.lat, userLocation.lng]);

    if (viewMode === 'emergencies' || viewMode === 'both') {
      filteredEmergencies.forEach(emergency => {
        bounds.push([emergency.coordinates.latitude, emergency.coordinates.longitude]);
      });
    }

    if (bounds.length > 1) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, userLocation, filteredEmergencies, viewMode]);

  return null;
};

export default function EmergencyMapSection() {
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [viewMode, setViewMode] = useState('emergencies'); // 'emergencies', 'bloodbanks', 'both'
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [bloodBanks, setBloodBanks] = useState(mockBloodBanks);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 17.3850, lng: 78.4867 }); // Default: Hyderabad center
  const [locationName, setLocationName] = useState('Loading location...');
  const [mapStyle, setMapStyle] = useState('default');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchRadius, setSearchRadius] = useState(1500); // Default to 1500 km
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const mapRef = useRef(null);

  // Fetch user's real-time location and location name
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          console.log('User location fetched:', { lat: latitude, lng: longitude });

          const name = await fetchLocationName(latitude, longitude);
          if (name) {
            setLocationName(name);
          } else {
            setLocationName(`Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`);
          }
        },
        (error) => {
          console.error('Error fetching user location:', error.message);
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
          setLocationName('Hyderabad, Telangana, India');
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
      setLocationName('Hyderabad, Telangana, India');
    }
  }, []);

  // Fetch real-time emergency requests from Firestore
  useEffect(() => {
    setLoading(true);
    setError(null);

    const emergenciesRef = collection(db, 'emergencyRequests'); // Changed to match EmergencySection.jsx collection
    const unsubscribe = onSnapshot(emergenciesRef, (snapshot) => {
      const realTimeEmergencies = snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data.coordinates || !data.coordinates.latitude || !data.coordinates.longitude) {
          console.warn(`Emergency ${doc.id} missing coordinates, skipping...`);
          return null;
        }
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
      }).filter(emergency => emergency !== null);

      // Combine with mock data as fallback
      const combinedEmergencies = [...realTimeEmergencies];
      mockEmergencyRequests.forEach(mock => {
        if (!combinedEmergencies.some(e => e.id === mock.id)) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            mock.coordinates.latitude,
            mock.coordinates.longitude
          );
          combinedEmergencies.push({ ...mock, distance });
        }
      });

      // Filter by search radius and blood type
      const filteredByRadius = combinedEmergencies.filter(e => e.distance <= searchRadius);
      const filtered = bloodTypeFilter === 'All'
        ? filteredByRadius
        : filteredByRadius.filter(e => e.bloodType === bloodTypeFilter);

      setFilteredEmergencies(filtered);
      setLoading(false);
      console.log('Emergencies updated:', filtered);
    }, (error) => {
      console.error('Error fetching emergencies:', error.message);
      setError('Failed to load emergency requests. Using fallback data.');
      const filteredByRadius = mockEmergencyRequests.map(mock => ({
        ...mock,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mock.coordinates.latitude,
          mock.coordinates.longitude
        )
      })).filter(e => e.distance <= searchRadius);
      
      const filtered = bloodTypeFilter === 'All'
        ? filteredByRadius
        : filteredByRadius.filter(e => e.bloodType === bloodTypeFilter);
      
      setFilteredEmergencies(filtered);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userLocation, searchRadius, bloodTypeFilter]);

  // Fetch real-time blood banks from Firestore
  useEffect(() => {
    const bloodBanksRef = collection(db, 'bloodBanks');
    const unsubscribe = onSnapshot(bloodBanksRef, (snapshot) => {
      const realTimeBloodBanks = snapshot.docs.map(doc => {
        const data = doc.data();
        if (!data.coordinates || !data.coordinates.latitude || !data.coordinates.longitude) {
          console.warn(`Blood bank ${doc.id} missing coordinates, skipping...`);
          return null;
        }
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          data.coordinates.latitude,
          data.coordinates.longitude
        );
        return {
          id: doc.id,
          ...data,
          distance
        };
      }).filter(bank => bank !== null);

      const combinedBloodBanks = [...realTimeBloodBanks];
      mockBloodBanks.forEach(mock => {
        if (!combinedBloodBanks.some(b => b.id === mock.id)) {
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            mock.coordinates.latitude,
            mock.coordinates.longitude
          );
          combinedBloodBanks.push({ ...mock, distance });
        }
      });

      const filteredByRadius = combinedBloodBanks.filter(b => b.distance <= searchRadius);
      setBloodBanks(filteredByRadius);
      console.log('Blood banks updated:', filteredByRadius);
    }, (error) => {
      console.error('Error fetching blood banks:', error.message);
      const filteredByRadius = mockBloodBanks.map(mock => ({
        ...mock,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          mock.coordinates.latitude,
          mock.coordinates.longitude
        )
      })).filter(b => b.distance <= searchRadius);
      setBloodBanks(filteredByRadius);
    });

    return () => unsubscribe();
  }, [userLocation, searchRadius]);

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case 'critical': return 'from-red-500 to-red-700';
      case 'urgent': return 'from-orange-500 to-orange-700'; // Changed 'high' to 'urgent' to match EmergencySection.jsx
      default: return 'from-yellow-500 to-yellow-700';
    }
  };

  const getMarkerIcon = (emergency) => {
    if (emergency.urgency === 'Critical') return criticalIcon;
    return emergencyIcon;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const getTileLayerUrl = () => {
    switch (mapStyle) {
      case 'satellite': return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      default: return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  const handleReportEmergency = () => {
    setShowReportModal(true);
  };

  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'py-16 bg-gradient-to-br from-slate-50 to-blue-50'}`}>
      <div className={`${isFullscreen ? 'h-full p-4' : 'container mx-auto px-4'}`}>
        {/* Header */}
        <div className={`${isFullscreen ? 'mb-4' : 'text-center mb-12'}`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-3">
                Live Emergency Map
              </h2>
              <p className="text-gray-600 max-w-3xl">
                AI-powered real-time blood emergency tracking with advanced geospatial analytics
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                <div className={`w-2 h-2 rounded-full animate-pulse ${loading ? 'bg-yellow-500' : error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium">{loading ? 'Loading...' : error ? 'Error' : 'Live'}</span>
              </div>
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                {isFullscreen ? '⊟' : '⊞'}
              </button>
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="bg-white/90 backdrop-blur-lg p-6 rounded-3xl shadow-2xl mb-6 border border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="flex flex-col lg:flex-row lg:items-start gap-5">
              <div className="flex-none">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Map Style</label>
                <div className="flex gap-2">
                  {[
                    { value: 'default', label: '🗺️', title: 'Default' },
                    { value: 'satellite', label: '🛰️', title: 'Satellite' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      title={style.title}
                      className={`p-2 rounded-xl text-lg transition-all duration-300 ${
                        mapStyle === style.value
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                      onClick={() => setMapStyle(style.value)}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Blood Type</label>
                <div className="flex flex-nowrap justify-between gap-2">
                  {bloodTypes.map((type) => (
                    <button
                      key={type}
                      className={`px-4 py-2 rounded-xl text-base font-medium transition-all duration-300 flex-1 text-center ${
                        bloodTypeFilter === type
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg transform scale-105'
                          : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 hover:scale-105'
                      }`}
                      onClick={() => setBloodTypeFilter(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row lg:justify-end gap-2 mr-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">View Mode</label>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="w-[350px] min-w-[200px] h-[35px] px-2 py-0 bg-white/80 border-[0.5px] border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm"
                >
                  <option value="emergencies">🚨 Emergencies Only</option>
                  <option value="bloodbanks">🏥 Blood Banks Only</option>
                  <option value="both">🔄 Show Both</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Search Radius: {searchRadius <= 500 ? `${searchRadius}km` : '500km+'}
                </label>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                  className="w-[350px] min-w-[200px] h-[35px] px-2 py-0 bg-white/80 border-[0.5px] border-gray-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-transparent transition-all duration-300 text-sm"
                >
                  <option value="50">50 km</option>
                  <option value="150">150 km</option>
                  <option value="500">500 km</option>
                  <option value="1500">More than 500 km</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          <div className={`${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} relative`}>
            {error && (
              <div className="absolute top-4 left-4 bg-red-100 text-red-800 p-3 rounded-lg z-[1000]">
                {error}
              </div>
            )}
            <MapContainer
              ref={mapRef}
              center={[userLocation.lat, userLocation.lng]}
              zoom={12}
              style={{ height: '100%', width: '100%' }}
              className="rounded-3xl"
            >
              <TileLayer
                url={getTileLayerUrl()}
                attribution='© OpenStreetMap contributors'
              />
              
              <MapUpdater 
                userLocation={userLocation} 
                filteredEmergencies={filteredEmergencies} 
                viewMode={viewMode} 
              />

              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={searchRadius * 1000}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  color: '#3b82f6',
                  weight: 2,
                  opacity: 0.6,
                  dashArray: '10, 10'
                }}
              />

              <Marker 
                position={[userLocation.lat, userLocation.lng]} 
                icon={userLocationIcon}
              >
                <Popup className="custom-popup">
                  <div className="p-2">
                    <h4 className="font-bold text-green-600">📍 Your Location</h4>
                    <p className="text-sm text-gray-600">{locationName}</p>
                  </div>
                </Popup>
              </Marker>

              {(viewMode === 'emergencies' || viewMode === 'both') && 
                filteredEmergencies.map((emergency) => (
                  <Marker
                    key={emergency.id}
                    position={[emergency.coordinates.latitude, emergency.coordinates.longitude]}
                    icon={getMarkerIcon(emergency)}
                    eventHandlers={{
                      click: () => setSelectedEmergency(emergency)
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-[280px]">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-lg">{emergency.hospital}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getUrgencyColor(emergency.urgency)}`}>
                            {emergency.urgency || 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📍 Location:</span>
                            <span>{emergency.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">🩸 Blood Type:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              rareBloodTypes.includes(emergency.bloodType) 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {emergency.bloodType}
                              {rareBloodTypes.includes(emergency.bloodType) && ' (Rare)'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">💧 Units:</span>
                            <span>{emergency.units || 1}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📏 Distance:</span>
                            <span>{emergency.distance} km</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">⏰ Posted:</span>
                            <span>{Math.floor((Date.now() / 1000 - emergency.timestamp.seconds) / 60)} min ago</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex gap-2">
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${emergency.coordinates.latitude},${emergency.coordinates.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 text-center"
                          >
                            🧭 Navigate
                          </a>
                          <button className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300">
                            🤝 Respond
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))
              }

              {(viewMode === 'bloodbanks' || viewMode === 'both') && 
                bloodBanks.map((bank) => (
                  <Marker
                    key={bank.id}
                    position={[bank.coordinates.latitude, bank.coordinates.longitude]}
                    icon={bloodBankIcon}
                  >
                    <Popup className="custom-popup">
                      <div className="p-4 min-w-[300px]">
                        <h4 className="font-bold text-lg mb-3 text-blue-600">{bank.name}</h4>
                        
                        <div className="space-y-2 text-sm mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📍 Location:</span>
                            <span>{bank.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">📏 Distance:</span>
                            <span>{bank.distance} km</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h5 className="font-semibold mb-2">🩸 Blood Availability:</h5>
                          <div className="grid grid-cols-3 gap-2">
                            {Object.entries(bank.availability).map(([type, count]) => (
                              <div key={type} className="bg-gray-50 p-2 rounded-lg text-center">
                                <div className="font-bold text-red-600">{type}</div>
                                <div className="text-sm text-gray-600">{count} units</div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${bank.coordinates.latitude},${bank.coordinates.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 text-center"
                        >
                          🧭 Get Directions
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))
              }
            </MapContainer>

            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20 z-[1000]">
              <h5 className="font-bold mb-3 text-gray-800">Legend</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full"></div>
                  <span>Emergency</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-blue-700 rounded-full"></div>
                  <span>Blood Bank</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-green-700 rounded-full"></div>
                  <span>Your Location</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 border-t border-gray-200/50">
            <div className="flex justify-between items-center">
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">{filteredEmergencies.length} Active Emergencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">{bloodBanks.length} Blood Banks</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Within {searchRadius <= 500 ? `${searchRadius}km` : '500km+'} radius</span>
                </div>
              </div>
              <button 
                onClick={handleReportEmergency}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                🚨 Report Emergency
              </button>
            </div>
          </div>
        </div>
      </div>

      <EmergencyRequestModal
        show={showReportModal}
        setShow={setShowReportModal}
        setShowSuccess={setShowSuccess}
        userLocation={userLocation}
      />

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-green-600 mb-4">Success!</h3>
            <p className="text-gray-600 mb-4">Your emergency request has been submitted successfully.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSuccess(false)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .custom-popup .leaflet-popup-tip {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
        }
        
        .custom-marker {
          filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
        }
      `}</style>
    </div>
  );
}