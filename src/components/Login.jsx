import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let emailToUse = identifier;

      // If identifier is not an email (no '@' symbol), try to find the associated email/username
      if (!identifier.includes('@')) {
        const q = query(collection(db, 'users'), where('username', '==', identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error(t('userNotFound'));
        }

        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        emailToUse = userData.authEmail || userData.email; // Try authEmail first, fallback to email

        if (!emailToUse) {
          throw new Error(t('emailNotFoundForUsername'));
        }
      }

      // Attempt to log in with the resolved email and password
      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log('Login successful, navigating to /blood-hub');
      navigate('/blood-hub');
    } catch (err) {
      setError(err.message || t('loginFailed'));
      console.error('Login error:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider); // Prompts user to select Google account
      const user = result.user;
      console.log('Google login successful:', user.uid);

      // Check if user exists in Firestore, create if not
      const q = query(collection(db, 'users'), where('authEmail', '==', user.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        const userData = {
          username: user.displayName || user.email.split('@')[0], // Default username from display name or email
          email: user.email,
          authEmail: user.email,
          phone: '',
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('New user data saved to Firestore:', userData);
      }

      navigate('/blood-hub');
    } catch (error) {
      setError(error.message || t('googleLoginFailed'));
      console.error('Google login error:', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video with Fallback */}
      <video
        autoPlay
        muted
        loop
        onError={(e) => console.error('Video load error:', e.target.error)}
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="src/assets/login-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay for Readability */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      <div className="min-h-screen flex items-center justify-center p-6 relative z-20">
        <header className="absolute top-0 right-0 p-4">
          <Link to="/blood-hub">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <HomeIcon className="h-8 w-8 text-red-400 hover:text-red-300 transition-all duration-300" />
            </motion.div>
          </Link>
        </header>

        <motion.div
          className="p-6 max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-red-500 dark:text-red-400 mb-6 font-inter text-center">
            {t('login')}
          </h2>

          {error && (
            <motion.p
              className="text-red-500 mb-4 font-inter font-medium text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          {/* Email/Username and Password Login Area */}
          <form onSubmit={handleLogin} className="space-y-6 mb-8">
            <div>
              <label className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('emailOrUsername')}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>

            <motion.button
              type="submit"
              className={`w-full p-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 font-inter font-semibold ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin mr-2">⚪</div>
                  {t('loggingIn')}
                </div>
              ) : (
                t('login')
              )}
            </motion.button>
          </form>

          {/* Google Login Area */}
          <div className="border-t border-neutral-300 dark:border-neutral-600 pt-6">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full p-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300 font-inter font-semibold"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
            >
              {t('loginWithGoogle')}
            </motion.button>
          </div>

          <p className="mt-4 text-center text-red-400 dark:text-red-300 font-inter">
            {t('dontHaveAccount')}{' '}
            <Link
              to="/register"
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500"
            >
              {t('register')}
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;