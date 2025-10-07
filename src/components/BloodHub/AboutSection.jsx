import { useState } from 'react';
import { Users, Heart, Clock, MapPin, Award, Shield, ArrowRight, ExternalLink, Bell, Phone, Zap } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

function FeatureCard({ icon, title, description, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const animationDelay = `${index * 0.1}s`;
  
  return (
    <div 
      className={`bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100
                 ${isHovered ? 'transform -translate-y-2' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay }}
    >
      <div className={`flex flex-col items-center text-center h-full`}>
        <div className={`mb-5 p-3 rounded-full bg-red-50 text-red-600 transition-all duration-300
                        ${isHovered ? 'bg-red-100 scale-110' : ''}`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <p className="text-gray-600 text-sm flex-grow">{description}</p>
        <div className={`mt-4 text-red-600 text-sm font-medium flex items-center transition-opacity duration-300
                       ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <span>Learn more</span>
          <ChevronRight size={16} className="ml-1" />
        </div>
      </div>
    </div>
  );
}

export default function AboutSection({ isLoggedIn, setShowAuthModal, setAuthMode }) {
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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-70"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-50 rounded-full -ml-40 -mb-40 opacity-70"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center mb-16">
          <span className="text-red-600 font-medium text-sm uppercase tracking-wider mb-2">Our Story</span>
          <h2 className="text-4xl font-bold mb-4 text-gray-900 text-center">About Raksetu</h2>
          <div className="w-24 h-1 bg-red-600 mb-6 rounded-full"></div>
          <p className="text-gray-600 max-w-3xl mx-auto text-center text-lg leading-relaxed">
            Raksetu is India's first AI-powered blood donation network, designed to bridge the gap between donors, recipients, and hospitals. Our mission is to save lives by ensuring timely blood availability across the country.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-red-600 relative group">
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={64} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">
                <Heart size={20} />
              </span>
              Our Mission
            </h3>
            <p className="text-gray-600 leading-relaxed">
              To leverage technology to create a seamless blood donation ecosystem, reducing emergency response times and increasing donor participation. We aim to save over <span className="font-semibold text-red-600">1 million lives by 2030</span>.
            </p>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <Award size={16} className="mr-2 text-red-500" />
                Founded in 2025 with a commitment to saving lives
              </span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-t-4 border-red-600 relative group">
            <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
              <Award size={64} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-semibold mb-4 text-gray-800 flex items-center">
              <span className="bg-red-100 text-red-600 p-2 rounded-lg mr-3">
                <Users size={20} />
              </span>
              Our Vision
            </h3>
            <p className="text-gray-600 leading-relaxed">
              A world where no one dies due to lack of blood. We strive to make blood donation accessible, efficient, and impactful for every Indian, creating a healthier and more compassionate society.
            </p>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-500 flex items-center">
                <Award size={16} className="mr-2 text-red-500" />
                Recognized as a leader in healthcare innovation
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mb-20">
          <div className="inline-block bg-red-50 px-4 py-1 rounded-full text-red-600 text-sm font-medium mb-4">Why Choose Raksetu?</div>
          <h3 className="text-2xl font-bold mb-10 text-gray-800">Making Blood Donation Accessible and Efficient</h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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

        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 md:p-12 shadow-xl text-white relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10">
            <Users size={240} strokeWidth={1} />
          </div>
          
          <div className="md:max-w-3xl relative z-10">
            <h3 className="text-3xl font-bold mb-4">Join Our Mission</h3>
            <p className="text-red-100 text-lg mb-8">
              We're looking for passionate individuals who want to make a difference. Join our team and help us revolutionize blood donation in India.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {!isLoggedIn && (
                <button
                  onClick={handleJoinTeamClick}
                  className="bg-white text-red-600 hover:bg-red-50 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center shadow-md hover:shadow-lg"
                >
                  Join Our Team
                  <ArrowRight size={18} className="ml-2" />
                </button>
              )}
              <a href="#" className="border border-white text-white hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center justify-center">
                Learn More
                <ExternalLink size={18} className="ml-2" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}