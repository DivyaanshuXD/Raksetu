import { useState, useEffect } from 'react';
import { auth, db } from '../utils/firebase';
import { sendPasswordResetEmail, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { Bell, Mail, Lock, Eye, EyeOff, Trash2, Save, X, User, Shield, AlertTriangle } from 'lucide-react';

export default function Settings({ userProfile, setUserProfile, isLoggedIn, setShowAuthModal, setAuthMode }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);

  const defaultSettings = {
    emailNotifications: true,
    emergencyAlerts: true,
    bloodDriveReminders: true,
    donationUpdates: true,
    shareBloodType: true,
    shareLocation: false,
  };

  // Load user settings
  useEffect(() => {
    if (!isLoggedIn || !userProfile || !userProfile.id) {
      setShowAuthModal(true);
      setAuthMode('login');
      setLoading(false);
      setSettings(defaultSettings);
      return;
    }

    // Verify that userProfile.id matches the authenticated user's UID
    if (userProfile.id !== auth.currentUser.uid) {
      console.error('User ID mismatch:', { userProfileId: userProfile.id, authUid: auth.currentUser.uid });
      setError('User ID mismatch. Please log in again.');
      setShowAuthModal(true);
      setAuthMode('login');
      setLoading(false);
      setSettings(defaultSettings);
      return;
    }

    const loadSettings = async () => {
      try {
        console.log('Starting to load settings for user:', userProfile.id);
        setLoading(true);
        const userDocRef = doc(db, 'users', userProfile.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          console.log('Fetched user data from Firestore:', userData);
          const loadedSettings = {
            emailNotifications: userData.emailNotifications ?? defaultSettings.emailNotifications,
            emergencyAlerts: userData.emergencyAlerts ?? defaultSettings.emergencyAlerts,
            bloodDriveReminders: userData.bloodDriveReminders ?? defaultSettings.bloodDriveReminders,
            donationUpdates: userData.donationUpdates ?? defaultSettings.donationUpdates,
            shareBloodType: userData.shareBloodType ?? defaultSettings.shareBloodType,
            shareLocation: userData.shareLocation ?? defaultSettings.shareLocation,
          };
          setSettings(loadedSettings);
          console.log('Loaded settings:', loadedSettings);
        } else {
          console.log('User document not found, initializing with default settings');
          // Initialize the document with default settings
          await setDoc(userDocRef, {
            ...defaultSettings,
            email: userProfile.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          setSettings(defaultSettings);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings: ' + err.message);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
        console.log('Finished loading settings');
      }
    };

    loadSettings();
  }, [isLoggedIn, userProfile, setShowAuthModal, setAuthMode]);

  const handleToggle = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      console.log('Toggled settings:', newSettings);
      return newSettings;
    });
  };

  const handleSaveSettings = async () => {
    if (!isLoggedIn || !userProfile || !userProfile.id || !settings) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Verify user ID again before saving
      if (userProfile.id !== auth.currentUser.uid) {
        throw new Error('User ID mismatch. Please log in again.');
      }

      const userDocRef = doc(db, 'users', userProfile.id);
      console.log('Saving settings to Firestore:', settings);
      await updateDoc(userDocRef, { ...settings, updatedAt: new Date().toISOString() });
      setUserProfile(prev => ({ ...prev, ...settings }));
      setSuccess('Settings saved successfully!');
      console.log('Successfully saved settings to Firestore');

      // Fetch the document again to confirm the update
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        console.log('Confirmed updated Firestore data:', updatedDoc.data());
      } else {
        console.error('Failed to fetch updated document after save');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      let errorMessage = 'Failed to save settings. Please try again.';
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you are logged in with the correct account.';
      } else if (err.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (err.message === 'User ID mismatch. Please log in again.') {
        errorMessage = err.message;
        setShowAuthModal(true);
        setAuthMode('login');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!isLoggedIn || !userProfile || !userProfile.email) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      setSuccess('Password reset email sent! Check your inbox.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error sending password reset email:', err);
      let errorMessage = 'Failed to send password reset email.';
      if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address. Please update your email and try again.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'User not found. Please try logging in again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const reauthenticateUser = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(auth.currentUser, provider);
      setShowReauthModal(false);
      return true;
    } catch (err) {
      console.error('Re-authentication failed:', err);
      setError('Failed to re-authenticate. Please try again.');
      setShowReauthModal(false);
      return false;
    }
  };

  const handleDeleteAccount = async () => {
    if (!isLoggedIn || !userProfile || !userProfile.id) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found.');
      }

      const userDocRef = doc(db, 'users', userProfile.id);

      // Delete related data
      const collections = ['appointments', 'userDrives', 'emergencyRequests', 'testimonials'];
      for (const col of collections) {
        const q = query(collection(db, col), where('userId', '==', userProfile.id));
        const snapshot = await getDocs(q);
        await Promise.all(snapshot.docs.map(doc => deleteDoc(doc.ref)));
      }

      // Delete user document
      await deleteDoc(userDocRef);

      // Attempt to delete the Firebase Auth user
      try {
        await deleteUser(user);
      } catch (authErr) {
        if (authErr.code === 'auth/requires-recent-login') {
          setLoading(false);
          setShowDeleteConfirm(false);
          setShowReauthModal(true);
          return;
        }
        throw authErr;
      }

      // Successfully deleted
      setUserProfile(null);
      setShowAuthModal(true);
      setAuthMode('login');
      setSuccess('Account deleted successfully.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Error deleting account:', err);
      let errorMessage = 'Failed to delete account.';
      if (err.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please ensure you are logged in with the correct account.';
      } else if (err.code === 'network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleReauthAndDelete = async () => {
    const reauthSuccess = await reauthenticateUser();
    if (reauthSuccess) {
      await handleDeleteAccount();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
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
                description={userProfile.email || 'Not set'}
              >
                <button
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                  onClick={() => { setShowAuthModal(true); setAuthMode('login'); }}
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
                  disabled={loading || !userProfile.email}
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

        {/* Re-authentication Modal */}
        {showReauthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Re-authentication Required</h3>
                <button
                  onClick={() => setShowReauthModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-gray-600 mb-6">
                For security reasons, please re-authenticate to delete your account.
              </p>
              <div className="flex space-x-3">
                <button
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={() => setShowReauthModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                  onClick={handleReauthAndDelete}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.0312 10.0312C18.0312 9.25 17.9688 8.5 17.8125 7.78125H10V11.25H14.5312C14.3438 12.25 13.7812 13.0938 12.9062 13.6562V15.8438H15.5625C17.1562 14.3438 18.0312 12.3438 18.0312 10.0312Z" fill="#4285F4"/>
                    <path d="M10 18.0625C12.1875 18.0625 14.0625 17.3125 15.5625 15.8438L12.9062 13.6562C12.1562 14.1562 11.1875 14.4688 10 14.4688C7.75 14.4688 5.8125 12.9062 5.125 10.7812H2.4375V13.0312C3.9375 15.9688 6.75 18.0625 10 18.0625Z" fill="#34A853"/>
                    <path d="M5.125 10.7812C4.9375 10.2812 4.8125 9.75 4.8125 9.2C4.8125 8.65 4.9375 8.11875 5.125 7.61875V5.36875H2.4375C1.8125 6.5 1.4375 7.8 1.4375 9.2C1.4375 10.6 1.8125 11.9 2.4375 13.0312L5.125 10.7812Z" fill="#FBBC05"/>
                    <path d="M10 3.9375C11.2188 3.9375 12.3125 4.34375 13.1875 5.18125L15.5312 2.83125C14.0625 1.45 12.1875 0.625 10 0.625C6.75 0.625 3.9375 2.71875 2.4375 5.65625L5.125 7.90625C5.8125 5.78125 7.75 3.9375 10 3.9375Z" fill="#EA4335"/>
                  </svg>
                  Re-authenticate with Google
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}