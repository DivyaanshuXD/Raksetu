import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { getCacheStats, formatCacheAge } from '../../utils/offlineCache';
import PropTypes from 'prop-types';

/**
 * Offline Indicator Component
 * 
 * Displays online/offline status with cache information
 * Shows when user is offline and using cached data
 */
const OfflineIndicator = ({ onRefresh, showDetails = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheStats, setCacheStats] = useState(null);
  const [showCacheInfo, setShowCacheInfo] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineIndicator] Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[OfflineIndicator] Offline');
      setIsOnline(false);
      // Load cache stats when going offline
      setCacheStats(getCacheStats());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial cache stats
    setCacheStats(getCacheStats());

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(getCacheStats());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleRefreshClick = () => {
    if (onRefresh && isOnline) {
      onRefresh();
    }
  };

  // Don't show indicator if online and not showing details
  if (isOnline && !showDetails) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main Status Badge */}
      <div
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full shadow-lg
          transition-all duration-300 cursor-pointer
          ${isOnline 
            ? 'bg-green-50 border-2 border-green-500 text-green-700' 
            : 'bg-red-50 border-2 border-red-500 text-red-700 animate-pulse'
          }
        `}
        onClick={() => setShowCacheInfo(!showCacheInfo)}
        role="button"
        tabIndex={0}
        aria-label={isOnline ? t('common.online') : t('common.offline')}
      >
        {isOnline ? (
          <Wifi size={18} className="text-green-600" />
        ) : (
          <WifiOff size={18} className="text-red-600" />
        )}
        
        <span className="text-sm font-semibold">
          {isOnline ? t('common.online') : t('common.offline')}
        </span>

        {isOnline && onRefresh && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefreshClick();
            }}
            className="ml-2 p-1 rounded-full hover:bg-green-100 transition-colors"
            aria-label={t('common.refresh')}
          >
            <RefreshCw size={14} className="text-green-600" />
          </button>
        )}
      </div>

      {/* Cache Details Popup */}
      {showCacheInfo && !isOnline && cacheStats && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-800 flex items-center">
                <WifiOff size={16} className="mr-2 text-red-600" />
                {t('common.offline_mode')}
              </h4>
              <button
                onClick={() => setShowCacheInfo(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {t('common.using_cached_data')}
            </p>
          </div>

          <div className="p-4 space-y-3">
            {/* Last Sync */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">{t('common.last_sync')}:</span>
              <span className="font-medium text-gray-800">
                {formatCacheAge(cacheStats.lastSync)}
              </span>
            </div>

            {/* Medical Resources */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t('medical_resources.title')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  cacheStats.medicalResources.valid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {cacheStats.medicalResources.valid ? t('common.valid') : t('common.expired')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{cacheStats.medicalResources.count} {t('common.items')}</span>
                <span>{formatCacheAge(cacheStats.lastSync - cacheStats.medicalResources.age)}</span>
              </div>
            </div>

            {/* Blood Banks */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t('common.blood_banks')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  cacheStats.bloodBanks.valid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {cacheStats.bloodBanks.valid ? t('common.valid') : t('common.expired')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{cacheStats.bloodBanks.count} {t('common.items')}</span>
                <span>{formatCacheAge(cacheStats.lastSync - cacheStats.bloodBanks.age)}</span>
              </div>
            </div>

            {/* Emergency Alerts */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {t('emergency.title')}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  cacheStats.emergencyAlerts.valid 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {cacheStats.emergencyAlerts.valid ? t('common.valid') : t('common.expired')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>{cacheStats.emergencyAlerts.count} {t('common.items')}</span>
                <span>{formatCacheAge(cacheStats.lastSync - cacheStats.emergencyAlerts.age)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-3 text-xs text-gray-600 text-center border-t border-gray-200">
            {t('common.cache_info_note')}
          </div>
        </div>
      )}
    </div>
  );
};

OfflineIndicator.propTypes = {
  onRefresh: PropTypes.func,
  showDetails: PropTypes.bool
};

export default OfflineIndicator;
