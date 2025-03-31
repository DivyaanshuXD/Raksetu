import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { query, collection, where, getDocs } from 'firebase/firestore';
import { HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Can be email or username
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      let emailToUse = identifier;

      // Check if the identifier is a username (not an email)
      if (!identifier.includes('@')) {
        console.log('Attempting to resolve username:', identifier);
        // Query Firestore to find the authEmail associated with the username
        const q = query(collection(db, 'users'), where('username', '==', identifier));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError(t('userNotFound'));
          console.log('Error: User not found');
          return;
        }

        // Get the authEmail from the first matching document
        const userDoc = querySnapshot.docs[0];
        emailToUse = userDoc.data().authEmail; // Use authEmail instead of email

        if (!emailToUse) {
          setError(t('emailNotFound'));
          console.log('Error: No authentication email found for this user');
          return;
        }
        console.log('Resolved username to email:', emailToUse);
      }

      // Sign in with the email (or resolved email from username)
      console.log('Attempting to sign in with email:', emailToUse);
      await signInWithEmailAndPassword(auth, emailToUse, password);
      console.log('Login successful, navigating to /blood-hub');
      navigate('/blood-hub');
    } catch (err) {
      setError(err.message);
      console.error('Login error:', err.message);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center p-6">
      <header className="absolute top-0 right-0 p-4">
        <Link to="/blood-hub">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <HomeIcon className="h-8 w-8 text-white hover:text-primary-200 transition-all duration-300" />
          </motion.div>
        </Link>
      </header>
      <motion.div
        className="p-6 max-w-md w-full bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6 font-inter">{t('login')}</h2>
        {error && (
          <motion.p
            className="text-red-500 mb-4 font-inter font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </motion.p>
        )}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
              {t('Email/Username')}
            </label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full p-3 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold shadow-md"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {t('login')}
          </motion.button>
        </form>
        <p className="mt-4 text-center text-neutral-700 dark:text-neutral-300 font-inter">
          {t('dontHaveAccount')}{' '}
          <Link to="/register" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500">
            {t('register')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;