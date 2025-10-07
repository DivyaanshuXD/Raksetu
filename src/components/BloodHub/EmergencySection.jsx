/**
 * EmergencySection Component (Optimized)
 * Main container for emergency requests with improved performance
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { Droplet, ArrowLeft, History } from 'lucide-react';
import EmergencyList from './Emergency/EmergencyList';
import EmergencyFilters from './Emergency/EmergencyFilters';
import EmergencyNotificationBanner from './Emergency/EmergencyNotificationBanner';
import RespondedEmergenciesSidebar from './Emergency/RespondedEmergenciesSidebar';
import { useEmergencyFilters } from '../../hooks/useEmergencyFilters';
import { useRespondedEmergencies } from '../../hooks/useRespondedEmergencies';

// Import detail views (we'll create these next)
const EmergencyDetail = React.lazy(() => import('./Emergency/EmergencyDetail'));

const EmergencySection = memo(({ 
  setShowEmergencyModal, 
  getUrgencyColor, 
  emergencyRequests, 
  userLocation, 
  userProfile,
  isLoggedIn,
  setShowAuthModal,
  setAuthMode,
  onDonationConfirmed 
}) => {
  // UI state
  const [showBloodTypeDropdown, setShowBloodTypeDropdown] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newEmergencyNotification, setNewEmergencyNotification] = useState(null);
  const [animateNotification, setAnimateNotification] = useState(false);
  const [showRespondedSidebar, setShowRespondedSidebar] = useState(false);

  // Custom hooks
  const {
    searchQuery,
    setSearchQuery,
    bloodTypeFilter,
    setBloodTypeFilter,
    distanceFilter,
    setDistanceFilter,
    filteredEmergencies,
    clearFilters
  } = useEmergencyFilters(emergencyRequests, userLocation);

  const respondedEmergencies = useRespondedEmergencies(userProfile?.id);

  // Handlers
  const handleSelectEmergency = useCallback((emergency) => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setSelectedEmergency(emergency);
  }, [isLoggedIn, setAuthMode, setShowAuthModal]);

  const handleRespondEmergency = useCallback((emergency) => {
    handleSelectEmergency(emergency);
  }, [handleSelectEmergency]);

  const handleBackToList = useCallback(() => {
    setSelectedEmergency(null);
    setNewEmergencyNotification(null);
  }, []);

  const handleCreateEmergency = useCallback(() => {
    if (!isLoggedIn) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    setShowEmergencyModal(true);
  }, [isLoggedIn, setAuthMode, setShowAuthModal, setShowEmergencyModal]);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleToggleDropdown = useCallback(() => {
    setShowBloodTypeDropdown(prev => !prev);
  }, []);

  const handleDismissNotification = useCallback(() => {
    setNewEmergencyNotification(null);
    setAnimateNotification(false);
  }, []);

  // Memoized header
  const header = useMemo(() => (
    <div className="sticky top-0 pt-2 pb-4 bg-gray-50 z-10">
      {/* Notification Banner */}
      <EmergencyNotificationBanner
        emergency={newEmergencyNotification}
        isAnimating={animateNotification}
        onRespond={handleSelectEmergency}
        onDismiss={handleDismissNotification}
      />

      {/* Header with My Responses Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Droplet size={24} className="text-red-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-800">Emergency Requests</h2>
        </div>
        
        {/* My Responses Button */}
        {isLoggedIn && (
          <button
            onClick={() => setShowRespondedSidebar(true)}
            className="relative flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <History size={18} />
            <span>My Responses</span>
            {respondedEmergencies.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {respondedEmergencies.length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filters */}
      <EmergencyFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        bloodTypeFilter={bloodTypeFilter}
        onBloodTypeChange={setBloodTypeFilter}
        distanceFilter={distanceFilter}
        onDistanceChange={setDistanceFilter}
        showBloodTypeDropdown={showBloodTypeDropdown}
        onToggleDropdown={handleToggleDropdown}
      />
    </div>
  ), [
    newEmergencyNotification,
    animateNotification,
    searchQuery,
    bloodTypeFilter,
    distanceFilter,
    showBloodTypeDropdown,
    isLoggedIn,
    respondedEmergencies.length,
    handleSelectEmergency,
    handleDismissNotification,
    handleToggleDropdown
  ]);

  // Show detail view if emergency is selected
  if (selectedEmergency) {
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <EmergencyDetail
          emergency={selectedEmergency}
          userProfile={userProfile}
          userLocation={userLocation}
          onBack={handleBackToList}
          onDonationConfirmed={onDonationConfirmed}
          getUrgencyColor={getUrgencyColor}
        />
      </React.Suspense>
    );
  }

  // Main list view
  return (
    <section className="max-w-7xl mx-auto px-4 py-8" aria-label="Emergency Blood Requests">
      {header}
      
      <EmergencyList
        emergencies={filteredEmergencies}
        respondedEmergencies={respondedEmergencies}
        isLoading={isLoading}
        error={error}
        bloodTypeFilter={bloodTypeFilter}
        onSelectEmergency={handleSelectEmergency}
        onRespondEmergency={handleRespondEmergency}
        onCreateEmergency={handleCreateEmergency}
        onRetry={handleRetry}
      />

      {/* Responded Emergencies Sidebar */}
      <RespondedEmergenciesSidebar
        isOpen={showRespondedSidebar}
        onClose={() => setShowRespondedSidebar(false)}
        userId={userProfile?.id}
      />
    </section>
  );
});

EmergencySection.displayName = 'EmergencySection';

EmergencySection.propTypes = {
  setShowEmergencyModal: PropTypes.func.isRequired,
  getUrgencyColor: PropTypes.func.isRequired,
  emergencyRequests: PropTypes.arrayOf(PropTypes.object),
  userLocation: PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired
  }),
  userProfile: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    bloodType: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  isLoggedIn: PropTypes.bool.isRequired,
  setShowAuthModal: PropTypes.func.isRequired,
  setAuthMode: PropTypes.func.isRequired,
  onDonationConfirmed: PropTypes.func
};

export default EmergencySection;
