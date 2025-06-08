import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Droplet, 
  Bell, 
  Menu, 
  X, 
  LogIn, 
  LogOut, 
  User, 
  Settings, 
  Gift, 
  ChevronDown, 
  Heart,
  Home,
  AlertTriangle,
  Search,
  Shield,
  Trash // Add Trash icon
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { listenForNotifications } from '../utils/notifications';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../utils/firebase';

// Custom hooks for better state management
const useClickOutside = (refs, handler) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = refs.every(ref => 
        !ref.current || !ref.current.contains(event.target)
      );
      if (clickedOutside) handler();
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [refs, handler]);
};

const useScrolled = (threshold = 20) => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);
  
  return scrolled;
};

// Enhanced NavLink with better accessibility and animations
const NavLink = ({ active, children, onClick, icon, badge }) => (
  <button
    className={`
      relative flex items-center gap-2 px-3 py-2 text-sm font-medium 
      transition-all duration-300 ease-out rounded-lg group
      ${active 
        ? 'text-red-600 bg-red-50 shadow-sm' 
        : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
      }
    `}
    onClick={onClick}
    aria-current={active ? 'page' : undefined}
  >
    {icon && <span className="transition-transform group-hover:scale-110">{icon}</span>}
    <span>{children}</span>
    {badge && (
      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
        {badge}
      </span>
    )}
    <div className={`
      absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-red-600 
      transition-all duration-300 rounded-full
      ${active ? 'w-6' : 'w-0 group-hover:w-6'}
    `} />
  </button>
);

