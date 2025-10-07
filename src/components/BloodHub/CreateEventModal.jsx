import React, { useState } from 'react';
import { X, Calendar, MapPin, Users, Phone, Mail, Clock, FileText, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

const CreateEventModal = React.memo(({ 
  show, 
  setShow, 
  tier,
  userProfile,
  onSubmit 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bloodDrive',
    location: '',
    city: '',
    state: '',
    startDate: '',
    startTime: '',
    endTime: '',
    capacity: tier?.id === 'pro' ? '' : tier?.id === 'plus' ? '200' : '50',
    contactEmail: userProfile?.email || '',
    contactPhone: userProfile?.phone || '',
    organizerName: userProfile?.name || '',
    additionalInfo: ''
  });

  const [errors, setErrors] = useState({});

  const eventTypes = [
    { value: 'bloodDrive', label: '🩸 Blood Donation Drive', description: 'Organize a blood donation camp' },
    { value: 'awareness', label: '📢 Awareness Campaign', description: 'Spread awareness about blood donation' },
    { value: 'training', label: '🎓 Training Session', description: 'Train volunteers and staff' }
  ];

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
    'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
    'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
    'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.length < 50) newErrors.description = 'Description must be at least 50 characters';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    if (!formData.capacity || formData.capacity < 1) newErrors.capacity = 'Capacity must be at least 1';
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Contact phone is required';
    if (!formData.organizerName.trim()) newErrors.organizerName = 'Organizer name is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Invalid email format';
    }

    // Validate phone format (Indian)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (formData.contactPhone && !phoneRegex.test(formData.contactPhone.replace(/\s/g, ''))) {
      newErrors.contactPhone = 'Invalid phone number (10 digits starting with 6-9)';
    }

    // Validate date is in future
    const selectedDate = new Date(formData.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      newErrors.startDate = 'Event date must be in the future';
    }

    // Validate end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await onSubmit(formData);
      // Modal will be closed by parent component
    } catch (error) {
      console.error('Error creating event:', error);
      setErrors({ submit: 'Failed to create event. Please try again.' });
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-2xl md:max-w-4xl my-8" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${tier?.color || 'from-red-600 to-pink-600'} text-white p-4 sm:p-6 rounded-t-2xl relative`}>
          <button
            onClick={() => setShow(false)}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">Create Your Event</h2>
            <p className="text-white/90 text-sm sm:text-base">
              {tier?.name} Tier • Fill in the details to publish your event
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Event Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Event Type *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {eventTypes.map((type) => (
                <label
                  key={type.value}
                  className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-colors duration-150 ${
                    formData.type === type.value
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-lg font-semibold mb-1">{type.label}</span>
                  <span className="text-xs text-gray-600">{type.description}</span>
                  {formData.type === type.value && (
                    <CheckCircle size={20} className="absolute top-3 right-3 text-red-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mumbai Blood Donation Camp 2025"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              maxLength={100}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.title}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.title.length}/100 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Event Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event, its purpose, what participants can expect, and any special requirements..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              maxLength={500}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">{formData.description.length}/500 characters</p>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Venue/Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., ABC Community Hall, Andheri West"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.location ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., Mumbai"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.city ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.city}
                </p>
              )}
            </div>
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              State *
            </label>
            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.state ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">Select State</option>
              {indianStates.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
            {errors.state && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.state}
              </p>
            )}
          </div>

          {/* Date and Time */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.startDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.startDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.startTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.startTime && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.startTime}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.endTime ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.endTime && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.endTime}
                </p>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Expected Participants *
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g., 100"
              min="1"
              max={tier?.id === 'pro' ? '10000' : tier?.id === 'plus' ? '200' : '50'}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.capacity ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.capacity && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.capacity}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {tier?.id === 'free' && 'Free tier: Maximum 50 participants'}
              {tier?.id === 'plus' && 'Plus tier: Maximum 200 participants'}
              {tier?.id === 'pro' && 'Pro tier: Unlimited participants'}
            </p>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Organizer Name *
              </label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleChange}
                placeholder="Your name or organization"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.organizerName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.organizerName && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.organizerName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@example.com"
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                  errors.contactEmail ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.contactEmail}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength="10"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none ${
                errors.contactPhone ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.contactPhone && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.contactPhone}
              </p>
            )}
          </div>

          {/* Additional Info */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Additional Information (Optional)
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleChange}
              placeholder="Any special requirements, parking instructions, dress code, etc."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
              maxLength={300}
            />
            <p className="mt-1 text-xs text-gray-500">{formData.additionalInfo.length}/300 characters</p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => setShow(false)}
              disabled={loading}
              className="w-full sm:flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50 text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`w-full sm:flex-1 py-3 px-6 rounded-xl font-bold text-white transition-transform duration-150 active:scale-95 text-sm sm:text-base ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${tier?.color || 'from-red-600 to-pink-600'} hover:shadow-xl`
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating Event...
                </span>
              ) : (
                '✨ Publish Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateEventModal.displayName = 'CreateEventModal';

export default CreateEventModal;
