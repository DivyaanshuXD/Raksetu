/**
 * Donation Completion Service
 * Handles marking emergency responses as completed
 */

import {
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db } from '../components/utils/firebase';
import { checkAndUpdateChallenges } from './challengesService';
import { calculateDonationPoints } from '../utils/gamification';

/**
 * Mark a donation as completed
 * Updates donation status, emergency status, user stats, and awards impact points
 * @param {string} donationId - Donation document ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const completeDonation = async (donationId, userId) => {
  try {
    if (!donationId || !userId) {
      throw new Error('Donation ID and User ID are required');
    }

    // Get donation document
    const donationRef = doc(db, 'donationsDone', donationId);
    const donationDoc = await getDoc(donationRef);

    if (!donationDoc.exists()) {
      throw new Error('Donation record not found');
    }

    const donationData = donationDoc.data();

    // Verify ownership
    if (donationData.userId !== userId) {
      throw new Error('Unauthorized: You can only mark your own donations as complete');
    }

    // Check if already completed
    if (donationData.status === 'completed') {
      throw new Error('This donation is already marked as completed');
    }

    // Calculate impact points based on donation details
    const pointsData = calculateDonationPoints({
      urgency: donationData.urgency,
      bloodType: donationData.bloodTypeRequested || donationData.userBloodType,
      distance: donationData.distance,
      responseTime: donationData.responseTime,
      isEmergency: true,
      completedAt: new Date()
    });

    const totalPoints = pointsData.total;

    console.log('✅ Calculated impact points:', {
      donationId,
      points: totalPoints,
      breakdown: pointsData.breakdown
    });

    // Update donation status to completed with points
    await updateDoc(donationRef, {
      status: 'completed',
      completedAt: serverTimestamp(),
      impactPoints: totalPoints,
      pointsBreakdown: pointsData.breakdown,
      updatedAt: serverTimestamp()
    });

    // Update user stats - increment total donations and impact points
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalDonations: increment(1),
      impactPoints: increment(totalPoints),
      lastDonationDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ User stats updated:', {
      userId,
      pointsAwarded: totalPoints
    });

    // Update challenge progress automatically
    try {
      await checkAndUpdateChallenges(userId, {
        isEmergency: true,
        urgency: donationData.urgency || 'normal',
        bloodType: donationData.bloodTypeRequested || donationData.bloodType,
        responseTime: donationData.responseTime || null,
        distance: donationData.distance || null,
        completedAt: new Date()
      });
      console.log('✅ Challenge progress updated for donation:', donationId);
    } catch (challengeError) {
      // Don't fail the donation completion if challenge update fails
      console.error('⚠️ Failed to update challenge progress:', challengeError);
    }

    // Check if emergency should be marked as fulfilled
    const emergencyId = donationData.emergencyId;
    if (emergencyId) {
      const emergencyRef = doc(db, 'emergencyRequests', emergencyId);
      const emergencyDoc = await getDoc(emergencyRef);

      if (emergencyDoc.exists()) {
        const emergencyData = emergencyDoc.data();
        const unitsNeeded = emergencyData.units || 1;
        const respondersCount = emergencyData.respondersCount || 0;

        // Mark as fulfilled if enough responders have completed
        if (respondersCount >= unitsNeeded) {
          await updateDoc(emergencyRef, {
            status: 'fulfilled',
            fulfilledAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } else {
          // Just update the timestamp
          await updateDoc(emergencyRef, {
            updatedAt: serverTimestamp()
          });
        }
      }
    }

    console.log('✅ Donation marked as completed:', {
      donationId,
      userId,
      emergencyId: donationData.emergencyId,
      pointsAwarded: totalPoints
    });

    return {
      success: true,
      message: `🎉 Thank you for saving a life! You earned ${totalPoints} impact points.`,
      pointsAwarded: totalPoints
    };
  } catch (error) {
    console.error('Error completing donation:', error);
    throw error;
  }
};

/**
 * Get completion stats for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Stats object
 */
export const getUserCompletionStats = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return {
        totalDonations: 0,
        lastDonationDate: null
      };
    }

    const userData = userDoc.data();
    return {
      totalDonations: userData.totalDonations || 0,
      lastDonationDate: userData.lastDonationDate || null
    };
  } catch (error) {
    console.error('Error fetching user completion stats:', error);
    return {
      totalDonations: 0,
      lastDonationDate: null
    };
  }
};

/**
 * Undo donation completion (in case of mistake)
 * @param {string} donationId - Donation document ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const undoCompleteDonation = async (donationId, userId) => {
  try {
    // Get donation document
    const donationRef = doc(db, 'donationsDone', donationId);
    const donationDoc = await getDoc(donationRef);

    if (!donationDoc.exists()) {
      throw new Error('Donation record not found');
    }

    const donationData = donationDoc.data();

    // Verify ownership
    if (donationData.userId !== userId) {
      throw new Error('Unauthorized');
    }

    // Check if it's completed
    if (donationData.status !== 'completed') {
      throw new Error('Donation is not marked as completed');
    }

    // Revert donation status to pending
    await updateDoc(donationRef, {
      status: 'pending',
      completedAt: null,
      updatedAt: serverTimestamp()
    });

    // Decrement user stats
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      totalDonations: increment(-1),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Donation completion undone:', { donationId, userId });
  } catch (error) {
    console.error('Error undoing donation completion:', error);
    throw error;
  }
};
