import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  increment,
  arrayUnion
} from 'firebase/firestore';
import { db } from '../components/utils/firebase';

/**
 * Dynamic Gamification Challenges Service
 * Manages adaptive challenges that change based on user behavior
 */

// Challenge Types
export const CHALLENGE_TYPES = {
  MONTHLY_STREAK: 'monthly_streak',
  COMMUNITY_GOAL: 'community_goal',
  REFERRAL: 'referral',
  SPEED_DEMON: 'speed_demon',
  DISTANCE_WARRIOR: 'distance_warrior',
  EMERGENCY_HERO: 'emergency_hero'
};

// Challenge Status
export const CHALLENGE_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  EXPIRED: 'expired',
  UPCOMING: 'upcoming'
};

/**
 * Get active challenges for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of active challenges with progress
 */
export const getUserActiveChallenges = async (userId) => {
  try {
    // Get global active challenges
    const challengesRef = collection(db, 'challenges');
    const activeQuery = query(
      challengesRef,
      where('status', '==', CHALLENGE_STATUS.ACTIVE),
      where('endDate', '>', Timestamp.now()),
      orderBy('endDate', 'asc')
    );

    const challengesSnap = await getDocs(activeQuery);
    const challenges = [];

    for (const challengeDoc of challengesSnap.docs) {
      const challengeData = challengeDoc.data();
      
      // Get user's progress for this challenge
      const progressDoc = await getDoc(
        doc(db, 'challenges', challengeDoc.id, 'participants', userId)
      );

      const progress = progressDoc.exists() ? progressDoc.data() : {
        current: 0,
        started: false,
        completedAt: null
      };

      challenges.push({
        id: challengeDoc.id,
        ...challengeData,
        userProgress: progress,
        isCompleted: progress.current >= challengeData.target,
        progressPercentage: Math.min(100, Math.round((progress.current / challengeData.target) * 100))
      });
    }

    return challenges;
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }
};

/**
 * Subscribe to real-time challenge updates
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function with updated challenges
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToChallenges = (userId, callback) => {
  const challengesRef = collection(db, 'challenges');
  const activeQuery = query(
    challengesRef,
    where('status', '==', CHALLENGE_STATUS.ACTIVE),
    orderBy('endDate', 'asc')
  );

  return onSnapshot(activeQuery, async (snapshot) => {
    const challenges = [];

    for (const challengeDoc of snapshot.docs) {
      const challengeData = challengeDoc.data();
      
      const progressDoc = await getDoc(
        doc(db, 'challenges', challengeDoc.id, 'participants', userId)
      );

      const progress = progressDoc.exists() ? progressDoc.data() : {
        current: 0,
        started: false
      };

      challenges.push({
        id: challengeDoc.id,
        ...challengeData,
        userProgress: progress,
        isCompleted: progress.current >= challengeData.target,
        progressPercentage: Math.min(100, Math.round((progress.current / challengeData.target) * 100))
      });
    }

    callback(challenges);
  });
};

/**
 * Update user progress on a challenge
 * @param {string} challengeId - Challenge ID
 * @param {string} userId - User ID
 * @param {number} increment - Progress increment (default: 1)
 * @returns {Promise<Object>} - Updated progress
 */
export const updateChallengeProgress = async (challengeId, userId, incrementValue = 1) => {
  try {
    const progressRef = doc(db, 'challenges', challengeId, 'participants', userId);
    const progressSnap = await getDoc(progressRef);

    const now = Timestamp.now();

    if (!progressSnap.exists()) {
      // First time participating
      await setDoc(progressRef, {
        current: incrementValue,
        started: true,
        startedAt: now,
        lastUpdated: now,
        userId
      });

      // Increment total participants count
      const challengeRef = doc(db, 'challenges', challengeId);
      await updateDoc(challengeRef, {
        totalParticipants: increment(1)
      });

      return { current: incrementValue, started: true };
    } else {
      // Update existing progress
      const currentProgress = progressSnap.data().current || 0;
      const newProgress = currentProgress + incrementValue;

      // Check if challenge is now completed
      const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
      const challengeData = challengeDoc.data();
      const isNowCompleted = newProgress >= challengeData.target && currentProgress < challengeData.target;

      const updateData = {
        current: newProgress,
        lastUpdated: now
      };

      if (isNowCompleted) {
        updateData.completedAt = now;
        
        // Increment completions count
        await updateDoc(doc(db, 'challenges', challengeId), {
          totalCompletions: increment(1)
        });

        // Award reward points to user
        if (challengeData.rewardPoints) {
          const userRef = doc(db, 'users', userId);
          await updateDoc(userRef, {
            totalPoints: increment(challengeData.rewardPoints),
            challengesCompleted: increment(1)
          });
        }
      }

      await updateDoc(progressRef, updateData);

      return { current: newProgress, started: true, completed: isNowCompleted };
    }
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    throw error;
  }
};

