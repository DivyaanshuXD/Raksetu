/**
 * EmergencyDetail Component
 * Displays detailed inform  // TASK 2: Calculate distance with formatting (FIX NaN issue)
  const distance = useMemo(() => {
    // Use calculatedDistance if available from filter hook
    if (emergency?.calculatedDistance !== undefined && emergency.calculatedDistance !== null) {
      const dist = Number(emergency.calculatedDistance);
      return !isNaN(dist) ? dist.toFixed(1) : null;
    }
    
    // Otherwise calculate it here
    if (!userLocation || !emergency?.coordinates) return null;
    
    // Validate coordinates are numbers
    const userLat = Number(userLocation.lat);
    const userLng = Number(userLocation.lng);
    const emergLat = Number(emergency.coordinates.latitude);
    const emergLng = Number(emergency.coordinates.longitude);
    
    if (isNaN(userLat) || isNaN(userLng) || isNaN(emergLat) || isNaN(emergLng)) {
      return null;
    }
    
    const dist = calculateDistance(userLat, userLng, emergLat, emergLng);
    return (dist && !isNaN(dist)) ? dist.toFixed(1) : null;
  }, [userLocation, emergency?.coordinates, emergency?.calculatedDistance]);cted emergency request
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  MapPin,
  Heart,
  MessageCircle,
  Navigation,
  Share2,
  Droplet,
  Clock,
  User,
  Phone
} from 'lucide-react';
import { calculateDistance } from '../../../utils/distance';
import { formatTimestamp, getRelativeTime } from '../../../utils/dateTime';
import { BLOOD_COMPATIBILITY } from '../../../constants/bloodTypes';
import { respondToEmergency } from '../../../services/emergencyResponseService';
import EmergencyChat from './EmergencyChat';
import EmergencyConfirmation from './EmergencyConfirmation';
import ConfirmResponseModal from './ConfirmResponseModal';
import AlertModal from './AlertModal';
import BloodCompatibilityMatrix from './BloodCompatibilityMatrix';

const EmergencyDetail = memo(({
  emergency,
  userProfile,
  userLocation,
  onBack,
  onDonationConfirmed,
  getUrgencyColor
}) => {
  const [showChat, setShowChat] = useState(false);
  const [currentView, setCurrentView] = useState('detail'); // detail, confirmation, confirmed
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseError, setResponseError] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [alertModal, setAlertModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // Calculate compatibility score
  const compatibilityScore = useMemo(() => {
    if (!userProfile?.bloodType || !emergency?.bloodType) return 0;
    
    // Check if user's blood type can donate to emergency's blood type
    // BLOOD_COMPATIBILITY[recipient] = [compatible donors]
    const compatibleDonors = BLOOD_COMPATIBILITY[emergency.bloodType];
    
    if (!compatibleDonors || !Array.isArray(compatibleDonors)) return 0;
    
    if (compatibleDonors.includes(userProfile.bloodType)) {
      // Perfect match if same blood type, otherwise compatible
      return userProfile.bloodType === emergency.bloodType ? 100 : 80;
    }
    
    return 30; // Not compatible
  }, [userProfile?.bloodType, emergency?.bloodType]);

  // Check if user's blood type is compatible (for disabling respond button)
  const isCompatible = useMemo(() => {
    if (!userProfile?.bloodType || !emergency?.bloodType) return false;
    const compatibleDonors = BLOOD_COMPATIBILITY[emergency.bloodType];
    return compatibleDonors && compatibleDonors.includes(userProfile.bloodType);
  }, [userProfile?.bloodType, emergency?.bloodType]);

  // TASK 2: Calculate distance with formatting (FIX NaN issue)
  const distance = useMemo(() => {
    // Use calculatedDistance if available from filter hook
    if (emergency?.calculatedDistance !== undefined && emergency.calculatedDistance !== null) {
      return emergency.calculatedDistance.toFixed(1);
    }
    
    // Otherwise calculate it here
    if (!userLocation || !emergency?.coordinates) return null;
    
    const dist = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      emergency.coordinates.latitude,
      emergency.coordinates.longitude
    );
    return dist ? dist.toFixed(1) : null;
  }, [userLocation, emergency?.coordinates, emergency?.calculatedDistance]);

  // TASK 3: Format time with both absolute and relative formats
  const timeAgo = useMemo(() => {
    if (!emergency?.timestamp) return 'Unknown';
    return getRelativeTime(emergency.timestamp); // "2 hours ago"
  }, [emergency?.timestamp]);
  
  const postedDate = useMemo(() => {
    if (!emergency?.timestamp) return 'Unknown';
    return formatTimestamp(emergency.timestamp); // "Oct 02, 2025"
  }, [emergency?.timestamp]);

  // Handle response
  const handleEmergencyResponse = useCallback(async () => {
    // Show confirmation modal first (safety check)
    setShowConfirmModal(true);
  }, []);

  // Handle confirmed response
  const handleConfirmedResponse = useCallback(async () => {
    if (isProcessing || !userProfile || !emergency) return;
    
    setIsProcessing(true);
    setResponseError(null);
    
    try {
      // Call the respondToEmergency service
      await respondToEmergency(emergency.id, userProfile);
      
      // Close confirmation modal immediately
      setShowConfirmModal(false);
      
      // Show success message using AlertModal
      setAlertModal({
        show: true,
        type: 'success',
        title: 'Response Recorded Successfully! 🎉',
        message: `✅ You've committed to donating ${emergency.bloodType} at ${emergency.hospital}.\n\n📱 You'll receive an SMS confirmation shortly.\n\n📋 View this in "My Responses" sidebar to:\n• Call the hospital\n• Get directions\n• Mark as complete after donating`
      });
      
      // Trigger callback if provided
      if (onDonationConfirmed) {
        onDonationConfirmed(emergency);
      }
    } catch (error) {
      console.error('Error responding to emergency:', error);
      setResponseError(error.message || 'Failed to respond to emergency. Please try again.');
      
      // Show error alert
      setAlertModal({
        show: true,
        type: 'error',
        title: 'Response Failed',
        message: error.message || 'Failed to respond to emergency. Please try again.'
      });
      
      setShowConfirmModal(false);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, userProfile, emergency, onDonationConfirmed, onBack]);

  // Handle SMS response for offline mode
  const handleSMSEmergencyResponse = useCallback(() => {
    if (!emergency?.contactPhone) {
      alert('Contact phone number not available');
      return;
    }
    
    const message = `I am responding to your emergency blood request for ${emergency.bloodType}. My blood type is ${userProfile?.bloodType}. Please contact me at ${userProfile?.phoneNumber || 'N/A'}.`;
    const smsUrl = `sms:${emergency.contactPhone}?body=${encodeURIComponent(message)}`;
    window.location.href = smsUrl;
  }, [emergency, userProfile]);

  // Handle share
  const handleShare = useCallback(async () => {
    const shareText = `Urgent: ${emergency?.bloodType} blood needed at ${emergency?.hospital}. ${emergency?.location}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Emergency Blood Request',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Details copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }, [emergency]);

  // Show confirmation view
  if (currentView === 'confirmation') {
    return (
      <EmergencyConfirmation
        emergency={emergency}
        userProfile={userProfile}
        onBack={() => setCurrentView('detail')}
        onConfirm={onDonationConfirmed}
      />
    );
  }

  if (!emergency) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center">
        <p className="text-gray-600">Emergency request not found</p>
        <button
          onClick={onBack}
          className="mt-4 text-red-600 hover:text-red-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOnline = navigator.onLine;

  return (
    <div className="max-w-lg mx-auto p-4 pb-20">
      {/* Back Button */}
      <button
        className="flex items-center text-red-600 mb-4 hover:text-red-700 transition-colors"
        onClick={onBack}
        aria-label="Back to emergency list"
      >
        <ArrowLeft size={18} className="mr-1" /> Back to emergencies
      </button>

      {/* Emergency Card */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Status Bar */}
        <div 
          className="h-2 w-full" 
          style={{ backgroundColor: getUrgencyColor?.(emergency.urgency) || '#EF4444' }}
        />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl font-bold text-red-600">
                  {emergency.bloodType}
                </span>
                <span 
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{ 
                    backgroundColor: getUrgencyColor?.(emergency.urgency) ? 
                      `${getUrgencyColor(emergency.urgency)}20` : '#FEE2E2',
                    color: getUrgencyColor?.(emergency.urgency) || '#DC2626'
                  }}
                >
                  {emergency.urgency || 'Medium'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                {emergency.hospital}
              </h3>
              <p className="text-gray-600 flex items-center text-sm">
                <MapPin size={14} className="mr-1" />
                {emergency.location}
              </p>
            </div>
          </div>

          {/* Units Required */}
          <div className="mb-4">
            <p className="text-gray-600 text-sm">
              {emergency.units || 1} {emergency.units > 1 ? 'units' : 'unit'} required
            </p>
          </div>

          {/* Notes */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-700">
              {emergency.notes ||
                `Urgent need for ${emergency.bloodType} blood for a patient undergoing emergency treatment.`}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Droplet size={16} className="text-red-500" />
              </div>
              <div className="text-gray-500 text-xs">Units Needed</div>
              <div className="font-semibold text-gray-800">{emergency.units || 1}</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Navigation size={16} className="text-blue-500" />
              </div>
              <div className="text-gray-500 text-xs">Distance</div>
              <div className="font-semibold text-gray-800">
                {distance ? `${distance} km` : (userLocation ? 'Calculating...' : 'Unknown')}
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm">
                <Clock size={16} className="text-green-500" />
              </div>
              <div className="text-gray-500 text-xs">Posted</div>
              <div className="font-semibold text-gray-800 text-xs">{timeAgo}</div>
              <div className="text-gray-400 text-[10px] mt-0.5">{postedDate}</div>
            </div>
          </div>

          {/* TASK 4: Blood Compatibility Matrix - Beautiful Visual Component */}
          <div className="mt-6">
            <BloodCompatibilityMatrix
              userBloodType={userProfile?.bloodType}
              recipientBloodType={emergency.bloodType}
              variant="compact"
            />
          </div>

          {/* Contact Information */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User size={16} className="mr-2 text-gray-500" />
              Contact Information
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">
                    {emergency.contactName || 'Hospital Blood Bank'}
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    {emergency.contactPhone || 'Contact hospital directly'}
                  </p>
                </div>
                {emergency.contactPhone && (
                  <a
                    href={`tel:${emergency.contactPhone}`}
                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors shadow-sm"
                    aria-label="Call contact"
                  >
                    <Phone size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            {isOnline ? (
              <>
                <div className="flex-1">
                  <button
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleEmergencyResponse}
                    disabled={isProcessing || !isCompatible}
                    title={!isCompatible ? `Your blood type (${userProfile?.bloodType || '?'}) cannot donate to ${emergency.bloodType}` : ''}
                  >
                    <Heart size={18} />
                    {isProcessing ? 'Processing...' : 'Respond Now'}
                  </button>
                  {!isCompatible && userProfile?.bloodType && (
                    <p className="text-xs text-red-600 mt-2 text-center">
                      ⚠️ Your blood type ({userProfile.bloodType}) is not compatible with {emergency.bloodType}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
                    onClick={() => setShowChat(true)}
                    aria-label="Message"
                  >
                    <MessageCircle size={18} className="text-gray-600" />
                  </button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${emergency.coordinates?.latitude},${emergency.coordinates?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors inline-flex items-center"
                    aria-label="Navigate to location"
                  >
                    <Navigation size={18} className="text-gray-600" />
                  </a>
                  <button
                    className="bg-gray-100 hover:bg-gray-200 p-3 rounded-xl transition-colors"
                    onClick={handleShare}
                    aria-label="Share"
                  >
                    <Share2 size={18} className="text-gray-600" />
                  </button>
                </div>
              </>
            ) : (
              <button
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleSMSEmergencyResponse}
                disabled={isProcessing}
              >
                <MessageCircle size={18} />
                Respond via SMS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chat Component */}
      {showChat && (
        <EmergencyChat
          emergency={emergency}
          userProfile={userProfile}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Confirm Response Modal */}
      <ConfirmResponseModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmedResponse}
        emergency={emergency}
        isProcessing={isProcessing}
      />

      {/* Alert Modal */}
      <AlertModal
        show={alertModal.show}
        onClose={() => setAlertModal({ ...alertModal, show: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
});

EmergencyDetail.displayName = 'EmergencyDetail';

EmergencyDetail.propTypes = {
  emergency: PropTypes.shape({
    id: PropTypes.string,
    bloodType: PropTypes.string.isRequired,
    urgency: PropTypes.string,
    hospital: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    units: PropTypes.number,
    notes: PropTypes.string,
    contactName: PropTypes.string,
    contactPhone: PropTypes.string,
    coordinates: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number
    }),
    timestamp: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.object
    ])
  }).isRequired,
  userProfile: PropTypes.shape({
    id: PropTypes.string,
    bloodType: PropTypes.string,
    phoneNumber: PropTypes.string,
    name: PropTypes.string
  }),
  userLocation: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number
  }),
  onBack: PropTypes.func.isRequired,
  onDonationConfirmed: PropTypes.func,
  getUrgencyColor: PropTypes.func
};

export default EmergencyDetail;
