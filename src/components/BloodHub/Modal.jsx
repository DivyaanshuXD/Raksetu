import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function Modal({ children, onClose, title }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="notranslate bg-white w-full max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-top-4 duration-300"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title || 'Details'}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors -mr-2"
            aria-label="Close modal"
          >
            <X size={22} className="text-gray-500 hover:text-gray-700" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 pb-8" style={{ willChange: 'scroll-position' }}>
          {children}
        </div>
      </div>
    </div>
  );
}