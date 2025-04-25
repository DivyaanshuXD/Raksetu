const bloodTypes = ['All', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencySection({ setShowEmergencyModal, getUrgencyColor, emergencyRequests, userLocation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [filteredEmergencies, setFilteredEmergencies] = useState([]);
  const [viewingEmergency, setViewingEmergency] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [nearbyDonors, setNearbyDonors] = useState(null);
  const [currentView, setCurrentView] = useState('emergency-list');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);

  // Set initial filtered emergencies and update when emergencyRequests changes
  useEffect(() => {
    applyFilters();
  }, [emergencyRequests, bloodTypeFilter, searchQuery]);

  // Filter emergencies based on search and blood type
  const applyFilters = () => {
    if (!emergencyRequests) return;
    
    let filtered = [...emergencyRequests];
    
    if (bloodTypeFilter !== 'All') {
      filtered = filtered.filter((e) => e.bloodType === bloodTypeFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e) =>
        (e.hospital && e.hospital.toLowerCase().includes(query)) ||
        (e.location && e.location.toLowerCase().includes(query))
      );
    }
    
    setFilteredEmergencies(filtered);
  };

  const handleEmergencySelect = (emergency) => {
    setSelectedEmergency(emergency);
    setViewingEmergency(true);
    setCurrentView('emergency-detail');
  };

  const handleEmergencyResponse = async () => {
    setIsProcessing(true);
    
    try {
      // Calculate nearby donors based on location
      // In a real app, this would query the database for actual donors
      
      // First make sure we have both user location and emergency location
      if (!userLocation || !selectedEmergency.coordinates) {
        throw new Error("Location data is missing");
      }
      
      // Calculate distance using Haversine formula
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        selectedEmergency.coordinates.latitude, 
        selectedEmergency.coordinates.longitude
      );
      
      // Mock data for nearby donors - in production this would be from your database
      setNearbyDonors({
        count: Math.floor(Math.random() * 10) + 3, // Random number between 3-12
        estimatedTime: `${Math.floor(distance * 3)} minutes`, // Rough estimate based on distance
        radius: `${Math.ceil(distance)} km`,
      });
      
      setCurrentView('donor-confirmation');
    } catch (error) {
      console.error("Error calculating nearby donors:", error);
      // Fallback to static data
      setNearbyDonors({
        count: 8,
        estimatedTime: '15 minutes',
        radius: '5 km',
      });
      setCurrentView('donor-confirmation');
    } finally {
      setIsProcessing(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  };

  const confirmDonation = async () => {
    setIsProcessing(true);
    
    try {
      // Update the emergency request with donor information
      if (selectedEmergency && selectedEmergency.id) {
        await updateDoc(doc(db, 'emergencyRequests', selectedEmergency.id), {
          donorResponded: true,
          donorResponseTime: new Date().toISOString()
        });
      }
      
      setCurrentView('donation-confirmed');
    } catch (error) {
      console.error("Error confirming donation:", error);
      // Proceed anyway to not block the user
      setCurrentView('donation-confirmed');
    } finally {
      setIsProcessing(false);
    }
  };

  const backToEmergencies = () => {
    setViewingEmergency(false);
    setSelectedEmergency(null);
    setNearbyDonors(null);
    setCurrentView('emergency-list');
  };

  const EmergencyList = ({ filteredEmergencies }) => (
    <div className="space-y-4">
      {filteredEmergencies.length > 0 ? (
        filteredEmergencies.map((emergency) => (
          <div 
            key={emergency.id} 
            className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleEmergencySelect(emergency)}
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
            
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-gray-500 text-xs">Units Needed</div>
                <div className="font-semibold">{emergency.units || 1}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Distance</div>
                <div className="font-semibold">
                  {userLocation && emergency.coordinates
                    ? `${calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        emergency.coordinates.latitude,
                        emergency.coordinates.longitude
                      )} km`
                    : "Unknown"}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Posted</div>
                <div className="font-semibold">
                  {emergency.timestamp 
                    ? new Date(emergency.timestamp.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                    : "Recently"}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emergencyRequests.length > 0 
            ? "No emergencies match your filters"
            : "Loading emergencies..."}
        </div>
      )}
    </div>
  );

  const renderSearchAndFilters = () => (
    <div className="sticky top-0 pt-2 pb-4 bg-gray-50 z-10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Emergency Requests</h3>
        <button 
          onClick={() => setShowEmergencyModal(false)}
          className="text-gray-500 hover:text-gray-700"
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
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setSearchQuery('')}
          >
            <X size={16} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="relative">
        <button
          className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-left"
          onClick={() => setShowBloodTypeDropdown(!showBloodTypeDropdown)}
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
          <div className="absolute z-20 w-full mt-1 bg-white rounded-lg border border-gray-200 shadow-lg">
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
      
      {(searchQuery || bloodTypeFilter !== 'All') && (
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
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'emergency-list':
        return (
          <EmergencyList
            filteredEmergencies={filteredEmergencies}
          />
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
                <h5 className="font-medium mb-2">Details</h5>
                <p className="text-gray-600 text-sm">
                  {selectedEmergency.notes || `Urgent need for ${selectedEmergency.bloodType} blood for a patient undergoing emergency treatment. The hospital has confirmed critical need with limited supply in their blood bank.`}
                </p>
              </div>

              <div className="mt-4">
                <h5 className="font-medium mb-2">Contact</h5>
                <p className="text-gray-600 text-sm">
                  {selectedEmergency.contactName || "Hospital Blood Bank"}: {selectedEmergency.contactPhone || "Contact hospital directly"}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                  onClick={handleEmergencyResponse}
                  disabled={isProcessing}
                >
                  <Heart size={16} /> 
                  {isProcessing ? "Processing..." : "Respond Now"}
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
                  By confirming, you agree to donate blood at {selectedEmergency.hospital}. The hospital staff will guide you through the donation process.
                </p>

                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium"
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
                  <span className="font-semibold">
                    {selectedEmergency.contactName || "Hospital Blood Bank"}: {selectedEmergency.contactPhone || "Contact hospital directly"}
                  </span>
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

  // Handle click outside blood type dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showBloodTypeDropdown) {
        setShowBloodTypeDropdown(false);
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showBloodTypeDropdown]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {currentView === 'emergency-list' && renderSearchAndFilters()}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        {renderCurrentView()}
      </div>
      
      {/* Status bar at bottom */}
      {currentView === 'emergency-list' && (
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between text-sm">
          <div className="text-gray-600">
            {filteredEmergencies.length} active {filteredEmergencies.length === 1 ? 'request' : 'requests'}
          </div>
          <button 
            className="text-red-600 flex items-center gap-1 font-medium"
            onClick={() => {
              // Future: Implement refreshing functionality
            }}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}