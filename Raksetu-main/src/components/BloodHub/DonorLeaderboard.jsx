import { useState, useEffect, useMemo } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { Trophy, Medal, Award, TrendingUp, Droplet, Heart, Star, Crown, Zap, Target } from 'lucide-react';

export default function DonorLeaderboard({ userProfile }) {
  const [topDonors, setTopDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('allTime'); // allTime, thisYear, thisMonth
  
  // Fetch top donors
  useEffect(() => {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('totalDonations', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(usersQuery,
      (snapshot) => {
        const donors = snapshot.docs.map((doc, index) => {
          const data = doc.data();
          return {
            id: doc.id,
            rank: index + 1,
            name: data.name || 'Anonymous',
            bloodType: data.bloodType || 'N/A',
            totalDonations: data.totalDonations || 0,
            impactPoints: data.impactPoints || data.totalDonations * 150 || 0,
            badge: data.badge || getBadgeLevel(data.totalDonations || 0),
            avatar: data.photoURL || null,
            createdAt: data.createdAt?.toDate?.() || new Date()
          };
        });
        
        setTopDonors(donors);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching leaderboard:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Determine badge level based on donations
  const getBadgeLevel = (donations) => {
    if (donations >= 50) return 'Platinum Lifesaver';
    if (donations >= 25) return 'Gold Lifesaver';
    if (donations >= 10) return 'Silver Lifesaver';
    if (donations >= 5) return 'Bronze Lifesaver';
    return 'Rising Star';
  };

  // Get badge color
  const getBadgeColor = (badge) => {
    if (badge?.includes('Platinum')) return 'from-purple-500 to-indigo-600';
    if (badge?.includes('Gold')) return 'from-yellow-400 to-orange-500';
    if (badge?.includes('Silver')) return 'from-gray-300 to-gray-500';
    if (badge?.includes('Bronze')) return 'from-amber-600 to-amber-800';
    return 'from-blue-400 to-blue-600';
  };

  // Get rank icon and color
  const getRankDisplay = (rank) => {
    switch (rank) {
      case 1:
        return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-100', label: '1st' };
      case 2:
        return { icon: Medal, color: 'text-gray-400', bgColor: 'bg-gray-100', label: '2nd' };
      case 3:
        return { icon: Medal, color: 'text-amber-600', bgColor: 'bg-amber-100', label: '3rd' };
      default:
        return { icon: Trophy, color: 'text-gray-600', bgColor: 'bg-gray-50', label: `${rank}th` };
    }
  };

  // Find current user's rank
  const currentUserRank = useMemo(() => {
    if (!userProfile) return null;
    const index = topDonors.findIndex(donor => donor.id === userProfile.id);
    return index >= 0 ? index + 1 : null;
  }, [topDonors, userProfile]);

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-500"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-gray-50 py-20">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
              <Trophy className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            🏆 Donor Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Celebrating our heroes who save lives through blood donation
          </p>
        </div>

        {/* Current User Card (if ranked) */}
        {currentUserRank && userProfile && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-6 shadow-xl text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                    <Star className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Your Rank: #{currentUserRank}</h3>
                    <p className="text-red-100">Keep up the amazing work!</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{userProfile.totalDonations || 0}</div>
                    <div className="text-sm text-red-100">Donations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{userProfile.impactPoints || 0}</div>
                    <div className="text-sm text-red-100">Points</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Droplet className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {topDonors.reduce((sum, donor) => sum + donor.totalDonations, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Donations</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {topDonors.reduce((sum, donor) => sum + donor.totalDonations * 3, 0)}
                </div>
                <div className="text-sm text-gray-600">Lives Saved</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{topDonors.length}</div>
                <div className="text-sm text-gray-600">Active Donors</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {topDonors.reduce((sum, donor) => sum + donor.impactPoints, 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Impact Points</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboard List */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <h2 className="text-2xl font-bold flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span>Top Donors</span>
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {topDonors.map((donor) => {
              const rankDisplay = getRankDisplay(donor.rank);
              const RankIcon = rankDisplay.icon;
              const isCurrentUser = userProfile && donor.id === userProfile.id;

              return (
                <div
                  key={donor.id}
                  className={`p-4 sm:p-6 transition-all hover:bg-gray-50 ${
                    isCurrentUser ? 'bg-red-50 border-l-4 border-red-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* Rank & User Info */}
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 ${rankDisplay.bgColor} rounded-full w-12 h-12 flex items-center justify-center`}>
                        {donor.rank <= 3 ? (
                          <RankIcon className={`w-6 h-6 ${rankDisplay.color}`} />
                        ) : (
                          <span className="text-lg font-bold text-gray-600">#{donor.rank}</span>
                        )}
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {donor.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate flex items-center space-x-2">
                            <span>{donor.name}</span>
                            {isCurrentUser && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">You</span>
                            )}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span className="flex items-center space-x-1">
                              <Droplet className="w-3 h-3" />
                              <span>{donor.bloodType}</span>
                            </span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 bg-gradient-to-r ${getBadgeColor(donor.badge)} text-white text-xs rounded-full`}>
                              {donor.badge}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-4 sm:space-x-8">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{donor.totalDonations}</div>
                        <div className="text-xs text-gray-500">Donations</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{donor.totalDonations * 3}</div>
                        <div className="text-xs text-gray-500">Lives</div>
                      </div>
                      <div className="text-center hidden sm:block">
                        <div className="text-2xl font-bold text-purple-600">{donor.impactPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">Points</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Motivational Footer */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white">
            <Target className="w-12 h-12 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Join the Leaderboard!</h3>
            <p className="text-red-100 mb-6">
              Every donation brings you closer to the top and saves lives in your community
            </p>
            <button
              onClick={() => window.location.hash = '#donate'}
              className="bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              Donate Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
