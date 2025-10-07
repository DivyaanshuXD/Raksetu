/**
 * Development-only logger utility
 * In production, logs are suppressed to avoid exposing internal logic
 * Errors are sent to monitoring service in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

export const logger = {
  /**
   * General logging - only in development
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Error logging - development console + production monitoring
   */
  error: (...args) => {
    if (isDev) {
      console.error(...args);
    }
    
    // In production, send to error tracking service
    if (isProd && window.errorTracker) {
      const errorMessage = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      window.errorTracker.captureMessage(errorMessage, 'error');
    }
  },

  /**
   * Warning logging - only in development
   */
  warn: (...args) => {
    if (isDev) {
      console.warn(...args);
    }
  },

  /**
   * Info logging - only in development
   */
  info: (...args) => {
    if (isDev) {
      console.info(...args);
    }
  },

  /**
   * Debug logging - only when DEBUG flag is set
   */
  debug: (...args) => {
    if (isDev && window.DEBUG) {
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Table logging - only in development
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  },

  /**
   * Group logging - only in development
   */
  group: (label) => {
    if (isDev) {
      console.group(label);
    }
  },

  groupEnd: () => {
    if (isDev) {
      console.groupEnd();
    }
  }
};

// Export default for convenience
export default logger;
