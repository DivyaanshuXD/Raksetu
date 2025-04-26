import { useState, useEffect, useRef } from 'react';
import { Droplet, Bell, Menu, X, LogIn, LogOut, User, Settings, Gift, ChevronDown, Heart } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../utils/firebase';

function NavLink({ active, children, onClick }) {
  return (
    <button
      className={`text-sm font-medium transition-colors hover:scale-105 relative group ${
        active ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'
      }`}
      onClick={onClick}
    >
      {children}
      <span className={`absolute -bottom-1 left-0 h-0.5 bg-red-600 transition-all duration-300 ${
        active ? 'w-full' : 'w-0 group-hover:w-full'
      }`}></span>
    </button>
  );
}

function MobileNavLink({ children, onClick, icon, active }) {
  return (
    <button
      className={`py-3 w-full flex items-center text-sm font-medium transition-colors ${
        active ? 'text-red-600 font-semibold bg-red-50 rounded-lg' : 'text-gray-700 hover:text-red-600 hover:bg-red-50 hover:rounded-lg'
      }`}
      onClick={onClick}
    >
      {icon && <span className="mr-3 ml-2">{icon}</span>}
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
  const [scrolled, setScrolled] = useState(false);
  const notificationRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
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

  const handleMyDonationsClick = () => {
    setActiveSection('track');
    setTimeout(() => {
      const donationHistory = document.querySelector('#donation-history');
      if (donationHistory) {
        donationHistory.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
    setShowProfileMenu(false);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 shadow-sm py-3'
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer group" 
          onClick={() => handleNavClick('home')}
        >
          <div className="relative transition-transform group-hover:scale-110 duration-300">
            <Droplet className="text-red-600" size={28} strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
            Raksetu
          </span>
        </div>

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

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center space-x-4">
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-1.5 rounded-full hover:bg-red-50 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell size={20} className="text-gray-600 hover:text-red-600" />
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 rounded-full text-white text-xs flex items-center justify-center shadow-sm">
                    0
                  </span>
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-xl p-4 z-50 transition-all duration-200 ease-in-out">
                    <div className="flex justify-between items-center mb-3 pb-2 border-b">
                      <h4 className="font-semibold text-gray-800">Notifications</h4>
                      <button className="text-xs text-red-600 hover:text-red-800 font-medium">Mark all as read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      <div className="flex items-center justify-center h-32 text-center">
                        <div>
                          <Bell size={24} className="text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">No new notifications</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 mt-2 border-t text-center">
                      <button className="text-sm text-red-600 hover:text-red-800 font-medium">View all notifications</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 group"
                >
                  <div className="h-9 w-9 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm ring-2 ring-red-100 group-hover:ring-red-200 transition-all">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 flex items-center">
                    {userProfile?.name || 'User'}
                    <ChevronDown size={16} className={`ml-1 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                  </span>
                </button>
                
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b bg-gradient-to-r from-red-50 to-white">
                      <p className="text-sm font-semibold text-gray-800">{userProfile?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile?.email || 'user@example.com'}</p>
                    </div>
                    <div className="py-1">
                      <button 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                        onClick={() => {
                          setActiveSection('profile');
                          setShowProfileMenu(false);
                        }}
                      >
                        <User size={16} className="mr-3 text-gray-500" />
                        Profile
                      </button>
                      <button 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                        onClick={handleMyDonationsClick}
                      >
                        <Heart size={16} className="mr-3 text-gray-500" />
                        My Donations
                      </button>
                      <button 
                        className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 w-full text-left"
                        onClick={() => {
                          setActiveSection('settings');
                          setShowProfileMenu(false);
                        }}
                      >
                        <Settings size={16} className="mr-3 text-gray-500" />
                        Settings
                      </button>
                    </div>
                    <div className="py-1 border-t bg-gray-50">
                      <button 
                        className="flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left"
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
              className="hidden md:flex items-center bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-sm hover:shadow"
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
            >
              <LogIn size={18} className="mr-2" />
              Sign In
            </button>
          )}

          <button 
            className="md:hidden text-gray-700 p-1.5 rounded-md hover:bg-red-50 transition-colors" 
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
          <div className="container mx-auto px-4 py-3 flex flex-col">
            <MobileNavLink 
              onClick={() => handleNavClick('home')}
              icon={<Droplet size={18} />}
              active={activeSection === 'home'}
            >
              Home
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('donate')}
              icon={<Gift size={18} />}
              active={activeSection === 'donate'}
            >
              Donate
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('emergency')}
              icon={<Bell size={18} />}
              active={activeSection === 'emergency'}
            >
              Emergency
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('track')}
              icon={<Heart size={18} />}
              active={activeSection === 'track'}
            >
              Track Donation
            </MobileNavLink>
            <MobileNavLink 
              onClick={() => handleNavClick('about')}
              icon={<User size={18} />}
              active={activeSection === 'about'}
            >
              About
            </MobileNavLink>

            {isLoggedIn ? (
              <div className="border-t border-gray-100 mt-3 pt-3">
                <div className="flex items-center px-2 py-3 mb-2 bg-red-50 rounded-lg">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-medium text-sm mr-3 ring-2 ring-red-200">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{userProfile?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{userProfile?.email || 'user@example.com'}</p>
                  </div>
                </div>
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
                <button
                  className="w-full mt-3 text-red-600 border border-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-center items-center"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} className="mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-4 mb-2">
                <button
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-3 rounded-lg font-medium transition-colors flex justify-center items-center shadow-sm"
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