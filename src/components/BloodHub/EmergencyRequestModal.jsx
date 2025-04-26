import { useState } from 'react';
import { MapPin } from 'lucide-react';
import Modal from './Modal';
import { addEmergencyRequest } from '../services/emergencyService';

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmergencyRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addEmergencyRequest(emergencyForm, userLocation);
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
      setShow(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting emergency request:', error);
      alert('Failed to submit emergency request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const useCurrentLocation = () => {
    if (userLocation) {
      const address = `Near ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
      setEmergencyForm({ ...emergencyForm, location: address });
    } else {
      alert('Unable to get your current location');
    }
  };

  if (!show) return null;

  return (
    <Modal onClose={() => setShow(false)} title="Request Emergency Blood">
      <form onSubmit={handleEmergencyRequest} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Patient Name</label>
          <input
            type="text"
            value={emergencyForm.patientName}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, patientName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter patient name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hospital</label>
          <input
            type="text"
            value={emergencyForm.hospital}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, hospital: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter hospital name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="flex">
            <input
              type="text"
              value={emergencyForm.location}
              onChange={(e) => setEmergencyForm({ ...emergencyForm, location: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-l-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Enter location"
              required
            />
            <button
              type="button"
              onClick={useCurrentLocation}
              className="bg-gray-200 hover:bg-gray-300 px-3 rounded-r-lg flex items-center justify-center"
            >
              <MapPin size={16} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Blood Type</label>
          <select
            value={emergencyForm.bloodType}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, bloodType: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            {bloodTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Units Needed</label>
          <input
            type="number"
            value={emergencyForm.units}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, units: parseInt(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Urgency</label>
          <select
            value={emergencyForm.urgency}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, urgency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={emergencyForm.contactName}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, contactName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter contact name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Contact Phone</label>
          <input
            type="tel"
            value={emergencyForm.contactPhone}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, contactPhone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter phone number"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Additional Notes</label>
          <textarea
            value={emergencyForm.notes}
            onChange={(e) => setEmergencyForm({ ...emergencyForm, notes: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Enter any additional details"
            rows="3"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </Modal>
  );
}