import { useState, useEffect } from 'react';
import { Droplet, AlertTriangle, ChevronRight } from 'lucide-react';
import EmergencyCard from './EmergencyCard';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

export default function HeroSection({ setActiveSection, setShowEmergencyModal, emergencyRequests }) {
  const [emergencies, setEmergencies] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'emergencies'), (snapshot) => {
      const emergencyList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setEmergencies(emergencyList);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section className="relative py-16 overflow-hidden">
      <video
        autoPlay
        muted
        loop
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-100"
      >
        <source src="src/assets/login-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="container mx-auto px-4 relative z-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6 text-white">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Save Lives with Every Drop
          </h1>
          <p className="text-lg">
            India's first AI-powered blood donation network connecting donors, recipients, and hospitals in real-time.
            Emergency response within minutes, not hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              onClick={() => setActiveSection('donate')}
            >
              <Droplet size={20} />
              Donate Now
            </button>
            <button
              className="bg-red-700 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-red-400 flex items-center justify-center gap-2"
              onClick={() => setShowEmergencyModal(true)}
            >
              <AlertTriangle size={20} />
              Request Emergency
            </button>
          </div>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-8 h-8 rounded-full border-2 border-red-600 bg-red-${300 + i * 100}`}></div>
              ))}
            </div>
            <p>Join 58,000+ donors saving lives daily</p>
          </div>
        </div>
        <div className="hidden md:block">
          <div className="relative">
            <div className="bg-white p-6 rounded-xl shadow-lg relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Emergency Alerts</h3>
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">Live</span>
              </div>
              <div className="space-y-4">
                {/* Use emergencyRequests from props instead of local emergencies state when possible */}
                {(emergencyRequests && emergencyRequests.length > 0 ? emergencyRequests : emergencies).slice(0, 3).map((emergency) => (
                  <EmergencyCard
                    key={emergency.id}
                    emergency={emergency}
                    onClick={() => {
                      setActiveSection('emergency');
                    }}
                  />
                ))}
              </div>
              <button
                className="mt-4 text-red-600 font-medium flex items-center hover:text-red-800 transition-colors"
                onClick={() => setActiveSection('emergency')}
              >
                View all emergencies <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}