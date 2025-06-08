import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(false);
  const [googleUserId, setGoogleUserId] = useState(null);
  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
      setShowAdditionalDetails(false);
      setGoogleUserId(null);
      setFormData({
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
      setError('');
      setLoading(false);
      setIsGoogleSignInInProgress(false);
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
    if (isGoogleSignInInProgress) {
      console.log('Google Sign-In already in progress, skipping...');
      return;
    }

    setIsGoogleSignInInProgress(true);
    setLoading(true);
    setError('');
    console.log('Starting Google Sign-In at:', new Date().toISOString());
    
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google Sign-In successful for user:', user.uid);
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          name: user.displayName || '',
          email: user.email,
          bloodType: '',
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '', // photoURL is optional
          createdAt: new Date().toISOString()
        });
        console.log('User document created for new user:', user.uid);
        setGoogleUserId(user.uid);
        setShowAdditionalDetails(true);
      } else {
        console.log('User already exists, logging in:', user.uid);
        setIsLoggedIn(true);
        setShow(false);
      }
    } catch (error) {
      console.error("Google Sign-In error:", error.message, error.code);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
      setIsGoogleSignInInProgress(false);
      console.log('Google Sign-In process completed at:', new Date().toISOString());
    }
  };

  const handleAdditionalDetailsSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted at:', new Date().toISOString());
    
    if (!formData.bloodType) {
      setError('Please select a blood type.');
      console.log('Validation failed: Blood type is required');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Loading state set to true');

    if (!googleUserId) {
      setError('User ID is missing. Please try signing up again.');
      setLoading(false);
      console.log('Error: googleUserId is null');
      return;
    }

    try {
      const userData = {
        bloodType: formData.bloodType,
        phone: formData.phone || '',
        dob: formData.dob || '',
        lastDonated: formData.lastDonated || '',
        city: formData.city || '',
        updatedAt: new Date().toISOString()
      };

      console.log('Updating user with ID:', googleUserId);
      console.log('Data to update:', userData);

      const userDocRef = doc(db, 'users', googleUserId);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out. Please try again.')), 10000);
      });

      await Promise.race([
        updateDoc(userDocRef, userData),
        timeoutPromise
      ]);

      console.log('User details updated successfully');
      setIsLoggedIn(true);
      setShow(false);
    } catch (error) {
      console.error("Error updating additional details:", error.message, error.code);
      let errorMessage = 'Failed to save additional details. Please try again.';
      
      if (error.message.includes('permission-denied')) {
        errorMessage = 'Permission denied. Please ensure you have the correct access rights.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message.includes('timed out')) {
        errorMessage = 'The operation took too long. Please try again.';
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Loading state reset to false');
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
              {showAdditionalDetails ? 'Complete Your Profile' : authMode === 'login' ? 'Welcome Back' : 'Join Raksetu'}
            </h3>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {showAdditionalDetails ? (
            <form onSubmit={handleAdditionalDetailsSubmit} className="space-y-4">
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                  {error}
                </div>
              )}

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

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-red-600 text-white py-3 rounded-lg font-medium flex items-center justify-center transition-opacity ${
                  loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : null}
                Save Details
              </button>
            </form>
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isGoogleSignInInProgress}
                  className={`w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-opacity ${
                    loading || isGoogleSignInInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}