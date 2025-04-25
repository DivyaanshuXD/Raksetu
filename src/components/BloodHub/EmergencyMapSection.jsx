import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

const userLocationIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [0, -41],
});

export default function EmergencyMapSection({ userLocation, emergencyRequests = [], setActiveSection }) {
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);

  useEffect(() => {
    if (bloodTypeFilter === 'All') {
      setFilteredEmergencies(emergencyRequests);
    } else {
      setFilteredEmergencies(emergencyRequests.filter((e) => e.bloodType === bloodTypeFilter));
    }
  }, [bloodTypeFilter, emergencyRequests]);

  // Calculate mock coordinates based on hospital location
  const getEmergencyCoordinates = (emergency) => {
    // This is a simplified mock implementation
    // In a real application, you would use the actual coordinates from the emergency data
    // or geocode the hospital address
    const baseCoords = userLocation || { lat: 28.6139, lng: 77.2090 };
    
    // Generate a semi-random offset based on the emergency ID or hospital name
    // This is just to spread out the markers on the map
    const hashCode = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };
    
    const offset = hashCode(emergency.hospital) % 100 / 1000;
    
    return {
      lat: baseCoords.lat + (Math.random() - 0.5) * 0.1,
      lng: baseCoords.lng + (Math.random() - 0.5) * 0.1
    };
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-3">Live Emergency Map</h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Real-time visualization of blood emergencies across India. Find donation opportunities near you.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="mb-6" style={{ height: '400px', width: '100%' }}>
            {userLocation && (
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
                  const coords = getEmergencyCoordinates(emergency);
                  return (
                    <Marker
                      key={emergency.id}
                      position={[coords.lat, coords.lng]}
                      icon={customIcon}
                    >
                      <Popup>
                        <div>
                          <h4 className="font-semibold">{emergency.hospital}</h4>
                          <p><strong>Blood Type:</strong> {emergency.bloodType}</p>
                          <p><strong>Urgency:</strong> {emergency.urgency}</p>
                          <p><strong>Units Needed:</strong> {emergency.units}</p>
                          <p><strong>Posted:</strong> {new Date(emergency.timePosted).toLocaleString()}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                  <Popup>Your current location</Popup>
                </Marker>
              </MapContainer>
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
              Showing {filteredEmergencies.length} {filteredEmergencies.length === 1 ? 'emergency' : 'emergencies'}
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