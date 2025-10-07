// Medical Resources Map Component with Google Maps Integration
import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { MapPin, Navigation, Phone, Clock, Hospital, Stethoscope, Activity } from 'lucide-react';
import PropTypes from 'prop-types';

// Sample medical resources data (clinics, hospitals)
const SAMPLE_MEDICAL_RESOURCES = [
  {
    id: 1,
    name: 'Apollo Hospital',
    type: 'hospital',
    address: 'Jubilee Hills, Hyderabad, Telangana 500033',
    phone: '+91 40 2360 7777',
    coordinates: { lat: 17.4326, lng: 78.4071 },
    services: ['Emergency', 'Blood Bank', 'ICU', '24/7'],
    openHours: '24 Hours',
    rating: 4.5
  },
  {
    id: 2,
    name: 'Care Hospital',
    type: 'hospital',
    address: 'Road No 1, Banjara Hills, Hyderabad 500034',
    phone: '+91 40 6165 6565',
    coordinates: { lat: 17.4239, lng: 78.4738 },
    services: ['Emergency', 'Blood Bank', 'Cardiology'],
    openHours: '24 Hours',
    rating: 4.3
  },
  {
    id: 3,
    name: 'Yashoda Hospital',
    type: 'hospital',
    address: 'Somajiguda, Hyderabad, Telangana 500082',
    phone: '+91 40 2337 7777',
    coordinates: { lat: 17.4281, lng: 78.4648 },
    services: ['Emergency', 'Blood Bank', 'Trauma Center'],
    openHours: '24 Hours',
    rating: 4.4
  },
  {
    id: 4,
    name: 'Rainbow Children Hospital',
    type: 'hospital',
    address: 'Banjara Hills, Hyderabad 500034',
    phone: '+91 40 4455 5555',
    coordinates: { lat: 17.4183, lng: 78.4367 },
    services: ['Pediatric Emergency', 'Neonatal ICU'],
    openHours: '24 Hours',
    rating: 4.6
  },
  {
    id: 5,
    name: 'City Clinic - Madhapur',
    type: 'clinic',
    address: 'HITEC City, Madhapur, Hyderabad 500081',
    phone: '+91 40 2311 1234',
    coordinates: { lat: 17.4483, lng: 78.3915 },
    services: ['General Medicine', 'Blood Tests', 'X-Ray'],
    openHours: '8 AM - 10 PM',
    rating: 4.0
  },
  {
    id: 6,
    name: 'Health Plus Clinic',
    type: 'clinic',
    address: 'Kukatpally, Hyderabad 500072',
    phone: '+91 40 2311 5678',
    coordinates: { lat: 17.4948, lng: 78.3998 },
    services: ['General Medicine', 'Diagnostic Center'],
    openHours: '9 AM - 9 PM',
    rating: 3.9
  },
  {
    id: 7,
    name: 'Max Cure Hospital',
    type: 'hospital',
    address: 'Gachibowli, Hyderabad 500032',
    phone: '+91 40 6777 6777',
    coordinates: { lat: 17.4400, lng: 78.3489 },
    services: ['Emergency', 'Blood Bank', 'Surgery'],
    openHours: '24 Hours',
    rating: 4.2
  },
  {
    id: 8,
    name: 'Continental Hospital',
    type: 'hospital',
    address: 'Gachibowli, IT Park Road, Hyderabad 500032',
    phone: '+91 40 6719 1000',
    coordinates: { lat: 17.4239, lng: 78.3421 },
    services: ['Emergency', 'Blood Bank', 'Specialized Care'],
    openHours: '24 Hours',
    rating: 4.5
  }
];

// Calculate distance using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
};

