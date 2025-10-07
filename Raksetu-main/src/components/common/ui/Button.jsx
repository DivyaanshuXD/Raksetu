/**
 * Button Component - Standardized button with design system integration
 * Week 2: Component Library
 * 
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: xs, sm, md, lg, xl
 * States: loading, disabled
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Click Me
 * </Button>
 */

import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  type = 'button',
  ...props
}, ref) => {
  
  // Base styles (always applied)
  const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
    active:scale-[0.98]
  `;

  // Variant styles
  const variantStyles = {
    primary: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      text-white shadow-sm hover:shadow-md
      focus:ring-red-500
    `,
    secondary: `
      bg-gradient-to-r from-blue-600 to-blue-700
      hover:from-blue-700 hover:to-blue-800
      text-white shadow-sm hover:shadow-md
      focus:ring-blue-500
    `,
    outline: `
      bg-white border-2 border-red-200
      hover:border-red-300 hover:bg-red-50
      text-red-600 shadow-sm
      focus:ring-red-500
    `,
    ghost: `
      bg-transparent hover:bg-gray-100
      text-gray-700 hover:text-gray-900
      focus:ring-gray-300
    `,
    danger: `
      bg-gradient-to-r from-red-600 to-red-700
      hover:from-red-700 hover:to-red-800
      text-white shadow-sm hover:shadow-md
      focus:ring-red-500
    `,
    success: `
      bg-gradient-to-r from-green-600 to-green-700
      hover:from-green-700 hover:to-green-800
      text-white shadow-sm hover:shadow-md
      focus:ring-green-500
    `,
  };

  // Size styles
  const sizeStyles = {
    xs: 'h-8 px-3 text-xs gap-1',
    sm: 'h-9 px-4 text-sm gap-1.5',
    md: 'h-10 px-5 text-base gap-2',
    lg: 'h-11 px-6 text-base gap-2',
    xl: 'h-12 px-8 text-lg gap-2.5',
  };

  // Mobile responsive sizes (larger on mobile)
  const mobileResponsiveSizes = {
    xs: 'h-8 sm:h-8',
    sm: 'h-10 sm:h-9',
    md: 'h-11 sm:h-10',
    lg: 'h-12 sm:h-11',
    xl: 'h-14 sm:h-12',
  };

  // Full width
  const widthStyles = fullWidth ? 'w-full' : '';

  // Combine all styles
  const combinedStyles = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${mobileResponsiveSizes[size]}
    ${widthStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      ref={ref}
      type={type}
      className={combinedStyles}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <Loader2 className="animate-spin" size={size === 'xs' || size === 'sm' ? 14 : 16} />
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className="inline-flex">{leftIcon}</span>
      )}

      {/* Button text */}
      {children}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className="inline-flex">{rightIcon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  onClick: PropTypes.func,
};

export default Button;
