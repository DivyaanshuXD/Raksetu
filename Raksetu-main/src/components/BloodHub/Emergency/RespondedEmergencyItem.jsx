/**
 * RespondedEmergencyItem Component
 * Individual emergency card in the responded emergencies sidebar
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Phone, Navigation, CheckCircle, Clock, Droplets, MapPin, Building2 } from 'lucide-react';
import CompletionModal from './CompletionModal';
import { completeDonation } from '../../../services/donationCompletionService';

const RespondedEmergencyItem = ({ response, onComplete }) => {
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const { donation, emergency } = response;

  if (!emergency || !donation) return null;

  const isCompleted = donation.status === 'completed';
  const isPending = donation.status === 'pending';

  // Format time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return 'Unknown';
    }
  };

  // Handle phone call
  const handleCall = () => {
    const phoneNumber = emergency.contactNumber || emergency.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  // Handle navigation
  const handleNavigate = () => {
    const { location, coordinates } = emergency;
    
    if (coordinates?.lat && coordinates?.lng) {
      // Use exact coordinates
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${coordinates.lat},${coordinates.lng}`,
        '_blank'
      );
    } else if (location) {
      // Use location address
      const query = encodeURIComponent(`${emergency.hospital}, ${location}`);
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${query}`,
        '_blank'
      );
    }
  };

  // Handle mark as complete
  const handleMarkComplete = async () => {
    try {
      setIsCompleting(true);
      await completeDonation(donation.id, donation.userId);
      setShowCompletionModal(false);
      onComplete?.();
    } catch (error) {
      console.error('Error completing donation:', error);
      alert(error.message || 'Failed to mark donation as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <>
      <div
        className={`
          bg-white rounded-xl border shadow-sm p-4 transition-all duration-200
          ${isCompleted 
            ? 'border-green-200 bg-green-50/50' 
            : 'border-gray-200 hover:shadow-md hover:border-gray-300'
          }
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Blood Type Badge */}
            <div
              className={`
                rounded-lg p-2 flex items-center justify-center flex-shrink-0
                ${isCompleted 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                }
              `}
            >
              <Droplets size={16} className="mr-1" />
              <span className="font-bold text-sm">{emergency.bloodType}</span>
            </div>

            {/* Hospital Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1">
                <Building2 size={14} className="text-gray-600 flex-shrink-0" />
                {emergency.hospital}
              </h4>
              <p className="text-xs text-gray-600 truncate flex items-center gap-1 mt-1">
                <MapPin size={10} className="flex-shrink-0" />
                {emergency.location}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          {isCompleted && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex-shrink-0">
              <CheckCircle size={12} />
              <span>Done</span>
            </div>
          )}
        </div>

        {/* Info Row */}
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Responded {getTimeAgo(donation.respondedAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium text-gray-700">{emergency.units} units</span>
          </div>
        </div>

        {/* Urgency */}
        {emergency.urgency && (
          <div className="mb-3">
            <span
              className={`
                inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${emergency.urgency?.toLowerCase() === 'critical' 
                  ? 'bg-red-100 text-red-700' 
                  : emergency.urgency?.toLowerCase() === 'high'
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-amber-100 text-amber-700'
                }
              `}
            >
              {emergency.urgency}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Call Button */}
          <button
            onClick={handleCall}
            disabled={!emergency.contactNumber && !emergency.phone}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone size={14} />
            <span>Call</span>
          </button>

          {/* Navigate Button */}
          <button
            onClick={handleNavigate}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Navigation size={14} />
            <span>Navigate</span>
          </button>
        </div>

        {/* Mark Complete Button */}
        {isPending && (
          <button
            onClick={() => setShowCompletionModal(true)}
            className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all text-sm font-semibold shadow-md hover:shadow-lg"
          >
            <CheckCircle size={16} />
            <span>Mark as Completed</span>
          </button>
        )}
      </div>

      {/* Completion Modal */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleMarkComplete}
        emergency={emergency}
        isLoading={isCompleting}
      />
    </>
  );
};

RespondedEmergencyItem.propTypes = {
  response: PropTypes.shape({
    donationId: PropTypes.string.isRequired,
    donation: PropTypes.shape({
      id: PropTypes.string.isRequired,
      userId: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      respondedAt: PropTypes.any
    }).isRequired,
    emergency: PropTypes.shape({
      id: PropTypes.string.isRequired,
      hospital: PropTypes.string.isRequired,
      bloodType: PropTypes.string.isRequired,
      location: PropTypes.string,
      units: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      urgency: PropTypes.string,
      contactNumber: PropTypes.string,
      phone: PropTypes.string,
      coordinates: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number
      })
    }).isRequired
  }).isRequired,
  onComplete: PropTypes.func
};

export default RespondedEmergencyItem;
