/**
 * Notification Permission Prompt
 * Beautiful modal to request push notification permissions
 */

import { useState, useEffect } from 'react';
import { Bell, X, Check, AlertCircle } from 'lucide-react';
import { 
  requestNotificationPermission, 
  getNotificationPermission,
  isNotificationSupported 
} from '../../utils/pushNotifications';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function NotificationPermissionPrompt({ onClose }) {
  const { userProfile } = useAuth();
  const toast = useToast();
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState(getNotificationPermission());

  useEffect(() => {
    setPermissionStatus(getNotificationPermission());
  }, []);

  const handleEnableNotifications = async () => {
    if (!userProfile?.id) {
      toast.error('Please log in to enable notifications');
      return;
    }

    setIsRequesting(true);

    try {
      const token = await requestNotificationPermission(userProfile.id);
      
      if (token) {
        toast.success('🎉 Push notifications enabled!');
        setPermissionStatus('granted');
        setTimeout(() => onClose(), 1500);
      } else {
        toast.error('Failed to enable notifications. Please check browser settings.');
        setPermissionStatus('denied');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    // Save that user dismissed (don't show again for a while)
    localStorage.setItem('notificationPromptDismissed', Date.now().toString());
    onClose();
  };

  // Don't show if not supported
  if (!isNotificationSupported()) {
    return null;
  }

  // Don't show if already granted
  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-300"
        style={{ willChange: 'transform', transform: 'translateZ(0)' }}
      >
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center animate-bounce">
            <Bell className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Stay Connected, Save Lives
        </h2>

        {/* Description */}
        <p className="text-gray-600 text-center mb-6">
          Get instant alerts when someone near you needs your blood type. 
          Every second counts in emergencies! 🚨
        </p>

        {/* Benefits */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
            <Check className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Instant Emergency Alerts</p>
              <p className="text-sm text-gray-600">Know immediately when someone needs your blood type</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <Check className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Location-Based Matching</p>
              <p className="text-sm text-gray-600">Only get alerts for emergencies near you</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">Smart Notifications</p>
              <p className="text-sm text-gray-600">Control what alerts you receive</p>
            </div>
          </div>
        </div>

        {/* Warning if blocked */}
        {permissionStatus === 'denied' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Notifications Blocked</p>
              <p className="mt-1">
                Please enable notifications in your browser settings to receive emergency alerts.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
          
          <button
            onClick={handleEnableNotifications}
            disabled={isRequesting || permissionStatus === 'denied'}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isRequesting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enabling...</span>
              </>
            ) : (
              <>
                <Bell className="w-5 h-5" />
                <span>Enable Alerts</span>
              </>
            )}
          </button>
        </div>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          🔒 We respect your privacy. You can disable notifications anytime in settings.
        </p>
      </div>
    </div>
  );
}