// Medical Resource Card Component
const ResourceCard = memo(({ resource, distance, onNavigate }) => {
  const isHospital = resource.type === 'hospital';

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${isHospital ? 'bg-red-100' : 'bg-blue-100'}`}>
            {isHospital ? (
              <Hospital size={20} className="text-red-600" />
            ) : (
              <Stethoscope size={20} className="text-blue-600" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">{resource.name}</h3>
            <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
          <span className="text-xs font-medium text-green-700">★ {resource.rating}</span>
        </div>
      </div>

      {/* Distance */}
      <div className="flex items-center gap-1 text-gray-600 mb-3">
        <MapPin size={14} />
        <span className="text-xs">{distance} km away</span>
      </div>

      {/* Address */}
      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{resource.address}</p>

      {/* Services */}
      <div className="flex flex-wrap gap-1 mb-3">
        {resource.services.slice(0, 3).map((service, index) => (
          <span
            key={index}
            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
          >
            {service}
          </span>
        ))}
        {resource.services.length > 3 && (
          <span className="text-xs text-gray-500">+{resource.services.length - 3}</span>
        )}
      </div>

      {/* Hours */}
      <div className="flex items-center gap-1 text-gray-600 mb-4">
        <Clock size={14} />
        <span className="text-xs">{resource.openHours}</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onNavigate(resource)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <Navigation size={14} />
          Navigate
        </button>
        <a
          href={`tel:${resource.phone}`}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <Phone size={14} />
          Call
        </a>
      </div>
    </div>
  );
});

ResourceCard.propTypes = {
  resource: PropTypes.object.isRequired,
  distance: PropTypes.number.isRequired,
  onNavigate: PropTypes.func.isRequired
};

ResourceCard.displayName = 'ResourceCard';

// Main Medical Resources Map Component
const MedicalResourcesMap = memo(() => {
  const [userLocation, setUserLocation] = useState(null);
  const [selectedType, setSelectedType] = useState('all'); // all, hospital, clinic
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          // Fallback to Hyderabad coordinates
          setUserLocation({ lat: 17.3850, lng: 78.4867 });
          setError('Unable to get your precise location. Showing results for Hyderabad.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setUserLocation({ lat: 17.3850, lng: 78.4867 });
      setLoading(false);
    }
  }, []);

  // Calculate distances and filter resources
  const resourcesWithDistance = useMemo(() => {
    if (!userLocation) return [];

    return SAMPLE_MEDICAL_RESOURCES.map(resource => ({
      ...resource,
      distance: calculateDistance(
        userLocation.lat,
        userLocation.lng,
        resource.coordinates.lat,
        resource.coordinates.lng
      )
    }))
      .filter(resource => selectedType === 'all' || resource.type === selectedType)
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, selectedType]);

  // Navigation handler
  const handleNavigate = useCallback((resource) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${resource.coordinates.lat},${resource.coordinates.lng}&travelmode=driving`;
    window.open(url, '_blank');
  }, []);

  // Re-center map on user location
  const handleRecenter = useCallback(() => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to get your current location');
          setLoading(false);
        }
      );
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="animate-spin text-red-600 mx-auto mb-2" size={32} />
          <p className="text-gray-600">Loading nearby medical resources...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center bg-red-100 rounded-full px-4 py-2 mb-4">
            <Hospital size={18} className="text-red-600 mr-2" />
            <span className="text-sm font-medium text-red-600">Medical Resources</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            Nearby Hospitals & Clinics
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find nearby medical facilities with blood donation services, emergency care, and diagnostic centers.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-2">
            <MapPin size={18} className="text-yellow-600" />
            <p className="text-sm text-yellow-700">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          {/* Type Filter */}
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'All Resources', icon: Activity },
              { value: 'hospital', label: 'Hospitals', icon: Hospital },
              { value: 'clinic', label: 'Clinics', icon: Stethoscope }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSelectedType(value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  selectedType === value
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm transition-all"
          >
            <Navigation size={16} />
            Update Location
          </button>
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-6">
          Found <span className="font-semibold text-red-600">{resourcesWithDistance.length}</span>{' '}
          {selectedType === 'all' ? 'resources' : `${selectedType}s`} near you
        </p>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resourcesWithDistance.map(resource => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              distance={resource.distance}
              onNavigate={handleNavigate}
            />
          ))}
        </div>

        {/* Empty State */}
        {resourcesWithDistance.length === 0 && (
          <div className="text-center py-12">
            <Hospital size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No {selectedType === 'all' ? 'resources' : `${selectedType}s`} found nearby</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your filters or location</p>
          </div>
        )}

        {/* Google Maps Integration Note */}
        <div className="mt-10 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <MapPin size={20} className="text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Google Maps Integration</h4>
              <p className="text-sm text-blue-700 mb-3">
                Click "Navigate" on any resource to get directions via Google Maps. The app uses:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Browser Geolocation API for your current position</li>
                <li>Haversine formula for accurate distance calculation</li>
                <li>Google Maps deep linking for turn-by-turn navigation</li>
                <li>Sample data for demonstration (8 medical facilities)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

MedicalResourcesMap.displayName = 'MedicalResourcesMap';

export default MedicalResourcesMap;
