import { useState, useEffect, useRef } from 'react';
import { Droplet, Bell, Menu, X, LogIn, LogOut, User, Settings, Gift, ChevronDown } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

function NavLink({ active, children, onClick }) {
  return (
    <button
      className={`text-sm font-medium transition-colors hover:scale-105 ${
        active ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function MobileNavLink({ children, onClick, icon }) {
  return (
    <button
      className="py-3 w-full flex items-center text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
      onClick={onClick}
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </button>
  );
}

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
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Handle clicks outside notification and profile dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsMenuOpen(false);
      setShowProfileMenu(false);
      setActiveSection('home');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleNavClick = (section) => {
    setActiveSection(section);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => handleNavClick('home')}
        >
          <div className="relative">
            <Droplet className="text-red-600" size={28} />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Raksetu
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          <NavLink active={activeSection === 'home'} onClick={() => handleNavClick('home')}>
            Home
          </NavLink>
          <NavLink active={activeSection === 'donate'} onClick={() => handleNavClick('donate')}>
            Donate
          </NavLink>
          <NavLink active={activeSection === 'emergency'} onClick={() => handleNavClick('emergency')}>
            Emergency
          </NavLink>
          <NavLink active={activeSection === 'track'} onClick={() => handleNavClick('track')}>
            Track
          </NavLink>
          <NavLink active={activeSection === 'about'} onClick={() => handleNavClick('about')}>
            About
          </NavLink>
        </nav>

        {/* User Menu & Mobile Toggle */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600 hover:text-red-600" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-600 rounded-full text-white text-xs flex items-center justify-center">
                    0
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg p-4 z-50 transition-all duration-200 ease-in-out">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                      <h4 className="font-semibold">Notifications</h4>
                      <button className="text-xs text-red-600 hover:text-red-800">Mark all as read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <p className="text-sm text-gray-600 py-4 text-center">No new notifications</p>
                    </div>
                    <div className="pt-2 mt-2 border-t text-center">
                      <button className="text-sm text-red-600 hover:text-red-800">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile Menu */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm group-hover:bg-red-200 transition-colors">
                    {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-red-600 flex items-center">
                    {userProfile?.name || 'User'}
                    <ChevronDown size={16} className="ml-1" />
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b">
                      <p className="text-sm font-semibold">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500">{userProfile?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setActiveSection('profile');
                          setShowProfileMenu(false);
                        }}
                      >
                        <User size={16} className="mr-2" />
                        Profile
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setActiveSection('donations');
                          setShowProfileMenu(false);
                        }}
                      >
                        <Gift size={16} className="mr-2" />
                        My Donations
                      </button>
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        onClick={() => {
                          setActiveSection('settings');
                          setShowProfileMenu(false);
                        }}
                      >
                        <Settings size={16} className="mr-2" />
                        Settings
                      </button>
                    </div>
                    <div className="py-1 border-t">
                      <button 
                        className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                        onClick={handleSignOut}
                      >
                        <LogOut size={16} className="mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              className="hidden md:flex items-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
            >
              <LogIn size={18} className="mr-2" />
              Sign In
            </button>
          )}

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-700 p-1 rounded-md hover:bg-gray-100" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-fadeIn">
          <div className="container mx-auto px-4 py-2 flex flex-col">
            <MobileNavLink 
              onClick={() => handleNavClick('home')}
              icon={<Droplet size={18} />}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('donate')}
              icon={<Gift size={18} />}
            >
              Donate
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('emergency')}
              icon={<Bell size={18} />}
            >
              Emergency
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('track')}
              icon={<Gift size={18} />}
            >
              Track Donation
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('about')}
              icon={<User size={18} />}
            >
              About
            </MobileNavLink>

            {isLoggedIn ? (
              <div className="border-t border-gray-100 mt-2 pt-2">
                <div className="flex items-center py-2 mb-2">
                  <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm mr-2">
                    {userProfile?.name ? userProfile.name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{userProfile?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{userProfile?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <MobileNavLink 
                  onClick={() => handleNavClick('profile')}
                  icon={<User size={18} />}
                >
                  Profile
                </MobileNavLink>
                <MobileNavLink 
                  onClick={() => handleNavClick('donations')}
                  icon={<Gift size={18} />}
                >
                  Donations
                </MobileNavLink>
                <MobileNavLink 
                  onClick={() => handleNavClick('settings')}
                  icon={<Settings size={18} />}
                >
                  Settings
                </MobileNavLink>
                <MobileNavLink 
                  onClick={handleSignOut}
                  icon={<LogOut size={18} />}
                >
                  Sign Out
                </MobileNavLink>
              </div>
            ) : (
              <div className="mt-4 mb-2">
                <button
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex justify-center items-center"
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