/**
 * Check and auto-update user's challenges based on recent donation
 * @param {string} userId - User ID
 * @param {Object} donation - Donation object
 */
export const checkAndUpdateChallenges = async (userId, donation) => {
  try {
    const challenges = await getUserActiveChallenges(userId);

    for (const challenge of challenges) {
      if (challenge.isCompleted) continue;

      let shouldUpdate = false;

      switch (challenge.type) {
        case CHALLENGE_TYPES.MONTHLY_STREAK:
          // Check if this donation continues the monthly streak
          shouldUpdate = true;
          break;

        case CHALLENGE_TYPES.SPEED_DEMON:
          // Check if donation was fast response
          if (donation.responseTime && donation.responseTime <= 15) {
            shouldUpdate = true;
          }
          break;

        case CHALLENGE_TYPES.DISTANCE_WARRIOR:
          // Check if donation was far distance
          if (donation.distance && donation.distance >= 20) {
            shouldUpdate = true;
          }
          break;

        case CHALLENGE_TYPES.EMERGENCY_HERO:
          // Check if donation was for emergency
          if (donation.isEmergency || donation.urgency === 'critical') {
            shouldUpdate = true;
          }
          break;

        case CHALLENGE_TYPES.COMMUNITY_GOAL:
          // Community challenges auto-update
          shouldUpdate = true;
          break;

        default:
          break;
      }

      if (shouldUpdate) {
        await updateChallengeProgress(challenge.id, userId, 1);
      }
    }
  } catch (error) {
    console.error('Error checking challenges:', error);
  }
};

/**
 * Add referral to user's challenge progress
 * @param {string} referrerId - User who referred
 * @param {string} newUserId - New user who was referred
 */
