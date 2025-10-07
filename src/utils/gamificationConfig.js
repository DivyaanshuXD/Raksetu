import { 
  Award, 
  Trophy, 
  Droplet, 
  Zap, 
  Heart, 
  Star, 
  Target, 
  TrendingUp,
  Clock,
  MapPin,
  Calendar,
  Flame
} from 'lucide-react';

/**
 * Gamification System Configuration
 * Defines achievements, badges, point calculations, and progression
 */

// ============================================
// ACHIEVEMENTS SYSTEM
// ============================================

export const ACHIEVEMENTS = {
  // Milestone Achievements (based on completed donations count)
  milestones: [
    {
      id: 'first_drop',
      title: 'First Drop',
      description: 'Completed your first blood donation',
      icon: Droplet,
      threshold: 1,
      points: 100,
      rarity: 'common',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'helping_hand',
      title: 'Helping Hand',
      description: 'Completed 3 blood donations',
      icon: Heart,
      threshold: 3,
      points: 150,
      rarity: 'common',
      color: 'from-pink-500 to-rose-500'
    },
    {
      id: 'bronze_hero',
      title: 'Bronze Hero',
      description: 'Completed 5 blood donations',
      icon: Award,
      threshold: 5,
      points: 250,
      rarity: 'uncommon',
      color: 'from-orange-600 to-amber-600'
    },
    {
      id: 'silver_hero',
      title: 'Silver Hero',
      description: 'Completed 10 blood donations',
      icon: Award,
      threshold: 10,
      points: 500,
      rarity: 'rare',
      color: 'from-gray-400 to-gray-600'
    },
    {
      id: 'gold_hero',
      title: 'Gold Hero',
      description: 'Completed 20 blood donations',
      icon: Trophy,
      threshold: 20,
      points: 1000,
      rarity: 'epic',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      id: 'platinum_legend',
      title: 'Platinum Legend',
      description: 'Completed 50 blood donations',
      icon: Trophy,
      threshold: 50,
      points: 2500,
      rarity: 'legendary',
      color: 'from-cyan-300 to-blue-500'
    },
    {
      id: 'diamond_savior',
      title: 'Diamond Savior',
      description: 'Completed 100 blood donations',
      icon: Trophy,
      threshold: 100,
      points: 5000,
      rarity: 'legendary',
      color: 'from-purple-400 to-pink-600'
    }
  ],

  // Streak Achievements
  streaks: [
    {
      id: 'consistent_giver',
      title: 'Consistent Giver',
      description: 'Donated 2 times in a week',
      icon: Calendar,
      period: 'week',
      count: 2,
      points: 200,
      rarity: 'uncommon',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'weekly_warrior',
      title: 'Weekly Warrior',
      description: 'Donated 3 times in a week',
      icon: Flame,
      period: 'week',
      count: 3,
      points: 300,
      rarity: 'rare',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'monthly_master',
      title: 'Monthly Master',
      description: 'Donated 4 times in a month',
      icon: TrendingUp,
      period: 'month',
      count: 4,
      points: 500,
      rarity: 'epic',
      color: 'from-indigo-500 to-purple-500'
    }
  ],

  // Speed Achievements (response time based)
  speed: [
    {
      id: 'lightning_fast',
      title: 'Lightning Fast',
      description: 'Responded to emergency in under 5 minutes',
      icon: Zap,
      responseTime: 300, // seconds
      points: 150,
      rarity: 'rare',
      color: 'from-yellow-300 to-orange-500'
    },
    {
      id: 'quick_responder',
      title: 'Quick Responder',
      description: 'Responded to emergency in under 15 minutes',
      icon: Clock,
      responseTime: 900, // seconds
      points: 100,
      rarity: 'uncommon',
      color: 'from-blue-400 to-cyan-500'
    }
  ],

  // Distance Achievements
  distance: [
    {
      id: 'local_hero',
      title: 'Local Hero',
      description: 'Donated within 5km of your location',
      icon: MapPin,
      maxDistance: 5,
      points: 50,
      rarity: 'common',
      color: 'from-green-400 to-teal-500'
    },
    {
      id: 'distance_warrior',
      title: 'Distance Warrior',
      description: 'Traveled over 20km to donate',
      icon: Target,
      minDistance: 20,
      points: 200,
      rarity: 'rare',
      color: 'from-red-500 to-orange-600'
    }
  ],

  // Special Achievements
  special: [
    {
      id: 'rare_gem',
      title: 'Rare Gem',
      description: 'Donated with rare blood type (AB-, B-, O-)',
      icon: Star,
      bloodTypes: ['AB-', 'B-', 'O-'],
      points: 300,
      rarity: 'epic',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'night_hero',
      title: 'Night Hero',
      description: 'Donated between 10 PM and 6 AM',
      icon: Star,
      timeRange: [22, 6],
      points: 150,
      rarity: 'uncommon',
      color: 'from-indigo-600 to-purple-700'
    },
    {
      id: 'emergency_responder',
      title: 'Emergency Responder',
      description: 'Responded to 5 critical emergencies',
      icon: Zap,
      criticalCount: 5,
      points: 500,
      rarity: 'epic',
      color: 'from-red-600 to-pink-600'
    }
  ]
};

