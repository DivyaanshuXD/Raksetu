/**
 * Offline Resource Cache Utility
 * 
 * Provides offline access to medical resources and blood bank data
 * using localStorage with automatic cache invalidation.
 * 
 * Features:
 * - Cache medical resources and blood banks
 * - Search cached data when offline
 * - Automatic cache expiration (24 hours default)
 * - Cache version management
 * - Sync status tracking
 */

const CACHE_VERSION = '1.0.0';
const CACHE_KEYS = {
  MEDICAL_RESOURCES: 'raksetu_medical_resources',
  BLOOD_BANKS: 'raksetu_blood_banks',
  EMERGENCY_ALERTS: 'raksetu_emergency_alerts',
  LAST_SYNC: 'raksetu_last_sync',
  VERSION: 'raksetu_cache_version'
};

// Default cache expiration: 24 hours
const DEFAULT_CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Initialize cache with version check
 */
export const initializeCache = () => {
  try {
    const cachedVersion = localStorage.getItem(CACHE_KEYS.VERSION);
    
    // Clear cache if version mismatch
    if (cachedVersion !== CACHE_VERSION) {
      console.log('[OfflineCache] Version mismatch - clearing cache');
      clearCache();
      localStorage.setItem(CACHE_KEYS.VERSION, CACHE_VERSION);
    }
  } catch (error) {
    console.error('[OfflineCache] Initialization error:', error);
  }
};

/**
 * Save medical resources to cache
 */
export const cacheMedicalResources = (resources) => {
  try {
    const cacheData = {
      data: resources,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    
    localStorage.setItem(CACHE_KEYS.MEDICAL_RESOURCES, JSON.stringify(cacheData));
    updateLastSync();
    
    console.log(`[OfflineCache] Cached ${resources.length} medical resources`);
    return true;
  } catch (error) {
    console.error('[OfflineCache] Error caching medical resources:', error);
    return false;
  }
};

/**
 * Save blood banks to cache
 */
export const cacheBloodBanks = (bloodBanks) => {
  try {
    const cacheData = {
      data: bloodBanks,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    
    localStorage.setItem(CACHE_KEYS.BLOOD_BANKS, JSON.stringify(cacheData));
    updateLastSync();
    
    console.log(`[OfflineCache] Cached ${bloodBanks.length} blood banks`);
    return true;
  } catch (error) {
    console.error('[OfflineCache] Error caching blood banks:', error);
    return false;
  }
};

/**
 * Save emergency alerts to cache
 */
export const cacheEmergencyAlerts = (alerts) => {
  try {
    const cacheData = {
      data: alerts,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    
    localStorage.setItem(CACHE_KEYS.EMERGENCY_ALERTS, JSON.stringify(cacheData));
    updateLastSync();
    
    console.log(`[OfflineCache] Cached ${alerts.length} emergency alerts`);
    return true;
  } catch (error) {
    console.error('[OfflineCache] Error caching emergency alerts:', error);
    return false;
  }
};

/**
 * Get cached medical resources
 */
export const getCachedMedicalResources = (maxAge = DEFAULT_CACHE_DURATION) => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.MEDICAL_RESOURCES);
    
    if (!cached) {
      console.log('[OfflineCache] No cached medical resources found');
      return null;
    }
    
    const cacheData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - cacheData.timestamp > maxAge) {
      console.log('[OfflineCache] Medical resources cache expired');
      return null;
    }
    
    console.log(`[OfflineCache] Retrieved ${cacheData.data.length} cached medical resources`);
    return cacheData.data;
  } catch (error) {
    console.error('[OfflineCache] Error retrieving cached medical resources:', error);
    return null;
  }
};

/**
 * Get cached blood banks
 */
export const getCachedBloodBanks = (maxAge = DEFAULT_CACHE_DURATION) => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.BLOOD_BANKS);
    
    if (!cached) {
      console.log('[OfflineCache] No cached blood banks found');
      return null;
    }
    
    const cacheData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - cacheData.timestamp > maxAge) {
      console.log('[OfflineCache] Blood banks cache expired');
      return null;
    }
    
    console.log(`[OfflineCache] Retrieved ${cacheData.data.length} cached blood banks`);
    return cacheData.data;
  } catch (error) {
    console.error('[OfflineCache] Error retrieving cached blood banks:', error);
    return null;
  }
};

/**
 * Get cached emergency alerts
 */
export const getCachedEmergencyAlerts = (maxAge = DEFAULT_CACHE_DURATION) => {
  try {
    const cached = localStorage.getItem(CACHE_KEYS.EMERGENCY_ALERTS);
    
    if (!cached) {
      console.log('[OfflineCache] No cached emergency alerts found');
      return null;
    }
    
    const cacheData = JSON.parse(cached);
    
    // Check if cache is expired
    if (Date.now() - cacheData.timestamp > maxAge) {
      console.log('[OfflineCache] Emergency alerts cache expired');
      return null;
    }
    
    console.log(`[OfflineCache] Retrieved ${cacheData.data.length} cached emergency alerts`);
    return cacheData.data;
  } catch (error) {
    console.error('[OfflineCache] Error retrieving cached emergency alerts:', error);
    return null;
  }
};

