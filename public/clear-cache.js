/**
 * Clear Service Worker and Caches Script
 * Run this in browser console to completely reset caching
 */

(async function clearAllCaches() {
  console.log('🧹 Starting cache cleanup...');
  
  try {
    // 1. Unregister all service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    console.log(`📋 Found ${registrations.length} service worker(s)`);
    
    for (let registration of registrations) {
      const result = await registration.unregister();
      console.log(`✅ Service worker unregistered:`, result);
    }
    
    // 2. Delete all caches
    const cacheNames = await caches.keys();
    console.log(`📦 Found ${cacheNames.length} cache(s):`, cacheNames);
    
    for (let cacheName of cacheNames) {
      const deleted = await caches.delete(cacheName);
      console.log(`🗑️ Cache deleted: ${cacheName} -`, deleted);
    }
    
    // 3. Clear localStorage
    localStorage.clear();
    console.log('🧹 localStorage cleared');
    
    // 4. Clear sessionStorage
    sessionStorage.clear();
    console.log('🧹 sessionStorage cleared');
    
    console.log('');
    console.log('✅ ✅ ✅ CLEANUP COMPLETE! ✅ ✅ ✅');
    console.log('');
    console.log('⚠️ IMPORTANT: Hard refresh the page now (Ctrl+Shift+R)');
    console.log('This will register the new service worker with updated cache rules.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
})();
