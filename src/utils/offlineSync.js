/**
 * Offline Sync Manager
 * Handles synchronization of offline actions when connection is restored
 */

import { getSyncQueue, completeSyncItem } from './offlineStorage';
import { db } from '../components/utils/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';

class OfflineSyncManager {
  constructor() {
    this.isSyncing = false;
    this.syncCallbacks = [];
    this.setupOnlineListener();
  }

  /**
   * Setup listener for when user comes back online
   */
  setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('[OfflineSync] Connection restored, starting sync...');
      this.syncAll();
    });
  }

  /**
   * Add callback to be notified of sync events
   */
  onSyncEvent(callback) {
    this.syncCallbacks.push(callback);
  }

  /**
   * Notify all listeners of sync events
   */
  notifySyncEvent(event) {
    this.syncCallbacks.forEach(callback => callback(event));
  }

  /**
   * Sync all pending items
   */
  async syncAll() {
    if (this.isSyncing) {
      console.log('[OfflineSync] Sync already in progress');
      return;
    }

    if (!navigator.onLine) {
      console.log('[OfflineSync] Still offline, skipping sync');
      return;
    }

    this.isSyncing = true;
    this.notifySyncEvent({ type: 'sync_start' });

    try {
      const queue = await getSyncQueue();
      console.log(`[OfflineSync] Found ${queue.length} items to sync`);

      let successCount = 0;
      let failCount = 0;

      for (const item of queue) {
        try {
          await this.syncItem(item);
          await completeSyncItem(item.id);
          successCount++;
          this.notifySyncEvent({ 
            type: 'item_synced', 
            item, 
            success: true 
          });
        } catch (error) {
          console.error(`[OfflineSync] Failed to sync item ${item.id}:`, error);
          failCount++;
          this.notifySyncEvent({ 
            type: 'item_synced', 
            item, 
            success: false, 
            error 
          });
        }
      }

      console.log(`[OfflineSync] Sync complete: ${successCount} success, ${failCount} failed`);
      this.notifySyncEvent({ 
        type: 'sync_complete', 
        successCount, 
        failCount 
      });

    } catch (error) {
      console.error('[OfflineSync] Sync error:', error);
      this.notifySyncEvent({ 
        type: 'sync_error', 
        error 
      });
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync individual item based on type
   */
  async syncItem(item) {
    console.log(`[OfflineSync] Syncing ${item.type}...`);

    switch (item.type) {
      case 'donation':
        return this.syncDonation(item.data);
      
      case 'profile_update':
        return this.syncProfileUpdate(item.data);
      
      case 'emergency_response':
        return this.syncEmergencyResponse(item.data);
      
      case 'donation_completion':
        return this.syncDonationCompletion(item.data);
      
      default:
        console.warn(`[OfflineSync] Unknown sync type: ${item.type}`);
    }
  }

  /**
   * Sync donation to Firebase
   */
  async syncDonation(data) {
    const donationRef = await addDoc(collection(db, 'donations'), {
      ...data,
      syncedAt: new Date().toISOString(),
      createdOffline: true
    });
    console.log(`[OfflineSync] Donation synced:`, donationRef.id);
    return donationRef.id;
  }

  /**
   * Sync profile update to Firebase
   */
  async syncProfileUpdate(data) {
    const { userId, updates } = data;
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log(`[OfflineSync] Profile updated:`, userId);
  }

  /**
   * Sync emergency response to Firebase
   */
  async syncEmergencyResponse(data) {
    const { emergencyId, userId, response } = data;
    const responseRef = await addDoc(collection(db, 'emergencyResponses'), {
      emergencyId,
      userId,
      ...response,
      respondedAt: new Date().toISOString(),
      createdOffline: true
    });
    console.log(`[OfflineSync] Emergency response synced:`, responseRef.id);
    return responseRef.id;
  }

  /**
   * Sync donation completion to Firebase
   */
  async syncDonationCompletion(data) {
    const { donationId, completionData } = data;
    const donationRef = doc(db, 'donations', donationId);
    await updateDoc(donationRef, {
      status: 'completed',
      ...completionData,
      completedAt: new Date().toISOString()
    });
    console.log(`[OfflineSync] Donation completion synced:`, donationId);
  }

  /**
   * Check if there are pending sync items
   */
  async hasPendingSync() {
    const queue = await getSyncQueue();
    return queue.length > 0;
  }
}

// Export singleton instance
export const offlineSync = new OfflineSyncManager();

// Export helper functions
export const syncOfflineData = () => offlineSync.syncAll();
export const onSyncEvent = (callback) => offlineSync.onSyncEvent(callback);
export const hasPendingSync = () => offlineSync.hasPendingSync();
