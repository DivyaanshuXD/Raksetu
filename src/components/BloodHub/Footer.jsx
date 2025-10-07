import { Droplet, Heart, Mail, Phone, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

export default function Footer({ setActiveSection }) {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();

  // Debug: Log the setActiveSection prop to ensure it's a function
  useEffect(() => {
    console.log('setActiveSection prop in Footer:', setActiveSection);
  }, [setActiveSection]);

  const handleNavigation = (section) => {
    console.log(`Footer: Navigating to section: ${section}`);
    setActiveSection(section);
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-red-500/10 rounded-xl">
                <Droplet className="text-red-500" size={28} />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                Raksetu
              </span>
            </div>
            <p className="text-gray-300 leading-relaxed mb-8 text-sm">
              India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-red-500/20 transition-colors">
                  <Phone size={16} />
                </div>
                <span className="text-sm font-medium">+91 800-123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors group">
                <div className="p-2 bg-gray-700/50 rounded-lg group-hover:bg-red-500/20 transition-colors">
                  <Mail size={16} />
                </div>
                <a href="mailto:support@raksetu.live" className="text-sm font-medium">
                  support@raksetu.live
                </a>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home', section: 'home' },
                { label: 'Donate', section: 'donate' },
                { label: 'Emergency', section: 'emergency' },
                { label: 'Track Donation', section: 'track' },
                { label: 'About Us', section: 'about' }
              ].map((link) => (
                <li key={link.section}>
                  <button 
                    onClick={() => handleNavigation(link.section)} 
                    className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                  >
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.label}
                    </span>
                    <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
            <ul className="space-y-3">
              {[
                { label: 'FAQs', href: 'https://raksetu.live/faq' },
                { label: 'Contact Us', href: 'mailto:support@raksetu.live' },
                { label: 'Privacy Policy', href: 'https://raksetu.live/privacy' },
                { label: 'Terms of Service', href: 'https://raksetu.live/terms' }
              ].map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                  >
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.label}
                    </span>
                    {link.href.startsWith('http') && (
                      <ExternalLink size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Get Involved */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Get Involved</h4>
            <ul className="space-y-3">
              <li>
                <button 
                  onClick={() => handleNavigation('donate')} 
                  className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    Become a Donor
                  </span>
                  <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('donate')} 
                  className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    Host a Blood Drive
                  </span>
                  <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNavigation('volunteer')} 
                  className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    Volunteer
                  </span>
                  <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                </button>
              </li>
              <li>
                <a 
                  href="https://raksetu.live/partnerships" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-300 hover:text-red-400 transition-all duration-300 text-sm font-medium group flex items-center"
                >
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    Partnerships
                  </span>
                  <ExternalLink size={12} className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="w-0 group-hover:w-2 h-px bg-red-400 ml-2 transition-all duration-300"></div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Divider */}
        <div className="my-12">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
          <div className="text-center lg:text-left">
            <p className="text-gray-400 text-sm mb-2">
              © {currentYear} Raksetu Technologies. All rights reserved.
            </p>
            <div className="flex justify-center lg:justify-start items-center space-x-2">
              <Heart size={14} className="text-red-500 animate-pulse" />
              <p className="text-xs text-gray-500">Made with love for communities across India</p>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400 mr-2">Follow us:</span>
            <div className="flex space-x-3">
              {[
                {
                  name: 'Facebook',
                  href: 'https://facebook.com/raksetu',
                  icon: (
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.653 9.153 8.439 9.926v-7H7.904v-2.892H10.44V9.849c0-2.212 1.319-3.43 3.337-3.43 0.967 0 1.98 0.073 2.234 0.105v2.594h-1.534c-1.2 0-1.433 0.571-1.433 1.408v1.847h2.861l-0.374 2.892h-2.487v7C18.347 21.153 22 17.013 22 12 22 6.477 17.523 2 12 2z"/>
                    </svg>
                  )
                },
                {
                  name: 'Twitter',
                  href: 'https://twitter.com/raksetu',
                  icon: (
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3.01c-0.83 0.37-1.72 0.62-2.65 0.73 0.95-0.57 1.68-1.48 2.02-2.56-0.89 0.53-1.87 0.91-2.92 1.12-0.84-0.89-2.03-1.45-3.35-1.45-2.54 0-4.6 2.06-4.6 4.6 0 0.36 0.04 0.71 0.11 1.05-3.82-0.19-7.21-2.02-9.48-4.8-0.4 0.68-0.63 1.48-0.63 2.33 0 1.61 0.82 3.03 2.06 3.86-0.76-0.02-1.47-0.23-2.09-0.58v0.06c0 2.24 1.59 4.11 3.7 4.53-0.39 0.11-0.79 0.16-1.21 0.16-0.29 0-0.58-0.03-0.86-0.08 0.58 1.81 2.26 3.13 4.25 3.16-1.56 1.22-3.52 1.95-5.65 1.95-0.37 0-0.73-0.02-1.09-0.06 2.01 1.29 4.4 2.04 6.97 2.04 8.37 0 12.95-6.93 12.95-12.94 0-0.2 0-0.39-0.01-0.58 0.89-0.64 1.66-1.44 2.27-2.35z"/>
                    </svg>
                  )
                },
                {
  name: 'Instagram',
  href: 'https://instagram.com/raksetu',
  icon: (
    <svg
      width="18"
      height="18"
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.2c3.2 0 3.6.01 4.9.07 1.2.05 1.9.24 2.35.41.59.23 1.01.5 1.45.94.44.44.71.86.94 1.45.17.45.36 1.15.41 2.35.06 1.3.07 1.7.07 4.9s-.01 3.6-.07 4.9c-.05 1.2-.24 1.9-.41 2.35-.23.59-.5 1.01-.94 1.45-.44.44-.86.71-1.45.94-.45.17-1.15.36-2.35.41-1.3.06-1.7.07-4.9.07s-3.6-.01-4.9-.07c-1.2-.05-1.9-.24-2.35-.41-.59-.23-1.01-.5-1.45-.94-.44-.44-.71-.86-.94-1.45-.17-.45-.36-1.15-.41-2.35C2.21 15.6 2.2 15.2 2.2 12s.01-3.6.07-4.9c.05-1.2.24-1.9.41-2.35.23-.59.5-1.01.94-1.45.44-.44.86-.71 1.45-.94.45-.17 1.15-.36 2.35-.41C8.4 2.21 8.8 2.2 12 2.2zm0-2.2C8.7 0 8.3.01 7 .07 5.3.14 4.1.36 3.1.74 2.1 1.1 1.3 1.9.74 3.1.36 4.1.14 5.3.07 7 .01 8.3 0 8.7 0 12s.01 3.7.07 5c.07 1.7.29 2.9.67 3.9.36 1 .95 1.7 1.95 2.3 1 .5 2.2.72 3.9.79 1.3.06 1.7.07 5 .07s3.7-.01 5-.07c1.7-.07 2.9-.29 3.9-.79 1-.56 1.6-1.28 2-2.3.38-1 .6-2.2.67-3.9.06-1.3.07-1.7.07-5s-.01-3.7-.07-5c-.07-1.7-.29-2.9-.67-3.9-.36-1-.95-1.7-2-2.3-1-.5-2.2-.72-3.9-.79C15.7.01 15.3 0 12 0zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/>
    </svg>
  )
}
,
                {
                  name: 'LinkedIn',
                  href: '#',
                  icon: (
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  )
                }
              ].map((social) => (
                <a 
                  key={social.name}
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-3 bg-gray-700/50 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-300 rounded-xl hover:scale-110 hover:rotate-3"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}