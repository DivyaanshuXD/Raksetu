import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function EmergencyFloatingButton({ setShowEmergencyModal, setShowAuthModal, setAuthMode, isLoggedIn }) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleEmergencyClick = () => {
    if (!isLoggedIn) {
      // Show login modal for non-logged-in users
      setAuthMode('login');
      setShowAuthModal(true);
    } else {
      // Show emergency request modal for logged-in users
      setShowEmergencyModal(true);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className="emergency-fab fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Tooltip */}
        {showTooltip && (
          <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-fade-in mr-2 whitespace-nowrap">
            Need Blood Urgently?
          </div>
        )}

        {/* Main Button */}
        <button
          onClick={handleEmergencyClick}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="group relative bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full p-4 shadow-2xl hover:shadow-red-600/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center gap-3"
          aria-label="Emergency Blood Request"
        >
          {/* Pulse Animation */}
          <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-75"></span>
          
          {/* Icon */}
          <AlertTriangle className="w-7 h-7 relative z-10 animate-pulse" />
          
          {/* Text on larger screens */}
          <span className="hidden sm:block relative z-10 font-bold text-sm pr-2">
            EMERGENCY
          </span>

          {/* Emergency Badge */}
          <div className="absolute -top-1 -right-1 bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg animate-bounce">
            !
          </div>
        </button>
      </div>

      {/* Mobile-optimized positioning */}
      <style>{`
        @media (max-width: 640px) {
          .emergency-fab {
            bottom: 80px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
