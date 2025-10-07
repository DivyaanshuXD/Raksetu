/**
 * Input Component - Standardized input field with design system integration
 * Week 2: Component Library
 * 
 * Variants: default, error, success
 * Sizes: sm, md, lg
 * Features: label, helperText, errorText, leftIcon, rightIcon
 * 
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   helperText="We'll never share your email"
 * />
 */

import { forwardRef, useState } from 'prop-types';
import PropTypes from 'prop-types';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  type = 'text',
  placeholder,
  helperText,
  errorText,
  successText,
  variant = 'default',
  size = 'md',
  disabled = false,
  required = false,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const actualType = isPassword && showPassword ? 'text' : type;

  // Determine variant based on error/success
  const actualVariant = errorText ? 'error' : successText ? 'success' : variant;

  // Base styles
  const baseStyles = `
    w-full rounded-lg border transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-0
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
  `;

  // Variant styles
  const variantStyles = {
    default: `
      border-gray-200 focus:border-red-500 focus:ring-red-100
      bg-white text-gray-900 placeholder-gray-400
    `,
    error: `
      border-red-300 focus:border-red-500 focus:ring-red-100
      bg-red-50 text-red-900 placeholder-red-400
    `,
    success: `
      border-green-300 focus:border-green-500 focus:ring-green-100
      bg-green-50 text-green-900 placeholder-green-400
    `,
  };

  // Size styles
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-11 px-4 text-base',
  };

  // Mobile responsive sizes
  const mobileResponsiveSizes = {
    sm: 'h-10 sm:h-9 text-base sm:text-sm',
    md: 'h-11 sm:h-10 text-base',
    lg: 'h-12 sm:h-11 text-base',
  };

  // Icon padding adjustments
  const iconPaddingStyles = `
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || isPassword ? 'pr-10' : ''}
  `;

  // Combine styles
  const inputStyles = `
    ${baseStyles}
    ${variantStyles[actualVariant]}
    ${sizeStyles[size]}
    ${mobileResponsiveSizes[size]}
    ${iconPaddingStyles}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Label styles
  const labelStyles = `
    block text-sm font-medium mb-2
    ${actualVariant === 'error' ? 'text-red-700' : 'text-gray-700'}
    ${required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ''}
  `;

  return (
    <div className={`${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={labelStyles}>
          {label}
        </label>
      )}

      {/* Input container */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        {/* Input field */}
        <input
          ref={ref}
          type={actualType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputStyles}
          {...props}
        />

        {/* Right icon or password toggle */}
        {(rightIcon || isPassword) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isPassword ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : (
              <span className="text-gray-400">{rightIcon}</span>
            )}
          </div>
        )}

        {/* Success/Error icon (overrides right icon) */}
        {!isPassword && actualVariant === 'error' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
            <AlertCircle size={18} />
          </div>
        )}
        {!isPassword && actualVariant === 'success' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <CheckCircle2 size={18} />
          </div>
        )}
      </div>

      {/* Helper/Error/Success text */}
      {(helperText || errorText || successText) && (
        <p className={`mt-2 text-sm ${
          errorText ? 'text-red-600' : 
          successText ? 'text-green-600' : 
          'text-gray-500'
        }`}>
          {errorText || successText || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  errorText: PropTypes.string,
  successText: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'error', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
};

export default Input;
