import { logger } from './logger';

/**
 * Environment Variable Validator
 * Validates that all required environment variables are present and properly formatted
 */

// Required Firebase configuration variables
const REQUIRED_FIREBASE_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

// Optional but recommended variables
const OPTIONAL_VARS = [
  'VITE_FIREBASE_MEASUREMENT_ID',
  'VITE_FIREBASE_DATABASE_URL',
  'VITE_FIREBASE_VAPID_KEY'
];

/**
 * Validates environment variables
 * @returns {Object} { isValid: boolean, missing: string[], warnings: string[] }
 */
export function validateEnv() {
  const missing = [];
  const warnings = [];
  const invalid = [];

  // Check required variables
  REQUIRED_FIREBASE_VARS.forEach(varName => {
    const value = import.meta.env[varName];
    
    if (!value || value.trim() === '') {
      missing.push(varName);
    } else {
      // Validate format for specific variables
      if (varName === 'VITE_FIREBASE_API_KEY' && value.length < 30) {
        invalid.push(`${varName} appears to be invalid (too short)`);
      }
      
      if (varName === 'VITE_FIREBASE_AUTH_DOMAIN' && !value.includes('.firebaseapp.com')) {
        invalid.push(`${varName} should end with .firebaseapp.com`);
      }
      
      if (varName === 'VITE_FIREBASE_PROJECT_ID' && value.includes(' ')) {
        invalid.push(`${varName} should not contain spaces`);
      }
    }
  });

  // Check optional variables
  OPTIONAL_VARS.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.trim() === '') {
      warnings.push(varName);
    }
  });

  const isValid = missing.length === 0 && invalid.length === 0;

  return {
    isValid,
    missing,
    warnings,
    invalid
  };
}

/**
 * Logs environment validation results
 * Throws error in production if critical variables are missing
 */
export function checkAndLogEnv() {
  const { isValid, missing, warnings, invalid } = validateEnv();

  if (!isValid) {
    const errorMessage = [
      '❌ Firebase Configuration Error',
      '',
      'Missing required environment variables:',
      ...missing.map(v => `  - ${v}`),
      '',
      ...(invalid.length > 0 ? [
        'Invalid environment variables:',
        ...invalid.map(v => `  - ${v}`),
        ''
      ] : []),
      'Please ensure your .env file contains all required Firebase configuration.',
      '',
      'Steps to fix:',
      '1. Copy .env.example to .env (if it exists)',
      '2. Add your Firebase project configuration from Firebase Console',
      '3. Restart the development server',
      '',
      'Firebase Console: https://console.firebase.google.com/'
    ].join('\n');

    logger.error(errorMessage);

    // In production, throw an error to prevent app from running with missing config
    if (import.meta.env.PROD) {
      throw new Error('Missing required Firebase configuration. Please check server logs.');
    }

    return false;
  }

  // Log warnings for optional variables
  if (warnings.length > 0) {
    logger.warn(
      '⚠️ Optional Firebase variables not set:\n' +
      warnings.map(v => `  - ${v}`).join('\n') +
      '\n\nThe app will work, but some features may be limited.'
    );
  }

  // Success message
  logger.info('✅ Firebase environment variables validated successfully');
  
  return true;
}

/**
 * Gets a required environment variable or throws an error
 * @param {string} key - Environment variable name
 * @returns {string} - Environment variable value
 */
export function getRequiredEnv(key) {
  const value = import.meta.env[key];
  
  if (!value || value.trim() === '') {
    const error = `Required environment variable ${key} is not set`;
    logger.error(error);
    throw new Error(error);
  }
  
  return value;
}

/**
 * Gets an optional environment variable with a default value
 * @param {string} key - Environment variable name
 * @param {string} defaultValue - Default value if not set
 * @returns {string} - Environment variable value or default
 */
export function getEnv(key, defaultValue = '') {
  const value = import.meta.env[key];
  return value && value.trim() !== '' ? value : defaultValue;
}

/**
 * Checks if we're in development mode
 * @returns {boolean}
 */
export function isDevelopment() {
  return import.meta.env.DEV;
}

/**
 * Checks if we're in production mode
 * @returns {boolean}
 */
export function isProduction() {
  return import.meta.env.PROD;
}

/**
 * Gets the current environment name
 * @returns {string} - 'development' or 'production'
 */
export function getEnvironment() {
  return import.meta.env.MODE || 'development';
}

// Auto-validate on module import
if (import.meta.env.DEV) {
  checkAndLogEnv();
}
