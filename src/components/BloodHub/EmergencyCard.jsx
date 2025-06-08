import { MapPin, Clock, Droplets, Building2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function EmergencyCard({ 
  emergency, 
  onClick, 
  compact = false,
  className = '',
  ...props 
}) {
  // State to store the formatted "time ago" string
  const [timeAgo, setTimeAgo] = useState('');

  // Enhanced urgency styling with animations and improved colors
  const getUrgencyStyles = (urgency) => {
    const baseStyles = 'font-semibold text-xs px-3 py-1.5 rounded-full border transition-all duration-200';
    
    switch (urgency?.toLowerCase()) {
      case 'critical':
        return `${baseStyles} bg-red-50 text-red-700 border-red-200 shadow-red-100 shadow-sm animate-pulse`;
      case 'high':
        return `${baseStyles} bg-orange-50 text-orange-700 border-orange-200 shadow-orange-100 shadow-sm`;
      case 'medium':
        return `${baseStyles} bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100 shadow-sm`;
      case 'low':
        return `${baseStyles} bg-green-50 text-green-700 border-green-200 shadow-green-100 shadow-sm`;
      default:
        return `${baseStyles} bg-blue-50 text-blue-700 border-blue-200 shadow-blue-100 shadow-sm`;
    }
  };

  // Blood type styling with proper colors
  const getBloodTypeStyles = (bloodType) => {
    const isRareType = ['AB-', 'AB+', 'O-'].includes(bloodType);
    return isRareType 
      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200' 
      : 'bg-gradient-to-br from-red-400 to-red-500 text-white shadow-md shadow-red-200';
  };

  // Format time ago
  const formatTimeAgo = (timeString) => {
    // Return 'Unknown' if timeString is not a string or is empty
    if (!timeString || typeof timeString !== 'string') return 'Unknown';
    
    // If it's already formatted (like "2h ago"), return as is
    if (timeString.includes('ago') || timeString.includes('min') || timeString.includes('hour')) {
      return timeString;
    }
    
    // Otherwise, assume it's a timestamp and format it
    try {
      const date = new Date(timeString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${Math.floor(diffHours / 24)}d ago`;
    } catch {
      return timeString;
    }
  };

  // Update the "time ago" string every minute
  useEffect(() => {
    // Initial calculation
    setTimeAgo(formatTimeAgo(emergency?.timePosted));

    // Set up an interval to update every minute
    const intervalId = setInterval(() => {
      setTimeAgo(formatTimeAgo(emergency?.timePosted));
    }, 60000); // Update every 60 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [emergency?.timePosted]); // Re-run if timePosted changes

  // Validate emergency data
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

  return (
    <article
      className={`
        group relative bg-white rounded-2xl border border-gray-200 shadow-sm 
        hover:shadow-lg hover:border-gray-300 hover:-translate-y-0.5
        transition-all duration-300 ease-out cursor-pointer
        ${compact ? 'p-4' : 'p-6'}
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
      aria-label={`Emergency blood request: ${bloodType} needed at ${hospital}`}
      {...props}
    >
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
      <header className="flex justify-between items-start mb-4">
        <div className={`flex items-center ${compact ? 'gap-3' : 'gap-4'}`}>
          {/* Blood type badge */}
          <div 
            className={`
              ${getBloodTypeStyles(bloodType)}
              ${compact ? 'h-12 w-12 text-base' : 'h-14 w-14 text-lg'}
              rounded-2xl flex items-center justify-center font-bold
              transform group-hover:scale-105 transition-transform duration-200
            `}
            aria-label={`Blood type ${bloodType}`}
          >
            <Droplets size={compact ? 16 : 18} className="mr-1" />
            {bloodType}
          </div>
          
          {/* Hospital info */}
          <div className="min-w-0 flex-1">
            <h3 className={`
              font-semibold text-gray-900 truncate
              ${compact ? 'text-base' : 'text-lg'}
            `}>
              <Building2 size={compact ? 14 : 16} className="inline mr-2 text-gray-600" />
              {hospital}
            </h3>
            <p className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin size={12} className="mr-1.5 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </p>
          </div>
        </div>

        {/* Urgency badge */}
        <div className="flex-shrink-0 ml-3">
          <span className={getUrgencyStyles(urgency)}>
            {urgency}
          </span>
        </div>
      </header>

      {/* Stats grid */}
      <div className={`
        grid grid-cols-3 gap-4 pt-4 border-t border-gray-100
        ${compact ? 'text-sm' : ''}
      `}>
        <div className="text-center group/stat">
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            Units Needed
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-red-600 transition-colors">
            {units}
          </div>
        </div>
        
        <div className="text-center group/stat">
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1">
            Distance
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-blue-600 transition-colors">
            {distance}
          </div>
        </div>
        
        <div className="text-center group/stat">
          <div className="text-gray-500 text-xs font-medium uppercase tracking-wide mb-1 flex items-center justify-center">
            <Clock size={10} className="mr-1" />
            Posted
          </div>
          <div className="font-bold text-gray-900 group-hover/stat:text-green-600 transition-colors">
            {timeAgo} {/* Use the state variable that updates in real-time */}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </article>
  );
}