import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../components/utils/firebase';

/**
 * Smart Matching Algorithm V1
 * Scores and ranks potential donors for emergency blood requests
 * 
 * Scoring Factors:
 * - Blood type compatibility (40 points max)
 * - Distance proximity (30 points max)
 * - Donor availability/activity (20 points max)
 * - Response history (10 points max)
 */

/**
 * Blood type compatibility matrix
 * Returns compatibility score based on donor-recipient blood type match
 */
const BLOOD_TYPE_COMPATIBILITY = {
  'O-': { 'O-': 40, 'O+': 35, 'A-': 35, 'A+': 30, 'B-': 35, 'B+': 30, 'AB-': 35, 'AB+': 30 },
  'O+': { 'O-': 0, 'O+': 40, 'A-': 0, 'A+': 35, 'B-': 0, 'B+': 35, 'AB-': 0, 'AB+': 35 },
  'A-': { 'O-': 0, 'O+': 0, 'A-': 40, 'A+': 35, 'B-': 0, 'B+': 0, 'AB-': 35, 'AB+': 30 },
  'A+': { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 40, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 35 },
  'B-': { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 40, 'B+': 35, 'AB-': 35, 'AB+': 30 },
  'B+': { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 40, 'AB-': 0, 'AB+': 35 },
  'AB-': { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 40, 'AB+': 35 },
  'AB+': { 'O-': 0, 'O+': 0, 'A-': 0, 'A+': 0, 'B-': 0, 'B+': 0, 'AB-': 0, 'AB+': 40 }
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
};

/**
 * Score donor based on distance
 * Closer donors get higher scores
 */
const calculateDistanceScore = (distance) => {
  if (distance <= 5) return 30; // Within 5 km
  if (distance <= 10) return 25; // 5-10 km
  if (distance <= 20) return 20; // 10-20 km
  if (distance <= 50) return 15; // 20-50 km
  if (distance <= 100) return 10; // 50-100 km
  return 5; // > 100 km
};

/**
 * Score donor based on recent activity and donation history
 * More active donors get higher scores
 */
const calculateAvailabilityScore = async (userId) => {
  try {
    // Check recent donations
    const donationsRef = collection(db, 'donationsDone');
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const recentDonationsQuery = query(
      donationsRef,
      where('userId', '==', userId),
      where('date', '>=', Timestamp.fromDate(threeMonthsAgo))
    );
    
    const recentDonationsSnap = await getDocs(recentDonationsQuery);
    
    // If donated in last 3 months, they're likely ineligible (need to wait)
    if (!recentDonationsSnap.empty) {
      return 0; // Not available (recently donated)
    }
    
    // Check total donation history
    const allDonationsQuery = query(donationsRef, where('userId', '==', userId));
    const allDonationsSnap = await getDocs(allDonationsQuery);
    const totalDonations = allDonationsSnap.size;
    
    // Experienced donors get higher scores (more likely to respond)
    if (totalDonations >= 10) return 20; // Veteran donor
    if (totalDonations >= 5) return 18; // Experienced donor
    if (totalDonations >= 3) return 15; // Regular donor
    if (totalDonations >= 1) return 12; // Has donated before
    return 10; // New donor
    
  } catch (error) {
    console.error('Error calculating availability score:', error);
    return 10; // Default score
  }
};

/**
 * Score donor based on response history
 * Donors who respond quickly and frequently get higher scores
 */
const calculateResponseScore = async (userId) => {
  try {
    // In future, track emergency response history
    // For now, return base score
    return 10;
  } catch (error) {
    console.error('Error calculating response score:', error);
    return 10;
  }
};

/**
 * Main function: Get smart-matched donors for an emergency request
 * 
 * @param {Object} emergency - Emergency request object
 * @param {string} emergency.bloodType - Required blood type
 * @param {number} emergency.latitude - Emergency location latitude
 * @param {number} emergency.longitude - Emergency location longitude
 * @param {number} maxDistance - Maximum distance in km (default: 100)
 * @param {number} limit - Maximum number of matches to return (default: 20)
 * @returns {Array} - Array of matched donors with scores
 */
