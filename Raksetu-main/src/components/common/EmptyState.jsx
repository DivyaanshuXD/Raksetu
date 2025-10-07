/**
 * EmptyState Component
 * Reusable empty state component
 */

import React from 'react';
import PropTypes from 'prop-types';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  actionLabel,
  className = '' 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}>
      {Icon && (
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-gray-400 dark:text-gray-600" />
        </div>
      )}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {description}
          </p>
        )}
      </div>
      {action && actionLabel && (
        <button
          onClick={action}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.func,
  actionLabel: PropTypes.string,
  className: PropTypes.string
};

export default EmptyState;
