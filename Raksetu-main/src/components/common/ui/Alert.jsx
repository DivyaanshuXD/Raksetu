/**
 * Alert Component - Standardized alert for notifications and messages
 * Week 2: Component Library
 * 
 * Variants: info, success, warning, error
 * Features: dismissible, icons, title, description, actions
 * 
 * @example
 * <Alert variant="success" title="Success!" dismissible onClose={handleClose}>
 *   Your donation request has been submitted.
 * </Alert>
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  X,
} from 'lucide-react';

const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onClose,
  icon: CustomIcon,
  actions,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Variant configurations
  const variantConfig = {
    info: {
      icon: Info,
      containerClasses: 'bg-blue-50 border-blue-200 text-blue-900',
      iconClasses: 'text-blue-500',
      closeClasses: 'text-blue-500 hover:bg-blue-200',
    },
    success: {
      icon: CheckCircle2,
      containerClasses: 'bg-green-50 border-green-200 text-green-900',
      iconClasses: 'text-green-500',
      closeClasses: 'text-green-500 hover:bg-green-200',
    },
    warning: {
      icon: AlertTriangle,
      containerClasses: 'bg-amber-50 border-amber-200 text-amber-900',
      iconClasses: 'text-amber-500',
      closeClasses: 'text-amber-500 hover:bg-amber-200',
    },
    error: {
      icon: XCircle,
      containerClasses: 'bg-red-50 border-red-200 text-red-900',
      iconClasses: 'text-red-500',
      closeClasses: 'text-red-500 hover:bg-red-200',
    },
  };

  const config = variantConfig[variant];
  const Icon = CustomIcon || config.icon;

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      // Delay to allow animation
      setTimeout(() => onClose(), 200);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        relative rounded-xl border p-4
        transition-all duration-200
        ${config.containerClasses}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      role="alert"
      {...props}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconClasses}`}>
          <Icon size={20} aria-hidden="true" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          {title && (
            <h4 className="font-semibold text-sm mb-1">
              {title}
            </h4>
          )}

          {/* Description */}
          {children && (
            <div className="text-sm opacity-90">
              {children}
            </div>
          )}

          {/* Actions */}
          {actions && (
            <div className="mt-3 flex gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Close button */}
        {dismissible && (
          <button
            onClick={handleClose}
            className={`
              flex-shrink-0 rounded-lg p-1
              transition-colors duration-200
              ${config.closeClasses}
            `.trim().replace(/\s+/g, ' ')}
            aria-label="Close alert"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf(['info', 'success', 'warning', 'error']),
  title: PropTypes.string,
  dismissible: PropTypes.bool,
  onClose: PropTypes.func,
  icon: PropTypes.elementType,
  actions: PropTypes.node,
  className: PropTypes.string,
};

export default Alert;
