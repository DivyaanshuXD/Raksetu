/**
 * Badge Component - Standardized badge for status indicators and labels
 * Week 2: Component Library
 * 
 * Variants: primary, secondary, success, warning, error, info, neutral
 * Sizes: sm, md, lg
 * Features: dot indicator, icon support
 * 
 * @example
 * <Badge variant="success" size="md">Active</Badge>
 * <Badge variant="warning" dot>Pending</Badge>
 */

import PropTypes from 'prop-types';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  icon: Icon,
  className = '',
  ...props
}) => {
  // Base styles
  const baseStyles = `
    inline-flex items-center gap-1.5
    font-medium rounded-full
    transition-colors duration-200
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-red-100 text-red-700
      border border-red-200
    `,
    secondary: `
      bg-blue-100 text-blue-700
      border border-blue-200
    `,
    success: `
      bg-green-100 text-green-700
      border border-green-200
    `,
    warning: `
      bg-amber-100 text-amber-700
      border border-amber-200
    `,
    error: `
      bg-red-100 text-red-700
      border border-red-200
    `,
    info: `
      bg-blue-100 text-blue-700
      border border-blue-200
    `,
    neutral: `
      bg-gray-100 text-gray-700
      border border-gray-200
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Dot color based on variant
  const dotColors = {
    primary: 'bg-red-500',
    secondary: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-500',
  };

  // Icon size based on badge size
  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  // Combine styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant]}
    ${sizeStyles[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <span className={combinedStyles} {...props}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {Icon && <Icon size={iconSizes[size]} aria-hidden="true" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
    'neutral',
  ]),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  dot: PropTypes.bool,
  icon: PropTypes.elementType,
  className: PropTypes.string,
};

export default Badge;
