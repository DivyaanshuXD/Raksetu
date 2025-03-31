import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import countryCodes from './countryCodes';

const Register = () => {
  const [method, setMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [searchCountry, setSearchCountry] = useState('');
  const [role, setRole] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const checkUsernameUnique = async (username) => {
    console.log('Checking username uniqueness for:', username);
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    const isUnique = querySnapshot.empty;
    console.log('Is username unique?', isUnique);
    return isUnique;
  };

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    console.log('Email registration triggered');
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
        email, // User-provided email
        authEmail: email, // Store the email used for authentication
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
      console.error('Registration error:', err.message);
    }
  };

  const handlePhoneRegister = async (e) => {
    e.preventDefault();
    console.log('Phone registration triggered');
    setError('');

    if (!username) {
      setError(t('usernameRequired'));
      console.log('Error: Username is required');
      return;
    }
    if (!phone) {
      setError(t('phoneRequired'));
      console.log('Error: Phone is required');
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

    const formattedPhoneNumber = `${countryCode}${phone}`;
    console.log('Formatted phone number:', formattedPhoneNumber);

    try {
      const dummyEmail = `${formattedPhoneNumber.replace('+', '')}@raksetu.com`;
      console.log('Attempting to create user with dummy email:', dummyEmail);
      const userCredential = await createUserWithEmailAndPassword(auth, dummyEmail, password);
      const user = userCredential.user;
      console.log('User created successfully:', user.uid);

      const userData = {
        username,
        email: email || '', // Email is optional
        authEmail: dummyEmail, // Store the dummy email used for authentication
        phone: formattedPhoneNumber,
        role,
        bloodGroup,
      };
      console.log('Saving user data to Firestore:', userData);
      await setDoc(doc(db, 'users', user.uid), userData);

      console.log('Navigating to /blood-hub');
      navigate('/blood-hub');
    } catch (error) {
      setError(error.message);
      console.error('Phone registration error:', error.message);
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
        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-6 font-inter text-center">
          {t('register')}
        </h2>

        <div className="flex justify-center mb-6">
          <button
            onClick={() => setMethod('email')}
            className={`px-4 py-2 font-inter font-semibold rounded-l-lg ${
              method === 'email'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
            }`}
          >
            {t('email')}
          </button>
          <button
            onClick={() => setMethod('phone')}
            className={`px-4 py-2 font-inter font-semibold rounded-r-lg ${
              method === 'phone'
                ? 'bg-primary-500 text-white'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
            }`}
          >
            {t('phone')}
          </button>
        </div>

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

        {method === 'email' ? (
          <form onSubmit={handleEmailRegister} className="space-y-6">
            <div>
              <label htmlFor="Username" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('Username')}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div>
              <label htmlFor="phone" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('phone')} ({t('optional')})
              </label>
              <div className="flex space-x-2">
                <div className="relative w-1/3">
                  <input
                    type="text"
                    placeholder={t('Country')}
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                  />
                  {searchCountry && (
                    <div className="absolute z-10 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="p-2 hover:bg-primary-100 dark:hover:bg-neutral-700 cursor-pointer font-inter"
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
                  className="w-1/2 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                />
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('role')}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              >
                
                <option value="donor">{t('donor')}</option>
                <option value="recipient">{t('recipient')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodGroup" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('bloodGroup')}
              </label>
              <select
                id="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
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
              className="w-full p-3 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('register')}
            </motion.button>
          </form>
        ) : (
          <form onSubmit={handlePhoneRegister} className="space-y-6">
            <div>
              <label htmlFor="Username" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('Username')}
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('email')} ({t('optional')})
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('phone')}
              </label>
              <div className="flex space-x-2">
                <div className="relative w-1/3">
                  <input
                    type="text"
                    placeholder={t('Country')}
                    value={searchCountry}
                    onChange={(e) => setSearchCountry(e.target.value)}
                    className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                  />
                  {searchCountry && (
                    <div className="absolute z-10 w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg mt-1 max-h-40 overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <div
                          key={country.code}
                          className="p-2 hover:bg-primary-100 dark:hover:bg-neutral-700 cursor-pointer font-inter"
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
                  className="w-1/2 p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                  required
                />
              </div>
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
            <div>
              <label htmlFor="role" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('role')}
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
                required
              >
                
                <option value="donor">{t('donor')}</option>
                <option value="recipient">{t('recipient')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="bloodGroup" className="block text-neutral-700 dark:text-neutral-300 font-inter font-medium mb-2">
                {t('bloodGroup')}
              </label>
              <select
                id="bloodGroup"
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full p-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white font-inter transition-all duration-200"
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
              className="w-full p-3 text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-all duration-300 font-inter font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t('register')}
            </motion.button>
          </form>
        )}

        <p className="mt-4 text-center text-neutral-700 dark:text-neutral-300 font-inter">
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-500">
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;