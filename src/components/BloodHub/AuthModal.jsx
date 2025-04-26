import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AuthModal({ show, setShow, authMode, setAuthMode, setIsLoggedIn }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    bloodType: '',
    phone: '',
    dob: '',
    lastDonated: '',
    address: '',
    city: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
    }
  }, [show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setIsLoggedIn(true);
        setShow(false);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const user = userCredential.user;

        const userData = {
          name: formData.name,
          email: formData.email,
          bloodType: formData.bloodType,
          phone: formData.phone || '',
          dob: formData.dob || '',
          lastDonated: formData.lastDonated || '',
          address: formData.address || '',
          city: formData.city || '',
          createdAt: new Date().toISOString(),
        };

        await setDoc(doc(db, 'users', user.uid), userData);
        
        setIsLoggedIn(true);
        setShow(false);
      }
    } catch (error) {
      let errorMessage = error.message;
      if (errorMessage.includes('auth/email-already-in-use')) {
        errorMessage = 'This email is already registered. Please login instead.';
      } else if (errorMessage.includes('auth/weak-password')) {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (errorMessage.includes('auth/user-not-found') || errorMessage.includes('auth/wrong-password')) {
        errorMessage = 'Invalid email or password.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // If this is a new user, create a user document
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || '',
          email: user.email,
          bloodType: '',
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          createdAt: new Date().toISOString()
        });
      }
      
      setIsLoggedIn(true);
      setShow(false);
    } catch (error) {
      console.error("Google sign in error:", error);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div 
        className={`bg-white rounded-xl shadow-xl w-full max-w-md transform transition-all duration-300 ${
          animateIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">
              {authMode === 'login' ? 'Welcome Back' : 'Join Raksetu'}
            </h3>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg transition-colors font-medium"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.0312 10.0312C18.0312 9.25 17.9688 8.5 17.8125 7.78125H10V11.25H14.5312C14.3438 12.25 13.7812 13.0938 12.9062 13.6562V15.8438H15.5625C17.1562 14.3438 18.0312 12.3438 18.0312 10.0312Z" fill="#4285F4"/>
                <path d="M10 18.0625C12.1875 18.0625 14.0625 17.3125 15.5625 15.8438L12.9062 13.6562C12.1562 14.1562 11.1875 14.4688 10 14.4688C7.75 14.4688 5.8125 12.9062 5.125 10.7812H2.4375V13.0312C3.9375 15.9688 6.75 18.0625 10 18.0625Z" fill="#34A853"/>
                <path d="M5.125 10.7812C4.9375 10.2812 4.8125 9.75 4.8125 9.2C4.8125 8.65 4.9375 8.11875 5.125 7.61875V5.36875H2.4375C1.8125 6.5 1.4375 7.8 1.4375 9.2C1.4375 10.6 1.8125 11.9 2.4375 13.0312L5.125 10.7812Z" fill="#FBBC05"/>
                <path d="M10 3.9375C11.2188 3.9375 12.3125 4.34375 13.1875 5.18125L15.5312 2.83125C14.0625 1.45 12.1875 0.625 10 0.625C6.75 0.625 3.9375 2.71875 2.4375 5.65625L5.125 7.90625C5.8125 5.78125 7.75 3.9375 10 3.9375Z" fill="#EA4335"/>
              </svg>
              <span>{authMode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-200"></div>
            <p className="mx-4 text-gray-500 text-sm">OR</p>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authMode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                    <select
                      name="bloodType"
                      value={formData.bloodType}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select</option>
                      {bloodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Donated</label>
                    <input
                      type="date"
                      name="lastDonated"
                      value={formData.lastDonated}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Your city"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors font-medium flex items-center justify-center"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {authMode === 'login' ? 'Sign In' : 'Register'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            {authMode === 'login' ? (
              <>
                New to Raksetu?{' '}
                <button
                  onClick={() => setAuthMode('register')}
                  className="text-red-600 hover:text-red-800 transition-colors font-medium"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already a donor?{' '}
                <button
                  onClick={() => setAuthMode('login')}
                  className="text-red-600 hover:text-red-800 transition-colors font-medium"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}