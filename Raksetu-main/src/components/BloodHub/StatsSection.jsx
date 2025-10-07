import { memo, useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
  
  const StatsSection = memo(() => {
    const [stats, setStats] = useState({
      livesSaved: 0,
      totalDonors: 0,
      bloodBanks: 0,
      emergenciesResolved: 0,
      loading: true
    });

    useEffect(() => {
      const fetchRealTimeStats = async () => {
        try {
          // Fetch total donors (users collection)
          const usersRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersRef);
          const totalDonors = usersSnapshot.size;

          // Fetch blood banks
          const bloodBanksRef = collection(db, 'bloodBanks');
          const bloodBanksSnapshot = await getDocs(bloodBanksRef);
          const totalBloodBanks = bloodBanksSnapshot.size;

          // Fetch resolved emergencies (status = 'Resolved')
          const emergenciesRef = collection(db, 'emergencyRequests');
          const emergenciesSnapshot = await getDocs(emergenciesRef);
          const allEmergencies = emergenciesSnapshot.docs.map(doc => doc.data());
          
          const resolvedEmergencies = allEmergencies.filter(
            e => e.status === 'Resolved' || e.status === 'Completed'
          ).length;

          // Fetch donations to calculate lives saved (each donation ~= 0.3 lives saved statistically)
          const donationsRef = collection(db, 'donations');
          const donationsSnapshot = await getDocs(donationsRef);
          const totalDonations = donationsSnapshot.size;
          const livesSaved = Math.floor(totalDonations * 0.3); // Conservative estimate

          setStats({
            livesSaved: livesSaved || 0,
            totalDonors: totalDonors || 0,
            bloodBanks: totalBloodBanks || 0,
            emergenciesResolved: resolvedEmergencies || 0,
            loading: false
          });
        } catch (error) {
          // Silently handle permission errors for unauthenticated users
          if (error.code === 'permission-denied') {
            console.log('ℹ️ [Stats] Not logged in - using default values');
          } else {
            console.error('Error fetching stats:', error);
          }
          setStats({
            livesSaved: 0,
            totalDonors: 0,
            bloodBanks: 0,
            emergenciesResolved: 0,
            loading: false
          });
        }
      };

      fetchRealTimeStats();

      // Refresh stats every 30 seconds
      const interval = setInterval(fetchRealTimeStats, 30000);
      return () => clearInterval(interval);
    }, []);

    const donorStats = [
      { 
        label: 'Lives Saved', 
        value: stats.loading ? '...' : stats.livesSaved.toLocaleString(),
        color: 'red'
      },
      { 
        label: 'Active Donors', 
        value: stats.loading ? '...' : stats.totalDonors.toLocaleString(),
        color: 'blue'
      },
      { 
        label: 'Blood Banks', 
        value: stats.loading ? '...' : stats.bloodBanks.toLocaleString(),
        color: 'green'
      },
      { 
        label: 'Emergencies Resolved', 
        value: stats.loading ? '...' : stats.emergenciesResolved.toLocaleString(),
        color: 'purple'
      },
    ];
  
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Our Impact</h2>
            <p className="text-gray-600">Real-time statistics from our community</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {donorStats.map((stat, index) => (
              <div 
                key={index} 
                className={`text-center p-6 bg-${stat.color}-50 rounded-xl border-2 border-${stat.color}-100 hover:shadow-lg transition-all`}
              >
                <div className={`text-4xl font-bold text-${stat.color}-600 mb-2 ${stats.loading ? 'animate-pulse' : ''}`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
                <div className="mt-2">
                  <span className="inline-flex items-center gap-1 text-xs text-green-600 font-semibold">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  });

StatsSection.displayName = 'StatsSection';

export default StatsSection;