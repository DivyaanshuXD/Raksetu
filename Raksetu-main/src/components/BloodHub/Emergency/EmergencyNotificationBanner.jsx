/**
 * EmergencyNotificationBanner Component
 * Displays urgent notifications for new emergency requests
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle } from 'lucide-react';

const EmergencyNotificationBanner = memo(({ 
  emergency, 
  isAnimating,
  onRespond,
  onDismiss
}) => {
  if (!emergency) return null;

  return (
    <div 
      className={`mb-4 p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg flex items-center justify-between transition-all duration-500 ${
        isAnimating ? 'transform scale-105' : ''
      }`}
    >
      <div className="flex items-center flex-1">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <AlertCircle size={24} className="text-white" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold">Urgent Blood Need!</h4>
          <p className="text-sm text-white/90 truncate">
            {emergency.bloodType} needed at {emergency.hospital}
          </p>
        </div>
      </div>
      <button
        className="bg-white/30 hover:bg-white/40 text-white px-3 py-1 rounded-lg transition-colors ml-4 whitespace-nowrap"
        onClick={() => {
          onRespond(emergency);
          onDismiss();
        }}
      >
        Respond Now
      </button>
    </div>
  );
});

EmergencyNotificationBanner.displayName = 'EmergencyNotificationBanner';

EmergencyNotificationBanner.propTypes = {
  emergency: PropTypes.shape({
    id: PropTypes.string.isRequired,
    hospital: PropTypes.string.isRequired,
    bloodType: PropTypes.string.isRequired
  }),
  isAnimating: PropTypes.bool,
  onRespond: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired
};

export default EmergencyNotificationBanner;
