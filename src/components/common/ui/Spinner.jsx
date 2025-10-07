/**
 * Spinner Component - Loading spinner with variants
 * Week 2: Micro-interactions & Animations
 * 
 * Features:
 * - Multiple spinner variants
 * - Customizable size and color
 * - Smooth animations
 * - Accessible labels
 * 
 * @example
 * <Spinner size="lg" variant="primary" />
 */

import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Spinner = ({
  size = 'md',
  variant = 'primary',
  label = 'Loading...',
  className = '',
}) => {
  // Size configurations
  const sizeConfig = {
    xs: { icon: 16, border: 'border-2' },
    sm: { icon: 20, border: 'border-2' },
    md: { icon: 24, border: 'border-3' },
    lg: { icon: 32, border: 'border-3' },
    xl: { icon: 40, border: 'border-4' },
  };

  // Variant colors
  const variantColors = {
    primary: 'text-red-600',
    secondary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-amber-600',
    error: 'text-red-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  const config = sizeConfig[size];
  const color = variantColors[variant];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      role="status"
      aria-label={label}
    >
      <Loader2
        size={config.icon}
        className={`${color} animate-spin`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
};

// Spinner overlay for full-screen loading
const SpinnerOverlay = ({ message = 'Loading...', className = '' }) => (
  <div
    className={`
      fixed inset-0 z-50
      bg-white/90
      flex flex-col items-center justify-center
      ${className}
    `.trim().replace(/\s+/g, ' ')}
  >
    <Spinner size="xl" variant="primary" />
    {message && (
      <p className="mt-4 text-gray-600 font-medium">
        {message}
      </p>
    )}
  </div>
);

// Spinner button (button with loading state)
const SpinnerButton = ({
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={`
      inline-flex items-center justify-center gap-2
      ${loading ? 'cursor-wait' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ')}
    {...props}
  >
    {loading && <Spinner size="sm" variant="white" />}
    {children}
  </button>
);

// Attach sub-components
Spinner.Overlay = SpinnerOverlay;
Spinner.Button = SpinnerButton;

Spinner.propTypes = {
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'error', 'white', 'gray']),
  label: PropTypes.string,
  className: PropTypes.string,
};

SpinnerOverlay.propTypes = {
  message: PropTypes.string,
  className: PropTypes.string,
};

SpinnerButton.propTypes = {
  loading: PropTypes.bool,
  children: PropTypes.node.isRequired,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export default Spinner;
