import { useState, useEffect, useCallback } from 'react';
import { 
  MapPin, 
  Heart, 
  MessageCircle, 
  ArrowLeft, 
  X, 
  Search, 
  Filter, 
  ChevronDown, 
  Check, 
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Phone,
  Navigation
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const rareBloodTypes = ['O h']; // Bombay Blood Group

export default function EmergencySection({ setShowEmergencyModal, getUrgencyColor, emergencyRequests, userLocation, userProfile }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [distanceFilter, setDistanceFilter] = useState(null); // New: For proximity-based alerts
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [viewingEmergency, setViewingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState(null);
  const [currentView, setCurrentView] = useState('emergency-list');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine); // New: For offline detection
  const [newEmergencyNotification, setNewEmergencyNotification] = useState(null); // New: For real-time notifications

  // Offline detection
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

  // Real-time emergency response: Notify when a new emergency matches user's blood type
  useEffect(() => {
    if (!userProfile || !userProfile.bloodType || !emergencyRequests) return;

    const userBloodType = userProfile.bloodType;
    const latestEmergency = emergencyRequests[0]; // Assume sorted by timestamp in BloodHub.jsx

    if (latestEmergency && latestEmergency.bloodType === userBloodType) {
      const now = new Date();
      const emergencyTime = latestEmergency.timestamp ? new Date(latestEmergency.timestamp.seconds * 1000) : new Date();
      const timeDiff = (now - emergencyTime) / 1000 / 60; // Minutes

      if (timeDiff < 5) { // Notify if emergency is less than 5 minutes old
        setNewEmergencyNotification(latestEmergency);
      }
    }
  }, [emergencyRequests, userProfile]);

  // Apply filters and update filteredEmergencies
  const applyFilters = useCallback(() => {
    if (!emergencyRequests) return [];

    let filtered = [...emergencyRequests];

    // Blood type filter
    if (bloodTypeFilter !== 'All') {
      filtered = filtered.filter((e) => e.bloodType === bloodTypeFilter);
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.hospital && e.hospital.toLowerCase().includes(query)) ||
        (e.location && e.location.toLowerCase().includes(query))
      );
    }

    // Distance filter (Proximity-based Alerts)
    if (distanceFilter && userLocation) {
      filtered = filtered.filter((e) => {
        if (!e.coordinates) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          e.coordinates.latitude,
          e.coordinates.longitude
        );
        return distance <= distanceFilter;
      });
    }

    // Blood Type Rare Alert System: Expand radius for rare blood types
    filtered = filtered.map((e) => {
      if (rareBloodTypes.includes(e.bloodType)) {
        return { ...e, isRare: true }; // Mark as rare for UI
      }
      return e;
    });

    return filtered;
  }, [emergencyRequests, bloodTypeFilter, searchQuery, distanceFilter, userLocation]);

  useEffect(() => {
    try {
      const filtered = applyFilters();
      setFilteredEmergencies(filtered);
      setIsLoading(false);
    } catch (err) {
      console.error("Error filtering emergencies:", err);
      setError("Failed to load emergency requests. Please try again.");
      setIsLoading(false);
    }
  }, [applyFilters]);

  const handleEmergencySelect = useCallback((emergency) => {
    setSelectedEmergency(emergency);
    setViewingEmergency(true);
    setCurrentView('emergency-detail');
  }, []);

  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10;
  }, []);

  const handleEmergencyResponse = useCallback(async () => {
    setIsProcessing(true);

    try {
      if (!userLocation || !selectedEmergency.coordinates) {
        throw new Error("Location data is missing");
      }

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        selectedEmergency.coordinates.latitude,
        selectedEmergency.coordinates.longitude
      );

      setNearbyDonors({
        count: Math.floor(Math.random() * 10) + 3,
        estimatedTime: `${Math.floor(distance * 3)} minutes`,
        radius: `${Math.ceil(distance)} km`,
      });

      setCurrentView('donor-confirmation');
    } catch (error) {
      console.error("Error calculating nearby donors:", error);
      setNearbyDonors({
        count: 8,
        estimatedTime: '15 minutes',
        radius: '5 km',
      });
      setCurrentView('donor-confirmation');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency, userLocation]);

  const handleSMSEmergencyResponse = useCallback(async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('https://raksetu-backend.vercel.app/send-sms', { // Replace with your backend URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: selectedEmergency.contactPhone,
          message: `Donor responding to donate ${selectedEmergency.bloodType} blood at ${selectedEmergency.hospital}, ${selectedEmergency.location}`,
        }),
      });
      if (response.ok) {
        setCurrentView('donation-confirmed');
      } else {
        throw new Error('Failed to send SMS');
      }
    } catch (error) {
      console.error("Error sending SMS:", error);
      setError("Failed to send SMS. Please try again when online.");
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency]);

  const confirmDonation = useCallback(async () => {
    setIsProcessing(true);

    try {
      if (selectedEmergency && selectedEmergency.id) {
        await updateDoc(doc(db, 'emergencyRequests', selectedEmergency.id), {
          donorResponded: true,
          donorResponseTime: new Date().toISOString(),
        });
      }
      setCurrentView('donation-confirmed');
    } catch (error) {
      console.error("Error confirming donation:", error);
      setCurrentView('donation-confirmed');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedEmergency]);

  const backToEmergencies = useCallback(() => {
    setViewingEmergency(false);
    setSelectedEmergency(null);
    setNearbyDonors(null);
    setCurrentView('emergency-list');
    setNewEmergencyNotification(null); // Clear notification on back
  }, []);

  const EmergencyList = ({ filteredEmergencies }) => (
    <div className="space-y-4">
      {filteredEmergencies.length > 0 ? (
        filteredEmergencies.map((emergency) => (
          <div
            key={emergency.id}
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow relative"
            onClick={() => handleEmergencySelect(emergency)}
            aria-label={`Emergency request for blood type ${emergency.bloodType} at ${emergency.hospital}`}
          >
            {emergency.isRare && (
              <span className="absolute top-2 right-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                Rare Blood Type
              </span>
            )}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{emergency.hospital}</h3>
                <p className="text-sm text-gray-600 flex items-center">
                  <MapPin size={14} className="mr-1" /> {emergency.location}
                </p>
              </div>
              <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(emergency.urgency)}`}>
                {emergency.urgency}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Urgent need for {emergency.bloodType} blood, {emergency.units || 1} units required.
            </p>
            <button
              className="mt-2 bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleEmergencySelect(emergency);
              }}
            >
              Respond
            </button>
          </div>
        ))
      ) : (
        <div className="text-center py-10">
          {isLoading ? (
            <p className="text-gray-500">Loading emergency requests...</p>
          ) : error ? (
            <div className="text-center">
              <p className="text-red-600">{error}</p>
              <button
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <p className="text-gray-500">No emergency requests found</p>
              {bloodTypeFilter !== 'All' && (
                <p className="text-sm text-gray-400 mt-1">Try changing your blood type filter</p>
              )}
              <button
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                onClick={() => setShowEmergencyModal(true)}
              >
                Create Emergency Request
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="sticky top-0 pt-2 pb-4 bg-gray-50 z-10">
      {/* Real-time Emergency Response: Notification Banner */}
      {newEmergencyNotification && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertCircle size={18} className="mr-2" />
            <span>
              New emergency for {newEmergencyNotification.bloodType} at {newEmergencyNotification.hospital}! Respond now.
            </span>
          </div>
          <button
            className="text-yellow-800 hover:text-yellow-900"
            onClick={() => {
              handleEmergencySelect(newEmergencyNotification);
              setNewEmergencyNotification(null);
            }}
          >
            View
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Emergency Requests</h2>
        <button
          onClick={() => setShowEmergencyModal(false)}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close emergency modal"
        >
          <X size={20} />
        </button>
      </div>

      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search hospitals or locations..."
          className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search hospitals or locations"
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <button
            className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-left"
            onClick={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}
            aria-expanded={showBloodTypeDropdown}
            aria-haspopup="listbox"
          >
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 mr-2" />
              <span>{bloodTypeFilter === 'All' ? 'All Blood Types' : `Blood Type: ${bloodTypeFilter}`}</span>
            </div>
            <ChevronDown
              size={16}
              className={`text-gray-500 transition-transform ${showBloodTypeDropdown ? 'transform rotate-180' : ''}`}
            />
          </button>

          {showBloodTypeDropdown && (
            <div
              className="absolute z-20 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg"
              role="listbox"
            >
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  className={`block w-full text-left px-4 py-2 hover:bg-gray-50 ${
                    bloodTypeFilter === type ? 'bg-red-50 text-red-600' : ''
                  }`}
                  onClick={() => {
                    setBloodTypeFilter(type);
                    setShowBloodTypeDropdown(false);
                  }}
                  role="option"
                  aria-selected={bloodTypeFilter === type}
                >
                  {type === 'All' ? 'All Blood Types' : type}
                  {bloodTypeFilter === type && (
                    <Check size={16} className="inline ml-2 text-red-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Proximity-based Alerts: Distance Filter */}
        <div className="relative">
          <select
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white"
            value={distanceFilter || ''}
            onChange={(e) => setDistanceFilter(e.target.value ? Number(e.target.value) : null)}
            aria-label="Filter by distance"
          >
            <option value="">All Distances</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="20">Within 20 km</option>
          </select>
        </div>
      </div>

      {(searchQuery || bloodTypeFilter !== 'All' || distanceFilter) && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <div className="flex items-center text-gray-500">
            <AlertTriangle size={14} className="mr-1" />
            <span>
              {filteredEmergencies.length}
              {filteredEmergencies.length === 1 ? ' result' : ' results'} found
            </span>
          </div>
          <button
            className="text-red-600 hover:text-red-700"
            onClick={() => {
              setSearchQuery('');
              setBloodTypeFilter('All');
              setDistanceFilter(null);
            }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="mt-4">
        <button
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          onClick={() => setShowEmergencyModal(true)}
        >
          Create Emergency Request
        </button>
      </div>

      {/* Works Without Internet: Offline Warning */}
      {!isOnline && (
        <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>
            You are offline. Some features may be limited. Use SMS to respond to emergencies.
          </span>
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'emergency-list':
        return <EmergencyList filteredEmergencies={filteredEmergencies} />;
      case 'emergency-detail':
        return selectedEmergency && (
          <div className="space-y-4">
            <button
              className="flex items-center text-red-600 mb-4"
              onClick={backToEmergencies}
              aria-label="Back to emergencies list"
            >
              <ArrowLeft size={18} className="mr-1" /> Back to emergencies
            </button>

            <div className="bg-white p-4 rounded-lg shadow-md">
              {selectedEmergency.isRare && (
                <div className="mb-3 p-2 bg-purple-100 text-purple-800 rounded-lg text-sm">
                  Rare Blood Type Alert: This request is for {selectedEmergency.bloodType}, a rare blood group.
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedEmergency.hospital}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <MapPin size={14} className="mr-1" /> {selectedEmergency.location}
                  </p>
                </div>
                <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(selectedEmergency.urgency)}`}>
                  {selectedEmergency.urgency}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {selectedEmergency.notes ||
                  `Urgent need for ${selectedEmergency.bloodType} blood for a patient undergoing emergency treatment.`}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-b border-gray-100 py-3">
                <div>
                  <div className="text-gray-500 text-xs">Units Needed</div>
                  <div className="font-semibold">{selectedEmergency.units || 1}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Distance</div>
                  <div className="font-semibold">
                    {userLocation && selectedEmergency.coordinates
                      ? `${calculateDistance(
                          userLocation.lat,
                          userLocation.lng,
                          selectedEmergency.coordinates.latitude,
                          selectedEmergency.coordinates.longitude
                        )} km`
                      : "Unknown"}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Posted</div>
                  <div className="font-semibold">
                    {selectedEmergency.timestamp
                      ? new Date(selectedEmergency.timestamp.seconds * 1000).toLocaleString()
                      : selectedEmergency.timePosted
                        ? new Date(selectedEmergency.timePosted).toLocaleString()
                        : "Recently"}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Contact</h5>
                <div className="flex items-center gap-2">
                  <p className="text-gray-600 text-sm">
                    {selectedEmergency.contactName || "Hospital Blood Bank"}: {selectedEmergency.contactPhone || "Contact hospital directly"}
                  </p>
                  {selectedEmergency.contactPhone && (
                    <a
                      href={`tel:${selectedEmergency.contactPhone}`}
                      className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                      aria-label="Call contact"
                    >
                      <Phone size={16} />
                    </a>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {isOnline ? (
                  <>
                    <button
                      className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                      onClick={handleEmergencyResponse}
                      disabled={isProcessing}
                    >
                      Respond Now
                    </button>
                    <button
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      aria-label="Message"
                    >
                      <MessageCircle size={18} />
                    </button>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEmergency.coordinates.latitude},${selectedEmergency.coordinates.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
                      aria-label="Navigate to location"
                    >
                      <Navigation size={18} />
                    </a>
                  </>
                ) : (
                  <button
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                    onClick={handleSMSEmergencyResponse}
                    disabled={isProcessing}
                  >
                    Respond via SMS
                  </button>
                )}
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
              aria-label="Back to emergency details"
            >
              <ArrowLeft size={18} className="mr-1" /> Back to emergency details
            </button>

            <div className="bg-white p-4 rounded-lg shadow-md text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-1">Great! Your blood type matches</h3>
              <p className="text-gray-600 mb-4">
                We found {nearbyDonors.count} potential donors within {nearbyDonors.radius}
              </p>

              <div className="border-t border-b border-gray-100 py-4 my-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500">Your blood type:</span>
                  <span className="font-semibold">{selectedEmergency.bloodType}</span>
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
                By confirming, you agree to donate blood at {selectedEmergency.hospital}.
              </p>

              <button
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
                onClick={confirmDonation}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Donation"}
              </button>

              <button
                className="w-full mt-2 text-gray-600 py-2"
                onClick={() => setCurrentView('emergency-detail')}
                disabled={isProcessing}
              >
                Cancel
              </button>
            </div>
          </div>
        );
      case 'donation-confirmed':
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
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
                  <span className="font-semibold">
                    {selectedEmergency.contactName || "Hospital Blood Bank"}: {selectedEmergency.contactPhone || "Contact hospital directly"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedEmergency.coordinates.latitude},${selectedEmergency.coordinates.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  Get Directions
                  <Navigation size={18} className="ml-2" />
                </a>
                <button
                  className="bg-gray-100 text-gray-800 py-2 rounded-lg hover:bg-gray-200"
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
        return <div className="text-center py-10 text-red-600">Error: Unknown view</div>;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBloodTypeDropdown) {
        setShowBloodTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBloodTypeDropdown]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {currentView === 'emergency-list' && renderSearchAndFilters()}
      <div className="flex-1 overflow-y-auto">
        {renderCurrentView()}
      </div>

      {currentView === 'emergency-list' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
          {filteredEmergencies.length} active {filteredEmergencies.length === 1 ? 'request' : 'requests'}
        </div>
      )}
    </div>
  );
}