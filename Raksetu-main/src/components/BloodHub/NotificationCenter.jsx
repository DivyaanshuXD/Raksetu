import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc, where, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { 
  Bell, X, Check, Trash2, Filter, RefreshCw, AlertCircle, Info, CheckCircle, 
  Heart, Droplet, Calendar, MessageSquare, Settings, Volume2, VolumeX, Eye,
  EyeOff, Clock, TrendingUp
} from 'lucide-react';

export default function NotificationCenter({ user, userProfile, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, emergency, donation, system
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    emergencyAlerts: true,
    donationReminders: true,
    systemUpdates: true,
    soundEnabled: true,
    desktopNotifications: true
  });

  // Fetch notifications with debounced updates
  useEffect(() => {
    if (!user) return;

    let timeoutId;
    const notificationsQuery = query(
      collection(db, 'notifications'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery,
      (snapshot) => {
        // Debounce updates to prevent excessive rerenders
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const notificationsList = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
              isRead: data.readBy?.includes(user.uid) || false
            };
          });

          // Filter based on user preferences
          const filtered = notificationsList.filter(notif => {
            if (notif.type === 'emergency' && !preferences.emergencyAlerts) return false;
            if (notif.type === 'donation' && !preferences.donationReminders) return false;
            if (notif.type === 'system' && !preferences.systemUpdates) return false;
            if (notif.type === 'reengagement' && !preferences.reengagementMessages) return false;
            return true;
          });

          setNotifications(filtered);
          setLoading(false);

          // Play sound for new unread emergency notifications
          const newEmergencies = filtered.filter(n => 
            n.type === 'emergency' && !n.isRead && preferences.soundEnabled
          );
          if (newEmergencies.length > 0) {
            playNotificationSound();
          }
        }, 200); // Debounce by 200ms
      },
      (error) => {
        console.error('Error fetching notifications:', error);
        setLoading(false);
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
    }, [user, preferences.emergencyAlerts, preferences.donationReminders, preferences.systemUpdates, preferences.soundEnabled]);  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBCs=');
      audio.volume = 0.3;
      audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        readBy: arrayUnion(user.uid)
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(notif =>
          updateDoc(doc(db, 'notifications', notif.id), {
            readBy: arrayUnion(user.uid)
          })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [notifications, user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    try {
      await Promise.all(
        notifications.map(notif => deleteDoc(doc(db, 'notifications', notif.id)))
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }, [notifications]);

  // Filtered notifications
    const filteredNotifications = useMemo(() => {
      if (filterType === 'all') return notifications;
      // Reengagement notifications show up in the system filter
      if (filterType === 'system') {
        return notifications.filter(n => n.type === 'system' || n.type === 'reengagement');
      }
      return notifications.filter(n => n.type === filterType);
    }, [notifications, filterType]);  // Statistics
  const stats = useMemo(() => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const emergencyCount = notifications.filter(n => n.type === 'emergency').length;
    const donationCount = notifications.filter(n => n.type === 'donation').length;
    const systemCount = notifications.filter(n => n.type === 'system' || n.type === 'reengagement').length;

    return { unreadCount, emergencyCount, donationCount, systemCount };
  }, [notifications]);

  // Get notification icon and color
  const getNotificationStyle = (type, priority) => {
    switch (type) {
      case 'emergency':
        return { icon: AlertCircle, color: 'red', bg: 'bg-red-100', text: 'text-red-600' };
      case 'donation':
        return { icon: Droplet, color: 'blue', bg: 'bg-blue-100', text: 'text-blue-600' };
      case 'reengagement':
        // ML re-engagement notifications with priority-based colors
        if (priority === 'high') {
          return { icon: Heart, color: 'purple', bg: 'bg-purple-100', text: 'text-purple-600' };
        }
        return { icon: Heart, color: 'pink', bg: 'bg-pink-100', text: 'text-pink-600' };
      case 'system':
        return { icon: Info, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' };
      default:
        return { icon: Bell, color: 'gray', bg: 'bg-gray-100', text: 'text-gray-600' };
    }
  };

  // Time ago formatter
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bell className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-600">{stats.unreadCount} unread</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-3">
            <button
              onClick={() => setFilterType('all')}
              className={`p-3 rounded-lg text-center transition-all ${
                filterType === 'all' 
                  ? 'bg-red-100 border-2 border-red-500' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-gray-900">{notifications.length}</div>
              <div className="text-xs text-gray-600">All</div>
            </button>
            <button
              onClick={() => setFilterType('emergency')}
              className={`p-3 rounded-lg text-center transition-all ${
                filterType === 'emergency' 
                  ? 'bg-red-100 border-2 border-red-500' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-red-600">{stats.emergencyCount}</div>
              <div className="text-xs text-gray-600">Emergency</div>
            </button>
            <button
              onClick={() => setFilterType('donation')}
              className={`p-3 rounded-lg text-center transition-all ${
                filterType === 'donation' 
                  ? 'bg-blue-100 border-2 border-blue-500' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">{stats.donationCount}</div>
              <div className="text-xs text-gray-600">Donation</div>
            </button>
            <button
              onClick={() => setFilterType('system')}
              className={`p-3 rounded-lg text-center transition-all ${
                filterType === 'system' 
                  ? 'bg-gray-100 border-2 border-gray-500' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="text-2xl font-bold text-gray-600">{stats.systemCount}</div>
              <div className="text-xs text-gray-600">System</div>
            </button>
          </div>

          {/* Settings Panel */}
          {showSettings && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Notification Preferences</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Emergency Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.emergencyAlerts}
                    onChange={(e) => setPreferences({ ...preferences, emergencyAlerts: e.target.checked })}
                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Donation Reminders</span>
                  <input
                    type="checkbox"
                    checked={preferences.donationReminders}
                    onChange={(e) => setPreferences({ ...preferences, donationReminders: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">System Updates</span>
                  <input
                    type="checkbox"
                    checked={preferences.systemUpdates}
                    onChange={(e) => setPreferences({ ...preferences, systemUpdates: e.target.checked })}
                    className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700">Sound Alerts</span>
                  <input
                    type="checkbox"
                    checked={preferences.soundEnabled}
                    onChange={(e) => setPreferences({ ...preferences, soundEnabled: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-4">
            {stats.unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-all flex items-center space-x-1"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-medium transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear all</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No notifications</p>
              <p className="text-sm text-gray-500 mt-1">
                {filterType !== 'all' ? `No ${filterType} notifications` : "You're all caught up!"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map(notification => {
                const style = getNotificationStyle(notification.type, notification.priority);
                const Icon = style.icon;
                
                return (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      notification.isRead
                        ? 'bg-white border-gray-200'
                        : 'bg-gradient-to-r from-red-50 to-white border-red-200 shadow-md'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 ${style.bg} rounded-lg flex-shrink-0`}>
                        <Icon className={`w-5 h-5 ${style.text}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`text-xs font-semibold px-2 py-0.5 ${style.bg} ${style.text} rounded-full`}>
                                {notification.type.toUpperCase()}
                              </span>
                              {!notification.isRead && (
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                              )}
                            </div>
                            {notification.title && (
                              <p className="text-sm text-gray-900 font-bold mb-1">{notification.title}</p>
                            )}
                            <p className="text-sm text-gray-800">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{timeAgo(notification.createdAt)}</span>
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.isRead && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1.5 hover:bg-green-50 rounded-lg text-green-600 transition-all"
                                title="Mark as read"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {notification.emergencyId && (
                          <button className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium">
                            View Emergency →
                          </button>
                        )}
                        {notification.actionUrl && notification.type === 'reengagement' && (
                          <a 
                            href={notification.actionUrl} 
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2 inline-block text-xs text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Take Action →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
