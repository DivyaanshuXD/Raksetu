import React from 'react';
import { Star, Sparkles } from 'lucide-react';

const ProfileBadge = React.memo(({ type = 'featured', expiresAt, size = 'medium' }) => {
  if (!type) return null;

  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  const iconSizes = {
    small: 14,
    medium: 18,
    large: 24
  };

  const badgeConfig = {
    featured: {
      icon: Star,
      gradient: 'from-amber-400 via-yellow-500 to-orange-500',
      ring: 'ring-yellow-300',
      glow: 'shadow-yellow-500/50',
      label: 'Featured Member',
      description: 'This user has achieved featured status'
    },
    priority: {
      icon: Sparkles,
      gradient: 'from-purple-400 via-pink-500 to-red-500',
      ring: 'ring-purple-300',
      glow: 'shadow-purple-500/50',
      label: 'Priority Access',
      description: 'This user has priority registration access'
    },
    vip: {
      icon: Star,
      gradient: 'from-indigo-400 via-purple-500 to-pink-500',
      ring: 'ring-indigo-300',
      glow: 'shadow-indigo-500/50',
      label: 'VIP Member',
      description: 'This user has VIP status'
    }
  };

  const config = badgeConfig[type] || badgeConfig.featured;
  const IconComponent = config.icon;

  return (
    <div className="inline-flex items-center justify-center group relative">
      {/* Badge */}
      <div 
        className={`
          ${sizeClasses[size]} 
          bg-gradient-to-br ${config.gradient}
          rounded-full 
          flex items-center justify-center
          ring-2 ${config.ring}
          shadow-lg ${config.glow}
          transition-all duration-300
          group-hover:scale-110
          group-hover:shadow-xl
          animate-pulse-slow
        `}
      >
        <IconComponent 
          size={iconSizes[size]} 
          className="text-white drop-shadow-lg" 
          fill="currentColor"
        />
      </div>

      {/* Sparkle effect */}
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Sparkles size={12} className="text-yellow-400 animate-spin-slow" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <div className="font-bold mb-0.5">{config.label}</div>
          <div className="text-gray-300 text-[10px]">{config.description}</div>
          {expiresAt && (
            <div className="text-gray-400 text-[10px] mt-1">
              Valid until: {new Date(expiresAt).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </div>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileBadge;
