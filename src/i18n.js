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
    debug: true, // Enable debug logs to troubleshoot
    backend: {
      loadPath: 'src/locales/en.json', // Path to translation files
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['cookie'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    defaultNS: 'translation', // Default namespace
  });

export default i18n;