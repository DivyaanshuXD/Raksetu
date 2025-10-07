import { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../utils/firebase';

export default function ForgotPasswordModal({ show, setShow }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [cooldown, setCooldown] = useState(0);
  const [animateIn, setAnimateIn] = useState(false);

  // Animation effect
  useEffect(() => {
    if (show) {
      setTimeout(() => setAnimateIn(true), 10);
    } else {
      setAnimateIn(false);
      // Reset form when closing
      setTimeout(() => {
        setEmail('');
        setMessage('');
        setMessageType('');
        setLoading(false);
      }, 300);
    }
  }, [show]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address');
      setMessageType('error');
      return;
    }

    if (cooldown > 0) {
      setMessage(`Please wait ${cooldown} seconds before trying again`);
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false,
      });

      setMessage('Password reset email sent! Please check your inbox and spam folder.');
      setMessageType('success');
      setCooldown(60); // 60 second cooldown
      
      // Auto-close after 3 seconds on success
      setTimeout(() => {
        setShow(false);
      }, 3000);
    } catch (error) {
      console.error('Error sending password reset email:', error);

      let errorMessage = 'Failed to send password reset email. ';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
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

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-300 ${
        animateIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div 
        className={`notranslate relative bg-white sm:rounded-2xl rounded-t-3xl shadow-2xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto transform transition-all duration-300 ${
          animateIn ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-5 sm:p-6 sm:rounded-t-2xl rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold">Reset Password</h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg -mr-2"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-red-100 mt-2 text-sm sm:text-base">
            Enter your email and we'll send you a link to reset your password
          </p>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
          {/* Message display */}
          {message && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border ${
              messageType === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm font-medium ${
                messageType === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {message}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full pl-12 pr-4 py-3.5 sm:py-3 text-base sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                  required
                  disabled={loading || cooldown > 0}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                We'll send a password reset link to this email
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={loading || cooldown > 0}
                className={`flex-1 py-3.5 sm:py-3 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-base sm:text-sm ${
                  loading || cooldown > 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Wait {cooldown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Reset Link
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3.5 sm:py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all text-base sm:text-sm active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Help text */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">💡 Tip:</span> If you don't receive the email within a few minutes:
            </p>
            <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1 list-disc">
              <li>Check your spam/junk folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait for the cooldown and try again</li>
            </ul>
          </div>

          {/* Back to login */}
          <div className="text-center pt-2">
            <button
              onClick={handleClose}
              className="text-sm text-red-600 hover:text-red-700 font-medium hover:underline"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
