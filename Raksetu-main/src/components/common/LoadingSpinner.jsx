/**
 * LoadingSpinner Component
 * Reusable loading spinner for various states
 */

import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'md', text = '', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className={`${sizeClasses[size]} border-4 border-red-200 border-t-red-500 rounded-full animate-spin`}></div>
      {text && <p className="text-gray-600 dark:text-gray-400 text-sm animate-pulse">{text}</p>}
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  text: PropTypes.string,
  className: PropTypes.string
};

export default LoadingSpinner;
