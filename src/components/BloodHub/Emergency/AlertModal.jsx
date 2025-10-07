/**
 * AlertModal Component
 * Reusable modal for success, error, info, and warning messages
 * Based on RequestSuccessModal design
 */

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const AlertModal = ({ 
  show, 
  onClose, 
  type = 'success', 
  title, 
  message,
  confirmText = 'Close',
  onConfirm,
  showCancel = false,
  cancelText = 'Cancel',
  autoCloseSeconds = 10
}) => {
  useEffect(() => {
    if (show && autoCloseSeconds > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseSeconds * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoCloseSeconds, onClose]);

  if (!show) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-gray-900',
      buttonBg: 'bg-green-600 hover:bg-green-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-gray-900',
      buttonBg: 'bg-red-600 hover:bg-red-700'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-gray-900',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-gray-900',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center animate-in zoom-in slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors z-10"
          aria-label="Close"
        >
          <X size={20} className="text-gray-500" />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className={`h-20 w-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Icon size={40} className={config.iconColor} />
          </div>

          {/* Title */}
          <h3 className={`text-xl font-bold mb-2 ${config.titleColor}`}>
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 mb-6 whitespace-pre-line">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className={`flex gap-3 p-6 pt-0 ${showCancel ? '' : 'justify-center'}`}>
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`${showCancel ? 'flex-1' : ''} px-6 py-3 ${config.buttonBg} text-white rounded-xl transition-colors font-semibold shadow-lg hover:shadow-xl`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

AlertModal.propTypes = {
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  confirmText: PropTypes.string,
  onConfirm: PropTypes.func,
  showCancel: PropTypes.bool,
  cancelText: PropTypes.string,
  autoCloseSeconds: PropTypes.number
};

export default AlertModal;
