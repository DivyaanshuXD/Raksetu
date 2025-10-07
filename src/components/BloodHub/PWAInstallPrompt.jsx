import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log('🔍 [PWA] Checking installation status...');
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ [PWA] App already installed');
      setIsInstalled(true);
      return;
    }

    console.log('⏳ [PWA] Waiting for beforeinstallprompt event...');
    
    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎯 [PWA] beforeinstallprompt event fired!');
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show install prompt after 1 second (reduced from 3)
      setTimeout(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        const dismissedUntil = dismissed ? parseInt(dismissed) : 0;
        const now = Date.now();
        
        if (now > dismissedUntil) {
          console.log('📱 [PWA] Showing install prompt');
          setShowPrompt(true);
        } else {
          console.log('⏭️ [PWA] Install prompt dismissed until:', new Date(dismissedUntil));
        }
      }, 1000); // Reduced from 3000ms to 1000ms
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ [PWA] App was installed successfully!');
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.removeItem('pwa-install-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ [PWA] No install prompt available');
      return;
    }

    console.log('📲 [PWA] Showing install dialog...');
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`📊 [PWA] User response: ${outcome}`);

    if (outcome === 'accepted') {
      console.log('✅ [PWA] User accepted the install prompt');
    } else {
      console.log('❌ [PWA] User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    console.log('⏭️ [PWA] Install prompt dismissed by user');
    setShowPrompt(false);
    // Remember dismissal for 7 days
    const dismissedUntil = Date.now() + (7 * 24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-dismissed', dismissedUntil.toString());
    console.log('📅 [PWA] Will show again after:', new Date(dismissedUntil));
  };

  // Don't show if installed or prompt not available
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 animate-slide-up">
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5">
          {/* Icon */}
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Install Raksetu</h3>
              <p className="text-sm text-red-100">Access offline, faster loading</p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2 mb-5 text-sm">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-red-200" />
              <span>Works offline with cached data</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-red-200" />
              <span>Instant loading from home screen</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-red-200" />
              <span>Push notifications for emergencies</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleInstallClick}
              className="flex-1 bg-white text-red-600 px-4 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Install App
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 py-3 rounded-xl font-medium text-white/90 hover:bg-white/10 transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
