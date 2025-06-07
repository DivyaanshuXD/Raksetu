import { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Bell, Mail, Lock, Eye, EyeOff, Trash2, Save, X, User, Shield, AlertTriangle } from 'lucide-react';

export default function Settings({ userProfile, setUserProfile, isLoggedIn, setShowAuthModal, setAuthMode }) {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    emergencyAlerts: true,
    bloodDriveReminders: true,
    donationUpdates: true,
    shareBloodType: true,
    shareLocation: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load user settings
  useEffect(() => {
    if (!isLoggedIn || !userProfile) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    // Simplified loading logic...
  }, [isLoggedIn, userProfile, setShowAuthModal, setAuthMode]);

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    if (!isLoggedIn || !userProfile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const userDocRef = doc(db, 'users', userProfile.id);
      await updateDoc(userDocRef, { ...settings, updatedAt: new Date().toISOString() });
      setUserProfile(prev => ({ ...prev, ...settings }));
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!isLoggedIn || !userProfile) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      setSuccess('Password reset email sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send password reset email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!isLoggedIn || !userProfile) return;
    setLoading(true);
    try {
      const user = auth.currentUser;
      const userDocRef = doc(db, 'users', userProfile.id);
      
      // Delete related data
      const collections = ['appointments', 'userDrives', 'emergencyRequests', 'testimonials'];
      for (const col of collections) {
        const q = query(collection(db, col), where('userId', '==', userProfile.id));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
      }
      
      await deleteDoc(userDocRef);
      await deleteUser(user);
      
      setUserProfile(null);
      setShowAuthModal(true);
      setAuthMode('login');
      setSuccess('Account deleted successfully.');
    } catch (err) {
      setError('Failed to delete account.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
        enabled ? 'bg-red-600' : 'bg-gray-200'
      }`}
      onClick={onChange}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ icon: Icon, label, children, description }) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-start space-x-3">
        <Icon className="text-gray-400 mt-1" size={20} />
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );

  if (!isLoggedIn || !userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Please Log In</h2>
          <p className="mt-1 text-sm text-gray-500">You need to be logged in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        {/* Settings Cards */}
        <div className="space-y-6">
          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="mr-2" size={20} />
                Account Information
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <SettingItem
                icon={Mail}
                label="Email Address"
                description={userProfile.email}
              >
                <button
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                  onClick={() => {setShowAuthModal(true); setAuthMode('login');}}
                >
                  Change
                </button>
              </SettingItem>
              <SettingItem
                icon={Lock}
                label="Password"
                description="Reset your password via email"
              >
                <button
                  className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                  onClick={handlePasswordReset}
                  disabled={loading}
                >
                  Reset
                </button>
              </SettingItem>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Bell className="mr-2" size={20} />
                Notifications
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <SettingItem
                icon={Bell}
                label="Email Notifications"
                description="Receive general updates via email"
              >
                <ToggleSwitch
                  enabled={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </SettingItem>
              <SettingItem
                icon={AlertTriangle}
                label="Emergency Alerts"
                description="Critical blood shortage notifications"
              >
                <ToggleSwitch
                  enabled={settings.emergencyAlerts}
                  onChange={() => handleToggle('emergencyAlerts')}
                />
              </SettingItem>
              <SettingItem
                icon={Bell}
                label="Blood Drive Reminders"
                description="Notifications about upcoming drives"
              >
                <ToggleSwitch
                  enabled={settings.bloodDriveReminders}
                  onChange={() => handleToggle('bloodDriveReminders')}
                />
              </SettingItem>
              <SettingItem
                icon={Bell}
                label="Donation Updates"
                description="Updates on your donation impact"
              >
                <ToggleSwitch
                  enabled={settings.donationUpdates}
                  onChange={() => handleToggle('donationUpdates')}
                />
              </SettingItem>
            </div>
          </div>

          {/* Privacy */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Shield className="mr-2" size={20} />
                Privacy
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <SettingItem
                icon={Eye}
                label="Share Blood Type"
                description="Allow others to see your blood type"
              >
                <ToggleSwitch
                  enabled={settings.shareBloodType}
                  onChange={() => handleToggle('shareBloodType')}
                />
              </SettingItem>
              <SettingItem
                icon={EyeOff}
                label="Share Location"
                description="Help match you with nearby requests"
              >
                <ToggleSwitch
                  enabled={settings.shareLocation}
                  onChange={() => handleToggle('shareLocation')}
                />
              </SettingItem>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-lg shadow-sm border border-red-200">
            <div className="px-6 py-4 border-b border-red-200">
              <h2 className="text-lg font-medium text-red-900 flex items-center">
                <Trash2 className="mr-2" size={20} />
                Danger Zone
              </h2>
            </div>
            <div className="p-6">
              <SettingItem
                icon={Trash2}
                label="Delete Account"
                description="Permanently delete your account and all associated data"
              >
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  Delete
                </button>
              </SettingItem>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          <button
            className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Status Messages */}
        {(error || success) && (
          <div className="mt-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}