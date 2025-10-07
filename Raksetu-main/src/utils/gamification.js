import { POINTS_CONFIG, ACHIEVEMENTS, BADGE_LEVELS } from './gamificationConfig';

/**
 * Calculate total points earned for a donation
 * @param {Object} donation - Donation object with all attributes
 * @returns {Object} - Points breakdown and total
 */
export function calculateDonationPoints(donation) {
  const breakdown = {
    base: POINTS_CONFIG.base,
    urgency: 0,
    distance: 0,
    bloodRarity: 0,
    responseTime: 0,
    timeOfDay: 0,
    firstDonation: 0
  };

  // Urgency bonus
  if (donation.urgency && POINTS_CONFIG.urgency[donation.urgency]) {
    breakdown.urgency = POINTS_CONFIG.urgency[donation.urgency];
  }

  // Distance bonus
  if (donation.distance !== undefined) {
    if (donation.distance <= POINTS_CONFIG.distance.local.max) {
      breakdown.distance = POINTS_CONFIG.distance.local.bonus;
    } else if (donation.distance >= POINTS_CONFIG.distance.far.min) {
      breakdown.distance = POINTS_CONFIG.distance.far.bonus;
    }
  }

  // Blood rarity bonus
  if (donation.bloodType && POINTS_CONFIG.bloodRarity[donation.bloodType]) {
    breakdown.bloodRarity = POINTS_CONFIG.bloodRarity[donation.bloodType];
  }

  // Response time bonus (in seconds)
  if (donation.responseTime !== undefined) {
    if (donation.responseTime <= POINTS_CONFIG.responseTime.instant.max) {
      breakdown.responseTime = POINTS_CONFIG.responseTime.instant.bonus;
    } else if (donation.responseTime <= POINTS_CONFIG.responseTime.quick.max) {
      breakdown.responseTime = POINTS_CONFIG.responseTime.quick.bonus;
    } else if (donation.responseTime <= POINTS_CONFIG.responseTime.normal.max) {
      breakdown.responseTime = POINTS_CONFIG.responseTime.normal.bonus;
    }
  }

  // Time of day bonus
  if (donation.timestamp) {
    const hour = new Date(donation.timestamp).getHours();
    const { start, end, bonus } = POINTS_CONFIG.timeOfDay.night;
    if (hour >= start || hour < end) {
      breakdown.timeOfDay = bonus;
    }
  }

  // First donation bonus
  if (donation.isFirstDonation) {
    breakdown.firstDonation = POINTS_CONFIG.firstDonation;
  }

  // Calculate total
  const total = Object.values(breakdown).reduce((sum, points) => sum + points, 0);

  return {
    breakdown,
    total
  };
}

/**
 * Get user's current badge level based on completed donations
 * @param {number} completedDonations - Number of completed donations
 * @returns {Object} - Badge level object
 */
export function getUserBadgeLevel(completedDonations) {
  for (const [key, badge] of Object.entries(BADGE_LEVELS)) {
    if (completedDonations >= badge.minDonations && completedDonations <= badge.maxDonations) {
      return { ...badge, key };
    }
  }
  return BADGE_LEVELS.newHero;
}

/**
 * Get next badge level and progress
 * @param {number} completedDonations - Number of completed donations
 * @returns {Object} - Next badge and progress percentage
 */
export function getNextBadge(completedDonations) {
  const currentBadge = getUserBadgeLevel(completedDonations);
  
  // Find next badge
  const badgeKeys = Object.keys(BADGE_LEVELS);
  const currentIndex = badgeKeys.findIndex(key => key === currentBadge.key);
  
  if (currentIndex === badgeKeys.length - 1) {
    return {
      nextBadge: null,
      progress: 100,
      donationsNeeded: 0
    };
  }

  const nextBadgeKey = badgeKeys[currentIndex + 1];
  const nextBadge = BADGE_LEVELS[nextBadgeKey];
  
  const donationsNeeded = nextBadge.minDonations - completedDonations;
  const progress = ((completedDonations - currentBadge.minDonations) / 
                   (nextBadge.minDonations - currentBadge.minDonations)) * 100;

  return {
    nextBadge: { ...nextBadge, key: nextBadgeKey },
    progress: Math.min(100, Math.max(0, progress)),
    donationsNeeded
  };
}

/**
 * Check which achievements a user has unlocked
 * @param {Object} userStats - User statistics object
 * @param {Array} donations - Array of user's donations
 * @returns {Array} - Array of unlocked achievement objects
 */
