/**
 * EmergencyList Component
 * Grid display of emergency request cards
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Zap } from 'lucide-react';
import EmergencyCard from './EmergencyCard';
import { ErrorMessage, EmptyState, EmergencyCardSkeleton } from '../../common';

const BloodDropIllustration = () => (
  <div className="w-24 h-24 mx-auto mb-4 relative">
    <div className="absolute inset-0 animate-pulse">
      <div className="w-full h-full bg-red-500 rounded-t-full rounded-b-lg transform rotate-45 opacity-20"></div>
    </div>
    <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-red-600 rounded-t-full rounded-b-lg transform rotate-45"></div>
  </div>
);

const EmergencyList = memo(({ 
  emergencies, 
  respondedEmergencies,
  isLoading, 
  error,
  bloodTypeFilter,
  onSelectEmergency,
  onRespondEmergency,
  onCreateEmergency,
  onRetry
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Show 6 skeleton cards for better UX */}
        {[...Array(6)].map((_, index) => (
          <EmergencyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-white rounded-xl border border-gray-200">
        <ErrorMessage
          title="Failed to load emergency requests"
          message={error}
          onRetry={onRetry}
        />
      </div>
    );
  }

  if (emergencies.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-xl shadow-sm">
        <BloodDropIllustration />
        <EmptyState
          title="No emergency requests found"
          description="Be the first to save lives in your area"
          action={onCreateEmergency}
          actionLabel={
            <span className="flex items-center gap-2">
              <Zap size={18} />
              Create Emergency Request
            </span>
          }
        />
        {bloodTypeFilter !== 'All' && (
          <p className="text-sm text-gray-400 mt-2">Try changing your blood type filter</p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {emergencies.map((emergency) => (
        <EmergencyCard
          key={emergency.id}
          emergency={emergency}
          hasResponded={respondedEmergencies.includes(emergency.id)}
          onSelect={onSelectEmergency}
          onRespond={onRespondEmergency}
        />
      ))}
    </div>
  );
});

EmergencyList.displayName = 'EmergencyList';

EmergencyList.propTypes = {
  emergencies: PropTypes.arrayOf(PropTypes.object).isRequired,
  respondedEmergencies: PropTypes.arrayOf(PropTypes.string).isRequired,
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  bloodTypeFilter: PropTypes.string.isRequired,
  onSelectEmergency: PropTypes.func.isRequired,
  onRespondEmergency: PropTypes.func.isRequired,
  onCreateEmergency: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired
};

export default EmergencyList;
