import { MapPin, Clock, Droplets, Building2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDistance } from '../utils/geolocation';

export default function EmergencyCard({ 
  emergency, 
  onClick, 
  hasResponded = false,
  compact = false,
  className = '',
  ...props 
}) {
  const [timeAgo, setTimeAgo] = useState('');

  // Urgency styling
  const getUrgencyStyles = (urgency) => {
    const baseStyles = 'font-semibold text-xs px-3 py-1.5 rounded-full border transition-all duration-200';
    
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return `${baseStyles} bg-red-50 text-red-700 border-red-200 shadow-sm animate-pulse`;
      case 'high':
        return `${baseStyles} bg-orange-50 text-orange-700 border-orange-200 shadow-sm`;
      case 'medium':
        return `${baseStyles} bg-amber-50 text-amber-700 border-amber-200 shadow-sm`;
      case 'low':
        return `${baseStyles} bg-green-50 text-green-700 border-green-200 shadow-sm`;
      default:
        return `${baseStyles} bg-blue-50 text-blue-700 border-blue-200 shadow-sm`;
    }
  };

  // Blood type styling
  const getBloodTypeStyles = (bloodType) => {
    const isRareType = ['AB-', 'AB+', 'O-'].includes(bloodType);
    return isRareType 
      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg' 
      : 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md';
  };

  // Format time ago
  const formatTimeAgo = (timeData) => {
    if (!timeData) return 'Unknown';
    
    try {
      let date;
      
      // Handle Firebase Timestamp object
      if (timeData?.toDate && typeof timeData.toDate === 'function') {
        date = timeData.toDate();
      }
      // Handle Firebase Timestamp with seconds
      else if (timeData?.seconds) {
        date = new Date(timeData.seconds * 1000);
      }
      // Handle string format
      else if (typeof timeData === 'string') {
        // If already formatted (e.g., "5m ago"), return as is
        if (timeData.includes('ago') || timeData.includes('min') || timeData.includes('hour')) {
          return timeData;
        }
        date = new Date(timeData);
      }
      // Handle Date object or timestamp number
      else if (timeData instanceof Date) {
        date = timeData;
      }
      else if (typeof timeData === 'number') {
        date = new Date(timeData);
      }
      else {
        return 'Unknown';
      }
      
      // Calculate time difference
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      // Format as date for older posts
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = String(date.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Unknown';
    }
  };

  useEffect(() => {
    // Try both timestamp and timePosted fields
    const timeData = emergency?.timestamp || emergency?.timePosted || emergency?.createdAt;
    setTimeAgo(formatTimeAgo(timeData));
    const intervalId = setInterval(() => {
      setTimeAgo(formatTimeAgo(timeData));
    }, 60000);
    return () => clearInterval(intervalId);
  }, [emergency?.timestamp, emergency?.timePosted, emergency?.createdAt]);

  if (!emergency) {
    return (
      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center text-gray-500">
        <p>Emergency data unavailable</p>
      </div>
    );
  }

  const {
    bloodType = 'Unknown',
    hospital = 'Unknown Hospital',
    location = 'Location not specified',
    urgency = 'Unknown',
    units = 'N/A',
    distance = 'N/A',
    timePosted = 'Unknown'
  } = emergency;

  const formattedDistance = formatDistance(distance);

  return (
    <article
      className={`
        group relative bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-sm 
        hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5
        transition-all duration-300 ease-out cursor-pointer
        ${compact ? 'p-3 sm:p-4' : 'p-4 sm:p-5 md:p-6'}
        ${hasResponded ? 'opacity-75 ring-2 ring-green-500 ring-opacity-50' : ''}
        ${className}
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(emergency);
        }
      }}
      aria-label={`Emergency blood request: ${bloodType} needed at ${hospital}${hasResponded ? ' - You have responded' : ''}`}
      {...props}
    >
      {/* Already Responded Overlay */}
      {hasResponded && (
        <div className="absolute inset-0 bg-green-900/15 rounded-2xl flex items-center justify-center z-10 pointer-events-none">
          <div className="bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg border-2 border-green-500 flex items-center gap-2 sm:gap-3 transform scale-95 sm:scale-100">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-green-900 text-sm sm:text-base">Already Responded</p>
              <p className="text-xs text-green-700 hidden sm:block">You've committed to this emergency</p>
            </div>
          </div>
        </div>
      )}

      {/* Urgency indicator stripe */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${
          urgency?.toLowerCase() === 'critical' ? 'bg-red-500' :
          urgency?.toLowerCase() === 'high' ? 'bg-orange-500' :
          urgency?.toLowerCase() === 'medium' ? 'bg-amber-500' :
          'bg-blue-500'
        }`}
      />

      {/* Header */}
      <header className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className={`flex items-center ${compact ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-4'} min-w-0 flex-1`}>
          {/* Blood type badge */}
          <div 
            className={`
              ${getBloodTypeStyles(bloodType)}
              ${compact ? 'h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base' : 'h-12 w-12 sm:h-14 sm:w-14 text-base sm:text-lg'}
              rounded-xl sm:rounded-2xl flex items-center justify-center font-bold flex-shrink-0
              transform group-hover:scale-105 transition-transform duration-200
            `}
            aria-label={`Blood type ${bloodType}`}
          >
            <Droplets size={compact ? 14 : 16} className="mr-0.5 sm:mr-1" />
            {bloodType}
          </div>
          
          {/* Hospital info */}
          <div className="min-w-0 flex-1">
            <h3 className={`
              font-semibold text-gray-900 truncate
              ${compact ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}
            `}>
              <Building2 size={compact ? 12 : 14} className="inline mr-1 sm:mr-2 text-gray-600" />
              {hospital}
            </h3>
            <p className="flex items-center text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              <MapPin size={10} className="mr-1 sm:mr-1.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>
        </div>

        {/* Urgency badge */}
        <div className="flex-shrink-0">
          <span className={getUrgencyStyles(urgency)}>
            {urgency}
          </span>
        </div>
      </header>

      {/* Stats grid */}
      <div className={`
        grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 pt-3 sm:pt-4 border-t border-gray-100
        ${compact ? 'text-xs sm:text-sm' : 'text-sm'}
      `}>
        <div className="text-center group/stat">
          <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">
            Units
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-red-600 transition-colors text-sm sm:text-base">
            {units}
          </div>
        </div>
        
        <div className="text-center group/stat">
          <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1">
            Distance
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-blue-600 transition-colors text-sm sm:text-base">
            {formattedDistance}
          </div>
        </div>
        
        <div className="text-center group/stat">
          <div className="text-gray-500 text-[10px] sm:text-xs font-medium uppercase tracking-wide mb-0.5 sm:mb-1 flex items-center justify-center">
            <Clock size={8} className="mr-0.5 sm:mr-1" />
            Posted
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-green-600 transition-colors text-sm sm:text-base">
            {timeAgo}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
}