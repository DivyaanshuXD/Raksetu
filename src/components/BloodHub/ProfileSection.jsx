import { useState, useEffect } from 'react';
import { auth } from '../../firebase';

export default function ProfileSection({ userProfile }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (auth.currentUser) {
      setUser({
        name: auth.currentUser.displayName || 'User',
        email: auth.currentUser.email,
        phone: auth.currentUser.phoneNumber || 'Not provided',
        photo: auth.currentUser.photoURL || null,
      });
    }
  }, []);

  if (!user) return <div>Loading...</div>;

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
            onClick={() => alert('Edit profile functionality coming soon!')}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </section>
  );
}