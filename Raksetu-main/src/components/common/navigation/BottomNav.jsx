/**
 * BottomNav Component - Mobile-first bottom navigation bar
 * Week 2: Mobile Navigation Enhancement
 * 
 * Features:
 * - Fixed bottom position on mobile (<768px)
 * - Auto-hide on scroll down, show on scroll up
 * - Active state indicators
 * - Touch-friendly targets (48px)
 * - Smooth animations
 * 
 * @example
 * <BottomNav />
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Droplet,
  AlertCircle,
  Activity,
  User,
} from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Navigation items
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/home',
      activeColor: 'text-red-600',
    },
    {
      id: 'donate',
      label: 'Donate',
      icon: Droplet,
      path: '/donate',
      activeColor: 'text-red-600',
    },
    {
      id: 'emergency',
      label: 'Emergency',
      icon: AlertCircle,
      path: '/emergency',
      activeColor: 'text-red-600',
    },
    {
      id: 'track',
      label: 'Track',
      icon: Activity,
      path: '/track',
      activeColor: 'text-red-600',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      activeColor: 'text-red-600',
    },
  ];

  // Handle scroll to show/hide nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', scrollHandler, { passive: true });

    return () => {
      window.removeEventListener('scroll', scrollHandler);
    };
  }, [lastScrollY]);

  const handleNavClick = (path) => {
    navigate(path);
    // Haptic feedback (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <nav
      className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-white border-t border-gray-200
        transition-transform duration-300 ease-in-out
        md:hidden
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}
      `.trim().replace(/\s+/g, ' ')}
      style={{ boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.05)' }}
    >
      {/* Safe area padding for iOS devices */}
      <div className="pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={`
                  flex flex-col items-center justify-center
                  min-w-[64px] h-full px-2
                  transition-all duration-200
                  active:scale-95
                  ${active ? item.activeColor : 'text-gray-500'}
                `.trim().replace(/\s+/g, ' ')}
                aria-label={item.label}
                aria-current={active ? 'page' : undefined}
              >
                {/* Icon with background indicator */}
                <div
                  className={`
                    relative flex items-center justify-center
                    w-10 h-10 rounded-xl
                    transition-all duration-200
                    ${active ? 'bg-red-50' : 'hover:bg-gray-50'}
                  `.trim().replace(/\s+/g, ' ')}
                >
                  <Icon
                    size={22}
                    strokeWidth={active ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  
                  {/* Active indicator dot */}
                  {active && (
                    <div
                      className="absolute -top-1 w-1 h-1 bg-red-600 rounded-full"
                      aria-hidden="true"
                    />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-xs mt-0.5 font-medium
                    ${active ? 'text-red-600' : 'text-gray-600'}
                  `.trim().replace(/\s+/g, ' ')}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
