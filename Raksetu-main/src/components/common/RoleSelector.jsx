import { useState } from 'react';
import { Heart, User, Check } from 'lucide-react';
import { getAvailableRoles, USER_ROLES } from '../../constants/roles';
import PropTypes from 'prop-types';

/**
 * RoleSelector Component
 * 
 * Beautiful role selection UI for registration
 * Shows cards for DONOR and RECIPIENT roles
 */
const RoleSelector = ({ selectedRole, onRoleSelect, error }) => {
  const [hoveredRole, setHoveredRole] = useState(null);
  const availableRoles = getAvailableRoles();

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'Heart':
        return Heart;
      case 'User':
        return User;
      default:
        return User;
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        I am joining as a <span className="text-red-600">*</span>
      </label>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableRoles.map((role) => {
          const Icon = getIcon(role.icon);
          const isSelected = selectedRole === role.value;
          const isHovered = hoveredRole === role.value;
          const colors = role.colors;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onRoleSelect(role.value)}
              onMouseEnter={() => setHoveredRole(role.value)}
              onMouseLeave={() => setHoveredRole(null)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300
                ${isSelected 
                  ? `${colors.bg} ${colors.border} shadow-lg scale-105` 
                  : `bg-white border-gray-200 ${colors.hover} hover:shadow-md hover:scale-102`
                }
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className={`absolute top-3 right-3 w-6 h-6 bg-gradient-to-r ${colors.gradient} rounded-full flex items-center justify-center animate-in zoom-in duration-300`}>
                  <Check size={14} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon */}
              <div className={`
                flex items-center justify-center w-16 h-16 rounded-full mx-auto mb-4
                transition-all duration-300
                ${isSelected || isHovered
                  ? `bg-gradient-to-r ${colors.gradient}`
                  : 'bg-gray-100'
                }
              `}>
                <Icon 
                  size={32} 
                  className={`
                    transition-colors duration-300
                    ${isSelected || isHovered ? 'text-white' : 'text-gray-600'}
                  `}
                  strokeWidth={isSelected ? 2.5 : 2}
                />
              </div>

              {/* Label */}
              <h3 className={`
                text-lg font-semibold mb-2 transition-colors duration-300
                ${isSelected ? colors.text : 'text-gray-800'}
              `}>
                {role.label}
              </h3>

              {/* Description */}
              <p className={`
                text-sm transition-colors duration-300
                ${isSelected ? colors.text : 'text-gray-600'}
              `}>
                {role.description}
              </p>

              {/* Animated Border on Hover */}
              <div className={`
                absolute inset-0 rounded-xl border-2 border-transparent
                transition-all duration-300
                ${isHovered && !isSelected ? `${colors.border} opacity-50` : 'opacity-0'}
              `} />
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 animate-in slide-in-from-top-1 duration-300">
          {error}
        </p>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        {selectedRole === USER_ROLES.DONOR && (
          <>💝 As a donor, you can donate blood, schedule appointments, and track your impact</>
        )}
        {selectedRole === USER_ROLES.RECIPIENT && (
          <>🆘 As a recipient, you can request blood, search donors, and create emergency requests</>
        )}
        {!selectedRole && (
          <>Select your role to continue. You can change this later in settings.</>
        )}
      </p>
    </div>
  );
};

RoleSelector.propTypes = {
  selectedRole: PropTypes.string,
  onRoleSelect: PropTypes.func.isRequired,
  error: PropTypes.string
};

export default RoleSelector;