export function checkUnlockedAchievements(userStats, donations) {
  const unlocked = [];
  const completedDonations = donations.filter(d => d.status === 'completed');

  // Check milestone achievements
  ACHIEVEMENTS.milestones.forEach(achievement => {
    if (completedDonations.length >= achievement.threshold) {
      unlocked.push({
        ...achievement,
        unlockedAt: completedDonations[achievement.threshold - 1]?.timestamp || new Date()
      });
    }
  });

  // Check streak achievements
  ACHIEVEMENTS.streaks.forEach(achievement => {
    const count = countDonationsInPeriod(completedDonations, achievement.period);
    if (count >= achievement.count) {
      unlocked.push({
        ...achievement,
        unlockedAt: new Date()
      });
    }
  });

  // Check speed achievements
  ACHIEVEMENTS.speed.forEach(achievement => {
    const hasFastResponse = completedDonations.some(
      d => d.responseTime && d.responseTime <= achievement.responseTime
    );
    if (hasFastResponse) {
      unlocked.push({
        ...achievement,
        unlockedAt: completedDonations.find(
          d => d.responseTime && d.responseTime <= achievement.responseTime
        ).timestamp
      });
    }
  });

  // Check distance achievements
  ACHIEVEMENTS.distance.forEach(achievement => {
    if (achievement.maxDistance) {
      const hasLocalDonation = completedDonations.some(
        d => d.distance && d.distance <= achievement.maxDistance
      );
      if (hasLocalDonation) {
        unlocked.push({ ...achievement, unlockedAt: new Date() });
      }
    }
    if (achievement.minDistance) {
      const hasDistantDonation = completedDonations.some(
        d => d.distance && d.distance >= achievement.minDistance
      );
      if (hasDistantDonation) {
        unlocked.push({ ...achievement, unlockedAt: new Date() });
      }
    }
  });

  // Check special achievements
  ACHIEVEMENTS.special.forEach(achievement => {
    if (achievement.bloodTypes) {
      const hasRareBlood = achievement.bloodTypes.includes(userStats.bloodType);
      const hasRareDonation = completedDonations.length > 0 && hasRareBlood;
      if (hasRareDonation) {
        unlocked.push({ ...achievement, unlockedAt: completedDonations[0].timestamp });
      }
    }

    if (achievement.timeRange) {
      const [start, end] = achievement.timeRange;
      const hasNightDonation = completedDonations.some(d => {
        const hour = new Date(d.timestamp).getHours();
        return hour >= start || hour < end;
      });
      if (hasNightDonation) {
        unlocked.push({ ...achievement, unlockedAt: new Date() });
      }
    }

    if (achievement.criticalCount) {
      const criticalCount = completedDonations.filter(
        d => d.urgency === 'critical'
      ).length;
      if (criticalCount >= achievement.criticalCount) {
        unlocked.push({ ...achievement, unlockedAt: new Date() });
      }
    }
  });

  return unlocked;
}

/**
 * Get all possible achievements for display
 * @returns {Array} - Flattened array of all achievements
 */
export function getAllAchievements() {
  return [
    ...ACHIEVEMENTS.milestones,
    ...ACHIEVEMENTS.streaks,
    ...ACHIEVEMENTS.speed,
    ...ACHIEVEMENTS.distance,
    ...ACHIEVEMENTS.special
  ];
}

/**
 * Count donations within a time period
 * @param {Array} donations - Array of donations
 * @param {string} period - 'week' or 'month'
 * @returns {number} - Count of donations in period
 */
function countDonationsInPeriod(donations, period) {
  const now = Date.now();
  const periodMs = period === 'week' 
    ? 7 * 24 * 60 * 60 * 1000 
    : 30 * 24 * 60 * 60 * 1000;

  return donations.filter(d => {
    const donationTime = new Date(d.timestamp).getTime();
    return now - donationTime <= periodMs;
  }).length;
}

/**
 * Calculate total points from all donations
 * @param {Array} donations - Array of completed donations
 * @returns {number} - Total points
 */
export function calculateTotalPoints(donations) {
  return donations
    .filter(d => d.status === 'completed')
    .reduce((total, donation) => {
      const { total: donationPoints } = calculateDonationPoints(donation);
      return total + donationPoints;
    }, 0);
}

/**
 * Get donation streak (consecutive donations within eligibility period)
 * @param {Array} donations - Array of completed donations sorted by date
 * @returns {number} - Current streak count
 */
export function getDonationStreak(donations) {
  const completedDonations = donations
    .filter(d => d.status === 'completed')
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (completedDonations.length === 0) return 0;

  let streak = 1;
  const eligibilityPeriod = 90 * 24 * 60 * 60 * 1000; // 90 days

  for (let i = 0; i < completedDonations.length - 1; i++) {
    const current = new Date(completedDonations[i].timestamp);
    const previous = new Date(completedDonations[i + 1].timestamp);
    const gap = current - previous;

    if (gap <= eligibilityPeriod) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
