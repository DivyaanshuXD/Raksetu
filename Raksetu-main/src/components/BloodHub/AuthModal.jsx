import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import RoleSelector from '../common/RoleSelector';
import PhoneInput from '../common/PhoneInput';
import { USER_ROLES } from '../../constants/roles';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useFocusTrap, useEscapeKey } from '../../utils/accessibility.jsx';
import { validateEmail, validatePhone, sanitizeUserProfile, checkRateLimit } from '../../utils/security';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AuthModal({ show, setShow, authMode, setAuthMode }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '', // Added role field
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
  const [showAdditionalDetails, setShowAdditionalDetails] = useState(
    sessionStorage.getItem('showAdditionalDetails') === 'true'
  );
  const [googleUserId, setGoogleUserId] = useState(
    sessionStorage.getItem('googleUserId') || null
  );
  const [isGoogleSignInInProgress, setIsGoogleSignInInProgress] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Refs for accessibility
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);
  
  // Use ref to immediately track profile completion mode (before React state updates)
  // Initialize from sessionStorage to survive component remounts
  const isProfileCompletionMode = useRef(
    sessionStorage.getItem('isProfileCompletionMode') === 'true'
  );

  // Focus trap for modal accessibility
  useFocusTrap(modalRef, show || showAdditionalDetails, firstInputRef);
  
  // Escape key to close modal (only if not in profile completion mode)
  useEscapeKey(() => {
    if (!isProfileCompletionMode.current && !showAdditionalDetails) {
      handleClose();
    }
  }, show);

  // Memoize blood type options to prevent re-renders
  const bloodTypeOptions = useMemo(() => bloodTypes, []);

  // Track component lifecycle
  useEffect(() => {
    // If we're in profile completion mode after remount, animate in and fetch user data
    if (isProfileCompletionMode.current && googleUserId && auth.currentUser) {
      // Animate in the modal
      setTimeout(() => setAnimateIn(true), 10);
      
      // Pre-fill form with current user data
      setFormData(prev => ({
        ...prev,
        name: auth.currentUser.displayName || prev.name || '',
        email: auth.currentUser.email || prev.email || ''
      }));
    }
  }, []);

  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      // Only reset if we're NOT in the middle of Google sign-up profile completion
      // Check REF first (immediate value), then state (delayed value)
      if (isProfileCompletionMode.current || showAdditionalDetails || googleUserId) {
        // DON'T reset anything - profile completion in progress
      } else {
        isProfileCompletionMode.current = false; // Reset ref when fully resetting
        sessionStorage.removeItem('isProfileCompletionMode');
        sessionStorage.removeItem('googleUserId');
        sessionStorage.removeItem('showAdditionalDetails');
        setAnimateIn(false);
        setShowAdditionalDetails(false);
        setGoogleUserId(null);
        setFormData({
          email: '',
          password: '',
          name: '',
          role: '', // Reset role
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
    }
  }, [show, showAdditionalDetails, googleUserId]);

  // Optimized input handler with useCallback to prevent re-renders
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        setShow(false);
        setFormData({
          email: '',
          password: '',
          name: '',
          role: '',
          bloodType: '',
          phone: '',
          dob: '',
          lastDonated: '',
          address: '',
          city: ''
        });
      } else {
        // Validate required fields
        if (!formData.role) {
          setError('Please select your role (Donor or Recipient)');
          return;
        }
        if (!formData.phone) {
          setError('Please enter your phone number');
          return;
        }
        if (!formData.bloodType) {
          setError('Please select your blood group');
          return;
        }

        // Generate email from phone number for Firebase Auth
        // Format: +919876543210 -> 919876543210@raksetu.app
        const phoneDigits = formData.phone.replace(/\D/g, '');
        const generatedEmail = `${phoneDigits}@raksetu.app`;

        // Check if phone/email already exists
        const emailQuery = query(collection(db, 'users'), where('email', '==', generatedEmail));
        const emailSnapshot = await getDocs(emailQuery);
        if (!emailSnapshot.empty) {
          throw new Error('This phone number is already registered. Please login instead.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, formData.password);
        const user = userCredential.user;

        const userData = {
          name: formData.name,
          email: generatedEmail, // Generated email for Firebase Auth
          phone: formData.phone, // Twilio-compatible format: +919876543210
          phoneNumber: formData.phone, // Alias for compatibility
          bloodType: formData.bloodType,
          role: formData.role,
          createdAt: new Date().toISOString(),
          emailVerified: false,
          registrationType: 'phone', // Track registration method
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        // Send email verification
        try {
          await sendEmailVerification(user, {
            url: window.location.origin + '/profile',
            handleCodeInApp: false,
          });
        } catch (emailError) {
          // Don't block signup if email fails
        }

        // Success - close modal and reset form
        setShow(false);
        setFormData({
          email: '',
          password: '',
          name: '',
          role: '',
          bloodType: '',
          phone: '',
          dob: '',
          lastDonated: '',
          address: '',
          city: ''
        });
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
      return;
    }

    setLoading(true);
    setError('');
    setIsGoogleSignInInProgress(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      if (!result || !result.user) {
        throw new Error('No user data received from Google');
      }
      
      const user = result.user;

      // Check if user document exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // NEW USER - Create minimal profile and show profile completion form
        
        // IMMEDIATELY set ref to prevent modal from closing
        isProfileCompletionMode.current = true;
        sessionStorage.setItem('isProfileCompletionMode', 'true');
        
        try {
          await setDoc(doc(db, 'users', user.uid), {
            name: user.displayName || '',
            email: user.email,
            photoURL: user.photoURL || '',
            phone: user.phoneNumber || '',
            createdAt: new Date().toISOString(),
            emailVerified: user.emailVerified || false
          });
        } catch (docError) {
          isProfileCompletionMode.current = false; // Reset on error
          throw docError; // Re-throw to be caught by outer catch
        }
        
        // Pre-fill form data with Google info
        setFormData(prev => ({
          ...prev,
          name: user.displayName || '',
          email: user.email,
          phone: user.phoneNumber || ''
        }));
        
        // Show profile completion modal
        setGoogleUserId(user.uid);
        sessionStorage.setItem('googleUserId', user.uid);
        
        setShowAdditionalDetails(true);
        sessionStorage.setItem('showAdditionalDetails', 'true');
        
        setLoading(false);
        
        setIsGoogleSignInInProgress(false);
        
        return; // IMPORTANT: Don't execute finally block
      } else {
        // EXISTING USER - Check if profile is complete
        const userData = userDoc.data();
        
        if (!userData.role || !userData.phone || !userData.bloodType) {
          // User exists but profile incomplete - show profile completion
          
          // IMMEDIATELY set ref to prevent modal from closing
          isProfileCompletionMode.current = true;
          sessionStorage.setItem('isProfileCompletionMode', 'true');
          
          setFormData(prev => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            bloodType: userData.bloodType || '',
            phone: userData.phone || '',
            dob: userData.dob || '',
            city: userData.city || ''
          }));
          setGoogleUserId(user.uid);
          sessionStorage.setItem('googleUserId', user.uid);
          setShowAdditionalDetails(true);
          sessionStorage.setItem('showAdditionalDetails', 'true');
          setLoading(false); // Allow user to fill form
          setIsGoogleSignInInProgress(false);
          return; // IMPORTANT: Don't execute finally block
        } else {
          // User has complete profile - login successfully and close modal
          // First clear Google states, then close modal
          setShowAdditionalDetails(false);
          setGoogleUserId(null);
          setFormData({
            email: '',
            password: '',
            name: '',
            role: '',
            bloodType: '',
            phone: '',
            dob: '',
            lastDonated: '',
            address: '',
            city: ''
          });
          setShow(false); // Close modal AFTER clearing states
        }
      }
    } catch (error) {
      if (error.code === 'auth/account-exists-with-different-credential') {
        setError('This email is already registered with a different sign-in method. Please sign in using that method and link your Google account.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please try again.');
      } else {
        setError('Failed to sign in with Google: ' + error.message);
      }
    } finally {
      // Don't reset states here - each path handles its own loading state
      // New user path: setLoading(false) after setting showAdditionalDetails
      // Existing user paths: handled in their respective branches
    }
  };

  const handleAdditionalDetailsSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.role) {
      setError('Please select your role (Donor or Recipient)');
      return;
    }
    if (!formData.name || !formData.phone || !formData.bloodType) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    // Use googleUserId from state, or fallback to current user
    const userId = googleUserId || auth.currentUser?.uid;
    
    if (!userId) {
      setError('User ID is missing. Please try signing up again.');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone, // Twilio-compatible format from PhoneInput
        phoneNumber: formData.phone, // Alias for compatibility
        bloodType: formData.bloodType,
        role: formData.role,
        updatedAt: new Date().toISOString(),
        emailVerified: auth.currentUser?.emailVerified || false,
        registrationType: 'google', // Track registration method
      };

      const userDocRef = doc(db, 'users', userId);

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Operation timed out. Please try again.')), 10000);
      });

      await Promise.race([
        updateDoc(userDocRef, userData),
        timeoutPromise
      ]);
      
      // Clear profile completion mode and close modal
      isProfileCompletionMode.current = false;
      sessionStorage.removeItem('isProfileCompletionMode');
      sessionStorage.removeItem('googleUserId');
      sessionStorage.removeItem('showAdditionalDetails');
      
      setShowAdditionalDetails(false);
      setShow(false);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: '',
        bloodType: '',
        phone: '',
        dob: '',
        lastDonated: '',
        address: '',
        city: ''
      });
      setGoogleUserId(null);
    } catch (error) {
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
    }
  };

  const handleClose = () => {
    // Don't allow closing if we're in profile completion mode (check ref for immediate value)
    if (isProfileCompletionMode.current) {
      return;
    }
    if (showAdditionalDetails && googleUserId) {
      return;
    }
    setAnimateIn(false);
    setTimeout(() => setShow(false), 300);
  };

  // Override show prop if we're in profile completion mode
  // Check ref first (immediate), then state (delayed)
  const shouldShowModal = show || isProfileCompletionMode.current || (showAdditionalDetails && googleUserId);

  if (!shouldShowModal) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div 
        ref={modalRef}
        className={`notranslate bg-white w-full max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[95vh] overflow-y-auto transform transition-all duration-300 ${
          animateIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 scale-95'
        }`}
        style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <h3 id="auth-modal-title" className="text-xl sm:text-2xl font-bold text-gray-800">
              {(showAdditionalDetails || isProfileCompletionMode.current) ? 'Complete Your Profile' : authMode === 'login' ? 'Welcome Back' : 'Join Raksetu'}
            </h3>
            <button 
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-xl hover:bg-gray-100 -mr-2"
              aria-label="Close authentication modal"
              disabled={isProfileCompletionMode.current || showAdditionalDetails}
            >
              <X size={22} />
            </button>
          </div>

          {(showAdditionalDetails || isProfileCompletionMode.current) ? (
            <form onSubmit={handleAdditionalDetailsSubmit} className="space-y-5" noValidate>
              {error && (
                <div 
                  className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">✨ Complete your profile!</span> Fill in your details to get started.
                </p>
              </div>

              {/* Name Field */}
              <div>
                <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-500" aria-label="required">*</span>
                </label>
                <input
                  id="profile-name"
                  ref={firstInputRef}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                  required
                  aria-required="true"
                  aria-invalid={!formData.name && error ? 'true' : 'false'}
                />
              </div>

              {/* Phone Number with Country Code */}
              <PhoneInput
                value={formData.phone}
                onChange={(phone) => setFormData({ ...formData, phone })}
                error={error && !formData.phone ? 'Phone number is required' : ''}
                required
              />

              {/* Blood Group Selection */}
              <div>
                <label htmlFor="profile-bloodtype" className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group <span className="text-red-500" aria-label="required">*</span>
                </label>
                <select
                  id="profile-bloodtype"
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  required
                  aria-required="true"
                  aria-invalid={!formData.bloodType && error ? 'true' : 'false'}
                >
                  <option value="">Select your blood group</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Selection for Google Sign-in */}
              <RoleSelector
                selectedRole={formData.role}
                onRoleSelect={(role) => setFormData({ ...formData, role })}
                error={error && !formData.role ? 'Please select your role to continue' : ''}
              />

              <button
                type="submit"
                disabled={loading || !formData.role || !formData.name || !formData.phone || !formData.bloodType}
                className={`w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center transition-all ${
                  loading || !formData.role || !formData.name || !formData.phone || !formData.bloodType
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-lg hover:shadow-red-600/30'
                }`}
                aria-label={loading ? 'Completing registration' : 'Complete registration and create account'}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </>
                ) : 'Complete Registration'}
              </button>
            </form>
          ) : (
            <>
              <div className="mb-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading || isGoogleSignInInProgress}
                  className={`w-full flex items-center justify-center gap-2 sm:gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3.5 sm:py-3 px-4 rounded-lg font-medium transition-all shadow-sm hover:shadow-md text-base sm:text-sm active:scale-[0.98] ${
                    loading || isGoogleSignInInProgress ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 hover:border-gray-400'
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    {/* Phone Number with Country Code */}
                    <PhoneInput
                      value={formData.phone}
                      onChange={(phone) => setFormData({ ...formData, phone })}
                      error={error && !formData.phone ? 'Phone number is required' : ''}
                      required
                    />

                    {/* Blood Group Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleChange}
                        className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        required
                      >
                        <option value="">Select your blood group</option>
                        {bloodTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Role Selection - REQUIRED for registration */}
                    <RoleSelector
                      selectedRole={formData.role}
                      onRoleSelect={(role) => setFormData({ ...formData, role })}
                      error={error && !formData.role ? 'Please select your role' : ''}
                    />
                  </>
                )}

                {authMode === 'login' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 sm:py-2.5 text-base sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white py-3.5 sm:py-3 rounded-lg transition-all font-medium flex items-center justify-center text-base sm:text-sm shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  {loading ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : null}
                  {authMode === 'login' ? 'Sign In' : 'Register'}
                </button>
                
                {/* Forgot Password link (only show on login) */}
                {authMode === 'login' && (
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
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
      
      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        show={showForgotPassword}
        setShow={setShowForgotPassword}
      />
    </div>
  );
}