import React, { useState } from 'react';
import { X, Package, MapPin, Phone, User, Shirt, AlertCircle } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { addDoc, collection, Timestamp } from 'firebase/firestore';

const ShippingFormModal = React.memo(({ show, setShow, rewardData, onSubmitSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    itemType: 'tshirt',
    size: 'M'
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!show || !rewardData) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!formData.fullName || !formData.phone || !formData.addressLine1 || 
          !formData.city || !formData.state || !formData.pincode) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Validate phone number (10 digits)
      if (!/^\d{10}$/.test(formData.phone)) {
        setError('Please enter a valid 10-digit phone number');
        setSubmitting(false);
        return;
      }

      // Validate pincode (6 digits)
      if (!/^\d{6}$/.test(formData.pincode)) {
        setError('Please enter a valid 6-digit pincode');
        setSubmitting(false);
        return;
      }

      // Create merchandise order
      const orderData = {
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'User',
        userEmail: auth.currentUser.email,
        rewardId: rewardData.reward.id,
        rewardCode: rewardData.code,
        orderDate: Timestamp.now(),
        shippingAddress: {
          fullName: formData.fullName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode
        },
        itemType: formData.itemType,
        size: formData.size,
        status: 'pending', // pending -> processing -> shipped -> delivered
        trackingNumber: null,
        shippedAt: null,
        deliveredAt: null
      };

      await addDoc(collection(db, 'merchandiseOrders'), orderData);

      // Success callback
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Reset and close
      setFormData({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        itemType: 'tshirt',
        size: 'M'
      });
      setShow(false);
    } catch (err) {
      console.error('Shipping form submission error:', err);
      setError('Failed to submit shipping details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <Package size={28} />
            <h2 className="text-2xl font-bold">Shipping Details</h2>
          </div>
          <p className="text-green-100">Fill in your delivery address for exclusive merchandise</p>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Personal Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-green-600" />
              Personal Information
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  maxLength="10"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-green-600" />
              Shipping Address
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  placeholder="House/Flat number, Building name"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address Line 2
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleChange}
                  placeholder="Street, Area, Landmark (optional)"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="City"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="State"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="6-digit pincode"
                    maxLength="6"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Item Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shirt size={18} className="text-green-600" />
              Item Preferences
            </h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose Item <span className="text-red-500">*</span>
                </label>
                <select
                  name="itemType"
                  value={formData.itemType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
                  required
                >
                  <option value="tshirt">T-Shirt (Raksetu Logo)</option>
                  <option value="cap">Cap (Embroidered)</option>
                  <option value="stickerpack">Sticker Pack (10 stickers)</option>
                </select>
              </div>

              {formData.itemType === 'tshirt' || formData.itemType === 'cap' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors bg-white"
                    required
                  >
                    <option value="S">Small (S)</option>
                    <option value="M">Medium (M)</option>
                    <option value="L">Large (L)</option>
                    <option value="XL">Extra Large (XL)</option>
                    <option value="XXL">2XL</option>
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-center bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600">No size selection needed</p>
                </div>
              )}
            </div>
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>📦 Delivery Timeline:</strong> Your merchandise will be dispatched within 3-5 business days. 
              Delivery typically takes 7-10 business days. You'll receive tracking details via email.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ShippingFormModal;
