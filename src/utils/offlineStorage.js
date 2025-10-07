/**
 * Offline Storage Manager
 * Manages offline data storage for donations, profile, and sync queue
 */

const DB_NAME = 'raksetu_offline';
const DB_VERSION = 1;

// Store names
const STORES = {
  PROFILE: 'profile',
  DONATIONS: 'donations',
  SYNC_QUEUE: 'sync_queue',
  EMERGENCIES: 'emergencies'
};

class OfflineStorageManager {
  constructor() {
    this.db = null;
    this.initPromise = this.init();
  }

  /**
   * Initialize IndexedDB
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        console.log('[OfflineStorage] Database initialized');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Profile store
        if (!db.objectStoreNames.contains(STORES.PROFILE)) {
          db.createObjectStore(STORES.PROFILE, { keyPath: 'userId' });
        }

        // Donations store
        if (!db.objectStoreNames.contains(STORES.DONATIONS)) {
          const donationsStore = db.createObjectStore(STORES.DONATIONS, { keyPath: 'id' });
          donationsStore.createIndex('userId', 'userId', { unique: false });
          donationsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
          const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        // Emergencies store
        if (!db.objectStoreNames.contains(STORES.EMERGENCIES)) {
          const emergenciesStore = db.createObjectStore(STORES.EMERGENCIES, { keyPath: 'id' });
          emergenciesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        console.log('[OfflineStorage] Database upgraded to version', DB_VERSION);
      };
    });
  }

  /**
   * Ensure database is initialized
   */
  async ensureInit() {
    if (!this.db) {
      await this.initPromise;
    }
    return this.db;
  }

  // ============================================
  // PROFILE OPERATIONS
  // ============================================

  /**
   * Save user profile offline
   */
  async saveProfile(userId, profileData) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PROFILE], 'readwrite');
      const store = transaction.objectStore(STORES.PROFILE);

      const data = {
        userId,
        ...profileData,
        cachedAt: new Date().toISOString()
      };

      const request = store.put(data);
      request.onsuccess = () => {
        console.log('[OfflineStorage] Profile saved:', userId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get user profile from offline storage
   */
  async getProfile(userId) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.PROFILE], 'readonly');
      const store = transaction.objectStore(STORES.PROFILE);
      const request = store.get(userId);

      request.onsuccess = () => {
        if (request.result) {
          console.log('[OfflineStorage] Profile loaded from cache:', userId);
          resolve(request.result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // DONATIONS OPERATIONS
  // ============================================

  /**
   * Save multiple donations
   */
  async saveDonations(userId, donations) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.DONATIONS], 'readwrite');
      const store = transaction.objectStore(STORES.DONATIONS);

      donations.forEach(donation => {
        store.put({
          ...donation,
          userId,
          cachedAt: new Date().toISOString()
        });
      });

      transaction.oncomplete = () => {
        console.log(`[OfflineStorage] ${donations.length} donations saved for user:`, userId);
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get user's donations from offline storage
   */
  async getDonations(userId) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.DONATIONS], 'readonly');
      const store = transaction.objectStore(STORES.DONATIONS);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        console.log(`[OfflineStorage] ${request.result.length} donations loaded from cache`);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // EMERGENCIES OPERATIONS
  // ============================================

  /**
   * Save emergencies to offline storage
   */
  async saveEmergencies(emergencies) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.EMERGENCIES], 'readwrite');
      const store = transaction.objectStore(STORES.EMERGENCIES);

      emergencies.forEach(emergency => {
        store.put({
          ...emergency,
          cachedAt: new Date().toISOString()
        });
      });

      transaction.oncomplete = () => {
        console.log(`[OfflineStorage] ${emergencies.length} emergencies saved`);
        resolve();
      };
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Get emergencies from offline storage
   */
  async getEmergencies() {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.EMERGENCIES], 'readonly');
      const store = transaction.objectStore(STORES.EMERGENCIES);
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`[OfflineStorage] ${request.result.length} emergencies loaded from cache`);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // SYNC QUEUE OPERATIONS
  // ============================================

  /**
   * Add action to sync queue (for when back online)
   */
  async addToSyncQueue(type, data) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);

      const queueItem = {
        type, // 'donation', 'profile_update', 'emergency_response', etc.
        data,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const request = store.add(queueItem);
      request.onsuccess = () => {
        console.log('[OfflineStorage] Added to sync queue:', type);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all pending sync items
   */
  async getSyncQueue() {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readonly');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.getAll();

      request.onsuccess = () => {
        const pending = request.result.filter(item => item.status === 'pending');
        console.log(`[OfflineStorage] ${pending.length} pending sync items`);
        resolve(pending);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Mark sync item as completed
   */
  async completeSyncItem(id) {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('[OfflineStorage] Sync item completed:', id);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Clear all sync queue items
   */
  async clearSyncQueue() {
    await this.ensureInit();
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORES.SYNC_QUEUE], 'readwrite');
      const store = transaction.objectStore(STORES.SYNC_QUEUE);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('[OfflineStorage] Sync queue cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  // ============================================
  // UTILITY OPERATIONS
  // ============================================

  /**
   * Get storage stats
   */
  async getStats() {
    await this.ensureInit();
    const stats = {};

    for (const storeName of Object.values(STORES)) {
      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const count = await new Promise((resolve) => {
        const request = store.count();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
      stats[storeName] = count;
    }

    return stats;
  }

  /**
   * Clear all offline data
   */
  async clearAll() {
    await this.ensureInit();
    const promises = Object.values(STORES).map(storeName => {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(promises);
    console.log('[OfflineStorage] All data cleared');
  }
}

// Export singleton instance
export const offlineStorage = new OfflineStorageManager();

// Export helper functions
export const saveProfileOffline = (userId, profileData) => offlineStorage.saveProfile(userId, profileData);
export const getProfileOffline = (userId) => offlineStorage.getProfile(userId);
export const saveDonationsOffline = (userId, donations) => offlineStorage.saveDonations(userId, donations);
export const getDonationsOffline = (userId) => offlineStorage.getDonations(userId);
export const saveEmergenciesOffline = (emergencies) => offlineStorage.saveEmergencies(emergencies);
export const getEmergenciesOffline = () => offlineStorage.getEmergencies();
export const addToSyncQueue = (type, data) => offlineStorage.addToSyncQueue(type, data);
export const getSyncQueue = () => offlineStorage.getSyncQueue();
export const completeSyncItem = (id) => offlineStorage.completeSyncItem(id);
export const getOfflineStats = () => offlineStorage.getStats();
export const clearOfflineData = () => offlineStorage.clearAll();
