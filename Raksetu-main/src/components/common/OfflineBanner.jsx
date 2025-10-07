import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertCircle, Cloud, CloudOff } from 'lucide-react';
import { onSyncEvent, hasPendingSync } from '../../utils/offlineSync';
import { getOfflineStats } from '../../utils/offlineStorage';

/**
 * Offline Status Banner
 * Shows offline status and sync progress at the top of the app
 */
const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [hasPending, setHasPending] = useState(false);
  const [stats, setStats] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineBanner] Online');
      setIsOnline(true);
    };

    const handleOffline = () => {
      console.log('[OfflineBanner] Offline');
      setIsOnline(false);
      loadStats();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load initial state
    checkPending();
    if (!isOnline) {
      loadStats();
    }

    // Setup sync event listener
    onSyncEvent((event) => {
      if (event.type === 'sync_start') {
        setIsSyncing(true);
        setSyncStatus('Syncing offline data...');
      } else if (event.type === 'sync_complete') {
        setIsSyncing(false);
        setSyncStatus(`✅ Synced ${event.successCount} items`);
        setHasPending(false);
        setTimeout(() => setSyncStatus(null), 3000);
      } else if (event.type === 'sync_error') {
        setIsSyncing(false);
        setSyncStatus('❌ Sync failed');
        setTimeout(() => setSyncStatus(null), 3000);
      }
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOnline]);

  const checkPending = async () => {
    const pending = await hasPendingSync();
    setHasPending(pending);
  };

  const loadStats = async () => {
    const offlineStats = await getOfflineStats();
    setStats(offlineStats);
  };

  // Don't show banner if online and no pending sync
  if (isOnline && !hasPending && !isSyncing && !syncStatus) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      >
        <div className="pointer-events-auto">
          {/* Offline Status */}
          {!isOnline && (
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <WifiOff className="w-5 h-5 animate-pulse" />
                    <div>
                      <p className="font-semibold">You're offline</p>
                      <p className="text-sm text-white/90">
                        {stats ? (
                          <>
                            Viewing {stats.donations || 0} cached donations, {stats.emergencies || 0} emergencies
                          </>
                        ) : (
                          'Using cached data'
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm"
                  >
                    {showDetails ? 'Hide' : 'Details'}
                  </button>
                </div>

                {showDetails && stats && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm"
                  >
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="text-white/70">Profile Data</p>
                      <p className="font-semibold">{stats.profile || 0} cached</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="text-white/70">Donations</p>
                      <p className="font-semibold">{stats.donations || 0} cached</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="text-white/70">Emergencies</p>
                      <p className="font-semibold">{stats.emergencies || 0} cached</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2">
                      <p className="text-white/70">Pending Sync</p>
                      <p className="font-semibold">{stats.sync_queue || 0} items</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Syncing Status */}
          {isSyncing && (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg">
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <div>
                    <p className="font-semibold">Syncing data</p>
                    <p className="text-sm text-white/90">
                      {syncStatus || 'Uploading offline changes...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sync Complete / Error */}
          {syncStatus && !isSyncing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`${
                syncStatus.includes('✅') 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              } text-white shadow-lg`}
            >
              <div className="container mx-auto px-4 py-3">
                <div className="flex items-center gap-3">
                  {syncStatus.includes('✅') ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <p className="font-semibold">{syncStatus}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Pending Sync Indicator (when online but has pending) */}
          {isOnline && hasPending && !isSyncing && !syncStatus && (
            <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
              <div className="container mx-auto px-4 py-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Cloud className="w-5 h-5" />
                    <p className="text-sm font-medium">
                      You have offline changes waiting to sync
                    </p>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors text-sm flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Sync Now
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineBanner;
