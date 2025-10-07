/**
 * Emergency Response Service
 * Handles user responses to emergency requests with one-response-per-user lock
 */

import {
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { db, auth } from '../components/utils/firebase';
import { sendResponderConfirmationSMS, sendCreatorNotificationSMS } from './smsNotificationService';
// WhatsApp service removed - requires paid Twilio account

/**
 * Check if user has already responded to an emergency
 * @param {string} emergencyId - Emergency request ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if user has responded
 */
export const hasUserResponded = async (emergencyId, userId) => {
  try {
    if (!emergencyId || !userId) return false;

    const emergencyRef = doc(db, 'emergencyRequests', emergencyId);
    const emergencyDoc = await getDoc(emergencyRef);

    if (!emergencyDoc.exists()) return false;

    const respondedBy = emergencyDoc.data().respondedBy || [];
    return respondedBy.includes(userId);
  } catch (error) {
    console.error('Error checking user response:', error);
    return false;
  }
};

/**
 * Respond to an emergency request
 * Adds user to respondedBy array and creates pending donation record
 * @param {string} emergencyId - Emergency request ID
 * @param {Object} userProfile - User profile data
 * @returns {Promise<string>} Response document ID
 */
export const respondToEmergency = async (emergencyId, userProfile) => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User must be authenticated to respond to emergencies');
  }

  try {
    // Check if already responded
    const alreadyResponded = await hasUserResponded(emergencyId, currentUser.uid);
    if (alreadyResponded) {
      throw new Error('You have already responded to this emergency');
    }

    // Get emergency details
    const emergencyRef = doc(db, 'emergencyRequests', emergencyId);
    const emergencyDoc = await getDoc(emergencyRef);

    if (!emergencyDoc.exists()) {
      throw new Error('Emergency request not found');
    }

    const emergencyData = emergencyDoc.data();

    // Update emergency request - add user to respondedBy array
    await updateDoc(emergencyRef, {
      respondedBy: arrayUnion(currentUser.uid),
      respondersCount: increment(1),
      updatedAt: serverTimestamp()
    });

    // Create a pending donation record in donationsDone collection
    const donationData = {
      userId: currentUser.uid,
      userName: userProfile?.name || currentUser.displayName || 'Anonymous',
      userEmail: currentUser.email,
      userPhone: userProfile?.phoneNumber || null,
      userBloodType: userProfile?.bloodType || null,
      emergencyId: emergencyId,
      hospital: emergencyData.hospital,
      bloodTypeRequested: emergencyData.bloodType,
      urgency: emergencyData.urgency,
      unitsRequested: emergencyData.units,
      type: 'emergency-response',
      status: 'pending', // pending → completed → verified
      respondedAt: serverTimestamp(),
      completedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const donationRef = await addDoc(collection(db, 'donationsDone'), donationData);

    console.log('✅ Response recorded:', {
      emergencyId,
      userId: currentUser.uid,
      donationId: donationRef.id
    });

    // Send SMS notifications (non-blocking)
    try {
      console.log('📤 Sending SMS notifications...');
      console.log('Responder phone:', userProfile?.phoneNumber);
      console.log('Creator phone:', emergencyData.contactPhone);

      // 1. Send SMS confirmation to responder
      if (userProfile?.phoneNumber) {
        const responderResult = await sendResponderConfirmationSMS(userProfile.phoneNumber, emergencyData);
        if (responderResult.success) {
          console.log('✅ SMS sent to responder successfully');
        } else {
          console.error('❌ Failed to send SMS to responder:', responderResult.error);
        }
      } else {
        console.warn('⚠️  No phone number found for responder');
      }

      // 2. Send SMS notification to emergency creator
      if (emergencyData.contactPhone) {
        const creatorResult = await sendCreatorNotificationSMS(
          emergencyData.contactPhone,
          {
            displayName: userProfile?.name || currentUser.displayName,
            phoneNumber: userProfile?.phoneNumber,
            bloodType: userProfile?.bloodType
          },
          emergencyData
        );
        if (creatorResult.success) {
          console.log('✅ SMS sent to emergency creator successfully');
        } else {
          console.error('❌ Failed to send SMS to creator:', creatorResult.error);
        }
      } else {
        console.warn('⚠️  No phone number found for emergency creator');
      }

      // Note: WhatsApp notifications removed (requires paid Twilio account)
      console.log('ℹ️  WhatsApp notifications disabled (requires paid subscription)');
    } catch (notificationError) {
      // Log error but don't fail the response
      console.error('❌ Notification error:', notificationError);
    }

    return donationRef.id;
  } catch (error) {
    console.error('Error responding to emergency:', error);
    throw error;
  }
};

