/**
 * Seed Script for Creating Initial Challenges
 * Run this once to populate the challenges collection with sample data
 * 
 * IMPORTANT: Firebase Security Rules Required!
 * Add this to your Firestore rules:
 * 
 * match /challenges/{challengeId} {
 *   allow read: if true; // Public read access
 *   allow write: if request.auth != null; // Authenticated users can write
 *   
 *   match /participants/{userId} {
 *     allow read: if true;
 *     allow write: if request.auth != null && request.auth.uid == userId;
 *   }
 * }
 * 
 * Usage:
 * 1. Ensure you're logged in as admin
 * 2. Navigate to Admin Section in the app
 * 3. Click "🏆 Seed Challenges Now" button
 */

import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../components/utils/firebase';
import { CHALLENGE_TYPES } from '../services/challengesService';
import { auth } from '../components/utils/firebase';

/**
 * Create initial challenges for the platform
 */
export const seedInitialChallenges = async () => {
  try {
    // Check authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('❌ You must be logged in to seed challenges. Please sign in first.');
    }

    console.log('🌱 Starting challenge seeding...');
    console.log(`👤 Authenticated as: ${currentUser.email}`);

    // Calculate dates
    const now = new Date();
    const startDate = Timestamp.fromDate(now);
    const endDate30Days = Timestamp.fromDate(new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000));
    const endDate60Days = Timestamp.fromDate(new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
    const endDate90Days = Timestamp.fromDate(new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000));

    const challenges = [
      // 1. Monthly Streak Challenge
      {
        title: '🔥 Donation Warrior',
        description: 'Donate blood once a month for 6 consecutive months. Become a hero in your community!',
        type: CHALLENGE_TYPES.MONTHLY_STREAK,
        target: 6,
        rewardPoints: 1000,
        status: 'active',
        startDate: startDate,
        endDate: endDate90Days, // 3 months to complete 6-month streak tracking
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🔥',
          difficulty: 'hard',
          category: 'consistency'
        }
      },

      // 2. Community Goal Challenge
      {
        title: '🏙️ City Heroes Challenge',
        description: 'Help your city donate 500 units this month. Every donation counts toward the goal!',
        type: CHALLENGE_TYPES.COMMUNITY_GOAL,
        target: 500,
        rewardPoints: 300,
        status: 'active',
        startDate: startDate,
        endDate: endDate30Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🏙️',
          difficulty: 'medium',
          category: 'community',
          city: 'all' // Track across all cities
        }
      },

      // 3. Referral Challenge
      {
        title: '🤝 Blood Ambassador',
        description: 'Invite 5 friends to join Raksetu and complete their first donation. Spread the gift of life!',
        type: CHALLENGE_TYPES.REFERRAL,
        target: 5,
        rewardPoints: 800,
        status: 'active',
        startDate: startDate,
        endDate: endDate60Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🤝',
          difficulty: 'hard',
          category: 'social'
        }
      },

      // 4. Speed Demon Challenge
      {
        title: '⚡ Lightning Responder',
        description: 'Respond to 10 emergency requests within 15 minutes. Speed saves lives!',
        type: CHALLENGE_TYPES.SPEED_DEMON,
        target: 10,
        rewardPoints: 600,
        status: 'active',
        startDate: startDate,
        endDate: endDate30Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '⚡',
          difficulty: 'hard',
          category: 'emergency',
          timeLimit: 15 // minutes
        }
      },

      // 5. Distance Warrior Challenge
      {
        title: '🎯 Distance Champion',
        description: 'Travel 20+ kilometers for 8 emergency donations. Go the extra mile!',
        type: CHALLENGE_TYPES.DISTANCE_WARRIOR,
        target: 8,
        rewardPoints: 700,
        status: 'active',
        startDate: startDate,
        endDate: endDate60Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🎯',
          difficulty: 'hard',
          category: 'emergency',
          minDistance: 20 // kilometers
        }
      },

      // 6. Emergency Hero Challenge
      {
        title: '🏆 Critical Savior',
        description: 'Respond to 15 critical emergency cases. Be there when it matters most!',
        type: CHALLENGE_TYPES.EMERGENCY_HERO,
        target: 15,
        rewardPoints: 900,
        status: 'active',
        startDate: startDate,
        endDate: endDate60Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🏆',
          difficulty: 'hard',
          category: 'emergency',
          urgencyLevel: 'critical'
        }
      },

      // 7. Beginner Challenge - Easy entry point
      {
        title: '🌟 First Steps',
        description: 'Complete your first 3 donations. Start your journey as a lifesaver!',
        type: CHALLENGE_TYPES.MONTHLY_STREAK,
        target: 3,
        rewardPoints: 200,
        status: 'active',
        startDate: startDate,
        endDate: endDate30Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🌟',
          difficulty: 'easy',
          category: 'beginner'
        }
      },

      // 8. Weekend Warrior
      {
        title: '🎪 Weekend Warrior',
        description: 'Donate 5 times on weekends (Saturday/Sunday). Make weekends count!',
        type: CHALLENGE_TYPES.MONTHLY_STREAK,
        target: 5,
        rewardPoints: 400,
        status: 'active',
        startDate: startDate,
        endDate: endDate60Days,
        totalParticipants: 0,
        totalCompletions: 0,
        createdAt: Timestamp.now(),
        metadata: {
          icon: '🎪',
          difficulty: 'medium',
          category: 'timing',
          daysOfWeek: [0, 6] // Sunday = 0, Saturday = 6
        }
      }
    ];

    // Add all challenges to Firestore
    const challengeRefs = [];
    for (const challenge of challenges) {
      const docRef = await addDoc(collection(db, 'challenges'), challenge);
      challengeRefs.push({ id: docRef.id, title: challenge.title });
      console.log(`✅ Created: ${challenge.title} (${docRef.id})`);
    }

    console.log('\n🎉 Challenge seeding completed!');
    console.log(`Total challenges created: ${challengeRefs.length}`);
    console.log('\nChallenge IDs:');
    challengeRefs.forEach((ref, index) => {
      console.log(`${index + 1}. ${ref.title}: ${ref.id}`);
    });

    return {
      success: true,
      count: challengeRefs.length,
      challenges: challengeRefs
    };
  } catch (error) {
    console.error('❌ Error seeding challenges:', error);
    
    // Provide helpful error messages
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      throw new Error(
        '🔒 Firebase Permission Error!\n\n' +
        'Please add these Firestore security rules:\n\n' +
        'match /challenges/{challengeId} {\n' +
        '  allow read: if true;\n' +
        '  allow write: if request.auth != null;\n' +
        '  \n' +
        '  match /participants/{userId} {\n' +
        '    allow read: if true;\n' +
        '    allow write: if request.auth != null && request.auth.uid == userId;\n' +
        '  }\n' +
        '}\n\n' +
        'Or contact your Firebase admin to update the rules.'
      );
    }
    
    throw error;
  }
};

