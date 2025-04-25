import { Droplet, Heart, Mail, Phone } from 'lucide-react';

export default function Footer({ setActiveSection }) {
  // Get current year dynamically
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Droplet className="text-red-500" size={24} />
              <span className="text-xl font-bold">Raksetu</span>
            </div>
            <p className="text-gray-400 mb-6">
              India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
            </p>
            <div className="flex items-center space-x-2 text-gray-400 mb-4">
              <Phone size={16} />
              <span>+91 800-123-4567</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <Mail size={16} />
              <a href="mailto:support@raksetu.com" className="hover:text-white transition-colors">support@raksetu.com</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-5 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button 
                  onClick={() => setActiveSection('home')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Home</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('donate')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Donate</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('emergency')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Emergency</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('track')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Track Donation</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('about')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">About Us</span>
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-5 text-lg">Support</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <a 
                  href="https://raksetu.com/faq" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">FAQs</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:support@raksetu.com" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Contact Us</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://raksetu.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Privacy Policy</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://raksetu.com/terms" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Terms of Service</span>
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-5 text-lg">Get Involved</h4>
            <ul className="space-y-3 text-gray-400">
              <li>
                <button 
                  onClick={() => setActiveSection('donate')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Become a Donor</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('donate')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Host a Blood Drive</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setActiveSection('volunteer')} 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Volunteer</span>
                </button>
              </li>
              <li>
                <a 
                  href="https://raksetu.com/partnerships" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-white transition-colors flex items-center"
                >
                  <span className="hover:translate-x-1 transition-transform">Partnerships</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            © {currentYear} Raksetu Technologies. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="https://facebook.com/raksetu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 5.013 3.653 9.153 8.439 9.926v-7H7.904v-2.892H10.44V9.849c0-2.212 1.319-3.43 3.337-3.43 0.967 0 1.98 0.073 2.234 0.105v2.594h-1.534c-1.2 0-1.433 0.571-1.433 1.408v1.847h2.861l-0.374 2.892h-2.487v7C18.347 21.153 22 17.013 22 12 22 6.477 17.523 2 12 2z"/>
              </svg>
            </a>
            <a href="https://twitter.com/raksetu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3.01c-0.83 0.37-1.72 0.62-2.65 0.73 0.95-0.57 1.68-1.48 2.02-2.56-0.89 0.53-1.87 0.91-2.92 1.12-0.84-0.89-2.03-1.45-3.35-1.45-2.54 0-4.6 2.06-4.6 4.6 0 0.36 0.04 0.71 0.11 1.05-3.82-0.19-7.21-2.02-9.48-4.8-0.4 0.68-0.63 1.48-0.63 2.33 0 1.61 0.82 3.03 2.06 3.86-0.76-0.02-1.47-0.23-2.09-0.58v0.06c0 2.24 1.59 4.11 3.7 4.53-0.39 0.11-0.79 0.16-1.21 0.16-0.29 0-0.58-0.03-0.86-0.08 0.58 1.81 2.26 3.13 4.25 3.16-1.56 1.22-3.52 1.95-5.65 1.95-0.37 0-0.73-0.02-1.09-0.06 2.01 1.29 4.4 2.04 6.97 2.04 8.37 0 12.95-6.93 12.95-12.94 0-0.2 0-0.39-0.01-0.58 0.89-0.64 1.66-1.44 2.27-2.35z"/>
              </svg>
            </a>
            <a href="https://instagram.com/raksetu" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.133.277 2.63.596.57.324.996.74 1.437 1.182.44.442.857.868 1.181 1.437.32.497.535 1.264.597 2.63.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.277 2.133-.596 2.63-.324.57-.74.996-1.182 1.437-.442.44-.868.857-1.437 1.181-.497.32-1.264.535-2.63.597-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.133-.277-2.63-.596-.57-.324-.996-.74-1.437-1.182-.44-.442-.857-.868-1.181-1.437-.32-.497-.535-1.264-.597-2.63-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.277-2.133.596-2.63.324-.57.74-.996 1.182-1.437.442-.44.868-.857 1.437-1.181.497-.32 1.264-.535 2.63-.597 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.67.014-4.95.072-1.315.064-2.558.28-3.51.723-1.037.476-1.907 1.346-2.383 2.383-.443.952-.66 2.195-.723 3.51-.058 1.28-.072 1.689-.072 4.95s.014 3.67.072 4.95c.064 1.315.28 2.558.723 3.51.476 1.037 1.346 1.907 2.383 2.383.952.443 2.195.66 3.51.723 1.28.058 1.689.072 4.95.072s3.67-.014 4.95-.072c1.315-.064 2.558-.28 3.51-.723 1.037-.476 1.907-1.346 2.383-2.383.443-.952.66-2.195.723-3.51.058-1.28.072-1.689.072-4.95s-.014-3.67-.072-4.95c-.064-1.315-.28-2.558-.723-3.51-.476-1.037-1.346-1.907-2.383-2.383-.952-.443-2.195-.66-3.51-.723-1.28-.058-1.689-.072-4.95-.072z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <div className="flex justify-center items-center space-x-2">
            <Heart size={16} className="text-red-500" />
            <p className="text-sm text-gray-400">Made with love for communities across India</p>
          </div>
        </div>
      </div>
    </footer>
  );
}