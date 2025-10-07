import { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

/**
 * Custom Language Selector for Indian Languages
 * Integrates with Google Translate but with custom UI
 */

const INDIAN_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

const LanguageSelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect current language from Google Translate
  useEffect(() => {
    const detectLanguage = () => {
      // Check for Google Translate's language cookie
      const match = document.cookie.match(/googtrans=\/[^\/]*\/([^;]*)/);
      if (match && match[1]) {
        setCurrentLanguage(match[1]);
      }
    };

    detectLanguage();
    
    // Listen for language changes
    const observer = new MutationObserver(detectLanguage);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['lang', 'class']
    });

    return () => observer.disconnect();
  }, []);

  const changeLanguage = (languageCode) => {
    // Set Google Translate cookie
    const domain = window.location.hostname;
    document.cookie = `googtrans=/en/${languageCode}; path=/; domain=${domain}`;
    document.cookie = `googtrans=/en/${languageCode}; path=/`;
    
    // Trigger Google Translate
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event('change'));
    } else {
      // Fallback: reload page with language parameter
      window.location.reload();
    }

    setCurrentLanguage(languageCode);
    setIsOpen(false);
  };

  const getCurrentLanguageData = () => {
    return INDIAN_LANGUAGES.find(lang => lang.code === currentLanguage) || INDIAN_LANGUAGES[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Globe Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group notranslate"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe 
          size={20} 
          className="transition-transform group-hover:rotate-12 group-hover:scale-110" 
        />
        <span className="hidden md:inline text-sm font-medium">
          {getCurrentLanguageData().nativeName}
        </span>
        <svg
          className={`hidden md:inline w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - notranslate class prevents Google Translate from translating this */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fadeIn notranslate">
          {/* Header */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Select Language
            </p>
          </div>

          {/* Language List */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar">
            {INDIAN_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => changeLanguage(language.code)}
                className={`
                  w-full px-4 py-3 flex items-center justify-between
                  hover:bg-red-50 transition-colors duration-150
                  ${currentLanguage === language.code ? 'bg-red-50' : ''}
                `}
              >
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-900">
                    {language.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {language.nativeName}
                  </span>
                </div>
                {currentLanguage === language.code && (
                  <Check size={18} className="text-red-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-100 mt-2">
            <p className="text-xs text-gray-400 text-center">
              Powered by Google Translate
            </p>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dc2626;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #b91c1c;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}} />
    </div>
  );
};

export default LanguageSelector;
