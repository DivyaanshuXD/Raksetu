import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { updatePassword, deleteUser } from 'firebase/auth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/login');
        setLoading(false);
        return;
      }

      try {
        const userDoc = doc(db, 'users', currentUser.uid);
        const userSnapshot = await getDoc(userDoc);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUser(userData);
          setFormData(userData);
        } else {
          navigate('/login');
        }
      } catch (err) {
        setError('Failed to fetch user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    setError(null);
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, formData);
      setUser(formData);
      setEditMode(false);
      alert('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setError(null);
    setLoading(true);
    if (newPassword.length < 6) {
      setError(t('passwordLengthError'));
      setLoading(false);
      return;
    }
    try {
      const currentUser = auth.currentUser;
      await updatePassword(currentUser, newPassword);
      setNewPassword('');
      alert('Password changed successfully!');
    } catch (error) {
      setError('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setError(null);
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        const userDoc = doc(db, 'users', currentUser.uid);
        await deleteDoc(userDoc);
        await deleteUser(currentUser);
        navigate('/login');
      } catch (error) {
        setError('Failed to delete account. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">{t('settings')}</h2>
      <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg mb-6 transform transition-all hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('profileInfo')}</h3>
        <p className="mb-2"><strong>{t('name')}:</strong> {user.name}</p>
        <p className="mb-2"><strong>{t('email')}:</strong> {user.email}</p>
        <p className="mb-2"><strong>{t('bloodGroup')}:</strong> {user.bloodGroup}</p>
        <p className="mb-2"><strong>{t('role')}:</strong> {user.role}</p>
      </div>

      {editMode ? (
        <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg mb-6 transform transition-all hover:scale-105">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('editProfile')}</h3>
          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('name')}:</span>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled={loading}
            />
          </label>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleUpdate}
              className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '...' : t('save')}
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="px-4 py-2 text-white bg-gradient-to-r from-gray-500 to-gray-600 rounded-md hover:from-gray-600 hover:to-gray-700 transition-all hover:scale-105 disabled:opacity-50"
              disabled={loading}
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <button
            onClick={() => setEditMode(true)}
            className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {t('editProfile')}
          </button>
        </div>
      )}

      <div className="p-6 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl shadow-lg mb-6 transform transition-all hover:scale-105">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-white mb-4">{t('changePassword')}</h3>
        <input
          type="password"
          placeholder={t('password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white mb-4"
          disabled={loading}
        />
        <div className="text-center">
          <button
            onClick={handleChangePassword}
            className="px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-md hover:from-blue-600 hover:to-blue-700 transition-all hover:scale-105 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? '...' : t('updatePassword')}
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700 transition-all hover:scale-105 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '...' : t('deleteAccount')}
        </button>
      </div>
      {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default React.memo(Profile);