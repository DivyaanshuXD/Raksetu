import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Filter, Crown } from 'lucide-react';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { calculateTotalPoints } from '../../utils/gamification';
import { LEADERBOARD_PERIODS } from '../../utils/gamificationConfig';

const Leaderboard = ({ currentUserId, userBloodType }) => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('allTime'); // 'allTime', 'monthly', 'weekly'
  const [filterBloodType, setFilterBloodType] = useState('all'); // 'all' or specific blood type

  useEffect(() => {
    fetchLeaderboard();
  }, [period, filterBloodType]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Build query
      let leaderQuery = query(collection(db, 'users'));

      // Filter by blood type if specified
      if (filterBloodType !== 'all') {
        leaderQuery = query(leaderQuery, where('bloodType', '==', filterBloodType));
      }

      const usersSnapshot = await getDocs(leaderQuery);
      const usersData = [];

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        
        // Fetch user's donations from donationsDone collection
        let donationsQuery = query(
          collection(db, 'donationsDone'),
          where('userId', '==', userDoc.id),
          where('status', '==', 'completed')
        );

        // Filter by time period
        const periodConfig = LEADERBOARD_PERIODS[period];
        if (periodConfig.duration) {
          const cutoffDate = new Date(Date.now() - periodConfig.duration);
          donationsQuery = query(
            donationsQuery,
            where('date', '>=', cutoffDate)
          );
        }

        const donationsSnapshot = await getDocs(donationsQuery);
        const donations = donationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const totalPoints = calculateTotalPoints(donations);
        const donationCount = donations.length;

        if (donationCount > 0 || totalPoints > 0) {
          usersData.push({
            id: userDoc.id,
            name: userData.name || 'Anonymous',
            bloodType: userData.bloodType || 'Unknown',
            profilePicture: userData.profilePicture,
            totalPoints,
            donationCount,
            lastDonation: donations[0]?.date
          });
        }
      }

      // Sort by points
      usersData.sort((a, b) => b.totalPoints - a.totalPoints);

      // Take top 100
      const topUsers = usersData.slice(0, 100);

      setLeaders(topUsers);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="text-gray-600 dark:text-gray-400 font-bold">{rank}</span>;
  };

  const getRankBackground = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 border-yellow-300 dark:border-yellow-700';
    if (rank === 2) return 'bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-800 dark:to-slate-800 border-gray-300 dark:border-gray-600';
    if (rank === 3) return 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 border-orange-300 dark:border-orange-700';
    return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  const bloodTypes = ['all', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <Trophy className="w-8 h-8 text-purple-600" />
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Top donors ranked by points and contributions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Time Period Filter */}
        <div className="flex gap-2">
          {Object.entries(LEADERBOARD_PERIODS).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                period === key
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Blood Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <select
            value={filterBloodType}
            onChange={(e) => setFilterBloodType(e.target.value)}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none font-medium"
          >
            {bloodTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Blood Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      )}

      {/* Leaderboard List */}
      {!loading && (
        <div className="space-y-3">
          {leaders.map((leader, index) => {
            const rank = index + 1;
            const isCurrentUser = leader.id === currentUserId;

            return (
              <motion.div
                key={leader.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`${getRankBackground(rank)} ${
                  isCurrentUser ? 'ring-2 ring-red-500' : ''
                } rounded-xl p-4 border-2 transition-all hover:shadow-lg`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                    {getRankIcon(rank)}
                  </div>

                  {/* Profile Picture */}
                  <div className="flex-shrink-0">
                    {leader.profilePicture ? (
                      <img
                        src={leader.profilePicture}
                        alt={leader.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {leader.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">
                        {leader.name}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded-full">
                            You
                          </span>
                        )}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-semibold text-red-600 dark:text-red-400">
                        {leader.bloodType}
                      </span>
                      <span>•</span>
                      <span>{leader.donationCount} donations</span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {leader.totalPoints.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      points
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!loading && leaders.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No donors found for this period
          </p>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
            Be the first to donate and top the leaderboard!
          </p>
        </div>
      )}

      {/* User's Rank (if not in top 100) */}
      {!loading && leaders.length > 0 && currentUserId && !leaders.some(l => l.id === currentUserId) && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border-2 border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-center text-gray-600 dark:text-gray-400">
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Keep donating to make it to the top 100!
          </p>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
