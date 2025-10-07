import { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, AlertTriangle, Loader2 } from 'lucide-react';
import Modal from './Modal';
import { addEmergencyRequest } from '../services/emergencyService';
import { auth } from '../utils/firebase';
import axios from 'axios';
import LocationAutocomplete from './LocationAutocomplete';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function EmergencyRequestModal({ show, setShow, setShowSuccess, userLocation }) {
  const [emergencyForm, setEmergencyForm] = useState({
    patientName: '',
    hospital: '',
    bloodType: 'A+',
    units: 1,
    urgency: 'Medium',
    contactName: '',
    contactPhone: '',
    notes: '',
    location: '',
  });
  const [locationCoordinates, setLocationCoordinates] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Optimized form change handler with useCallback to prevent re-renders
  const handleChange = useCallback((field, value) => {
    setEmergencyForm(prev => ({ ...prev, [field]: value }));
  }, []);

  // Handle location selection from autocomplete
  const handleLocationSelect = useCallback((locationData) => {
    if (locationData) {
      handleChange('location', locationData.address);
      setLocationCoordinates(locationData.coordinates);
    } else {
      // Location cleared
      handleChange('location', '');
      setLocationCoordinates(null);
    }
  }, [handleChange]);

  const handleEmergencyRequest = async (e) => {
    e.preventDefault();
    
    const currentUser = auth.currentUser;
    if (currentUser && !currentUser.emailVerified) {
      setErrorMessage('Please verify your email address before making emergency requests. Check your inbox for the verification email.');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      // Use stored coordinates from autocomplete, fallback to userLocation
      const coordinates = locationCoordinates || userLocation;
      await addEmergencyRequest(emergencyForm, coordinates);
      setEmergencyForm({
        patientName: '',
        hospital: '',
        bloodType: 'A+',
        units: 1,
        urgency: 'Medium',
        contactName: '',
        contactPhone: '',
        notes: '',
        location: '',
      });
      setLocationCoordinates(null);
      setShow(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      setErrorMessage('Failed to submit emergency request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <Modal onClose={() => setShow(false)} title="🆘 Request Emergency Blood">
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200 animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleEmergencyRequest} className="space-y-5">
        {/* Patient Name */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
            Patient Name *
          </label>
          <input
            type="text"
            value={emergencyForm.patientName}
            onChange={(e) => handleChange('patientName', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
            placeholder="Enter patient name"
            required
          />
        </div>

        {/* Hospital */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
            Hospital *
          </label>
          <input
            type="text"
            value={emergencyForm.hospital}
            onChange={(e) => handleChange('hospital', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
            placeholder="Enter hospital name"
            required
          />
        </div>

        {/* Location with Autocomplete */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
            Location *
          </label>
          <LocationAutocomplete
            value={emergencyForm.location}
            onChange={(value) => handleChange('location', value)}
            onLocationSelect={handleLocationSelect}
            placeholder="Search for location or use GPS"
            required
          />
          {locationCoordinates && (
            <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
              <span className="font-semibold">✓</span>
              <span>Coordinates saved: {locationCoordinates.latitude.toFixed(4)}, {locationCoordinates.longitude.toFixed(4)}</span>
            </div>
          )}
        </div>

        {/* Blood Type & Units */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
              Blood Type *
            </label>
            <select
              value={emergencyForm.bloodType}
              onChange={(e) => handleChange('bloodType', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
              required
            >
              {bloodTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
              Units Needed *
            </label>
            <input
              type="number"
              value={emergencyForm.units}
              onChange={(e) => handleChange('units', parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
              min="1"
              required
            />
          </div>
        </div>

        {/* Urgency */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
            Urgency Level *
          </label>
          <select
            value={emergencyForm.urgency}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
            required
          >
            <option value="Critical">🔴 Critical - Immediate</option>
            <option value="High">🟠 High - Within hours</option>
            <option value="Medium">🟡 Medium - Within a day</option>
            <option value="Low">🟢 Low - Planned</option>
          </select>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
              Contact Name *
            </label>
            <input
              type="text"
              value={emergencyForm.contactName}
              onChange={(e) => handleChange('contactName', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
              placeholder="Enter contact name"
              required
            />
          </div>

          <div className="group">
            <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
              Contact Phone *
            </label>
            <input
              type="tel"
              value={emergencyForm.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
              placeholder="Enter phone number"
              required
            />
          </div>
        </div>

        {/* Additional Notes */}
        <div className="group">
          <label className="block text-sm font-semibold mb-2 text-gray-700 group-focus-within:text-red-600 transition-colors">
            Additional Notes (Optional)
          </label>
          <textarea
            value={emergencyForm.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none bg-white"
            placeholder="Any additional information that might help donors"
            rows="3"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl transition-all font-bold text-base shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Submitting Request...
            </>
          ) : (
            <>
              <AlertTriangle size={20} />
              Submit Emergency Request
            </>
          )}
        </button>
      </form>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </Modal>
  );
}
