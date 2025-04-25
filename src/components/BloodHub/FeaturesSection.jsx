import { useState } from 'react';
import { Clock, MapPin, Bell, Phone, Heart, Users, ChevronRight, Shield, Zap } from 'lucide-react';

function FeatureCard({ icon, title, description, index }) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Delay animation based on index for staggered effect
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

export default function FeaturesSection() {
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

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-red-600 font-medium mb-3">WHY CHOOSE US</p>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">What Makes Raksetu Different</h2>
          <div className="w-24 h-1 bg-red-600 mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We're revolutionizing blood donation with unique features designed for India's specific challenges,
            connecting donors and recipients faster than ever before.
          </p>
        </div>
        
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
        
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-6">Join thousands of donors already making a difference across India</p>
          <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-300 inline-flex items-center">
            Become a Donor
            <ChevronRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </section>
  );
}