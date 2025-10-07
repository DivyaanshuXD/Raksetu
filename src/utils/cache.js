/**
 * Cache Utility for Raksetu
 * Implements intelligent caching for instant loading during emergencies
 * 
 * CRITICAL: Emergency data MUST load instantly, even on slow networks
 * Strategy: In-memory cache + IndexedDB fallback + stale-while-revalidate
 */

class CacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.dbName = 'raksetu-cache';
    this.storeName = 'emergency-data';
    this.db = null;
    this.initDB();
  }

  /**
   * Initialize IndexedDB for persistent caching
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[Cache] IndexedDB initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('[Cache] Object store created');
        }
      };
    });
  }

  /**
   * Get cached data with automatic stale check
   * @param {string} key - Cache key
   * @param {number} maxAge - Maximum age in milliseconds (default: 30 seconds for emergencies)
   * @returns {Promise<any>} Cached data or null
   */
  async get(key, maxAge = 30000) {
    // Check memory cache first (FASTEST)
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() - memoryData.timestamp < maxAge) {
      console.log('[Cache] Memory cache HIT:', key);
      return memoryData.data;
    }

    // Check IndexedDB (FAST)
    try {
      if (!this.db) await this.initDB();
      
      const data = await this.getFromDB(key);
      if (data && Date.now() - data.timestamp < maxAge) {
        console.log('[Cache] IndexedDB cache HIT:', key);
        // Also store in memory for next time
        this.memoryCache.set(key, data);
        return data.data;
      }
    } catch (error) {
      console.error('[Cache] IndexedDB read error:', error);
    }

    console.log('[Cache] Cache MISS:', key);
    return null;
  }

  /**
   * Set cached data in both memory and IndexedDB
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @returns {Promise<void>}
   */
  async set(key, data) {
    const cacheEntry = {
      key,
      data,
      timestamp: Date.now()
    };

    // Store in memory (instant access)
    this.memoryCache.set(key, cacheEntry);

    // Store in IndexedDB (persistent)
    try {
      if (!this.db) await this.initDB();
      await this.setInDB(cacheEntry);
      console.log('[Cache] Data cached:', key);
    } catch (error) {
      console.error('[Cache] IndexedDB write error:', error);
    }
  }

  /**
   * Get data from IndexedDB
   */
  getFromDB(key) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Set data in IndexedDB
   */
  setInDB(data) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all cache
   */
  async clear() {
    this.memoryCache.clear();
    
    if (this.db) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => {
          console.log('[Cache] All cache cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
      });
    }
  }

  /**
   * Clear old entries (older than 1 hour)
   */
  async clearOld(maxAge = 3600000) {
    const cutoffTime = Date.now() - maxAge;

    // Clear memory cache
    for (const [key, value] of this.memoryCache.entries()) {
      if (value.timestamp < cutoffTime) {
        this.memoryCache.delete(key);
      }
    }

    // Clear IndexedDB
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffTime);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          console.log('[Cache] Old entries cleared');
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get cache size (for debugging)
   */
  getSize() {
    return {
      memory: this.memoryCache.size,
      // IndexedDB size requires async query
    };
  }
}

// Singleton instance
const cacheManager = new CacheManager();

// Clear old cache every 10 minutes
setInterval(() => {
  cacheManager.clearOld();
}, 600000);

export default cacheManager;

/**
 * Wrapper for cached Firestore queries
 * Implements stale-while-revalidate pattern
 */
export const cachedQuery = async (key, queryFn, maxAge = 30000) => {
  // Try cache first
  const cachedData = await cacheManager.get(key, maxAge);
  
  if (cachedData) {
    // Return cached data immediately
    // Fetch fresh data in background
    queryFn().then(freshData => {
      cacheManager.set(key, freshData);
    }).catch(error => {
      console.warn('[Cache] Background refresh failed:', error);
    });
    
    return cachedData;
  }

  // No cache - fetch fresh data
  try {
    const freshData = await queryFn();
    await cacheManager.set(key, freshData);
    return freshData;
  } catch (error) {
    console.error('[Cache] Query failed:', error);
    throw error;
  }
};
