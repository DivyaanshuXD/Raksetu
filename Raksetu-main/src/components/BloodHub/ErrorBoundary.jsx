import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '../../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const { errorCount } = this.state;
    
    // Log to console in development
    logger.error('ErrorBoundary caught an error:', {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      count: errorCount + 1
    });

    // Send to error tracking service in production
    if (window.errorTracker) {
      window.errorTracker.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      });
    }

    this.setState({
      error,
      errorInfo,
      errorCount: errorCount + 1
    });
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    const { hasError, error, errorInfo, errorCount } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      // Custom fallback if provided
      if (fallback) {
        return fallback(error, this.handleReset);
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              We're sorry for the inconvenience. Our team has been notified and is working on a fix.
            </p>

            {/* Error Details (Development Only) */}
            {import.meta.env.DEV && error && (
              <details className="mb-6 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                <summary className="cursor-pointer font-semibold text-sm text-gray-700 dark:text-gray-300">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {error.toString()}
                </pre>
                {errorInfo && (
                  <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                    {errorInfo.componentStack}
                  </pre>
                )}
                <p className="mt-2 text-xs text-gray-500">Error Count: {errorCount}</p>
              </details>
            )}

            {/* Recovery Actions */}
            <div className="space-y-3">
              <button
                onClick={this.handleRefresh}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                <RefreshCw size={18} />
                Refresh Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                <Home size={18} />
                Go to Home
              </button>

              {errorCount > 1 && (
                <button
                  onClick={this.handleReset}
                  className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Try Again Without Refresh
                </button>
              )}
            </div>

            {/* Support Link */}
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Need help?{' '}
              <a 
                href="mailto:support@raksetu.in" 
                className="text-red-600 hover:underline"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.defaultProps = {
  fallback: null
};

export default ErrorBoundary;