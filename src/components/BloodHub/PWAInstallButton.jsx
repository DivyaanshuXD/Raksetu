import { useState, useEffect } from 'react';
import { Download, Smartphone } from 'lucide-react';

/**
 * PWA Install Button - Persistent header button for app installation
 * Shows when PWA is installable, hides when already installed
 */
export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    console.log('🔍 [PWA Button] Initializing...');
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ [PWA Button] App already installed');
      setIsInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('🎯 [PWA Button] Install prompt available');
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log('✅ [PWA Button] App installed');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleClick = async () => {
    if (!deferredPrompt) {
      console.warn('⚠️ [PWA Button] No install prompt available');
      alert('App installation is not available right now. Make sure you are using HTTPS and a supported browser (Chrome, Edge, Samsung Internet).');
      return;
    }

    console.log('📲 [PWA Button] Triggering install...');
    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    console.log(`📊 [PWA Button] User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} installation`);

    setDeferredPrompt(null);
  };

  // Don't show button if app is already installed
  if (isInstalled) {
    return null;
  }

  // Don't show button if install prompt not available (show anyway for visibility)
  // Changed: Always show button, but show tooltip about availability

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          hidden md:flex items-center gap-2 px-4 py-2 rounded-xl font-medium
          transition-all duration-300 shadow-sm hover:shadow-md
          ${deferredPrompt 
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        disabled={!deferredPrompt}
        aria-label="Install Raksetu App"
      >
        <Smartphone size={18} />
        <span className="text-sm">Install App</span>
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-50 animate-in slide-in-from-top-2 duration-200">
          {deferredPrompt ? (
            <>
              <p className="font-semibold mb-1">📱 Install Raksetu</p>
              <p className="text-gray-300">
                Get faster access, offline mode, and push notifications!
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold mb-1">⚠️ Not Available</p>
              <p className="text-gray-300">
                App install requires HTTPS and a supported browser. 
                {!window.matchMedia('(display-mode: standalone)').matches && 
                  ' The popup will appear automatically when available.'}
              </p>
            </>
          )}
        </div>
      )}

      {/* Mobile button (always visible) */}
      <button
        onClick={handleClick}
        className={`
          md:hidden flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm
          transition-all duration-300
          ${deferredPrompt 
            ? 'bg-blue-600 text-white hover:bg-blue-700' 
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }
        `}
        disabled={!deferredPrompt}
        aria-label="Install Raksetu App"
      >
        <Download size={16} />
        <span>Install</span>
      </button>
    </div>
  );
}