// ============================================
// POINTS CALCULATION SYSTEM
// ============================================

export const POINTS_CONFIG = {
  base: 100, // Base points for any donation
  
  urgency: {
    critical: 50,
    high: 25,
    medium: 10,
    low: 0
  },
  
  distance: {
    local: { max: 5, bonus: 25 },      // Within 5km
    nearby: { max: 10, bonus: 0 },     // 5-10km
    far: { min: 10, bonus: 30 }        // Over 10km
  },
  
  bloodRarity: {
    'AB-': 40,
    'B-': 40,
    'O-': 40,
    'AB+': 20,
    'A-': 30,
    'B+': 10,
    'O+': 10,
    'A+': 10
  },
  
  responseTime: {
    instant: { max: 300, bonus: 50 },      // Under 5 min
    quick: { max: 900, bonus: 25 },        // 5-15 min
    normal: { max: 1800, bonus: 10 },      // 15-30 min
    slow: { max: 3600, bonus: 0 }          // Over 30 min
  },
  
  timeOfDay: {
    night: { start: 22, end: 6, bonus: 30 }  // 10 PM - 6 AM
  },
  
  firstDonation: 100,  // Bonus for first donation
  streak: {
    daily: 50,
    weekly: 100,
    monthly: 200
  }
};

// ============================================
// BADGE PROGRESSION SYSTEM
// ============================================

export const BADGE_LEVELS = {
  newHero: {
    title: 'New Hero',
    minDonations: 0,
    maxDonations: 0,
    icon: Droplet,
    color: 'from-gray-400 to-gray-500',
    textColor: 'text-gray-600'
  },
  bronze: {
    title: 'Bronze Hero',
    minDonations: 1,
    maxDonations: 4,
    icon: Award,
    color: 'from-orange-600 to-amber-600',
    textColor: 'text-orange-600'
  },
  silver: {
    title: 'Silver Hero',
    minDonations: 5,
    maxDonations: 9,
    icon: Award,
    color: 'from-gray-400 to-gray-600',
    textColor: 'text-gray-600'
  },
  gold: {
    title: 'Gold Hero',
    minDonations: 10,
    maxDonations: 19,
    icon: Trophy,
    color: 'from-yellow-400 to-yellow-600',
    textColor: 'text-yellow-600'
  },
  platinum: {
    title: 'Platinum Legend',
    minDonations: 20,
    maxDonations: 49,
    icon: Trophy,
    color: 'from-cyan-300 to-blue-500',
    textColor: 'text-cyan-500'
  },
  diamond: {
    title: 'Diamond Savior',
    minDonations: 50,
    maxDonations: Infinity,
    icon: Trophy,
    color: 'from-purple-400 to-pink-600',
    textColor: 'text-purple-500'
  }
};

// ============================================
// LEADERBOARD CONFIG
// ============================================

export const LEADERBOARD_PERIODS = {
  allTime: {
    label: 'All Time',
    duration: null
  },
  monthly: {
    label: 'This Month',
    duration: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
  },
  weekly: {
    label: 'This Week',
    duration: 7 * 24 * 60 * 60 * 1000 // 7 days in ms
  }
};

export const RARITY_COLORS = {
  common: 'text-gray-500',
  uncommon: 'text-green-500',
  rare: 'text-blue-500',
  epic: 'text-purple-500',
  legendary: 'text-yellow-500'
};

export const RARITY_LABELS = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary'
};