// Modern mobile navigation with better UX
const MobileNavLink = ({ children, onClick, icon, active, badge }) => (
  <button
    className={`
      flex items-center justify-between w-full px-4 py-3 text-sm font-medium 
      transition-all duration-200 rounded-xl group
      ${active 
        ? 'text-red-600 bg-red-50 shadow-sm transform scale-[1.02]' 
        : 'text-gray-700 hover:text-red-600 hover:bg-red-50 hover:transform hover:scale-[1.01]'
      }
    `}
    onClick={onClick}
  >
    <div className="flex items-center">
      {icon && (
        <span className={`mr-3 transition-transform group-hover:scale-110 ${
          active ? 'text-red-600' : 'text-gray-500'
        }`}>
          {icon}
        </span>
      )}
      <span>{children}</span>
    </div>
    {badge && (
      <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

// Enhanced Avatar component
const Avatar = ({ user, size = 'md', onClick, className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8 text-sm',
    md: 'h-9 w-9 text-sm',
    lg: 'h-10 w-10 text-base'
  };

  const fallbackImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"%3E%3Cpath fill="%23ef4444" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/%3E%3C/svg%3E';

  return (
    <div 
      className={`
        ${sizeClasses[size]} rounded-full overflow-hidden ring-2 ring-red-100 
        hover:ring-red-200 transition-all duration-300 cursor-pointer
        ${onClick ? 'hover:scale-105' : ''} ${className}
      `}
      onClick={onClick}
    >
      {user?.photoURL ? (
        <img 
          src={user.photoURL} 
          alt={`${user.name || 'User'}'s avatar`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = fallbackImage;
          }}
        />
      ) : (
        <div className="h-full w-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-700 font-semibold">
          {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
        </div>
      )}
    </div>
  );
};

// Modern notification bell with enhanced UX
const NotificationBell = ({ count = 0, onClick, isOpen }) => (
  <button 
    onClick={onClick}
    className="relative p-2 rounded-xl hover:bg-red-50 transition-all duration-300 group"
    aria-label={`Notifications ${count > 0 ? `(${count} unread)` : ''}`}
  >
    <Bell 
      size={20} 
      className={`transition-all duration-300 ${
        isOpen ? 'text-red-600 rotate-12' : 'text-gray-600 group-hover:text-red-600'
      }`} 
    />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center shadow-lg animate-pulse">
        {count > 99 ? '99+' : count}
      </span>
    )}
  </button>
);

export default function Header({
  isMenuOpen,
  setIsMenuOpen,
  activeSection,
  setActiveSection,
  isLoggedIn,
  setIsLoggedIn,
  setShowAuthModal,
  setAuthMode,
  userProfile
}) {
  const [showDropdowns, setShowDropdowns] = useState({
    notifications: false,
    profile: false
  });
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const scrolled = useScrolled(10);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Enhanced click outside handling
  useClickOutside(
    [notificationRef, profileMenuRef], 
    useCallback(() => setShowDropdowns({ notifications: false, profile: false }), [])
  );

  // Listen for notifications in real-time
useEffect(() => {
  let unsubscribe;
  console.log('Setting up notifications listener');
  unsubscribe = listenForNotifications((newNotifications) => {
    console.log('Received notifications:', newNotifications);
    setNotifications(newNotifications);
    // Calculate unread count based on login status
    if (isLoggedIn && auth.currentUser?.uid) {
      const unread = newNotifications.filter(
        (notif) => !notif.readBy?.includes(auth.currentUser.uid)
      ).length;
      console.log('Unread notifications count (logged in):', unread);
      setUnreadCount(unread);
    } else {
      // For unauthenticated users, treat all notifications as unread
      const unread = newNotifications.length;
      console.log('Unread notifications count (not logged in):', unread);
      setUnreadCount(unread);
    }
  });
  return () => unsubscribe && unsubscribe();
}, []); // Remove isLoggedIn dependency

  // Navigation configuration with icons and enhanced UX
  const navigationItems = useMemo(() => [
    { id: 'home', label: 'Home', icon: <Home size={16} /> },
    { id: 'donate', label: 'Donate', icon: <Gift size={16} />, badge: 'New' },
    { id: 'emergency', label: 'Emergency', icon: <AlertTriangle size={16} /> },
    { id: 'track', label: 'Track', icon: <Search size={16} /> },
    { id: 'about', label: 'About', icon: <Shield size={16} /> }
  ], []);

  // Enhanced sign out with better UX
  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      setShowDropdowns({ notifications: false, profile: false });
      setActiveSection('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [setIsLoggedIn, setIsMenuOpen, setActiveSection]);

  const handleNavClick = useCallback((section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  }, [setActiveSection, setIsMenuOpen]);

  const handleMyDonationsClick = useCallback(() => {
    setActiveSection('track');
    setShowDropdowns(prev => ({ ...prev, profile: false }));
    requestAnimationFrame(() => {
      setTimeout(() => {
        const element = document.querySelector('#donation-history');
        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  }, [setActiveSection]);

  const toggleDropdown = useCallback((type) => {
    setShowDropdowns(prev => ({
      notifications: type === 'notifications' ? !prev.notifications : false,
      profile: type === 'profile' ? !prev.profile : false
    }));
  }, []);

  // Handle clicking a notification
const handleNotificationClick = useCallback(async (notification) => {
  // Navigate to the emergency section for all users
  setActiveSection('emergency');
  setShowDropdowns(prev => ({ ...prev, notifications: false }));
  requestAnimationFrame(() => {
    setTimeout(() => {
      const element = document.querySelector('#emergency');
      element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  });

  // Mark as read only if user is logged in
  if (isLoggedIn && auth.currentUser) {
    try {
      const notificationRef = doc(db, 'notifications', notification.id);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(auth.currentUser.uid)
      });
      console.log('Notification marked as read:', notification.id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  } else {
    console.log('User not logged in, skipping mark as read');
  }
}, [setActiveSection, isLoggedIn]);

  // Mark all notifications as read
const handleMarkAllRead = useCallback(async () => {
  if (!isLoggedIn || !auth.currentUser) {
    console.log('User not logged in, cannot mark notifications as read');
    return;
  }

  const unreadNotifications = notifications.filter(
    (notif) => !notif.readBy?.includes(auth.currentUser.uid)
  );

  if (unreadNotifications.length === 0) {
    console.log('No unread notifications to mark as read');
    return;
  }

  try {
    for (const notif of unreadNotifications) {
      const notificationRef = doc(db, 'notifications', notif.id);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(auth.currentUser.uid)
      });
    }
    console.log('All notifications marked as read');
  } catch (error) {
    console.error('Error marking notifications as read:', error);
  }
}, [notifications, isLoggedIn]);

// Clear all notifications for the current user by marking them as read
const handleClearNotifications = useCallback(async () => {
  if (!isLoggedIn || !auth.currentUser) {
    console.log('User not logged in, cannot clear notifications');
    return;
  }

  try {
    const notificationsToClear = notifications.filter(
      (notif) => !notif.readBy?.includes(auth.currentUser.uid)
    );

    if (notificationsToClear.length === 0) {
      console.log('No notifications to clear');
      return;
    }

    for (const notif of notificationsToClear) {
      const notificationRef = doc(db, 'notifications', notif.id);
      await updateDoc(notificationRef, {
        readBy: arrayUnion(auth.currentUser.uid)
      });
    }
    console.log('All notifications cleared for user:', auth.currentUser.uid);
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}, [notifications, isLoggedIn]);

  return (
    <header className={`
      sticky top-0 z-50 transition-all duration-500 ease-out backdrop-blur-md
      ${scrolled 
        ? 'bg-white/95 shadow-lg border-b border-red-100 py-2' 
        : 'bg-white/90 shadow-sm py-3'
      }
    `}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Enhanced Brand Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group" 
            onClick={() => handleNavClick('home')}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-sm opacity-30 group-hover:opacity-50 transition-opacity" />
              <Droplet 
                className="relative text-red-600 drop-shadow-sm transition-transform group-hover:scale-110 duration-300" 
                size={32} 
                strokeWidth={2.5} 
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-600 rounded-full animate-pulse shadow-sm" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent">
                Raksetu
              </span>
              <div className="text-xs text-gray-500 font-medium -mt-1">Save Lives Together</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navigationItems.map(item => (
              <NavLink
                key={item.id}
                active={activeSection === item.id}
                onClick={() => handleNavClick(item.id)}
                icon={item.icon}
                badge={item.badge}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <div className="hidden md:flex items-center space-x-3">
                {/* Enhanced Notifications */}
                <div className="relative" ref={notificationRef}>
                  <NotificationBell
                    count={unreadCount}
                    onClick={() => toggleDropdown('notifications')}
                    isOpen={showDropdowns.notifications}
                  />
                  
                  {showDropdowns.notifications && (
                    <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-md border border-red-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      <div className="p-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
  <div className="flex justify-between items-center">
    <h4 className="font-semibold text-gray-800 flex items-center">
      <Bell size={16} className="mr-2 text-red-600" />
      Notifications
    </h4>
    <div className="flex items-center space-x-2">
      {unreadCount > 0 && (
        <button 
          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          onClick={handleMarkAllRead}
        >
          Mark all read
        </button>
      )}
      {isLoggedIn && auth.currentUser && unreadCount > 0 && (
        <button 
          className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
          onClick={handleClearNotifications}
          aria-label="Clear all notifications"
        >
          <Trash size={16} />
        </button>
      )}
    </div>
  </div>
</div>
                      <div className="max-h-80 overflow-y-auto">
  {(() => {
    // Filter notifications: show only unread for logged-in users, all for others
    const visibleNotifications = isLoggedIn && auth.currentUser
      ? notifications.filter((notif) => !notif.readBy?.includes(auth.currentUser.uid))
      : notifications;

    if (visibleNotifications.length > 0) {
      return visibleNotifications.map((notification) => (
        <button
          key={notification.id}
          className="w-full flex items-start p-4 text-left text-sm border-b border-red-50 transition-all duration-200 bg-red-50 text-gray-800 font-medium hover:bg-red-100 hover:text-red-700"
          onClick={() => handleNotificationClick(notification)}
        >
          <AlertTriangle size={16} className="mr-3 mt-0.5 flex-shrink-0 text-red-500" />
          <div>
            <p>{notification.message}</p>
            <p className="text-xs text-gray-400 mt-1">
              {notification.createdAt?.toDate().toLocaleString()}
            </p>
          </div>
        </button>
      ));
    }

    return (
      <div className="flex items-center justify-center h-32 text-center p-4">
        <div>
          <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bell size={20} className="text-red-300" />
          </div>
          <p className="text-sm text-gray-500">No new notifications</p>
          <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
        </div>
      </div>
    );
  })()}
</div>
                    </div>
                  )}
                </div>
                
                {/* Enhanced Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => toggleDropdown('profile')}
                    className="flex items-center space-x-2 p-1 rounded-xl hover:bg-red-50 transition-all duration-300 group"
                  >
                    <Avatar user={userProfile} onClick={() => toggleDropdown('profile')} />
                    <div className="hidden xl:flex items-center">
                      <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                        {userProfile?.name?.split(' ')[0] || 'User'}
                      </span>
                      <ChevronDown 
                        size={16} 
                        className={`ml-1 text-gray-400 transition-all duration-300 ${
                          showDropdowns.profile ? 'rotate-180 text-red-600' : 'group-hover:text-red-600'
                        }`} 
                      />
                    </div>
                  </button>
                  
                  {showDropdowns.profile && (
                    <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md border border-red-100 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                      {/* Profile Header */}
                      <div className="p-4 bg-gradient-to-r from-red-50 to-white border-b border-red-100">
                        <div className="flex items-center space-x-3">
                          <Avatar user={userProfile} size="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {userProfile?.name || 'User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {userProfile?.email || 'user@example.com'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        {[
                          { 
                            icon: <User size={16} />, 
                            label: 'Profile', 
                            action: () => {
                              setActiveSection('profile');
                              setShowDropdowns(prev => ({ ...prev, profile: false }));
                            }
                          },
                          { 
                            icon: <Heart size={16} />, 
                            label: 'My Donations', 
                            action: handleMyDonationsClick 
                          },
                          { 
                            icon: <Settings size={16} />, 
                            label: 'Settings', 
                            action: () => {
                              setActiveSection('settings');
                              setShowDropdowns(prev => ({ ...prev, profile: false }));
                            }
                          }
                        ].map((item, index) => (
                          <button
                            key={index}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                            onClick={item.action}
                          >
                            <span className="mr-3 text-gray-500">{item.icon}</span>
                            {item.label}
                          </button>
                        ))}
                      </div>
                      
                      {/* Sign Out */}
                      <div className="border-t border-red-100 bg-gray-50/50">
                        <button 
                          className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-200 font-medium"
                          onClick={handleSignOut}
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <button
                className="hidden md:flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105"
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
              >
                <LogIn size={18} className="mr-2" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 rounded-xl hover:bg-red-50 transition-all duration-300" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? 
                <X size={24} className="text-gray-700" /> : 
                <Menu size={24} className="text-gray-700" />
              }
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-red-100 shadow-2xl animate-in slide-in-from-top-4 duration-300">
          <div className="container mx-auto px-4 py-4">
            {/* Navigation Links */}
            <div className="space-y-2 mb-4">
              {navigationItems.map(item => (
                <MobileNavLink
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  icon={item.icon}
                  active={activeSection === item.id}
                  badge={item.badge}
                >
                  {item.label}
                </MobileNavLink>
              ))}
            </div>

            {/* User Section */}
            {isLoggedIn ? (
              <div className="border-t border-red-100 pt-4">
                {/* User Info Card */}
                <div className="bg-gradient-to-r from-red-50 to-white p-4 rounded-2xl mb-4 border border-red-100">
                  <div className="flex items-center space-x-3">
                    <Avatar user={userProfile} size="lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {userProfile?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {userProfile?.email || 'user@example.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Actions */}
                <div className="space-y-2 mb-4">
                  <MobileNavLink 
                    onClick={() => handleNavClick('profile')}
                    icon={<User size={18} />}
                    active={activeSection === 'profile'}
                  >
                    Profile
                  </MobileNavLink>
                  <MobileNavLink 
                    onClick={handleMyDonationsClick}
                    icon={<Heart size={18} />}
                  >
                    My Donations
                  </MobileNavLink>
                  <MobileNavLink 
                    onClick={() => handleNavClick('settings')}
                    icon={<Settings size={18} />}
                    active={activeSection === 'settings'}
                  >
                    Settings
                  </MobileNavLink>
                </div>

                {/* Sign Out Button */}
                <button
                  className="w-full text-red-600 border-2 border-red-600 hover:bg-red-50 px-4 py-3 rounded-xl font-medium transition-all duration-300 flex justify-center items-center"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t border-red-100 pt-4">
                <button
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3.5 rounded-xl font-medium transition-all duration-300 flex justify-center items-center shadow-lg hover:shadow-xl"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                >
                  <LogIn size={18} className="mr-2" />
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}