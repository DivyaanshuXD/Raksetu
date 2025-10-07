/**
 * EmergencyCardSkeleton Component
 * Loading placeholder for emergency cards - provides instant perceived performance
 */

import React from 'react';

const EmergencyCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Urgency Badge Skeleton */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
        <div className="h-5 bg-gray-200 rounded w-16"></div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 space-y-4">
        {/* Patient Name */}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>

        {/* Hospital Name */}
        <div className="flex items-start gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded mt-0.5"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>

        {/* Blood Type and Units */}
        <div className="flex gap-4">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <div className="h-5 w-5 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        </div>

        {/* Distance and Compatibility */}
        <div className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>

        {/* Impact Badge */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-40"></div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyCardSkeleton;