/**
 * Search cached medical resources
 */
export const searchCachedMedicalResources = (query) => {
  const resources = getCachedMedicalResources();
  
  if (!resources || !query) {
    return resources || [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  return resources.filter(resource => 
    resource.name?.toLowerCase().includes(lowerQuery) ||
    resource.type?.toLowerCase().includes(lowerQuery) ||
    resource.address?.toLowerCase().includes(lowerQuery) ||
    resource.specialties?.some(s => s.toLowerCase().includes(lowerQuery))
  );
};

/**
 * Search cached blood banks
 */
export const searchCachedBloodBanks = (query) => {
  const bloodBanks = getCachedBloodBanks();
  
  if (!bloodBanks || !query) {
    return bloodBanks || [];
  }
  
  const lowerQuery = query.toLowerCase();
  
  return bloodBanks.filter(bank => 
    bank.name?.toLowerCase().includes(lowerQuery) ||
    bank.address?.toLowerCase().includes(lowerQuery) ||
    bank.city?.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get last sync timestamp
 */
export const getLastSync = () => {
  try {
    const lastSync = localStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return lastSync ? parseInt(lastSync, 10) : null;
  } catch (error) {
    console.error('[OfflineCache] Error getting last sync:', error);
    return null;
  }
};

/**
 * Update last sync timestamp
 */
const updateLastSync = () => {
  try {
    localStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('[OfflineCache] Error updating last sync:', error);
  }
};

/**
 * Check if cache exists and is valid
 */
export const isCacheValid = (cacheKey, maxAge = DEFAULT_CACHE_DURATION) => {
  try {
    const cached = localStorage.getItem(cacheKey);
    
    if (!cached) return false;
    
    const cacheData = JSON.parse(cached);
    return Date.now() - cacheData.timestamp <= maxAge;
  } catch (error) {
    console.error('[OfflineCache] Error checking cache validity:', error);
    return false;
  }
};

/**
 * Clear all cache
 */
export const clearCache = () => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      if (key !== CACHE_KEYS.VERSION) {
        localStorage.removeItem(key);
      }
    });
    
    console.log('[OfflineCache] All cache cleared');
    return true;
  } catch (error) {
    console.error('[OfflineCache] Error clearing cache:', error);
    return false;
  }
};

/**
 * Clear specific cache by key
 */
export const clearCacheByKey = (cacheKey) => {
  try {
    localStorage.removeItem(cacheKey);
    console.log(`[OfflineCache] Cleared cache: ${cacheKey}`);
    return true;
  } catch (error) {
    console.error(`[OfflineCache] Error clearing cache ${cacheKey}:`, error);
    return false;
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  try {
    const stats = {
      version: localStorage.getItem(CACHE_KEYS.VERSION),
      lastSync: getLastSync(),
      medicalResources: {
        count: 0,
        age: null,
        valid: false
      },
      bloodBanks: {
        count: 0,
        age: null,
        valid: false
      },
      emergencyAlerts: {
        count: 0,
        age: null,
        valid: false
      }
    };
    
    // Medical resources stats
    const medicalCache = localStorage.getItem(CACHE_KEYS.MEDICAL_RESOURCES);
    if (medicalCache) {
      const data = JSON.parse(medicalCache);
      stats.medicalResources.count = data.data?.length || 0;
      stats.medicalResources.age = Date.now() - data.timestamp;
      stats.medicalResources.valid = stats.medicalResources.age <= DEFAULT_CACHE_DURATION;
    }
    
    // Blood banks stats
    const bloodBanksCache = localStorage.getItem(CACHE_KEYS.BLOOD_BANKS);
    if (bloodBanksCache) {
      const data = JSON.parse(bloodBanksCache);
      stats.bloodBanks.count = data.data?.length || 0;
      stats.bloodBanks.age = Date.now() - data.timestamp;
      stats.bloodBanks.valid = stats.bloodBanks.age <= DEFAULT_CACHE_DURATION;
    }
    
    // Emergency alerts stats
    const alertsCache = localStorage.getItem(CACHE_KEYS.EMERGENCY_ALERTS);
    if (alertsCache) {
      const data = JSON.parse(alertsCache);
      stats.emergencyAlerts.count = data.data?.length || 0;
      stats.emergencyAlerts.age = Date.now() - data.timestamp;
      stats.emergencyAlerts.valid = stats.emergencyAlerts.age <= DEFAULT_CACHE_DURATION;
    }
    
    return stats;
  } catch (error) {
    console.error('[OfflineCache] Error getting cache stats:', error);
    return null;
  }
};

/**
 * Check if user is online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Format cache age for display
 */
export const formatCacheAge = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const age = Date.now() - timestamp;
  const minutes = Math.floor(age / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Export cache keys for external use
export { CACHE_KEYS, DEFAULT_CACHE_DURATION };

// Initialize cache on module load
initializeCache();
