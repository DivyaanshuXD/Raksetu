import { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '../utils/firebase';

export default function EmailVerificationBanner() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [cooldown, setCooldown] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  
  const user = auth.currentUser;

  // Check if user is verified
  useEffect(() => {
    if (user?.emailVerified) {
      setIsVisible(false);
    }
  }, [user]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!user || cooldown > 0) return;

    setLoading(true);
    setMessage('');

    try {
      await sendEmailVerification(user, {
        url: window.location.origin + '/profile',
        handleCodeInApp: false,
      });

      setMessage('Verification email sent! Please check your inbox and spam folder.');
      setMessageType('success');
      setCooldown(60); // 60 second cooldown
    } catch (error) {
      console.error('Error sending verification email:', error);
      
      let errorMessage = 'Failed to send verification email. ';
      
      if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
        setCooldown(120); // 2 minute cooldown for rate limit
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage += error.message;
      }
      
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  // Don't show if user is verified or banner is dismissed
  if (!user || user.emailVerified || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 rounded-lg shadow-md mb-6 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="bg-amber-100 rounded-full p-2">
              <Mail className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Verify Your Email Address
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Please verify your email to unlock all features including emergency requests, 
                  blood drive registration, and donation tracking.
                </p>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Message display */}
            {message && (
              <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${
                  messageType === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {message}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleResendEmail}
                disabled={loading || cooldown > 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  loading || cooldown > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-amber-600 text-white hover:bg-amber-700 shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Resend Verification Email
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.reload()}
                className="text-sm text-amber-700 hover:text-amber-800 font-medium hover:underline"
              >
                Already verified? Refresh page
              </button>
            </div>

            {/* Help text */}
            <p className="text-xs text-gray-500 mt-3">
              💡 Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
