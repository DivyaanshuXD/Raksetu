import { useState, useEffect } from 'react';
import { auth } from '../utils/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfileSection({ userProfile }) {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    phone: '',
    photo: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.currentUser) {
      setUser({
        name: auth.currentUser.displayName || 'User',
        email: auth.currentUser.email,
        phone: auth.currentUser.phoneNumber || 'Not provided',
        photo: auth.currentUser.photoURL || null,
      });
      setEditData({
        name: auth.currentUser.displayName || 'User',
        email: auth.currentUser.email,
        phone: auth.currentUser.phoneNumber || 'Not provided',
        photo: auth.currentUser.photoURL || '',
      });
    }
  }, []);

  if (!user) return <div>Loading...</div>;

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('No user logged in');

      await updateProfile(currentUser, {
        displayName: editData.name,
        photoURL: editData.photo || null,
      });

      // Email and phone updates require re-authentication or additional Firebase setup
      setUser({
        ...user,
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        photo: editData.photo,
      });
      setShowEditModal(false);
      setError('');
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error('Error updating profile:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6">Profile</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center space-x-4 mb-4">
            {user.photo ? (
              <img src={user.photo} alt="Profile" className="h-16 w-16 rounded-full" />
            ) : (
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-xl">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-600">{user.phone}</p>
            </div>
          </div>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            onClick={handleEditProfile}
          >
            Edit Profile
          </button>
        </div>

        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Edit Profile</h3>
              {error && <p className="text-red-600 mb-4">{error}</p>}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Photo URL</label>
                  <input
                    type="text"
                    name="photo"
                    value={editData.photo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2"
                    placeholder="Enter image URL (optional)"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg transition-colors font-medium"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors font-medium"
                  onClick={handleSaveProfile}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}