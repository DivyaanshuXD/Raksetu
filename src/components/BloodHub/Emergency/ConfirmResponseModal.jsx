/**
 * ConfirmResponseModal Component
 * Safety confirmation before responding to emergency (prevents misclick)
 */

import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Heart, X, Droplet, MapPin, Building2 } from 'lucide-react';

const ConfirmResponseModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  emergency,
  isProcessing = false 
}) => {
  if (!isOpen || !emergency) return null;

  const handleBackdropClick = () => {
    if (!isProcessing) {
      onClose();
    }
  };

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
        <div className="relative bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-t-2xl">
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
              <AlertCircle size={28} />
            </div>
            <h2 className="text-2xl font-bold">Confirm Your Response</h2>
          </div>
          <p className="text-white/90 text-sm">
            You're about to commit to donating blood
          </p>
        </div>

        {/* Emergency Details */}
        <div className="p-6">
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 mb-6 border-2 border-red-200">
            {/* Blood Type & Hospital */}
            <div className="flex items-start gap-4 mb-3">
              <div className="bg-red-600 text-white rounded-xl p-3 flex items-center justify-center flex-shrink-0">
                <Droplet size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl font-bold text-red-700">
                    {emergency.bloodType}
                  </span>
                  {emergency.urgency && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
                      ${emergency.urgency?.toLowerCase() === 'critical' 
                        ? 'bg-red-100 text-red-700 animate-pulse' 
                        : 'bg-orange-100 text-orange-700'
                      }
                    `}>
                      {emergency.urgency}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 font-semibold truncate flex items-center gap-1">
                  <Building2 size={14} />
                  {emergency.hospital}
                </p>
                {emergency.location && (
                  <p className="text-gray-600 text-sm truncate flex items-center gap-1 mt-1">
                    <MapPin size={12} />
                    {emergency.location}
                  </p>
                )}
              </div>
            </div>

            {/* Units */}
            {emergency.units && (
              <div className="text-sm text-gray-700">
                <span className="font-semibold">Units needed:</span> {emergency.units}
              </div>
            )}
          </div>

          {/* Confirmation Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Heart size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Important: Read Before Confirming
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✓ You commit to donating blood at this hospital</li>
                  <li>✓ Hospital will be notified of your response</li>
                  <li>✓ You can view details in "My Responses" sidebar</li>
                  <li>✓ Mark as complete after donating</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-yellow-800 flex items-start gap-2">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> You can only respond once to each emergency. Make sure you can fulfill this commitment.
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={handleBackdropClick}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Heart size={18} />
                <span>Yes, I'll Help</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

ConfirmResponseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  emergency: PropTypes.shape({
    bloodType: PropTypes.string,
    hospital: PropTypes.string,
    location: PropTypes.string,
    urgency: PropTypes.string,
    units: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  isProcessing: PropTypes.bool
};

export default ConfirmResponseModal;
