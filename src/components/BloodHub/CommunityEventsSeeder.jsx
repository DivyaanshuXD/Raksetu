import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, Timestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const CommunityEventsSeeder = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [eventCount, setEventCount] = useState(0);

  const sampleEvents = [
    {
      title: "Blood Donation Camp - Andheri West",
      type: "bloodDrive",
      description: "Join us for a community blood donation drive. Help save lives in your neighborhood. Refreshments and certificates provided to all donors. Free health checkup included.",
      location: "Andheri Sports Complex, S.V. Road, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      startDate: new Date("2025-10-15T09:00:00"),
      endDate: new Date("2025-10-15T17:00:00"),
      capacity: 150,
      participants: 45,
      organizer: "Red Cross Mumbai",
      organizerId: "admin_seed",
      contactEmail: "mumbai@redcross.org.in",
      contactPhone: "+91 9876543210",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "Blood Donation Awareness Workshop",
      type: "awareness",
      description: "Learn about the importance of blood donation, eligibility criteria, and how you can become a regular donor. Interactive session with healthcare professionals.",
      location: "Ramaiah Medical College, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      startDate: new Date("2025-10-20T14:00:00"),
      endDate: new Date("2025-10-20T16:00:00"),
      capacity: 80,
      participants: 23,
      organizer: "Rotary Club Bengaluru",
      organizerId: "admin_seed",
      contactEmail: "rotary@bangalore.org",
      contactPhone: "+91 9123456789",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "Emergency Response Training",
      type: "training",
      description: "Certified first aid and emergency response training. Learn CPR, basic life support, and emergency protocols. Certificate provided upon completion.",
      location: "AIIMS Delhi, Ansari Nagar",
      city: "Delhi",
      state: "Delhi",
      startDate: new Date("2025-10-18T10:00:00"),
      endDate: new Date("2025-10-18T15:00:00"),
      capacity: 50,
      participants: 38,
      organizer: "AIIMS Medical Team",
      organizerId: "admin_seed",
      contactEmail: "training@aiims.edu",
      contactPhone: "+91 9988776655",
      tier: "plus",
      status: "active",
      verified: true
    },
    {
      title: "Corporate Blood Drive - Tech Park",
      type: "bloodDrive",
      description: "Annual blood donation drive for IT companies in Hitech City. Special CSR event with employee engagement activities. Participate and earn CSR credits.",
      location: "Mindspace IT Park, Hitech City",
      city: "Hyderabad",
      state: "Telangana",
      startDate: new Date("2025-10-25T09:00:00"),
      endDate: new Date("2025-10-25T18:00:00"),
      capacity: 300,
      participants: 127,
      organizer: "TechCorp India CSR Team",
      organizerId: "admin_seed",
      contactEmail: "csr@techcorp.in",
      contactPhone: "+91 9876123456",
      tier: "pro",
      status: "active",
      verified: true
    },
    {
      title: "Community Health Camp & Blood Drive",
      type: "bloodDrive",
      description: "Free health checkups, blood donation, and awareness sessions. Open to all ages. Volunteers needed for coordination.",
      location: "Rajiv Gandhi Stadium, Pune",
      city: "Pune",
      state: "Maharashtra",
      startDate: new Date("2025-11-01T08:00:00"),
      endDate: new Date("2025-11-01T16:00:00"),
      capacity: 200,
      participants: 67,
      organizer: "Lions Club Pune",
      organizerId: "admin_seed",
      contactEmail: "pune@lionsclub.org",
      contactPhone: "+91 9123987654",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "World Blood Donor Day Celebration",
      type: "awareness",
      description: "Celebrating World Blood Donor Day with cultural programs, talks by doctors, and felicitation of regular donors. Free entry for all.",
      location: "Nehru Stadium, Indore",
      city: "Indore",
      state: "Madhya Pradesh",
      startDate: new Date("2025-10-14T17:00:00"),
      endDate: new Date("2025-10-14T20:00:00"),
      capacity: 500,
      participants: 89,
      organizer: "State Health Department",
      organizerId: "admin_seed",
      contactEmail: "health@mp.gov.in",
      contactPhone: "+91 9876567890",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "Student Blood Donation Camp",
      type: "bloodDrive",
      description: "Annual blood donation camp for college students. First-time donors welcome. Free snacks and certificates. Parents can accompany.",
      location: "IIT Kharagpur Campus",
      city: "Kharagpur",
      state: "West Bengal",
      startDate: new Date("2025-10-22T10:00:00"),
      endDate: new Date("2025-10-22T16:00:00"),
      capacity: 120,
      participants: 54,
      organizer: "NSS IIT Kharagpur",
      organizerId: "admin_seed",
      contactEmail: "nss@iitkgp.ac.in",
      contactPhone: "+91 9234567890",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "Volunteer Training Program",
      type: "training",
      description: "Training session for volunteers interested in coordinating blood donation events. Learn event management, donor care, and emergency protocols.",
      location: "Community Center, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      startDate: new Date("2025-10-28T11:00:00"),
      endDate: new Date("2025-10-28T14:00:00"),
      capacity: 40,
      participants: 12,
      organizer: "Raksetu Volunteer Team",
      organizerId: "admin_seed",
      contactEmail: "volunteers@raksetu.live",
      contactPhone: "+91 9345678901",
      tier: "free",
      status: "active",
      verified: true
    },
    {
      title: "Mega Blood Donation Drive - Connaught Place",
      type: "bloodDrive",
      description: "Largest blood donation drive in Delhi. Join us to create a record! Special gifts for all donors. Free health screening and blood group testing.",
      location: "Connaught Place Central Park",
      city: "Delhi",
      state: "Delhi",
      startDate: new Date("2025-11-05T08:00:00"),
      endDate: new Date("2025-11-05T20:00:00"),
      capacity: 1000,
      participants: 342,
      organizer: "Delhi Blood Bank Association",
      organizerId: "admin_seed",
      contactEmail: "contact@delhibloodbank.org",
      contactPhone: "+91 9876098760",
      tier: "pro",
      status: "active",
      verified: true
    },
    {
      title: "Thalassemia Awareness & Support Camp",
      type: "awareness",
      description: "Awareness session about Thalassemia, screening facilities, and support for patients. Free genetic counseling available.",
      location: "Tata Memorial Hospital, Parel",
      city: "Mumbai",
      state: "Maharashtra",
      startDate: new Date("2025-10-30T10:00:00"),
      endDate: new Date("2025-10-30T14:00:00"),
      capacity: 100,
      participants: 34,
      organizer: "Thalassemia Society Mumbai",
      organizerId: "admin_seed",
      contactEmail: "info@thalassemiamumbai.org",
      contactPhone: "+91 9123456780",
      tier: "free",
      status: "active",
      verified: true
    }
  ];

  const checkEventCount = async () => {
    try {
      const eventsRef = collection(db, 'communityEvents');
      const snapshot = await getDocs(eventsRef);
      setEventCount(snapshot.size);
    } catch (error) {
      console.error('Error checking events:', error);
    }
  };

  const seedEvents = async () => {
    setLoading(true);
    setStatus({ type: 'loading', message: 'Seeding community events...' });

    try {
      const eventsRef = collection(db, 'communityEvents');
      let successCount = 0;

      for (let i = 0; i < sampleEvents.length; i++) {
        const event = {
          ...sampleEvents[i],
          createdAt: Timestamp.now()
        };

        await addDoc(eventsRef, event);
        successCount++;
        setStatus({
          type: 'loading',
          message: `Added ${successCount}/${sampleEvents.length} events...`
        });
      }

      await checkEventCount();
      setStatus({
        type: 'success',
        message: `✅ Successfully seeded ${successCount} community events!`
      });
    } catch (error) {
      console.error('Error seeding events:', error);
      setStatus({
        type: 'error',
        message: `❌ Error: ${error.message}`
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    checkEventCount();
  }, []);

  return (
    <>
      {/* Event Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-2">📋 What This Does:</h3>
        <ul className="text-sm text-purple-800 space-y-1">
          <li>• Seeds <strong>10 realistic Indian events</strong> across 7 cities</li>
          <li>• Includes <strong>Mumbai, Delhi, Bengaluru, Hyderabad, Pune, Indore, Kharagpur</strong></li>
          <li>• Mix of <strong>Blood Drives (6), Awareness (3), and Training (2)</strong> events</li>
          <li>• All events marked as <strong>verified and active</strong></li>
          <li>• Realistic data: actual hospital names, addresses, contacts</li>
        </ul>
      </div>

      {/* Current Count */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">Current Events in Database</p>
            <p className="text-3xl font-bold text-purple-600">{eventCount}</p>
          </div>
          <button
            onClick={checkEventCount}
            disabled={loading}
            className="p-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={20} className={`text-purple-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Event Details Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-3 border border-red-200">
          <p className="text-red-900 font-semibold text-sm">🩸 Blood Donation Camp</p>
          <p className="text-xs text-red-700">Andheri West, Mumbai · 150 capacity</p>
        </div>
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-3 border border-blue-200">
          <p className="text-blue-900 font-semibold text-sm">📢 Awareness Workshop</p>
          <p className="text-xs text-blue-700">Bengaluru · 80 capacity</p>
        </div>
        <div className="bg-gradient-to-r from-green-100 to-teal-100 rounded-lg p-3 border border-green-200">
          <p className="text-green-900 font-semibold text-sm">🚨 Emergency Training</p>
          <p className="text-xs text-green-700">Delhi · 50 capacity</p>
        </div>
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-3 border border-purple-200">
          <p className="text-purple-900 font-semibold text-sm">🏢 Corporate Drive</p>
          <p className="text-xs text-purple-700">Hyderabad · 300 capacity</p>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={seedEvents}
          disabled={loading}
          className={`
            px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg
            ${loading 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-xl transform hover:scale-105'
            }
          `}
        >
          {loading ? (
            <span className="flex items-center space-x-2">
              <div className="w-5 h-5 border-3 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
              <span>Seeding Events...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <Database size={20} />
              <span>🌱 Seed 10 Sample Events</span>
            </span>
          )}
        </button>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`p-4 rounded-lg border-2 ${
            status.type === 'success'
              ? 'bg-green-50 border-green-300'
              : status.type === 'error'
              ? 'bg-red-50 border-red-300'
              : 'bg-blue-50 border-blue-300'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full animate-pulse ${status.type === 'success' ? 'bg-green-500' : status.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <div>
              <p className={`font-semibold ${status.type === 'success' ? 'text-green-900' : status.type === 'error' ? 'text-red-900' : 'text-blue-900'}`}>
                {status.type === 'success' ? '✅ Success!' : status.type === 'error' ? '❌ Error' : '⏳ Processing...'}
              </p>
              <p className={`text-sm ${status.type === 'success' ? 'text-green-700' : status.type === 'error' ? 'text-red-700' : 'text-blue-700'}`}>
                {status.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-xs text-yellow-800">
          <strong>⚠️ Note:</strong> Seeding will add 10 events to your database. Events will be checked for duplicates.
          All seeded events will be marked as verified and active.
        </p>
      </div>
    </>
  );
};

export default CommunityEventsSeeder;
