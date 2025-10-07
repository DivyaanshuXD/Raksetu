import { useState } from 'react';
import { Phone, ChevronDown } from 'lucide-react';

/**
 * PhoneInput Component
 * Phone number input with country code selector
 * Formats output as Twilio-compatible: +[countryCode][number]
 */

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA/Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+33', country: 'France', flag: '🇫🇷' },
  { code: '+49', country: 'Germany', flag: '🇩🇪' },
];

export default function PhoneInput({ value, onChange, error, required = false, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]); // Default to India
  const [phoneNumber, setPhoneNumber] = useState('');

  // Parse existing value if provided (e.g., "+919876543210")
  useState(() => {
    if (value && value.startsWith('+')) {
      const country = COUNTRY_CODES.find(c => value.startsWith(c.code));
      if (country) {
        setSelectedCountry(country);
        setPhoneNumber(value.substring(country.code.length));
      }
    }
  }, [value]);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Update parent with new country code
    const fullNumber = country.code + phoneNumber.replace(/\D/g, '');
    onChange(fullNumber);
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value;
    // Remove all non-digits
    const digitsOnly = input.replace(/\D/g, '');
    
    // Limit length based on country
    let maxLength = 10; // Default for India
    if (selectedCountry.code === '+1') maxLength = 10; // USA/Canada
    if (selectedCountry.code === '+44') maxLength = 10; // UK
    if (selectedCountry.code === '+971') maxLength = 9; // UAE
    
    const limited = digitsOnly.slice(0, maxLength);
    setPhoneNumber(limited);
    
    // Format as Twilio-compatible: +[code][number]
    const twilioFormat = selectedCountry.code + limited;
    onChange(twilioFormat);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Phone Number {required && <span className="text-red-500">*</span>}
      </label>
      
      <div className="flex gap-2">
        {/* Country Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`flex items-center gap-2 px-3 py-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors ${
              disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            } ${error ? 'border-red-300' : 'border-gray-300'}`}
          >
            <span className="text-xl">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.code}</span>
            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsOpen(false)}
              />
              
              {/* Options */}
              <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                {COUNTRY_CODES.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      selectedCountry.code === country.code ? 'bg-red-50 text-red-600' : 'text-gray-700'
                    }`}
                  >
                    <span className="text-xl">{country.flag}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{country.country}</div>
                      <div className="text-xs text-gray-500">{country.code}</div>
                    </div>
                    {selectedCountry.code === country.code && (
                      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={disabled}
            placeholder={selectedCountry.code === '+91' ? '9876543210' : 'Phone number'}
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all ${
              error ? 'border-red-300' : 'border-gray-300'
            } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
          />
        </div>
      </div>

      {/* Helper Text */}
      {!error && (
        <p className="text-xs text-gray-500">
          Format: {selectedCountry.code} {phoneNumber || 'XXXXXXXXXX'}
          {phoneNumber && (
            <span className="ml-2 text-green-600 font-medium">
              ✓ Twilio-compatible
            </span>
          )}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
