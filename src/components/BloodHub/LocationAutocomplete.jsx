import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Loader2, X } from 'lucide-react';
import axios from 'axios';

/**
 * LocationAutocomplete Component
 * Provides autocomplete suggestions for location input using Nominatim API
 * Stores both formatted address and coordinates
 */
export default function LocationAutocomplete({ 
  value, 
  onChange, 
  onLocationSelect,
  placeholder = "Enter location or use GPS",
  className = "",
  required = false 
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceTimerRef = useRef(null);
  const wrapperRef = useRef(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Fetch location suggestions from Nominatim
  const fetchSuggestions = async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Using Nominatim for geocoding (free alternative to Google Places)
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: searchText,
          format: 'json',
          addressdetails: 1,
          limit: 5,
          countrycodes: 'in' // Restrict to India for better results
        },
        headers: {
          'User-Agent': 'BloodHub Emergency App' // Required by Nominatim
        }
      });

      const formattedSuggestions = response.data.map(place => ({
        display_name: place.display_name,
        lat: parseFloat(place.lat),
        lon: parseFloat(place.lon),
        address: place.address,
        type: place.type,
        importance: place.importance
      }));

      setSuggestions(formattedSuggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue); // Update parent with text value

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for API call (500ms debounce)
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue);
    }, 500);
  };

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion) => {
    const formattedAddress = suggestion.display_name;
    const coordinates = {
      latitude: suggestion.lat,
      longitude: suggestion.lon
    };

    setInputValue(formattedAddress);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    
    // Notify parent component
    onChange(formattedAddress);
    if (onLocationSelect) {
      onLocationSelect({
        address: formattedAddress,
        coordinates: coordinates,
        details: suggestion.address
      });
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Get current GPS location
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLoadingGPS(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocode to get address
        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              lat: lat,
              lon: lon,
              format: 'json',
              addressdetails: 1
            },
            headers: {
              'User-Agent': 'BloodHub Emergency App'
            }
          });

          const formattedAddress = response.data.display_name;
          const coordinates = {
            latitude: lat,
            longitude: lon
          };

          setInputValue(formattedAddress);
          onChange(formattedAddress);
          
          if (onLocationSelect) {
            onLocationSelect({
              address: formattedAddress,
              coordinates: coordinates,
              details: response.data.address
            });
          }
        } catch (error) {
          console.error('Error reverse geocoding:', error);
          const fallbackAddress = `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
          setInputValue(fallbackAddress);
          onChange(fallbackAddress);
          
          if (onLocationSelect) {
            onLocationSelect({
              address: fallbackAddress,
              coordinates: { latitude: lat, longitude: lon },
              details: {}
            });
          }
        }
        setLoadingGPS(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setLoadingGPS(false);
        
        let errorMsg = 'Unable to get your location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied. Please enable location permissions in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information is unavailable. Please check your device settings.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out. Please try again or enter location manually.';
            break;
          default:
            errorMsg = 'An error occurred while getting location. Please enter manually.';
        }
        
        alert(errorMsg);
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 300000 // Allow cached position up to 5 minutes old
      }
    );
  };

  // Clear input
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
    if (onLocationSelect) {
      onLocationSelect(null);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        {/* Input field with clear button */}
        <div className="relative flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className={`w-full px-4 py-3 pr-10 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white ${className}`}
            placeholder={placeholder}
            required={required}
            autoComplete="off"
          />
          {/* Clear button */}
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear location"
            >
              <X size={18} />
            </button>
          )}
          {/* Loading indicator */}
          {loading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 size={18} className="animate-spin text-red-500" />
            </div>
          )}
        </div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleGetLocation}
          disabled={loadingGPS}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-xl flex items-center justify-center min-w-[60px] transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
          aria-label="Get current location"
          title="Use my current location"
        >
          {loadingGPS ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <MapPin size={20} />
          )}
        </button>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 hover:bg-red-50 ${
                selectedIndex === index ? 'bg-red-50' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-red-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm leading-tight">
                    {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || 'Location'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {suggestion.display_name}
                  </div>
                  {suggestion.address?.postcode && (
                    <div className="text-xs text-gray-400 mt-1">
                      PIN: {suggestion.address.postcode}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && !loading && inputValue.length >= 3 && suggestions.length === 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl p-4 text-center text-gray-500 text-sm">
          No locations found. Try a different search term.
        </div>
      )}

      {/* Hint text */}
      <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
        <MapPin size={12} />
        <span>Type at least 3 characters to search for locations</span>
      </div>
    </div>
  );
}
