/**
 * EmergencyConfirmation Component
 * Confirmation flow after responding to an emergency request
 */

import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Navigation,
  Droplet,
  Phone,
  CheckCircle,
  Share2,
  Bookmark
} from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';

const EmergencyConfirmation = memo(({ emergency, userProfile, onBack, onConfirm }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [isShareClicked, setIsShareClicked] = useState(false);
  const [isSaveClicked, setIsSaveClicked] = useState(false);
  const [isMarkClicked, setIsMarkClicked] = useState(false);

  // Handle donation confirmation
  const handleConfirmDonation = useCallback(async () => {
    if (isConfirming || !userProfile || !emergency) return;

    setIsConfirming(true);
    try {
      // Add to donationsDone collection
      await addDoc(collection(db, 'donationsDone'), {
        userId: userProfile.id,
        userName: userProfile.name || 'Anonymous',
        userBloodType: userProfile.bloodType,
        emergencyId: emergency.id,
        hospital: emergency.hospital,
        location: emergency.location,
        bloodType: emergency.bloodType,
        units: emergency.units || 1,
        type: 'emergency',
        status: 'pending',
        timestamp: serverTimestamp(),
        contactPhone: userProfile.phoneNumber || null
      });

      setIsConfirmed(true);
      
      // Call parent callback if provided
      if (onConfirm) {
        onConfirm();
      }
    } catch (error) {
      console.error('Error confirming donation:', error);
      alert('Failed to confirm donation. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  }, [isConfirming, userProfile, emergency, onConfirm]);

  // Handle share donation
  const handleShareDonation = useCallback(async () => {
    setIsShareClicked(true);
    setTimeout(() => setIsShareClicked(false), 500);

    const shareText = `I'm donating ${emergency?.bloodType} blood at ${emergency?.hospital}. Every donation saves lives! 🩸`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Blood Donation',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Details copied to clipboard!');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
      }
    }
  }, [emergency]);

  // Handle save donation
  const handleSaveDonation = useCallback(async () => {
    setIsSaveClicked(true);
    setTimeout(() => setIsSaveClicked(false), 500);

    const donationDetails = `
Blood Donation Details:
Hospital: ${emergency?.hospital}
Location: ${emergency?.location}
Blood Type: ${emergency?.bloodType}
Units: ${emergency?.units || 1}
Contact: ${emergency?.contactPhone || 'N/A'}
Date: ${new Date().toLocaleString()}
    `.trim();

    try {
      await navigator.clipboard.writeText(donationDetails);
      setShowSaveSuccessModal(true);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('Failed to copy details to clipboard');
    }
  }, [emergency]);

  // Handle mark as completed
  const handleMarkDonation = useCallback(() => {
    setIsMarkClicked(true);
    setTimeout(() => setIsMarkClicked(false), 500);
    alert('This feature will be available in the Track Donations section after you complete your donation.');
  }, []);

  if (!emergency) {
    return (
      <div className="max-w-lg mx-auto p-4 text-center">
        <p className="text-gray-600">Emergency request not found</p>
        <button onClick={onBack} className="mt-4 text-red-600 hover:text-red-700">
          Go Back
        </button>
      </div>
    );
  }

  // Show confirmation view (before confirming)
  if (!isConfirmed) {
    return (
      <div className="max-w-lg mx-auto p-4 pb-20">
        <button
          className="flex items-center text-red-600 mb-4 hover:text-red-700 transition-colors"
          onClick={onBack}
          aria-label="Back to emergency details"
        >
          <ArrowLeft size={18} className="mr-1" /> Back to emergency details
        </button>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="h-2 w-full bg-orange-500" />
          
          <div className="p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={32} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Confirm Your Response
              </h2>
              <p className="text-gray-600">
                Please review the details before confirming your donation
              </p>
            </div>

            {/* Emergency Details */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 divide-y divide-gray-200 mb-6">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Hospital</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.hospital}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Navigation size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Location</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.location}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Droplet size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Blood Type</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.bloodType}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Contact</span>
                </div>
                <span className="font-semibold text-gray-700">
                  {emergency.contactPhone || 'Hospital Contact'}
                </span>
              </div>
            </div>

            {/* Important Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Important:</h4>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Ensure you are eligible to donate (healthy, well-rested)</li>
                <li>Eat a proper meal before donating</li>
                <li>Bring a valid ID and proof of blood type if available</li>
                <li>Inform the hospital staff that you responded to an emergency request</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                onClick={handleConfirmDonation}
                disabled={isConfirming}
              >
                <CheckCircle size={18} />
                {isConfirming ? 'Confirming...' : 'Confirm Donation'}
              </button>
              <button
                className="px-6 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors"
                onClick={onBack}
                disabled={isConfirming}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show success view (after confirming)
  return (
    <div className="max-w-lg mx-auto p-4 pb-20">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-2 w-full bg-green-500" />
        
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-500 opacity-10 animate-ping rounded-full" />
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto relative z-10 border-4 border-green-200">
              <Heart size={48} className="text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Thank You, Lifesaver!
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your commitment to donate blood will help save lives. The hospital has been notified of your arrival. 
            Please mark the donation as completed in the Track section after donating to earn your Impact Points.
          </p>

          {/* Emergency Details */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6">
            <div className="divide-y divide-gray-100">
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <MapPin size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Hospital</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.hospital}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Navigation size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Location</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.location}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Droplet size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Blood Type</span>
                </div>
                <span className="font-semibold text-gray-700">{emergency.bloodType}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div className="flex items-center">
                  <Phone size={16} className="text-gray-400 mr-2" />
                  <span className="text-gray-800 font-medium">Contact</span>
                </div>
                <span className="font-semibold text-gray-700">
                  {emergency.contactPhone || 'Hospital Contact'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${emergency.coordinates?.latitude},${emergency.coordinates?.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <Navigation size={18} />
              Get Directions
            </a>
            <button
              className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              onClick={onBack}
            >
              <Heart size={18} className="text-red-500" />
              View Other Emergencies
            </button>
          </div>

          {/* Social Actions */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={handleShareDonation}
              className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                isShareClicked ? 'bg-red-100 scale-110' : 'hover:bg-gray-50'
              }`}
              aria-label="Share donation"
            >
              <Share2 size={18} className={isShareClicked ? 'text-red-600' : 'text-red-500'} />
            </button>
            <button
              onClick={handleSaveDonation}
              className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                isSaveClicked ? 'bg-red-100 scale-110' : 'hover:bg-gray-50'
              }`}
              aria-label="Save donation"
            >
              <Bookmark size={18} className={isSaveClicked ? 'text-red-600' : 'text-red-500'} />
            </button>
            <button
              onClick={handleMarkDonation}
              className={`p-2 bg-white rounded-lg border border-gray-200 transition-all duration-300 ${
                isMarkClicked ? 'bg-green-100 scale-110' : 'hover:bg-gray-50'
              }`}
              aria-label="Mark donation as completed"
            >
              <CheckCircle size={18} className={isMarkClicked ? 'text-green-600' : 'text-green-500'} />
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Make sure to drink plenty of water and eat before donating.
            </p>
          </div>
        </div>
      </div>

      {/* Save Success Modal */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={24} className="text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Saved Successfully!</h3>
            <p className="text-gray-600 mb-6">Donation details have been copied to your clipboard.</p>
            <button
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
              onClick={() => setShowSaveSuccessModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

EmergencyConfirmation.displayName = 'EmergencyConfirmation';

EmergencyConfirmation.propTypes = {
  emergency: PropTypes.shape({
    id: PropTypes.string,
    hospital: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    bloodType: PropTypes.string.isRequired,
    units: PropTypes.number,
    contactPhone: PropTypes.string,
    coordinates: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number
    })
  }).isRequired,
  userProfile: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    bloodType: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  onBack: PropTypes.func.isRequired,
  onConfirm: PropTypes.func
};

export default EmergencyConfirmation;
