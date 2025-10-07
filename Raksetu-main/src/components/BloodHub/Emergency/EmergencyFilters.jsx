/**
 * EmergencyFilters Component
 * Search and filter controls for emergency requests
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import { BLOOD_TYPES_WITH_ALL } from '../../../constants';

const EmergencyFilters = memo(({
  searchQuery,
  onSearchChange,
  bloodTypeFilter,
  onBloodTypeChange,
  distanceFilter,
  onDistanceChange,
  showBloodTypeDropdown,
  onToggleDropdown
}) => {
  const distanceOptions = [
    { label: 'Any distance', value: null },
    { label: 'Within 5 km', value: 5 },
    { label: 'Within 10 km', value: 10 },
    { label: 'Within 20 km', value: 20 },
    { label: 'Within 50 km', value: 50 }
  ];

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by hospital or location..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Blood Type Filter */}
        <div className="relative">
          <button
            onClick={onToggleDropdown}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <Filter size={18} className="text-gray-600" />
            <span className="font-medium text-gray-700">
              {bloodTypeFilter === 'All' ? 'All Blood Types' : bloodTypeFilter}
            </span>
            <ChevronDown size={18} className="text-gray-600" />
          </button>
          
          {showBloodTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[180px]">
              {BLOOD_TYPES_WITH_ALL.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onBloodTypeChange(type);
                    onToggleDropdown();
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-red-50 transition-colors ${
                    bloodTypeFilter === type ? 'bg-red-50 text-red-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Distance Filter */}
        <select
          value={distanceFilter || ''}
          onChange={(e) => onDistanceChange(e.target.value ? Number(e.target.value) : null)}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {distanceOptions.map((option) => (
            <option key={option.label} value={option.value || ''}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Active filters indicator */}
        {(bloodTypeFilter !== 'All' || distanceFilter !== null || searchQuery) && (
          <button
            onClick={() => {
              onSearchChange('');
              onBloodTypeChange('All');
              onDistanceChange(null);
            }}
            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            <span className="font-medium">Clear filters</span>
          </button>
        )}
      </div>
    </div>
  );
});

EmergencyFilters.displayName = 'EmergencyFilters';

EmergencyFilters.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  bloodTypeFilter: PropTypes.string.isRequired,
  onBloodTypeChange: PropTypes.func.isRequired,
  distanceFilter: PropTypes.number,
  onDistanceChange: PropTypes.func.isRequired,
  showBloodTypeDropdown: PropTypes.bool.isRequired,
  onToggleDropdown: PropTypes.func.isRequired
};

export default EmergencyFilters;
