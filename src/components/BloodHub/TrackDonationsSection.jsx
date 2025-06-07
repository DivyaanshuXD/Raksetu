import { useEffect, useState } from 'react';
import { UserCircle, Heart, Users, Check, Award, Download, Calendar, MapPin, Trash2, Plus, TrendingUp } from 'lucide-react';

// Mock data for demonstration
const mockUserProfile = {
  name: "John Doe",
  bloodType: "O+",
  email: "john@example.com"
};

const mockCompletedDonations = [
  {
    id: 1,
    type: 'appointment',
    bankName: 'City Blood Bank',
    date: new Date('2024-01-15'),
    time: '10:00 AM',
    location: 'Downtown Medical Center'
  },
  {
    id: 2,
    type: 'emergency',
    hospital: 'General Hospital',
    date: new Date('2024-02-20'),
    time: '2:30 PM',
    location: 'Emergency Ward'
  }
];

const mockDonations = [
  {
    id: 1,
    type: 'drive',
    driveName: 'Community Blood Drive',
    date: new Date('2024-07-15'),
    time: '9:00 AM',
    location: 'Community Center'
  },
  {
    id: 2,
    type: 'appointment',
    bankName: 'Apollo Blood Center',
    date: new Date('2024-07-20'),
    time: '11:00 AM',
    location: 'MG Road Branch'
  }
];

export default function TrackDonationsSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalHeading, setModalHeading] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // Using mock data for demonstration
  const userProfile = mockUserProfile;
  const completedDonations = mockCompletedDonations;
  const donations = mockDonations;

  const totalDonations = completedDonations.length;
  const totalImpactPoints = totalDonations * 10;
  const bloodType = userProfile?.bloodType || 'Not specified';
  const username = userProfile?.name || 'Anonymous';

  const registeredDrives = donations.filter(d => d.type === 'drive');
  const appointments = donations.filter(d => d.type === 'appointment');

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown Date';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Unknown Date';
    }
  };

  const getBadgeInfo = () => {
    if (totalDonations >= 10) return { label: 'Platinum Lifesaver', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (totalDonations >= 5) return { label: 'Gold Lifesaver', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    if (totalDonations >= 2) return { label: 'Emergency Hero', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    return { label: 'First Donor', color: 'bg-green-100 text-green-700 border-green-200' };
  };

  const badgeInfo = getBadgeInfo();

  const achievements = [
    { icon: Heart, title: 'First Donation', threshold: 1, achieved: totalDonations >= 1 },
    { icon: Users, title: 'Emergency Hero', threshold: 2, achieved: totalDonations >= 2 },
    { icon: Check, title: 'Regular Donor', threshold: 5, achieved: totalDonations >= 5 },
    { icon: Award, title: 'Platinum Saver', threshold: 10, achieved: totalDonations >= 10 },
  ];

  const handleScheduleVisit = () => {
    setShowScheduleModal(true);
  };

  const handleSubmitAppointment = () => {
    setModalHeading('Appointment Scheduled!');
    setModalMessage(`Your appointment has been scheduled for ${appointmentDate} at ${appointmentTime}`);
    setShowSuccessModal(true);
    setShowScheduleModal(false);
    setAppointmentDate('');
    setAppointmentTime('');
  };

  const handleClearAll = () => {
    setModalHeading('Cleared Successfully!');
    setModalMessage('All scheduled donations have been cleared.');
    setShowSuccessModal(true);
    setShowClearModal(false);
  };

  if (!isLoggedIn) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-8 text-center border border-red-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
              <UserCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Track Your Impact</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Sign in to view your donation history and track lives saved
            </p>
            <div className="flex gap-3 justify-center">
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
                Sign In
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium border border-gray-300 transition-colors">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Your Impact Dashboard</h2>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${badgeInfo.color}`}>
            {badgeInfo.label}
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-xl font-bold">
                {bloodType}
              </div>
              <div>
                <h3 className="text-xl font-semibold">{username}</h3>
                <p className="text-red-100">{totalDonations} donations • {totalImpactPoints} impact points</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{totalDonations}</div>
              <div className="text-red-100 text-sm">Lives Saved</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-red-600">{totalDonations}</div>
            <div className="text-gray-600 text-sm">Total Donations</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">{totalDonations * 3}</div>
            <div className="text-gray-600 text-sm">Lives Touched</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{totalImpactPoints}</div>
            <div className="text-gray-600 text-sm">Impact Points</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">{bloodType}</div>
            <div className="text-gray-600 text-sm">Blood Type</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Upcoming Activities */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Upcoming Activities</h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleScheduleVisit}
                    className="text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Schedule new donation"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowClearModal(true)}
                    className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                    title="Clear all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {[...registeredDrives, ...appointments].length > 0 ? (
                <div className="space-y-3">
                  {[...registeredDrives, ...appointments].map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-500 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {item.driveName || item.bankName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(item.date)} • {item.time}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {item.location}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming activities</p>
                </div>
              )}
            </div>
          </div>

          {/* Donation History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900">Recent Donations</h3>
              </div>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              {completedDonations.length > 0 ? (
                <div className="space-y-3">
                  {completedDonations.map((donation) => (
                    <div key={donation.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <Heart className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {donation.bankName || donation.hospital || 'Blood Donation'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(donation.date)} • {donation.time}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          +1 Life Saved
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No donations yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Achievements</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <div key={index} className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    achievement.achieved ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{achievement.title}</div>
                  <div className="text-xs text-gray-500">
                    {achievement.achieved ? 'Unlocked' : `${achievement.threshold} donations`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleScheduleVisit}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium transition-colors"
          >
            Schedule Donation
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Certificate
          </button>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Schedule Donation</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                  <input 
                    type="date" 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    min={new Date().toISOString().split('T')[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Time</label>
                  <select 
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors font-medium"
                  onClick={() => setShowScheduleModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-medium disabled:opacity-50"
                  onClick={handleSubmitAppointment}
                  disabled={!appointmentDate || !appointmentTime}
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Clear Confirmation Modal */}
        {showClearModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Clear All Activities?</h3>
              <p className="text-gray-600 mb-6">
                This will remove all scheduled donations and registrations. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2.5 rounded-lg transition-colors font-medium"
                  onClick={() => setShowClearModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg transition-colors font-medium"
                  onClick={handleClearAll}
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{modalHeading}</h3>
              <p className="text-gray-600 mb-6">{modalMessage}</p>
              <button 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                onClick={() => setShowSuccessModal(false)}
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}