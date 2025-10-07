import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, Star } from 'lucide-react';
import { 
  getAllAchievements, 
  checkUnlockedAchievements 
} from '../../utils/gamification';
import { RARITY_COLORS, RARITY_LABELS } from '../../utils/gamificationConfig';

const AchievementTracker = ({ userProfile, donations = [] }) => {
  const [allAchievements, setAllAchievements] = useState([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unlocked', 'locked'
  const [sortBy, setSortBy] = useState('rarity'); // 'rarity', 'points', 'date'

  useEffect(() => {
    const all = getAllAchievements();
    const unlocked = checkUnlockedAchievements(userProfile, donations);
    
    setAllAchievements(all);
    setUnlockedAchievements(unlocked);
  }, [userProfile, donations]);

  const isUnlocked = (achievementId) => {
    return unlockedAchievements.some(a => a.id === achievementId);
  };

  const getUnlockedData = (achievementId) => {
    return unlockedAchievements.find(a => a.id === achievementId);
  };

  const filteredAchievements = allAchievements.filter(achievement => {
    if (filter === 'unlocked') return isUnlocked(achievement.id);
    if (filter === 'locked') return !isUnlocked(achievement.id);
    return true;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (sortBy === 'points') return b.points - a.points;
    if (sortBy === 'date') {
      const aData = getUnlockedData(a.id);
      const bData = getUnlockedData(b.id);
      if (!aData) return 1;
      if (!bData) return -1;
      return new Date(bData.unlockedAt) - new Date(aData.unlockedAt);
    }
    // Default: sort by rarity
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
  });

  const unlockedCount = unlockedAchievements.length;
  const totalCount = allAchievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Achievements
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {unlockedCount} of {totalCount} unlocked
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
              {completionPercentage}%
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-red-500 to-pink-500"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'unlocked'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('locked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'locked'
                ? 'bg-gray-600 text-white shadow-lg'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Locked ({totalCount - unlockedCount})
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-none font-medium"
        >
          <option value="rarity">Sort by Rarity</option>
          <option value="points">Sort by Points</option>
          <option value="date">Sort by Date</option>
        </select>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedAchievements.map((achievement, index) => {
            const unlocked = isUnlocked(achievement.id);
            const unlockedData = getUnlockedData(achievement.id);
            const IconComponent = achievement.icon;

            return (
              <motion.div
                key={achievement.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-xl p-5 transition-all ${
                  unlocked
                    ? 'bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl border-2 border-transparent hover:border-red-300 dark:hover:border-red-700'
                    : 'bg-gray-50 dark:bg-gray-900/50 opacity-60 hover:opacity-80'
                }`}
              >
                {/* Locked Overlay */}
                {!unlocked && (
                  <div className="absolute top-4 right-4">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                )}

                {/* Unlocked Badge */}
                {unlocked && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                )}

                {/* Icon */}
                <div className={`mb-3 ${unlocked ? '' : 'grayscale'}`}>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${achievement.color} p-3 flex items-center justify-center`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </div>

                {/* Title & Rarity */}
                <div className="mb-2">
                  <h4 className={`text-lg font-bold ${
                    unlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-600'
                  }`}>
                    {achievement.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className={`w-4 h-4 ${RARITY_COLORS[achievement.rarity]}`} />
                    <span className={`text-xs font-semibold ${RARITY_COLORS[achievement.rarity]}`}>
                      {RARITY_LABELS[achievement.rarity]}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-sm mb-3 ${
                  unlocked ? 'text-gray-600 dark:text-gray-400' : 'text-gray-500 dark:text-gray-600'
                }`}>
                  {achievement.description}
                </p>

                {/* Points */}
                <div className={`flex items-center justify-between pt-3 border-t ${
                  unlocked ? 'border-gray-200 dark:border-gray-700' : 'border-gray-300 dark:border-gray-800'
                }`}>
                  <span className={`text-sm font-semibold ${
                    unlocked ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500'
                  }`}>
                    +{achievement.points} points
                  </span>
                  {unlocked && unlockedData?.unlockedAt && (
                    <span className="text-xs text-gray-500">
                      {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sortedAchievements.length === 0 && (
        <div className="text-center py-12">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No achievements found with current filter
          </p>
        </div>
      )}
    </div>
  );
};

export default AchievementTracker;
