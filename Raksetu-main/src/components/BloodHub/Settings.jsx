import { useState, useEffect } from 'react';
import { logger } from '../../utils/logger';
import { auth, db } from '../utils/firebase';
import { sendPasswordResetEmail, deleteUser, reauthenticateWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { 
  Bell, Mail, Lock, Eye, EyeOff, Trash2, Save, X, User, Shield, AlertTriangle,
  Smartphone, Globe, Database, Download, CheckCircle2, Settings as SettingsIcon, Palette, Sun, Moon
} from 'lucide-react';

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
    smsNotifications: false,
    darkMode: false,
    language: 'en',
    dataBackup: true,
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
      logger.error('User ID mismatch:', { userProfileId: userProfile.id, authUid: auth.currentUser.uid });
      setError('User ID mismatch. Please log in again.');
      setShowAuthModal(true);
      setAuthMode('login');
      setLoading(false);
      setSettings(defaultSettings);
      return;
    }

    const loadSettings = async () => {
      try {
        logger.info('Starting to load settings for user:', userProfile.id);
        setLoading(true);
        const userDocRef = doc(db, 'users', userProfile.id);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          logger.info('Fetched user data from Firestore:', userData);
          const loadedSettings = {
            emailNotifications: userData.emailNotifications ?? defaultSettings.emailNotifications,
            emergencyAlerts: userData.emergencyAlerts ?? defaultSettings.emergencyAlerts,
            bloodDriveReminders: userData.bloodDriveReminders ?? defaultSettings.bloodDriveReminders,
            donationUpdates: userData.donationUpdates ?? defaultSettings.donationUpdates,
            shareBloodType: userData.shareBloodType ?? defaultSettings.shareBloodType,
            shareLocation: userData.shareLocation ?? defaultSettings.shareLocation,
            smsNotifications: userData.smsNotifications ?? defaultSettings.smsNotifications,
            darkMode: userData.darkMode ?? defaultSettings.darkMode,
            language: userData.language ?? defaultSettings.language,
            dataBackup: userData.dataBackup ?? defaultSettings.dataBackup,
          };
          setSettings(loadedSettings);
          logger.info('Loaded settings:', loadedSettings);
        } else {
          logger.info('User document not found, initializing with default settings');
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
        logger.error('Error loading settings:', err);
        setError('Failed to load settings: ' + err.message);
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
        logger.info('Finished loading settings');
      }
    };

    loadSettings();
  }, [isLoggedIn, userProfile, setShowAuthModal, setAuthMode]);

  const handleToggle = (key) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: !prev[key] };
      logger.info('Toggled settings:', newSettings);
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
      logger.info('Saving settings to Firestore:', settings);
      await updateDoc(userDocRef, { ...settings, updatedAt: new Date().toISOString() });
      setUserProfile(prev => ({ ...prev, ...settings }));
      setSuccess('Settings saved successfully!');
      logger.info('Successfully saved settings to Firestore');

      // Fetch the document again to confirm the update
      const updatedDoc = await getDoc(userDocRef);
      if (updatedDoc.exists()) {
        logger.info('Confirmed updated Firestore data:', updatedDoc.data());
      } else {
        logger.error('Failed to fetch updated document after save');
      }
    } catch (err) {
      logger.error('Error saving settings:', err);
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
      logger.error('Error sending password reset email:', err);
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
      logger.error('Re-authentication failed:', err);
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
      logger.error('Error deleting account:', err);
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

  const handleExportData = async () => {
    if (!isLoggedIn || !userProfile || !userProfile.id) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Fetch all user data
      const userData = {
        profile: userProfile,
        settings: settings,
        donations: [],
        emergencyRequests: [],
        appointments: []
      };

      // Fetch donations
      const donationsQuery = query(collection(db, 'donations'), where('userId', '==', userProfile.id));
      const donationsSnapshot = await getDocs(donationsQuery);
      userData.donations = donationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Fetch emergency requests
      const emergenciesQuery = query(collection(db, 'emergencyRequests'), where('userId', '==', userProfile.id));
      const emergenciesSnapshot = await getDocs(emergenciesQuery);
      userData.emergencyRequests = emergenciesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `raksetu-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      logger.error('Error exporting data:', err);
      setError('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 shadow-sm ${
        enabled ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gray-300'
      }`}
      onClick={onChange}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 shadow-md ${
          enabled ? 'translate-x-6 scale-110' : 'translate-x-1'
        }`}
      />
    </button>
  );

  const SettingItem = ({ icon: Icon, label, children, description }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 last:border-0 gap-3 sm:gap-0">
      <div className="flex items-start space-x-3">
        <Icon className="text-gray-400 mt-1 flex-shrink-0" size={18} />
        <div>
          <p className="font-medium text-gray-900 text-sm sm:text-base">{label}</p>
          {description && <p className="text-xs sm:text-sm text-gray-500 mt-1">{description}</p>}
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50/20 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8 sm:mb-10 text-center">
          <div className="inline-flex items-center bg-red-50 border border-red-100 px-3 sm:px-4 py-2 rounded-full text-red-600 text-xs sm:text-sm font-semibold mb-4 shadow-sm">
            <SettingsIcon size={14} className="sm:w-4 sm:h-4 mr-2" />
            <span>Account Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
            Settings
          </h1>
          <p className="text-base sm:text-lg text-gray-600">Manage your account preferences and privacy settings</p>
        </div>

        {/* Settings Cards - Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Account Information */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-6 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl border-b border-blue-100">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-blue-600 p-2 sm:p-2.5 rounded-xl text-white shadow-md">
                  <User size={18} className="sm:w-[22px] sm:h-[22px]" />
                </div>
                Account Information
              </h2>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <SettingItem
                icon={Mail}
                label="Email Address"
                description={userProfile.email || 'Not set'}
              >
                <button
                  className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
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
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-red-600 border-2 border-red-600 rounded-xl hover:bg-red-50 transition-all shadow-sm hover:shadow-md"
                  onClick={handlePasswordReset}
                  disabled={loading || !userProfile.email}
                >
                  Reset
                </button>
              </SettingItem>
              <SettingItem
                icon={Database}
                label="Export Data"
                description="Download all your account data"
              >
                <button
                  className="px-4 py-2 text-sm font-semibold text-green-600 border-2 border-green-600 rounded-xl hover:bg-green-50 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
                  onClick={handleExportData}
                  disabled={loading}
                >
                  <Download size={16} />
                  Export
                </button>
              </SettingItem>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-8 py-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-3xl border-b border-purple-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-purple-600 p-2.5 rounded-xl text-white shadow-md">
                  <Bell size={22} />
                </div>
                Notifications
              </h2>
            </div>
            <div className="p-8 space-y-5">
              <SettingItem
                icon={Mail}
                label="Email Notifications"
                description="Receive general updates via email"
              >
                <ToggleSwitch
                  enabled={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
              </SettingItem>
              <SettingItem
                icon={Smartphone}
                label="SMS Notifications"
                description="Receive critical updates via SMS"
              >
                <ToggleSwitch
                  enabled={settings.smsNotifications}
                  onChange={() => handleToggle('smsNotifications')}
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
                icon={CheckCircle2}
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
        </div>

        {/* Full Width Sections Below */}
        <div className="mt-8 space-y-8">
          {/* Privacy & Preferences - Combined */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-8 py-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-3xl border-b border-green-100">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="bg-green-600 p-2.5 rounded-xl text-white shadow-md">
                  <Shield size={22} />
                </div>
                Privacy & Preferences
              </h2>
            </div>
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Privacy Settings</h3>
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
                  <SettingItem
                    icon={Database}
                    label="Auto Data Backup"
                    description="Automatically backup your data"
                  >
                    <ToggleSwitch
                      enabled={settings.dataBackup}
                      onChange={() => handleToggle('dataBackup')}
                    />
                  </SettingItem>
                </div>
                
                <div className="space-y-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Appearance & Language</h3>
                  <SettingItem
                    icon={settings.darkMode ? Moon : Sun}
                    label="Dark Mode"
                    description="Switch to dark theme (Coming Soon)"
                  >
                    <ToggleSwitch
                      enabled={settings.darkMode}
                      onChange={() => handleToggle('darkMode')}
                    />
                  </SettingItem>
                  <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div className="flex items-start space-x-3">
                      <Globe className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Language</p>
                        <p className="text-sm text-gray-500 mt-1">Choose your preferred language</p>
                      </div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
                      className="px-4 py-2 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-medium"
                    >
                      <option value="en">English</option>
                      <option value="hi">हिन्दी (Hindi)</option>
                      <option value="bn">বাংলা (Bengali)</option>
                      <option value="te">తెలుగు (Telugu)</option>
                      <option value="mr">मराठी (Marathi)</option>
                      <option value="ta">தமிழ் (Tamil)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-3xl shadow-xl border-2 border-red-200 hover:shadow-2xl transition-shadow duration-300">
            <div className="px-8 py-6 bg-gradient-to-r from-red-100 to-pink-100 rounded-t-3xl border-b-2 border-red-200">
              <h2 className="text-2xl font-bold text-red-900 flex items-center gap-2">
                <div className="bg-red-600 p-2.5 rounded-xl text-white shadow-md">
                  <Trash2 size={22} />
                </div>
                Danger Zone
              </h2>
            </div>
            <div className="p-8">
              <SettingItem
                icon={Trash2}
                label="Delete Account"
                description="Permanently delete your account and all associated data. This action cannot be undone."
              >
                <button
                  className="px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                >
                  Delete Account
                </button>
              </SettingItem>
            </div>
          </div>
        </div>

        {/* Enhanced Save Button */}
        <div className="mt-12 flex justify-center">
          <button
            className="group px-12 py-5 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-lg rounded-2xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save size={22} />
                <span>Save All Changes</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </>
            )}
          </button>
        </div>

        {/* Enhanced Status Messages */}
        {(error || success) && (
          <div className="mt-8 max-w-2xl mx-auto">
            {error && (
              <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 rounded-2xl text-sm shadow-lg flex items-start gap-3 animate-pulse">
                <AlertTriangle size={24} className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 rounded-2xl text-sm shadow-lg flex items-start gap-3">
                <CheckCircle2 size={24} className="flex-shrink-0" />
                <span className="font-medium">{success}</span>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle size={28} className="text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Delete Account</h3>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-8">
                <p className="text-gray-600 text-base leading-relaxed mb-4">
                  ⚠️ <span className="font-semibold">This action cannot be undone.</span> All your data will be permanently deleted including:
                </p>
                <ul className="space-y-2 text-sm text-gray-600 ml-6 list-disc">
                  <li>Profile information and settings</li>
                  <li>Donation history and statistics</li>
                  <li>Emergency requests and appointments</li>
                  <li>All associated records</li>
                </ul>
              </div>
              <div className="flex gap-4">
                <button
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 font-bold shadow-lg transition-all"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Re-authentication Modal */}
        {showReauthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all animate-scaleIn">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Shield size={28} className="text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Security Check</h3>
                </div>
                <button
                  onClick={() => setShowReauthModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-gray-600 text-base leading-relaxed mb-8">
                🔒 For security reasons, please re-authenticate with your Google account to delete your account.
              </p>
              <div className="flex gap-4">
                <button
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-colors"
                  onClick={() => setShowReauthModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 flex items-center justify-center gap-2 font-bold shadow-lg transition-all hover:scale-105"
                  onClick={handleReauthAndDelete}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.0312 10.0312C18.0312 9.25 17.9688 8.5 17.8125 7.78125H10V11.25H14.5312C14.3438 12.25 13.7812 13.0938 12.9062 13.6562V15.8438H15.5625C17.1562 14.3438 18.0312 12.3438 18.0312 10.0312Z" fill="#4285F4"/>
                    <path d="M10 18.0625C12.1875 18.0625 14.0625 17.3125 15.5625 15.8438L12.9062 13.6562C12.1562 14.1562 11.1875 14.4688 10 14.4688C7.75 14.4688 5.8125 12.9062 5.125 10.7812H2.4375V13.0312C3.9375 15.9688 6.75 18.0625 10 18.0625Z" fill="#34A853"/>
                    <path d="M5.125 10.7812C4.9375 10.2812 4.8125 9.75 4.8125 9.2C4.8125 8.65 4.9375 8.11875 5.125 7.61875V5.36875H2.4375C1.8125 6.5 1.4375 7.8 1.4375 9.2C1.4375 10.6 1.8125 11.9 2.4375 13.0312L5.125 10.7812Z" fill="#FBBC05"/>
                    <path d="M10 3.9375C11.2188 3.9375 12.3125 4.34375 13.1875 5.18125L15.5312 2.83125C14.0625 1.45 12.1875 0.625 10 0.625C6.75 0.625 3.9375 2.71875 2.4375 5.65625L5.125 7.90625C5.8125 5.78125 7.75 3.9375 10 3.9375Z" fill="#EA4335"/>
                  </svg>
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
