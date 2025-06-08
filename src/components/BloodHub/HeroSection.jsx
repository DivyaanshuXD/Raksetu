import { Droplet, AlertTriangle, ChevronRight, Heart, Shield, Clock, Users } from 'lucide-react';
import EmergencyCard from './EmergencyCard';
import Particles from './Particles';

export default function HeroSection({ setActiveSection, setShowEmergencyModal, emergencyRequests }) {
  return (
    <section className="relative pt-8 md:pt-12 pb-12 md:pb-16 overflow-hidden h-[90vh] sm:h-[85vh] md:h-[80vh] lg:h-[75vh] flex items-center">
      {/* Particles Background with Black Background */}
      <div className="absolute inset-0 z-0 bg-black">
        <Particles
          particleColors={['#ff0000']} // Set to red as specified
          particleCount={400} // Set to 400 as specified
          particleSpread={10} // Already correct
          speed={0.2} // Set to 0.2 as specified
          particleBaseSize={200} // Set to 200 as specified
          moveParticlesOnHover={true} // As per your usage example
          alphaParticles={false} // As per your usage example
          disableRotation={false} // As per your usage example
          className="w-full h-full"
        />
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
          {/* Left Column - Hero Text */}
          <div className="space-y-5 md:space-y-6 text-white">
            <div className="inline-flex items-center bg-red-900/50 backdrop-blur-sm rounded-full py-1 px-3 md:py-2 md:px-4 mb-2">
              <Droplet size={14} className="text-red-400 mr-1 md:mr-2" />
              <span className="text-xs md:text-sm font-medium">India's Premier Blood Donation Network</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">
              Save Lives with<br />Every <span className="text-red-500">Drop</span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-red-50/90 leading-relaxed">
              India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
              Emergency response within minutes, not hours.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-red-600/30 hover:-translate-y-1"
                onClick={() => setActiveSection('donate')}
              >
                <Droplet size={20} />
                Donate Now
              </button>
              <button
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 border border-white/30 flex items-center justify-center gap-2 hover:border-white/50 hover:-translate-y-1"
                onClick={() => setShowEmergencyModal(true)}
              >
                <AlertTriangle size={20} className="text-red-400" />
                Request Emergency
              </button>
            </div>
            
            {/* Stats Bar - More compact on mobile */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 md:p-4 border border-white/20 mt-5 md:mt-6">
              <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 md:gap-4">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-red-500/20 p-1 md:p-2 rounded-lg">
                    <Users size={16} className="text-red-200" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold">58,000+</p>
                    <p className="text-xs text-red-200">Active Donors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-red-500/20 p-1 md:p-2 rounded-lg">
                    <Heart size={16} className="text-red-200" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold">124K+</p>
                    <p className="text-xs text-red-200">Lives Saved</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-red-500/20 p-1 md:p-2 rounded-lg">
                    <Clock size={16} className="text-red-200" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold">15 min</p>
                    <p className="text-xs text-red-200">Avg. Response</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="bg-red-500/20 p-1 md:p-2 rounded-lg">
                    <Shield size={16} className="text-red-200" />
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold">1,230+</p>
                    <p className="text-xs text-red-200">Hospitals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Emergency Alerts */}
          <div className="mt-6 sm:mt-8 md:mt-0">
            <div className="relative">
              {/* Decorative Elements */}
              <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-16 md:w-20 h-16 md:h-20 bg-red-500/30 rounded-full blur-xl"></div>
              <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-20 md:w-32 h-20 md:h-32 bg-red-600/20 rounded-full blur-xl"></div>
              
              {/* Alert Card */}
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
                {/* Alert Header */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <AlertTriangle size={18} className="text-white mr-2" />
                      <h3 className="font-semibold text-white text-sm md:text-base">Emergency Alerts</h3>
                    </div>
                    <div className="flex items-center">
                      <span className="flex h-2 w-2 md:h-3 md:w-3 relative mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-200 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 md:h-3 md:w-3 bg-red-400"></span>
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-2 md:px-3 py-0.5 md:py-1 rounded-full font-medium">Live</span>
                    </div>
                  </div>
                </div>
                
                {/* Alert Content */}
                <div className="p-4 md:p-6">
                  <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                    {emergencyRequests.slice(0, 3).map((emergency, index) => (
                      <div key={emergency.id}>
                        <EmergencyCard
                          emergency={emergency}
                          onClick={() => setActiveSection('emergency')}
                          compact={true}
                        />
                        {index < 2 && 
                          <div className="border-b border-gray-100 my-3 md:my-4"></div>
                        }
                      </div>
                    ))}
                  </div>
                  
                  <button
                    className="w-full bg-gray-50 hover:bg-gray-100 text-red-600 font-medium rounded-xl py-2 md:py-3 flex items-center justify-center hover:text-red-700 transition-colors text-sm md:text-base"
                    onClick={() => setActiveSection('emergency')}
                  >
                    View all emergencies 
                    <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
                
                {/* Bottom Banner */}
                <div className="bg-red-50 p-3 md:p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex -space-x-1 md:-space-x-2 mr-2 md:mr-3">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-white flex items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-medium"
                        >
                          {['A+', 'B+', 'O-', 'AB'][i]}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600 hidden sm:block">All blood types needed</div>
                  </div>
                  <button 
                    className="text-xs font-medium text-red-600 hover:text-red-800"
                    onClick={() => setActiveSection('donate')}
                  >
                    Check compatibility
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}