export const addReferralProgress = async (referrerId, newUserId) => {
  try {
    // Find active referral challenges
    const challengesRef = collection(db, 'challenges');
    const referralQuery = query(
      challengesRef,
      where('type', '==', CHALLENGE_TYPES.REFERRAL),
      where('status', '==', CHALLENGE_STATUS.ACTIVE)
    );

    const challengesSnap = await getDocs(referralQuery);

    for (const challengeDoc of challengesSnap.docs) {
      const progressRef = doc(db, 'challenges', challengeDoc.id, 'participants', referrerId);
      const progressSnap = await getDoc(progressRef);

      if (!progressSnap.exists()) {
        await setDoc(progressRef, {
          current: 1,
          started: true,
          startedAt: Timestamp.now(),
          referredUsers: [newUserId],
          userId: referrerId
        });

        await updateDoc(doc(db, 'challenges', challengeDoc.id), {
          totalParticipants: increment(1)
        });
      } else {
        await updateDoc(progressRef, {
          current: increment(1),
          referredUsers: arrayUnion(newUserId),
          lastUpdated: Timestamp.now()
        });

        // Check if completed
        const challengeData = challengeDoc.data();
        const newCurrent = (progressSnap.data().current || 0) + 1;
        
        if (newCurrent >= challengeData.target) {
          await updateDoc(progressRef, {
            completedAt: Timestamp.now()
          });

          await updateDoc(doc(db, 'challenges', challengeDoc.id), {
            totalCompletions: increment(1)
          });

          // Award points
          if (challengeData.rewardPoints) {
            const userRef = doc(db, 'users', referrerId);
            await updateDoc(userRef, {
              totalPoints: increment(challengeData.rewardPoints),
              challengesCompleted: increment(1)
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('Error adding referral progress:', error);
  }
};

/**
 * Get user's completed challenges
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of completed challenges
 */
export const getUserCompletedChallenges = async (userId) => {
  try {
    const challengesRef = collection(db, 'challenges');
    const challengesSnap = await getDocs(challengesRef);
    
    const completed = [];

    for (const challengeDoc of challengesSnap.docs) {
      const progressDoc = await getDoc(
        doc(db, 'challenges', challengeDoc.id, 'participants', userId)
      );

      if (progressDoc.exists()) {
        const progress = progressDoc.data();
        const challengeData = challengeDoc.data();

        if (progress.current >= challengeData.target) {
          completed.push({
            id: challengeDoc.id,
            ...challengeData,
            completedAt: progress.completedAt,
            progress: progress.current
          });
        }
      }
    }

    return completed.sort((a, b) => b.completedAt?.toMillis() - a.completedAt?.toMillis());
  } catch (error) {
    console.error('Error fetching completed challenges:', error);
    return [];
  }
};

/**
 * Get leaderboard for a specific challenge
 * @param {string} challengeId - Challenge ID
 * @param {number} limitCount - Number of top participants (default: 10)
 * @returns {Promise<Array>} - Array of top participants
 */
export const getChallengeLeaderboard = async (challengeId, limitCount = 10) => {
  try {
    const participantsRef = collection(db, 'challenges', challengeId, 'participants');
    const leaderboardQuery = query(
      participantsRef,
      orderBy('current', 'desc'),
      limit(limitCount)
    );

    const participantsSnap = await getDocs(leaderboardQuery);
    const leaderboard = [];

    for (const participantDoc of participantsSnap.docs) {
      const participantData = participantDoc.data();
      
      // Get user details
      const userDoc = await getDoc(doc(db, 'users', participantDoc.id));
      const userData = userDoc.exists() ? userDoc.data() : {};

      leaderboard.push({
        userId: participantDoc.id,
        userName: userData.name || 'Anonymous',
        userBloodType: userData.bloodType,
        progress: participantData.current,
        rank: leaderboard.length + 1
      });
    }

    return leaderboard;
  } catch (error) {
    console.error('Error fetching challenge leaderboard:', error);
    return [];
  }
};

/**
 * Create a new challenge (Admin only)
 * @param {Object} challengeData - Challenge configuration
 * @returns {Promise<string>} - Challenge ID
 */
export const createChallenge = async (challengeData) => {
  try {
    const challengesRef = collection(db, 'challenges');
    const newChallengeRef = doc(challengesRef);

    const challenge = {
      ...challengeData,
      status: CHALLENGE_STATUS.ACTIVE,
      createdAt: Timestamp.now(),
      totalParticipants: 0,
      totalCompletions: 0
    };

    await setDoc(newChallengeRef, challenge);

    console.log('✅ Challenge created:', newChallengeRef.id);
    return newChallengeRef.id;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
};

/**
 * Generate social share text for challenge
 * @param {Object} challenge - Challenge object
 * @param {Object} userProgress - User's progress
 * @returns {string} - Share text
 */
export const generateShareText = (challenge, userProgress) => {
  const progressPercentage = Math.round((userProgress.current / challenge.target) * 100);
  
  if (userProgress.current >= challenge.target) {
    return `🎉 I just completed the "${challenge.title}" challenge on Raksetu! ${challenge.description} Join me in saving lives! #BloodDonation #Raksetu`;
  } else {
    return `💪 I'm ${progressPercentage}% towards completing the "${challenge.title}" challenge on Raksetu! ${userProgress.current}/${challenge.target} done. Join me! #BloodDonation #Raksetu`;
  }
};

/**
 * Get challenge statistics
 * @param {string} challengeId - Challenge ID
 * @returns {Promise<Object>} - Challenge statistics
 */
export const getChallengeStats = async (challengeId) => {
  try {
    const challengeDoc = await getDoc(doc(db, 'challenges', challengeId));
    
    if (!challengeDoc.exists()) {
      throw new Error('Challenge not found');
    }

    const challengeData = challengeDoc.data();
    const participantsRef = collection(db, 'challenges', challengeId, 'participants');
    const participantsSnap = await getDocs(participantsRef);

    let totalProgress = 0;
    let completedCount = 0;

    participantsSnap.forEach(doc => {
      const data = doc.data();
      totalProgress += data.current || 0;
      if (data.current >= challengeData.target) {
        completedCount++;
      }
    });

    return {
      totalParticipants: participantsSnap.size,
      totalCompletions: completedCount,
      averageProgress: participantsSnap.size > 0 ? totalProgress / participantsSnap.size : 0,
      completionRate: participantsSnap.size > 0 ? (completedCount / participantsSnap.size) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    return null;
  }
};

export default {
  getUserActiveChallenges,
  subscribeToChallenges,
  updateChallengeProgress,
  checkAndUpdateChallenges,
  addReferralProgress,
  getUserCompletedChallenges,
  getChallengeLeaderboard,
  createChallenge,
  generateShareText,
  getChallengeStats,
  CHALLENGE_TYPES,
  CHALLENGE_STATUS
};
