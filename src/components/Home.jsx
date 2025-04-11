import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { motion } from 'framer-motion';
import { Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import logo from '../assets/logo.jpg';
import backgroundVideo from '../assets/background-video.mp4'; // Adjust the path to your video file

const Home = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Home.jsx - Auth state:', currentUser ? 'Authenticated' : 'Unauthenticated');
      setUser(currentUser);
      if (currentUser) {
        navigate('/blood-hub');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const logoVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.8, ease: 'easeOut' },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
    },
  };

  const textVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, delay: 0.3 } },
  };

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        className="absolute z-0 w-auto min-w-full min-h-full max-w-none object-cover"
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {/* Overlay for Readability (Optional, can be removed if video is clear enough) */}
      <div className="absolute inset-0 bg-black opacity-40 z-10"></div>

      <div className="min-h-screen flex flex-col items-center justify-center p-6 relative z-20">
        {user ? (
          <>
            <div className="absolute top-4 right-4 md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? (
                  <XMarkIcon className="h-8 w-8 text-white" />
                ) : (
                  <Bars3Icon className="h-8 w-8 text-white" />
                )}
              </button>
            </div>

            <motion.div
              className={`${
                isMenuOpen ? 'block' : 'hidden'
              } md:block absolute top-16 right-4 bg-white dark:bg-neutral-800 p-4 rounded-xl shadow-lg md:static md:bg-transparent md:dark:bg-transparent md:shadow-none md:p-0 md:flex md:space-x-4 z-50`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/blood-hub/profile"
                className="flex items-center space-x-2 text-neutral-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 md:p-0 p-2"
              >
                <UserIcon className="h-6 w-6" />
                <span>{t('profile')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-neutral-800 dark:text-white hover:text-primary-500 dark:hover:text-primary-400 md:p-0 p-2"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
                <span>{t('logout')}</span>
              </button>
            </motion.div>
          </>
        ) : (
          <div className="text-center">
            {/* Circular Logo with Animation */}
            <motion.div
              className="relative mx-auto mb-8 w-40 h-40 rounded-full overflow-hidden shadow-2xl"
              variants={logoVariants}
              initial="hidden"
              animate={['visible', 'pulse']}
            >
              <img src={logo} alt="Raksetu Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border-4 border-primary-500 rounded-full animate-pulse opacity-50" />
            </motion.div>

            {/* Tagline and Title */}
            <motion.h1
              className="text-5xl md:text-6xl font-bold text-white mb-4 font-playfair"
              variants={textVariants}
              initial="hidden"
              animate="visible"
            >
              Raksetu
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 font-inter"
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              {t('tagline')}
            </motion.p>

            {/* Buttons */}
            <div className="flex justify-center space-x-4">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/login"
                  className="px-8 py-4 text-white bg-primary-500 rounded-full hover:bg-primary-600 transition-all duration-300 font-inter font-semibold shadow-lg"
                >
                  {t('login')}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  to="/register"
                  className="px-8 py-4 text-white bg-secondary-500 rounded-full hover:bg-secondary-600 transition-all duration-300 font-inter font-semibold shadow-lg"
                >
                  {t('register')}
                </Link>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;