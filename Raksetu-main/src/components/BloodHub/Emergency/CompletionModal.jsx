/**
 * CompletionModal Component
 * Confirmation dialog for marking donations as complete
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { X, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CompletionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  emergency,
  isLoading = false 
}) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setError(null);
      await onConfirm();
      setShowSuccess(true);
      
      // Auto-close after showing success
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to mark donation as complete');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setShowSuccess(false);
      setError(null);
      onClose();
    }
  };

  // Success view
  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You! 🎉
            </h3>
            <p className="text-gray-600">
              Your donation has been recorded. You've saved a life today!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            Complete Donation
          </h3>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Emergency Info */}
          {emergency && (
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 mb-6 border border-red-100">
              <div className="flex items-start gap-3">
                <div className="bg-red-600 text-white rounded-lg p-2 flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {emergency.hospital}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Blood Type: <span className="font-semibold text-red-600">{emergency.bloodType}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Units: <span className="font-semibold">{emergency.units}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Confirmation Question */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              Did you successfully donate blood?
            </p>
            <p className="text-sm text-gray-600">
              Marking this as complete will update your donation history and notify the requester.
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 text-gray-700 font-medium rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Yes, I Donated</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

CompletionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  emergency: PropTypes.shape({
    hospital: PropTypes.string,
    bloodType: PropTypes.string,
    units: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  }),
  isLoading: PropTypes.bool
};

export default CompletionModal;
