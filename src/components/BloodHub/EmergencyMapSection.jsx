import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase'; // Adjust based on your Firebase setup
import { calculateDistance } from '../utils/geolocation';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareBloodTypes = ['O h'];

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const rareBloodIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  className: 'hue-rotate-90',
});

const newEmergencyIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  className: 'animate-pulse',
});

const nearbyIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  className: 'hue-rotate-180',
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const bloodBankIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
  className: 'hue-rotate-45',
});

export default function EmergencyMapSection({ userLocation, emergencyRequests = [], bloodDrives = [], setActiveSection }) {
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (bloodTypeFilter === 'All') {
      setFilteredEmergencies(emergencyRequests);
    } else {
      setFilteredEmergencies(emergencyRequests.filter((e) => e.bloodType === bloodTypeFilter));
    }
  }, [bloodTypeFilter, emergencyRequests]);

  useEffect(() => {
    if (userLocation) {
      const unsubscribe = onSnapshot(collection(db, 'bloodBanks'), (snapshot) => {
        const banks = snapshot.docs.map(doc => {
          const data = doc.data();
          // Add approximate coordinates for Hyderabad blood banks if not present
          const coordinates = data.coordinates || {
            latitude: 17.3850, // Central Hyderabad coordinates
            longitude: 78.4867,
          };
          const distance = calculateDistance(
            userLocation.lat,
            userLocation.lng,
            coordinates.latitude,
            coordinates.longitude
          );
          return {
            id: doc.id,
            ...data,
            coordinates,
            distance,
            location: data.address || 'Hyderabad, Telangana',
            availability: parseAvailability(data.availability), // Parse availability string
          };
        }).filter(bank => bank.distance <= 100); // Keep the same distance filter
        setBloodBanks(banks);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching blood banks:', error);
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userLocation]);

  // Parse availability string (e.g., "A+Ve:9, O+Ve:16, B+Ve:4, O-") into an object
  const parseAvailability = (availabilityString) => {
    if (!availabilityString || availabilityString.includes('Not Available')) return {};
    const entries = availabilityString.split(',').map(item => {
      const [type, count] = item.trim().split(':');
      return [type.replace('Ve', ''), parseInt(count) || 0];
    });
    return Object.fromEntries(entries);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  const getMarkerIcon = (emergency) => {
    const isRare = rareBloodTypes.includes(emergency.bloodType);
    const isNew = emergency.timestamp && (new Date() - new Date(emergency.timestamp.seconds * 1000)) / 1000 / 60 < 5;
    const isNearby = userLocation && emergency.coordinates && calculateDistance(
      userLocation.lat,
      userLocation.lng,
      emergency.coordinates.latitude,
      emergency.coordinates.longitude
    ) <= 10;

    if (isRare) return rareBloodIcon;
    if (isNew) return newEmergencyIcon;
    if (isNearby) return nearbyIcon;
    return customIcon;
  };

  if (loading) return <p>Loading map...</p>;

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Live Emergency Map</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Real-time visualization of blood emergencies and blood banks across India. Find donation opportunities near you.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="mb-6" style={{ height: '400px', width: '100%' }}>
            {userLocation && isOnline ? (
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {filteredEmergencies.map((emergency) => {
                  if (!emergency.coordinates) return null;
                  const coords = {
                    lat: emergency.coordinates.latitude,
                    lng: emergency.coordinates.longitude,
                  };
                  const isRare = rareBloodTypes.includes(emergency.bloodType);
                  return (
                    <Marker
                      key={emergency.id}
                      position={[coords.lat, coords.lng]}
                      icon={getMarkerIcon(emergency)}
                    >
                      <Popup>
                        <div>
                          <h4 className="font-semibold">{emergency.hospital}</h4>
                          <p><strong>Location:</strong> {emergency.location}</p>
                          <p><strong>Blood Type:</strong> {emergency.bloodType}{isRare ? ' (Rare)' : ''}</p>
                          <p><strong>Urgency:</strong> {emergency.urgency}</p>
                          <p><strong>Units Needed:</strong> {emergency.units || 1}</p>
                          <p><strong>Posted:</strong> {emergency.timestamp ? new Date(emergency.timestamp.seconds * 1000).toLocaleString() : 'Recently'}</p>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Navigate
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                {bloodBanks.map((bank) => {
                  const coords = {
                    lat: bank.coordinates.latitude,
                    lng: bank.coordinates.longitude,
                  };
                  return (
                    <Marker
                      key={bank.id}
                      position={[coords.lat, coords.lng]}
                      icon={bloodBankIcon}
                    >
                      <Popup>
                        <div>
                          <h4 className="font-semibold">{bank.name}</h4>
                          <p><strong>Location:</strong> {bank.location}</p>
                          <p><strong>Distance:</strong> {bank.distance} km</p>
                          {bank.availability && (
                            <div>
                              <strong>Blood Availability:</strong>
                              <ul>
                                {Object.entries(bank.availability).map(([type, count]) => (
                                  <li key={type}>{type}: {count} units</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Navigate
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                  <Popup>Your current location</Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
                <p className="text-gray-600">
                  {isOnline ? "Loading map..." : "Map unavailable offline. Please connect to the internet."}
                </p>
              </div>
            )}
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
            <div className="text-sm text-gray-500">
              Showing {filteredEmergencies.length} {filteredEmergencies.length === 1 ? 'emergency' : 'emergencies'} and {bloodBanks.length} blood banks
            </div>
            <button
              className="text-red-600 font-medium flex items-center hover:text-red-800 transition-colors"
              onClick={() => {
                if (typeof setActiveSection === 'function') {
                  setActiveSection('emergency');
                }
              }}
            >
              View all details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}