/**
 * Get all emergencies the user has responded to (with full details)
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of emergency details with response info
 */
export const getUserResponses = async (userId) => {
  try {
    if (!userId) return [];

    // Get all pending donations by user
    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('type', '==', 'emergency-response'),
      where('status', 'in', ['pending', 'completed'])
    );

    const donationsSnapshot = await getDocs(donationsQuery);
    
    // Get emergency details for each donation
    const responses = await Promise.all(
      donationsSnapshot.docs.map(async (donationDoc) => {
        const donation = { id: donationDoc.id, ...donationDoc.data() };
        
        // Fetch emergency details
        const emergencyRef = doc(db, 'emergencyRequests', donation.emergencyId);
        const emergencyDoc = await getDoc(emergencyRef);
        
        if (emergencyDoc.exists()) {
          return {
            donationId: donation.id,
            donation: donation,
            emergency: { id: emergencyDoc.id, ...emergencyDoc.data() }
          };
        }
        
        return null;
      })
    );

    // Filter out null values (deleted emergencies)
    return responses.filter(Boolean);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return [];
  }
};

/**
 * Get emergency IDs that user has responded to (quick check)
 * @param {string} userId - User ID
 * @returns {Promise<Array<string>>} Array of emergency IDs
 */
export const getUserRespondedEmergencyIds = async (userId) => {
  try {
    if (!userId) return [];

    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('type', '==', 'emergency-response'),
      where('status', 'in', ['pending', 'completed'])
    );

    const snapshot = await getDocs(donationsQuery);
    return snapshot.docs.map(doc => doc.data().emergencyId);
  } catch (error) {
    console.error('Error fetching responded emergency IDs:', error);
    return [];
  }
};

/**
 * Cancel a response (remove from respondedBy array)
 * @param {string} emergencyId - Emergency ID
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const cancelResponse = async (emergencyId, userId) => {
  try {
    const emergencyRef = doc(db, 'emergencyRequests', emergencyId);
    
    await updateDoc(emergencyRef, {
      respondedBy: arrayRemove(userId),
      respondersCount: increment(-1),
      updatedAt: serverTimestamp()
    });

    // Update donation status to cancelled
    const donationsQuery = query(
      collection(db, 'donationsDone'),
      where('userId', '==', userId),
      where('emergencyId', '==', emergencyId),
      where('type', '==', 'emergency-response'),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(donationsQuery);
    
    for (const donationDoc of snapshot.docs) {
      await updateDoc(doc(db, 'donationsDone', donationDoc.id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ Response cancelled:', { emergencyId, userId });
  } catch (error) {
    console.error('Error cancelling response:', error);
    throw error;
  }
};

/**
 * Get count of responders for an emergency
 * @param {string} emergencyId - Emergency ID
 * @returns {Promise<number>} Number of responders
 */
export const getResponderCount = async (emergencyId) => {
  try {
    const emergencyRef = doc(db, 'emergencyRequests', emergencyId);
    const emergencyDoc = await getDoc(emergencyRef);

    if (!emergencyDoc.exists()) return 0;

    const respondedBy = emergencyDoc.data().respondedBy || [];
    return respondedBy.length;
  } catch (error) {
    console.error('Error getting responder count:', error);
    return 0;
  }
};
