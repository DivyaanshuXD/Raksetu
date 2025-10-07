/**
 * EmergencyCard Component
 * Displays individual emergency request card with response tracking
 */

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { MapPin, Droplet, Users, LifeBuoy, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { getRelativeTime } from '../../../utils/dateTime';
import AlertModal from './AlertModal';

const EmergencyCard = memo(({ 
  emergency, 
  hasResponded, 
  onSelect, 
  onRespond 
}) => {
  const [alertModal, setAlertModal] = useState({ show: false, type: 'info', title: '', message: '' });
  
  const impactLevel = emergency.urgency === "Critical" ? 
    "high" : (emergency.units > 2 ? "medium" : "standard");

  const handleClick = () => {
    // Allow viewing details even if responded
    onSelect(emergency);
  };

  const handleRespondClick = (e) => {
    e.stopPropagation();
    if (hasResponded) {
      setAlertModal({
        show: true,
        type: 'info',
        title: 'Already Responded',
        message: "You've already committed to this emergency.\n\nView it in the 'My Responses' sidebar to:\n• Call the hospital\n• Get directions\n• Mark as complete after donating"
      });
      return;
    }
    onRespond(emergency);
  };

  const urgencyStyles = {
    Critical: { bg: 'bg-red-500', badge: 'bg-red-100 text-red-700', pulse: 'animate-pulse' },
    Urgent: { bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', pulse: '' },
    High: { bg: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', pulse: '' },
    Medium: { bg: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700', pulse: '' },
    Low: { bg: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', pulse: '' }
  };

  const style = urgencyStyles[emergency.urgency] || urgencyStyles.Medium;

  return (
    <div
      className={`
        relative bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300 
        border-2 cursor-pointer
        ${hasResponded
          ? 'border-green-400 ring-2 ring-green-200 opacity-90'
          : 'border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-red-300'
        }
      `}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Emergency request for blood type ${emergency.bloodType} at ${emergency.hospital}${hasResponded ? ' - You have responded' : ''}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Already Responded Overlay */}
      {hasResponded && (
        <div className="absolute top-2 right-2 z-10 bg-green-600 text-white px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg animate-in fade-in zoom-in duration-200">
          <CheckCircle size={14} className="animate-pulse" />
          <span className="text-xs font-semibold">Responded</span>
        </div>
      )}

      {/* Urgency indicator bar */}
      <div className={`h-2 w-full ${style.bg} ${style.pulse}`} />
      
      <div className="p-4 pb-3">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-20"> {/* Extra padding to avoid overlap with Responded badge */}
            <h3 className="font-semibold text-gray-900 text-lg truncate">
              {emergency.hospital}
            </h3>
            <p className="text-sm text-gray-600 flex items-center mt-1">
              <MapPin size={14} className="mr-1 text-gray-400 flex-shrink-0" />
              <span className="truncate">{emergency.location}</span>
            </p>
          </div>
          <div className="flex flex-col items-end ml-3">
            <span className={`text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap ${style.badge}`}>
              {emergency.urgency}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Clock size={10} />
              <span>{getRelativeTime(emergency.timestamp)}</span>
            </div>
          </div>
        </div>

        {/* Blood type info */}
        <div className="flex items-center">
          <div className={`
            flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center
            ${hasResponded 
              ? 'bg-green-100' 
              : 'bg-gradient-to-br from-red-50 to-red-100'
            }
          `}>
            <Droplet 
              size={26} 
              className={hasResponded ? 'text-green-600' : 'text-red-500'} 
            />
          </div>
          <div className="ml-3 flex-1">
            <div className="flex items-center flex-wrap gap-2">
              <span className={`
                font-bold text-xl
                ${hasResponded ? 'text-green-700' : 'text-red-600'}
              `}>
                {emergency.bloodType}
              </span>
              {emergency.isRare && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded-full font-medium">
                  Rare Type
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700 font-medium mt-0.5">
              {emergency.units || 1} {(emergency.units || 1) > 1 ? 'units' : 'unit'} needed
            </p>
          </div>
        </div>

        {/* Impact level */}
        {impactLevel !== "standard" && (
          <div className="mt-3 flex items-center gap-1.5 bg-gradient-to-r from-red-50 to-orange-50 px-3 py-1.5 rounded-lg border border-red-100">
            {impactLevel === "high" ? (
              <LifeBuoy size={16} className="text-red-600" />
            ) : (
              <TrendingUp size={16} className="text-orange-600" />
            )}
            <span className={`text-xs font-semibold ${
              impactLevel === "high" ? "text-red-700" : "text-orange-700"
            }`}>
              {impactLevel === "high" ? "🔥 High Impact - Critical Need" : "⚡ Medium Impact"}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-3 flex justify-between items-center bg-gray-50">
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-500" />
          <span className="text-xs text-gray-700 font-medium">
            {emergency.donorsResponded || 0} {(emergency.donorsResponded || 0) === 1 ? 'donor' : 'donors'} responding
          </span>
        </div>
        <button
          className={`
            text-sm px-4 py-1.5 rounded-lg font-semibold transition-all
            ${hasResponded
              ? 'bg-green-100 text-green-700 cursor-default'
              : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg'
            }
          `}
          onClick={handleRespondClick}
          disabled={hasResponded}
        >
          {hasResponded ? (
            <span className="flex items-center gap-1.5">
              <CheckCircle size={14} />
              Responded
            </span>
          ) : (
            "I'll Help"
          )}
        </button>
      </div>

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

EmergencyCard.displayName = 'EmergencyCard';

EmergencyCard.propTypes = {
  emergency: PropTypes.shape({
    id: PropTypes.string.isRequired,
    hospital: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    bloodType: PropTypes.string.isRequired,
    urgency: PropTypes.string.isRequired,
    units: PropTypes.number,
    timestamp: PropTypes.object,
    isRare: PropTypes.bool,
    donorsResponded: PropTypes.number,
    coordinates: PropTypes.object
  }).isRequired,
  hasResponded: PropTypes.bool.isRequired,
  onSelect: PropTypes.func.isRequired,
  onRespond: PropTypes.func.isRequired
};

export default EmergencyCard;
