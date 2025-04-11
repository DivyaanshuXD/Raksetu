import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import countryCodes from './countryCodes';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [searchCountry, setSearchCountry] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Blood group compatibility matrix
  const compatibilityMatrix = {
    'A+': {
      canDonateTo: ['A+', 'AB+'],
      canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    },
    'A-': {
      canDonateTo: ['A+', 'A-', 'AB+', 'AB-'],
      canReceiveFrom: ['A-', 'O-'],
    },
    'B+': {
      canDonateTo: ['B+', 'AB+'],
      canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    },
    'B-': {
      canDonateTo: ['B+', 'B-', 'AB+', 'AB-'],
      canReceiveFrom: ['B-', 'O-'],
    },
    'AB+': {
      canDonateTo: ['AB+'],
      canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    'AB-': {
      canDonateTo: ['AB+', 'AB-'],
      canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'],
    },
    'O+': {
      canDonateTo: ['A+', 'B+', 'AB+', 'O+'],
      canReceiveFrom: ['O+', 'O-'],
    },
    'O-': {
      canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      canReceiveFrom: ['O-'],
    },
  };

  const checkUsernameUnique = async (username) => {
    console.log('Checking username uniqueness for:', username);
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    const isUnique = querySnapshot.empty;
    console.log('Is username unique?', isUnique);
    return isUnique;
  };

  const handleManualRegister = async (e) => {
    e.preventDefault();
    console.log('Manual registration triggered');
    setError('');

    if (!username) {
      setError(t('usernameRequired'));
      console.log('Error: Username is required');
      return;
    }
    if (!email) {
      setError(t('emailRequired'));
      console.log('Error: Email is required');
      return;
    }
    if (!password) {
      setError(t('passwordRequired'));
      console.log('Error: Password is required');
      return;
    }
    if (!role) {
      setError(t('roleRequired'));
      console.log('Error: Role is required');
      return;
    }
    if (!bloodGroup) {
      setError(t('bloodGroupRequired'));
      console.log('Error: Blood group is required');
      return;
    }

    if (password.length < 6) {
      setError(t('passwordLengthError'));
      console.log('Error: Password must be at least 6 characters');
      return;
    }

    const isUsernameUnique = await checkUsernameUnique(username);
    if (!isUsernameUnique) {
      setError(t('usernameTaken'));
      console.log('Error: Username is taken');
      return;
    }

    try {
      console.log('Attempting to create user with email:', email);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);

      const userData = {
        username,
        email,
        authEmail: email,
        phone: phone ? `${countryCode}${phone}` : '',
        role,
        bloodGroup,
      };
      console.log('Saving user data to Firestore:', userData);
      await setDoc(doc(db, 'users', user.uid), userData);

      console.log('Navigating to /blood-hub');
      navigate('/blood-hub');
    } catch (err) {
      setError(err.message);
      console.error('Manual registration error:', err.message);
    }
  };

  const handleGoogleRegister = async (e) => {
    e.preventDefault();
    console.log('Google registration triggered');
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider); // Prompts user to select Google account
      const user = result.user;
      console.log('User signed in with Google:', user.uid);

      const userData = {
        username: user.displayName || user.email.split('@')[0], // Default username from display name or email
        email: user.email || '',
        authEmail: user.email || '',
        phone: '',
      };
      console.log('Saving user data to Firestore:', userData);
      await setDoc(doc(db, 'users', user.uid), userData, { merge: true });

      console.log('Navigating to /blood-hub');
      navigate('/blood-hub');
    } catch (error) {
      setError(error.message);
      console.error('Google registration error:', error.message);
    }
  };

  const filteredCountries = countryCodes.filter((country) =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  // Get compatibility info based on role and blood group
  const getCompatibilityInfo = () => {
    if (!role || !bloodGroup) return { title: '', content: [] };
    const compat = compatibilityMatrix[bloodGroup] || {};
    if (role === 'donor') {
      return {
        title: t('canDonateTo'),
        content: compat.canDonateTo || [],
      };
    } else if (role === 'recipient') {
      return {
        title: t('canReceiveFrom'),
        content: compat.canReceiveFrom || [],
      };
    }
    return { title: '', content: [] };
  };

  const { title, content } = getCompatibilityInfo();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src="src/assets/register-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay for Readability */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>

      <div className="min-h-screen flex flex-col md:flex-row max-w-5xl w-full items-center justify-center p-6 relative z-20">
        <header className="absolute top-0 right-0 p-4">
          <Link to="/blood-hub">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <HomeIcon className="h-8 w-8 text-red-400 hover:text-red-300 transition-all duration-300" />
            </motion.div>
          </Link>
        </header>
        {/* Registration Form Area */}
        <motion.div
          className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg flex-1"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-3xl font-bold text-red-500 dark:text-red-400 mb-6 font-inter text-center">
            {t('register')}
          </h2>

          {/* Manual Registration Area */}
          <form onSubmit={handleManualRegister} className="space-y-6 mb-8">
            <div>
              <label htmlFor="username" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('password')}
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('phone')} {t('optional')}
              </label>
              <div className="flex space-x-2">
                <div className="relative w-1/3">
                  <input
                    type="text"
                    placeholder={t('Country')}
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                  />
                  {searchCountry && (
                    <div className="absolute z-10 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="p-2 hover:bg-red-100 dark:hover:bg-neutral-700 cursor-pointer font-inter"
                          onClick={() => {
                            setCountryCode(country.code);
                            setSearchCountry('');
                          }}
                        >
                          {country.name} ({country.code})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={countryCode}
                  readOnly
                  className="w-1/4 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white font-inter"
                />
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-1/2 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('role')}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              >
                <option value="">{t('selectRole')}</option>
                <option value="donor">{t('donor')}</option>
                <option value="recipient">{t('recipient')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodGroup" className="block text-red-400 dark:text-red-300 font-inter font-medium mb-2">
                {t('bloodGroup')}
              </label>
              <select
                id="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              >
                <option value="">{t('selectBloodGroup')}</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>
            <motion.button
              type="submit"
              className="w-full p-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-300 font-inter font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('register')}
            </motion.button>
          </form>

          {/* Google Registration Area */}
          <div className="border-t border-neutral-300 dark:border-neutral-600 pt-6">
            <motion.button
              type="button"
              onClick={handleGoogleRegister}
              className="w-full p-3 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-300 font-inter font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('signUpWithGoogle')}
            </motion.button>
          </div>

          {error && (
            <motion.p
              className="text-red-500 mt-4 font-inter font-medium text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </motion.p>
          )}

          <p className="mt-4 text-center text-red-400 dark:text-red-300 font-inter">
            {t('alreadyHaveAccount')}{' '}
            <Link to="/login" className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500">
              {t('login')}
            </Link>
          </p>
        </motion.div>

        {/* Compatibility Matrix Side Box */}
        <motion.div
          className="p-9 bg-white dark:bg-neutral-800 rounded-3xl shadow-lg ml-6 mt-6 md:mt-0 md:w-1/3 md:h-1/3"
          variants={formVariants}
          initial="hidden"
          animate="visible"
        >
          <h3 className="text-xl font-bold text-red-500 dark:text-red-400 mb-4 font-inter">
            {t('bloodCompatibility')}
          </h3>
          {role && bloodGroup ? (
            <div>
              <p className="text-red-400 dark:text-red-300 font-inter mb-2">
                <strong>{t('role')}: {t(role)}</strong>
              </p>
              <p className="text-red-400 dark:text-red-300 font-inter mb-2">
                <strong>{t('bloodGroup')}: {bloodGroup}</strong>
              </p>
              <p className="text-red-400 dark:text-red-300 font-inter mb-2">
                <strong>{title}:</strong>
              </p>
              <ul className="list-disc pl-5 text-red-400 dark:text-red-300 font-inter">
                {content.length > 0 ? (
                  content.map((group, index) => (
                    <li key={index}>{group}</li>
                  ))
                ) : (
                  <li>{t('noCompatibilityData')}</li>
                )}
              </ul>
            </div>
          ) : (
            <p className="text-red-400 dark:text-red-300 font-inter">
              {t('selectRoleAndBloodGroup')}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;