export const getSmartMatchedDonors = async (emergency, maxDistance = 100, limit = 20) => {
  try {
    const { bloodType, latitude, longitude } = emergency;
    
    if (!bloodType || !latitude || !longitude) {
      throw new Error('Emergency must include bloodType, latitude, and longitude');
    }

    // Get all users with blood type info
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('bloodType', '!=', null));
    const usersSnap = await getDocs(usersQuery);
    
    if (usersSnap.empty) {
      console.log('No users with blood type information found');
      return [];
    }

    console.log(`Found ${usersSnap.size} users with blood type information`);

    // Score each potential donor
    const scoredDonors = await Promise.all(
      usersSnap.docs.map(async (doc) => {
        const donor = { id: doc.id, ...doc.data() };
        
        // Skip if no location data
        if (!donor.latitude || !donor.longitude) {
          return null;
        }

        // Calculate blood type compatibility score
        const compatibilityScore = BLOOD_TYPE_COMPATIBILITY[donor.bloodType]?.[bloodType] || 0;
        
        // Skip if incompatible blood type
        if (compatibilityScore === 0) {
          return null;
        }

        // Calculate distance and distance score
        const distance = calculateDistance(
          donor.latitude,
          donor.longitude,
          latitude,
          longitude
        );
        
        // Skip if too far
        if (distance > maxDistance) {
          return null;
        }
        
        const distanceScore = calculateDistanceScore(distance);

        // Calculate availability score
        const availabilityScore = await calculateAvailabilityScore(donor.id);
        
        // Calculate response score
        const responseScore = await calculateResponseScore(donor.id);

        // Calculate total match score
        const totalScore = compatibilityScore + distanceScore + availabilityScore + responseScore;

        // Determine match quality
        let matchQuality;
        let matchQualityColor;
        if (totalScore >= 85) {
          matchQuality = 'Excellent Match';
          matchQualityColor = 'green';
        } else if (totalScore >= 70) {
          matchQuality = 'Good Match';
          matchQualityColor = 'blue';
        } else if (totalScore >= 50) {
          matchQuality = 'Fair Match';
          matchQualityColor = 'yellow';
        } else {
          matchQuality = 'Possible Match';
          matchQualityColor = 'gray';
        }

        return {
          ...donor,
          distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          scores: {
            compatibility: compatibilityScore,
            distance: distanceScore,
            availability: availabilityScore,
            response: responseScore,
            total: totalScore
          },
          matchQuality,
          matchQualityColor,
          estimatedResponseTime: getEstimatedResponseTime(distance, availabilityScore)
        };
      })
    );

    // Filter out null values and sort by total score (descending)
    const validMatches = scoredDonors
      .filter(donor => donor !== null)
      .sort((a, b) => b.scores.total - a.scores.total)
      .slice(0, limit);

    console.log(`Smart matching found ${validMatches.length} potential donors`);
    
    return validMatches;

  } catch (error) {
    console.error('Error in smart matching algorithm:', error);
    throw error;
  }
};

/**
 * Estimate response time based on distance and donor activity
 */
const getEstimatedResponseTime = (distance, availabilityScore) => {
  // Base time for notification check (5 min) + travel time
  const travelTimePerKm = 2; // 2 minutes per km (assuming good traffic)
  const baseTime = 5;
  const travelTime = distance * travelTimePerKm;
  
  // Active donors respond faster
  const activityMultiplier = availabilityScore >= 18 ? 0.8 : 1.0;
  
  const totalTime = Math.round((baseTime + travelTime) * activityMultiplier);
  
  if (totalTime <= 15) return '10-15 minutes';
  if (totalTime <= 30) return '15-30 minutes';
  if (totalTime <= 60) return '30-60 minutes';
  return '1-2 hours';
};

/**
 * Get match explanation for UI display
 */
export const getMatchExplanation = (donor) => {
  const explanations = [];
  
  if (donor.scores.compatibility >= 40) {
    explanations.push('Perfect blood type match');
  } else if (donor.scores.compatibility >= 35) {
    explanations.push('Excellent blood compatibility');
  } else if (donor.scores.compatibility >= 30) {
    explanations.push('Good blood compatibility');
  }
  
  if (donor.scores.distance >= 25) {
    explanations.push('Very close proximity');
  } else if (donor.scores.distance >= 15) {
    explanations.push('Nearby location');
  }
  
  if (donor.scores.availability >= 18) {
    explanations.push('Experienced donor');
  } else if (donor.scores.availability === 0) {
    explanations.push('Recently donated (may be ineligible)');
  }
  
  return explanations.join(' • ');
};

/**
 * Simple fallback: Get all users with compatible blood type within radius
 * Used if smart matching fails
 */
export const getBasicMatchedDonors = async (bloodType, latitude, longitude, maxDistance = 50) => {
  try {
    const usersRef = collection(db, 'users');
    const usersQuery = query(usersRef, where('bloodType', '==', bloodType));
    const usersSnap = await getDocs(usersQuery);
    
    const donors = usersSnap.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(donor => {
        if (!donor.latitude || !donor.longitude) return false;
        const distance = calculateDistance(donor.latitude, donor.longitude, latitude, longitude);
        return distance <= maxDistance;
      })
      .map(donor => ({
        ...donor,
        distance: Math.round(
          calculateDistance(donor.latitude, donor.longitude, latitude, longitude) * 10
        ) / 10
      }))
      .sort((a, b) => a.distance - b.distance);
    
    return donors;
  } catch (error) {
    console.error('Error in basic matching:', error);
    return [];
  }
};

export default {
  getSmartMatchedDonors,
  getMatchExplanation,
  getBasicMatchedDonors
};
