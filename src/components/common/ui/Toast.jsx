/**
 * Toast Component - Notification toast with animations
 * Week 2: Micro-interactions & Animations
 * 
 * Features:
 * - Slide-in animations
 * - Auto-dismiss
 * - Multiple positions
 * - Icon support
 * - Action buttons
 * 
 * @example
 * <Toast
 *   variant="success"
 *   message="Donation successful!"
 *   position="top-right"
 *   duration={3000}
 * />
 */

import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  X,
} from 'lucide-react';

const Toast = ({
  variant = 'info',
  message,
  description,
  position = 'top-right',
  duration = 3000,
  onClose,
  action,
  icon: CustomIcon,
  closable = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Mount animation
  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  // Variant configurations
  const variantConfig = {
    info: {
      icon: Info,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-900',
      iconColor: 'text-blue-500',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-900',
      iconColor: 'text-green-500',
    },
    warning: {
      icon: AlertCircle,
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-900',
      iconColor: 'text-amber-500',
    },
    error: {
      icon: XCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-900',
      iconColor: 'text-red-500',
    },
  };

  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  // Animation classes
  const animationClasses = {
    'top-left': isExiting ? '-translate-x-full opacity-0' : isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
    'top-center': isExiting ? '-translate-y-full opacity-0' : isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0',
    'top-right': isExiting ? 'translate-x-full opacity-0' : isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    'bottom-left': isExiting ? '-translate-x-full opacity-0' : isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0',
    'bottom-center': isExiting ? 'translate-y-full opacity-0' : isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0',
    'bottom-right': isExiting ? 'translate-x-full opacity-0' : isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
  };

  return (
    <div
      className={`
        fixed z-50
        ${positionClasses[position]}
        transition-all duration-300 ease-out
        ${animationClasses[position]}
      `.trim().replace(/\s+/g, ' ')}
    >
      <div
        className={`
          flex items-start gap-3 min-w-[300px] max-w-md
          ${config.bg} ${config.border} ${config.text}
          border rounded-xl shadow-lg p-4
        `.trim().replace(/\s+/g, ' ')}
        role="alert"
      >
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          <Icon size={20} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">
            {message}
          </p>
          {description && (
            <p className="text-sm mt-1 opacity-90">
              {description}
            </p>
          )}
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>

        {/* Close button */}
        {closable && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 rounded-lg p-1
              ${config.iconColor} hover:bg-black/5
              transition-colors duration-200
            `.trim().replace(/\s+/g, ' ')}
            aria-label="Close notification"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

Toast.propTypes = {
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  message: PropTypes.string.isRequired,
  description: PropTypes.string,
  position: PropTypes.oneOf([
    'top-left',
    'top-center',
    'top-right',
    'bottom-left',
    'bottom-center',
    'bottom-right',
  ]),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  action: PropTypes.node,
  icon: PropTypes.elementType,
  closable: PropTypes.bool,
};

export default Toast;