/**
 * Helper function to check if challenges already exist
 */
export const checkExistingChallenges = async () => {
  try {
    // Check authentication
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.warn('⚠️ Not authenticated - skipping challenge check');
      return 0;
    }

    const { getDocs, query, collection } = await import('firebase/firestore');
    const challengesQuery = query(collection(db, 'challenges'));
    const snapshot = await getDocs(challengesQuery);
    
    console.log(`Found ${snapshot.size} existing challenges`);
    
    if (snapshot.size > 0) {
      console.log('\nExisting challenges:');
      snapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`${index + 1}. ${data.title} - Status: ${data.status} - Target: ${data.target}`);
      });
    }
    
    return snapshot.size;
  } catch (error) {
    console.error('Error checking challenges:', error);
    
    if (error.code === 'permission-denied' || error.message?.includes('permission')) {
      console.error('🔒 Firebase permission error. Please update Firestore rules.');
    }
    
    return 0;
  }
};

/**
 * Delete all challenges (use with caution!)
 */
export const deleteAllChallenges = async () => {
  try {
    const { getDocs, query, collection, deleteDoc, doc } = await import('firebase/firestore');
    const challengesQuery = query(collection(db, 'challenges'));
    const snapshot = await getDocs(challengesQuery);
    
    console.log(`Found ${snapshot.size} challenges to delete...`);
    
    for (const docSnapshot of snapshot.docs) {
      await deleteDoc(doc(db, 'challenges', docSnapshot.id));
      console.log(`Deleted: ${docSnapshot.data().title}`);
    }
    
    console.log('✅ All challenges deleted');
    return snapshot.size;
  } catch (error) {
    console.error('Error deleting challenges:', error);
    throw error;
  }
};

// Export default for easy importing
export default {
  seedInitialChallenges,
  checkExistingChallenges,
  deleteAllChallenges
};
