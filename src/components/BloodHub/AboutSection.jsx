import { useState, memo } from 'react';
import { Users, Heart, Clock, MapPin, Award, Shield, ArrowRight, ExternalLink, Bell, Phone, Zap, Target, Globe, TrendingUp, CheckCircle2 } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

function FeatureCard({ icon, title, description, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className={`group bg-white p-6 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100
                 ${isHovered ? 'transform -translate-y-3 border-red-200' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay }}
    >
      <div className="flex flex-col items-start text-left h-full">
        <div className={`mb-4 p-3.5 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-red-600 transition-all duration-500
                        ${isHovered ? 'bg-gradient-to-br from-red-100 to-red-200 scale-110 rotate-3 shadow-lg' : ''}`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold mb-2.5 text-gray-900 group-hover:text-red-600 transition-colors duration-300">{title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed flex-grow">{description}</p>
        <div className={`mt-4 pt-3 border-t border-gray-100 w-full text-red-600 text-xs font-semibold flex items-center transition-all duration-300
                       ${isHovered ? 'opacity-100 translate-x-1' : 'opacity-0'}`}>
          <span>Explore feature</span>
          <ChevronRight size={14} className="ml-1" />
        </div>
      </div>
    </div>
  );
}

const AboutSection = memo(({ isLoggedIn, setShowAuthModal, setAuthMode }) => {
  const features = [
    {
      icon: <Clock size={32} />,
      title: "Real-time Emergency Response",
      description: "Notify nearby donors instantly during emergencies through our AI-based matching algorithm, reducing response time by 78%."
    },
    {
      icon: <MapPin size={32} />,
      title: "Proximity-based Alerts",
      description: "Receive alerts only for emergencies within your commutable distance, with integrated navigation."
    },
    {
      icon: <Bell size={32} />,
      title: "Blood Type Rare Alert System",
      description: "Special notification system for rare blood types like Bombay Blood Group, connecting across multiple states."
    },
    {
      icon: <Phone size={32} />,
      title: "Works Without Internet",
      description: "Emergency SMS fallback system works even when internet connectivity is unavailable in remote areas."
    },
    {
      icon: <Heart size={32} />,
      title: "Impact Tracking",
      description: "See how your donations are used and receive updates about the lives you've helped save."
    },
    {
      icon: <Users size={32} />,
      title: "Community Blood Drives",
      description: "Organize and participate in community blood drives with our built-in event management tools."
    },
    {
      icon: <Shield size={32} />,
      title: "Secure Health Information",
      description: "Your health data is protected with end-to-end encryption and follows all HIPAA and Indian healthcare privacy standards."
    },
    {
      icon: <Zap size={32} />,
      title: "Fast-track Hospital Integration",
      description: "Direct integration with 500+ hospitals across India for seamless verification and donation processing."
    }
  ];

  const handleJoinTeamClick = () => {
    setAuthMode('register');
    setShowAuthModal(true);
  };

  return (
    <section className="py-28 bg-gradient-to-br from-gray-50 via-white to-red-50/30 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-red-100 to-red-50 rounded-full -mr-48 -mt-48 opacity-40 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-red-50 to-pink-50 rounded-full -ml-64 -mb-64 opacity-30 blur-3xl"></div>
      <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-red-50 to-orange-50 rounded-full opacity-20 blur-2xl"></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        {/* Header Section - Enhanced */}
        <div className="flex flex-col items-center mb-20 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-red-50 border border-red-100 px-4 py-2 rounded-full text-red-600 text-sm font-semibold mb-6 shadow-sm">
            <Heart size={16} className="mr-2 animate-pulse" />
            <span>About Raksetu</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gray-900 leading-tight">
            Transforming Blood Donation
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500 mt-2">
              Through Technology
            </span>
          </h2>
          
          <div className="w-20 sm:w-24 md:w-28 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-pink-500 mb-6 sm:mb-8 rounded-full shadow-sm"></div>
          
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl leading-relaxed font-light">
            Raksetu is India's <span className="font-semibold text-red-600">first AI-powered blood donation network</span>, designed to bridge the gap between donors, recipients, and hospitals. Our mission is to save lives by ensuring timely blood availability across the country.
          </p>
          
          {/* Quick Stats - New Addition */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 mt-8 sm:mt-12 w-full max-w-2xl">
            <div className="bg-white p-3 sm:p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-1">500+</div>
              <div className="text-sm text-gray-600 font-medium">Hospitals</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold text-red-600 mb-1">1M</div>
              <div className="text-sm text-gray-600 font-medium">Lives Target</div>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="text-3xl font-bold text-red-600 mb-1">78%</div>
              <div className="text-sm text-gray-600 font-medium">Faster Response</div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Enhanced Design */}
        <div className="grid lg:grid-cols-2 gap-8 mb-24">
          <div className="group bg-gradient-to-br from-white to-red-50/30 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-red-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-red-100 to-red-50 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-red-50 to-pink-50 rounded-full opacity-40"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center bg-red-600 text-white p-3.5 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Target size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold mb-5 text-gray-900 flex items-center">
                Our Mission
              </h3>
              
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                To leverage technology to create a seamless blood donation ecosystem, reducing emergency response times and increasing donor participation. We aim to save over <span className="font-bold text-red-600 text-lg">1 million lives by 2030</span>.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">AI-powered donor matching algorithm</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Real-time emergency response system</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">24/7 availability across India</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-red-200/50">
                <span className="text-sm text-gray-500 flex items-center font-medium">
                  <Award size={18} className="mr-2 text-red-500" />
                  Founded in 2025 with a commitment to saving lives
                </span>
              </div>
            </div>
          </div>
          
          <div className="group bg-gradient-to-br from-white to-blue-50/30 p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-blue-100 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-full opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-blue-50 to-indigo-50 rounded-full opacity-40"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center bg-blue-600 text-white p-3.5 rounded-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <Globe size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="text-3xl font-bold mb-5 text-gray-900 flex items-center">
                Our Vision
              </h3>
              
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                A world where no one dies due to lack of blood. We strive to make blood donation accessible, efficient, and impactful for every Indian, creating a healthier and more compassionate society.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Zero preventable deaths from blood shortage</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Universal blood donation awareness</span>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 size={18} className="text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Community-driven healthcare innovation</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-blue-200/50">
                <span className="text-sm text-gray-500 flex items-center font-medium">
                  <TrendingUp size={18} className="mr-2 text-blue-500" />
                  Recognized as a leader in healthcare innovation
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section - Enhanced Grid */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center bg-gradient-to-r from-red-50 to-pink-50 border border-red-100 px-4 sm:px-5 py-2.5 rounded-full text-red-600 text-xs sm:text-sm font-bold mb-6 shadow-sm">
            <Zap size={14} className="sm:w-4 sm:h-4 mr-2" />
            <span>Why Choose Raksetu?</span>
          </div>
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-gray-900 px-4">
            Making Blood Donation 
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 mt-1">
              Accessible & Efficient
            </span>
          </h3>
          <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg mb-10 sm:mb-14 px-4">
            Discover how our innovative features are revolutionizing blood donation across India
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* CTA Section - Enhanced with Auth-Aware Learn More */}
        <div className="relative mt-20">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 rounded-3xl p-10 md:p-14 shadow-2xl text-white relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full -mr-40 -mt-40 blur-2xl"></div>
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-white/5 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            <div className="absolute right-1/4 bottom-1/4 opacity-5">
              <Users size={280} strokeWidth={0.5} />
            </div>
            
            <div className="relative z-10 max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-semibold mb-6 border border-white/20">
                <Heart size={16} className="mr-2 animate-pulse" />
                <span>Join the Movement</span>
              </div>
              
              <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-6 leading-tight px-4">
                Be Part of Something Bigger
              </h3>
              
              <p className="text-red-50 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 leading-relaxed max-w-3xl mx-auto font-light px-4">
                We're looking for passionate individuals who want to make a difference. Join our team and help us revolutionize blood donation in India. Together, we can save countless lives.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
                {!isLoggedIn && (
                  <button
                    onClick={handleJoinTeamClick}
                    className="group bg-white text-red-600 hover:bg-red-50 px-8 sm:px-10 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 inline-flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 border-2 border-transparent hover:border-white w-full sm:w-auto"
                  >
                    Join Our Team
                    <ArrowRight size={18} className="sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                )}
                
                {/* Learn More button - Only visible to non-logged-in users, prompts signup */}
                {!isLoggedIn && (
                  <button
                    onClick={handleJoinTeamClick}
                    className="group border-2 border-white text-white hover:bg-white hover:text-red-600 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 inline-flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Learn More
                    <ExternalLink size={20} className="ml-2 group-hover:rotate-12 transition-transform duration-300" />
                  </button>
                )}
                
                {isLoggedIn && (
                  <div className="bg-white/10 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-xl">
                    <p className="text-white font-medium flex items-center">
                      <CheckCircle2 size={20} className="mr-2 text-green-300" />
                      You're already part of our mission!
                    </p>
                  </div>
                )}
              </div>
              
              {!isLoggedIn && (
                <p className="text-red-200 text-sm mt-6 font-light">
                  Sign up now to access exclusive features and start making an impact today
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;