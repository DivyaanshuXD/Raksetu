import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { getStorage } from "firebase/storage";
import { logger } from '../../utils/logger';
import { checkAndLogEnv, getRequiredEnv } from '../../utils/validateEnv';

// Validate all required environment variables before initialization
checkAndLogEnv();

const firebaseConfig = {
  apiKey: getRequiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getRequiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getRequiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getRequiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getRequiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getRequiredEnv('VITE_FIREBASE_APP_ID'),
};

// Declare auth, db, messaging, and storage variables globally
let app;
let auth;
let db;
let messaging;
let storage;

try {
  logger.info('[Firebase] Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  logger.info('[Firebase] App initialized');
  
  auth = getAuth(app);
  logger.info('[Firebase] Auth initialized');
  
  db = getFirestore(app);
  logger.info('[Firebase] Firestore initialized:', db ? 'SUCCESS' : 'FAILED');
  
  messaging = getMessaging(app);
  logger.info('[Firebase] Messaging initialized');
  
  storage = getStorage(app);
  logger.info('[Firebase] Storage initialized');
  
  // Verify db is properly initialized
  if (!db) {
    throw new Error('Firestore (db) failed to initialize');
  }
} catch (error) {
  logger.error('[Firebase] Initialization error:', error);
  logger.error('[Firebase] Config:', firebaseConfig);
  throw new Error('Failed to initialize Firebase: ' + error.message);
}

// Export auth, db, messaging, storage, and phone auth utilities
export { auth, db, messaging, storage, RecaptchaVerifier, signInWithPhoneNumber };