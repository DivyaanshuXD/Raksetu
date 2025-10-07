/**
 * ConfirmEventModal Component
 * Confirmation modal before registering for community events
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Calendar, Users, MapPin, Clock, X, CheckCircle, Crown, AlertCircle } from 'lucide-react';

const ConfirmEventModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  event,
  hasPriorityAccess = false,
  isProcessing = false 
}) => {
  if (!isOpen || !event) return null;

  const handleBackdropClick = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  // Format date
  const eventDate = event.startDate?.toDate 
    ? new Date(event.startDate.toDate()).toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : 'Date TBD';

  // Calculate spots remaining
  const currentParticipants = event.participants || 0;
  const maxCapacity = event.capacity || 100;
  const spotsRemaining = maxCapacity - currentParticipants;
  const isAlmostFull = spotsRemaining <= 10 && spotsRemaining > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <button
            onClick={handleBackdropClick}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-3 rounded-full">
              <CheckCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold">Confirm Registration</h2>
          </div>
          <p className="text-white/90 text-sm">
            You're about to register for this event
          </p>
        </div>

        {/* Event Details */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border-2 border-blue-200">
            {/* Event Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              {event.title}
            </h3>

            {/* Event Info Grid */}
            <div className="space-y-2.5">
              {/* Date */}
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{eventDate}</span>
              </div>

              {/* Time */}
              {event.time && (
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{event.time}</span>
                </div>
              )}

              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{event.location}</span>
                </div>
              )}

              {/* Participants */}
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">
                  {currentParticipants} / {maxCapacity} participants
                  {spotsRemaining > 0 && (
                    <span className={`ml-2 font-semibold ${isAlmostFull ? 'text-orange-600' : 'text-green-600'}`}>
                      ({spotsRemaining} spots left)
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Priority Access Banner */}
          {hasPriorityAccess && (
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl p-3 mb-4 flex items-start gap-3">
              <Crown className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-900">Priority Registration Active</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  You're registering with priority access and will receive bonus points!
                </p>
              </div>
            </div>
          )}

          {/* Almost Full Warning */}
          {isAlmostFull && !hasPriorityAccess && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-700">
                This event is almost full! Register now to secure your spot.
              </p>
            </div>
          )}

          {/* Confirmation Note */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 leading-relaxed">
              By confirming, you commit to attending this event. You'll receive:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>Event details via email</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>Community impact points</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <span>Check-in instructions before the event</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleBackdropClick}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>Confirm Registration</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  event: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    startDate: PropTypes.object,
    time: PropTypes.string,
    location: PropTypes.string,
    participants: PropTypes.number,
    capacity: PropTypes.number,
  }),
  hasPriorityAccess: PropTypes.bool,
  isProcessing: PropTypes.bool
};

export default ConfirmEventModal;
