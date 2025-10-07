import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Initialize i18next
i18n
  .use(Backend) // Loads translations from the locales folder
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next) // Initializes react-i18next
  .init({
    fallbackLng: 'en', // Default language
    supportedLngs: ['bn', 'en', 'hi', 'kn', 'ta', 'te'], // Supported languages: English and Hindi (reset to original)
    debug: process.env.NODE_ENV === 'development', // Only debug in development
    backend: {
      loadPath: '/locales/{{lng}}.json', // Path to translation files (loads en.json or hi.json)
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'], // Check localStorage first for saved preference
      lookupLocalStorage: 'preferredLanguage', // Key in localStorage
      caches: ['localStorage'], // Cache language preference
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    defaultNS: 'translation', // Default namespace
  });

export default i18n;