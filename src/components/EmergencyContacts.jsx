import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EmergencyContacts = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const emergencyContacts = [
    {
      name: 'American Red Cross',
      phone: '+1-800-733-2767',
      website: 'https://www.redcross.org',
      description: 'Provides emergency assistance, disaster relief, and blood donation services in the United States.',
    },
    {
      name: 'National Emergency Number (USA)',
      phone: '911',
      website: null,
      description: 'Emergency services for police, fire, and medical emergencies in the United States.',
    },
    {
      name: 'NHS Blood and Transplant (UK)',
      phone: '+44-300-123-2323',
      website: 'https://www.nhsbt.nhs.uk',
      description: 'Manages blood donation and transplant services in the United Kingdom.',
    },
    {
      name: 'Indian Red Cross Society',
      phone: '+91-11-23716441',
      website: 'https://www.indianredcross.org',
      description: 'Provides emergency response and blood donation services in India.',
    },
  ];

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center font-inter text-neutral-700 dark:text-neutral-300">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-neutral-900 dark:to-neutral-800 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <button onClick={handleBack} className="flex items-center space-x-2 text-neutral-700 dark:text-neutral-200 hover:text-primary-500 dark:hover:text-primary-400 mb-4">
          <ArrowLeftIcon className="h-5 w-5" />
          <span className="font-inter">Back</span>
        </button>

        <h2 className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-8 font-inter">
          Emergency Contacts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {emergencyContacts.map((contact, index) => (
            <motion.div
              key={index}
              className="p-6 bg-white dark:bg-neutral-800 rounded-2xl shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-bold text-primary-600 dark:text-primary-400 font-inter">
                {contact.name}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 font-inter mt-2">
                {contact.description}
              </p>
              <p className="text-neutral-700 dark:text-neutral-200 font-inter mt-2">
                Phone: <a href={`tel:${contact.phone}`} className="text-primary-500 hover:underline">{contact.phone}</a>
              </p>
              {contact.website && (
                <p className="text-neutral-700 dark:text-neutral-200 font-inter mt-2">
                  Website: <a href={contact.website} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">{contact.website}</a>
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default EmergencyContacts;