import { collection, query, where, getDocs, addDoc, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../components/utils/firebase';

/**
 * Predictive Blood Shortage Alerts System V1
 * Monitors blood bank inventory and predicts potential shortages
 * Sends proactive alerts to donors when specific blood types are low
 */

// Threshold levels for shortage detection
const THRESHOLD_LEVELS = {
  CRITICAL: 10,  // Less than 10 units
  LOW: 25,       // Less than 25 units
  WARNING: 50    // Less than 50 units
};

// Blood type demand weights (higher = more frequently needed)
const DEMAND_WEIGHTS = {
  'O+': 1.5,  // Most common
  'O-': 1.4,  // Universal donor
  'A+': 1.3,
  'B+': 1.2,
  'A-': 1.2,
  'AB+': 1.1,
  'B-': 1.1,
  'AB-': 1.0
};

/**
 * Calculate current inventory for each blood type across all blood banks
 */
const calculateBloodInventory = async () => {
  try {
    const bloodBanksRef = collection(db, 'bloodBanks');
    const bloodBanksSnap = await getDocs(bloodBanksRef);
    
    const inventory = {
      'O+': { total: 0, banks: 0 },
      'O-': { total: 0, banks: 0 },
      'A+': { total: 0, banks: 0 },
      'A-': { total: 0, banks: 0 },
      'B+': { total: 0, banks: 0 },
      'B-': { total: 0, banks: 0 },
      'AB+': { total: 0, banks: 0 },
      'AB-': { total: 0, banks: 0 }
    };

    bloodBanksSnap.docs.forEach(doc => {
      const bank = doc.data();
      if (bank.inventory) {
        Object.keys(inventory).forEach(bloodType => {
          const units = bank.inventory[bloodType] || 0;
          inventory[bloodType].total += units;
          if (units > 0) {
            inventory[bloodType].banks++;
          }
        });
      }
    });

    return inventory;
  } catch (error) {
    console.error('Error calculating blood inventory:', error);
    return null;
  }
};

/**
 * Calculate demand rate based on recent emergencies
 */
const calculateDemandRate = async (bloodType, daysBack = 7) => {
  try {
    const emergenciesRef = collection(db, 'emergencies');
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - daysBack);
    
    const recentEmergenciesQuery = query(
      emergenciesRef,
      where('bloodType', '==', bloodType),
      where('createdAt', '>=', Timestamp.fromDate(pastDate))
    );
    
    const emergenciesSnap = await getDocs(recentEmergenciesQuery);
    const requestCount = emergenciesSnap.size;
    
    // Calculate average requests per day
    const avgPerDay = requestCount / daysBack;
    
    return avgPerDay;
  } catch (error) {
    console.error('Error calculating demand rate:', error);
    return 0;
  }
};

/**
 * Predict days until shortage based on current inventory and demand
 */
const predictShortage = (currentUnits, demandPerDay, demandWeight) => {
  if (demandPerDay === 0) {
    return { daysUntilShortage: 999, severity: 'stable' };
  }

  // Adjust demand based on blood type weight
  const adjustedDemand = demandPerDay * demandWeight;
  
  // Calculate days until critical level
  const daysUntilCritical = (currentUnits - THRESHOLD_LEVELS.CRITICAL) / adjustedDemand;
  const daysUntilLow = (currentUnits - THRESHOLD_LEVELS.LOW) / adjustedDemand;
  
  let severity, daysUntilShortage;
  
  if (currentUnits <= THRESHOLD_LEVELS.CRITICAL) {
    severity = 'critical';
    daysUntilShortage = 0;
  } else if (currentUnits <= THRESHOLD_LEVELS.LOW) {
    severity = 'low';
    daysUntilShortage = daysUntilCritical;
  } else if (daysUntilLow <= 3) {
    severity = 'warning';
    daysUntilShortage = daysUntilLow;
  } else {
    severity = 'stable';
    daysUntilShortage = daysUntilLow;
  }
  
  return {
    daysUntilShortage: Math.max(0, Math.round(daysUntilShortage)),
    severity
  };
};

/**
 * Main function: Analyze all blood types and detect potential shortages
 */
export const analyzeBloodShortages = async () => {
  try {
    console.log('🔍 Analyzing blood inventory for potential shortages...');
    
    // Get current inventory
    const inventory = await calculateBloodInventory();
    
    if (!inventory) {
      throw new Error('Failed to calculate inventory');
    }

    // Analyze each blood type
    const shortageAnalysis = await Promise.all(
      Object.keys(inventory).map(async (bloodType) => {
        const { total: currentUnits, banks } = inventory[bloodType];
        const demandRate = await calculateDemandRate(bloodType);
        const demandWeight = DEMAND_WEIGHTS[bloodType] || 1.0;
        
        const prediction = predictShortage(currentUnits, demandRate, demandWeight);
        
        return {
          bloodType,
          currentUnits,
          banksWithStock: banks,
          demandRate: Math.round(demandRate * 10) / 10,
          ...prediction,
          needsAlert: prediction.severity !== 'stable'
        };
      })
    );

    // Sort by severity (critical first)
    const severityOrder = { critical: 0, low: 1, warning: 2, stable: 3 };
    shortageAnalysis.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    console.log('✅ Shortage analysis complete:', shortageAnalysis);
    
    return shortageAnalysis;
  } catch (error) {
    console.error('Error analyzing blood shortages:', error);
    return [];
  }
};

/**
 * Create a shortage alert notification in the database
 */
export const createShortageAlert = async (bloodType, severity, daysUntilShortage, currentUnits) => {
  try {
    const alertsRef = collection(db, 'shortageAlerts');
    
    // Check if alert already exists for this blood type (in last 24 hours)
    const recentDate = new Date();
    recentDate.setHours(recentDate.getHours() - 24);
    
    const existingAlertsQuery = query(
      alertsRef,
      where('bloodType', '==', bloodType),
      where('createdAt', '>=', Timestamp.fromDate(recentDate))
    );
    
    const existingAlertsSnap = await getDocs(existingAlertsQuery);
    
    if (!existingAlertsSnap.empty) {
      console.log(`⚠️ Alert for ${bloodType} already sent in last 24 hours`);
      return null;
    }

    // Create new alert
    const alert = {
      bloodType,
      severity,
      daysUntilShortage,
      currentUnits,
      message: getShortageMessage(bloodType, severity, daysUntilShortage),
      createdAt: Timestamp.now(),
      active: true
    };
    
    const docRef = await addDoc(alertsRef, alert);
    console.log(`🚨 Created shortage alert for ${bloodType} (${severity})`);
    
    return { id: docRef.id, ...alert };
  } catch (error) {
    console.error('Error creating shortage alert:', error);
    return null;
  }
};

/**
 * Generate appropriate message based on severity
 */
const getShortageMessage = (bloodType, severity, daysUntilShortage) => {
  switch (severity) {
    case 'critical':
      return `🚨 URGENT: ${bloodType} blood critically low! We need immediate donations to help patients in need.`;
    case 'low':
      return `⚠️ ALERT: ${bloodType} blood running low. Expected shortage in ${daysUntilShortage} day${daysUntilShortage !== 1 ? 's' : ''}. Please donate if you can!`;
    case 'warning':
      return `⚡ NOTICE: ${bloodType} blood levels declining. Donate now to prevent shortage in ${daysUntilShortage} days.`;
    default:
      return `${bloodType} blood levels stable. Thank you for your continued support!`;
  }
};

/**
 * Send notifications to eligible donors for shortage alert
 */
export const notifyDonorsForShortage = async (bloodType, severity) => {
  try {
    // Get compatible donors (including universal donors)
    const compatibleTypes = getCompatibleDonorTypes(bloodType);
    
    const usersRef = collection(db, 'users');
    const donorsQuery = query(
      usersRef,
      where('bloodType', 'in', compatibleTypes)
    );
    
    const donorsSnap = await getDocs(donorsQuery);
    
    if (donorsSnap.empty) {
      console.log(`No donors found for blood type: ${bloodType}`);
      return 0;
    }

    // Create notification for each donor
    const notificationsRef = collection(db, 'notifications');
    let notificationCount = 0;
    
    const message = getShortageMessage(bloodType, severity, 0);
    
    for (const donorDoc of donorsSnap.docs) {
      const donor = donorDoc.data();
      
      // Skip if donor has opted out of shortage alerts
      if (donor.shortageAlertsDisabled) continue;
      
      // Skip if donor donated in last 3 months (likely ineligible)
      const lastDonation = donor.lastDonationDate?.toDate();
      if (lastDonation) {
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        if (lastDonation > threeMonthsAgo) continue;
      }
      
      await addDoc(notificationsRef, {
        userId: donorDoc.id,
        type: 'shortage_alert',
        bloodType,
        severity,
        message,
        createdAt: Timestamp.now(),
        read: false
      });
      
      notificationCount++;
    }
    
    console.log(`📬 Sent ${notificationCount} shortage notifications for ${bloodType}`);
    return notificationCount;
    
  } catch (error) {
    console.error('Error notifying donors:', error);
    return 0;
  }
};

/**
 * Get compatible donor blood types for a recipient blood type
 */
const getCompatibleDonorTypes = (recipientType) => {
  const compatibility = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Universal recipient
  };
  
  return compatibility[recipientType] || [recipientType];
};

/**
 * Monitor blood inventory in real-time and trigger alerts
 * Call this function once when app starts
 */
export const startShortageMonitoring = (callback) => {
  console.log('🔄 Starting real-time shortage monitoring...');
  
  // Monitor blood banks collection
  const bloodBanksRef = collection(db, 'bloodBanks');
  
  const unsubscribe = onSnapshot(bloodBanksRef, async () => {
    console.log('📊 Blood bank inventory updated, analyzing...');
    
    const shortageAnalysis = await analyzeBloodShortages();
    
    // Create alerts for blood types that need attention
    for (const analysis of shortageAnalysis) {
      if (analysis.needsAlert) {
        await createShortageAlert(
          analysis.bloodType,
          analysis.severity,
          analysis.daysUntilShortage,
          analysis.currentUnits
        );
        
        // Notify donors if critical or low
        if (analysis.severity === 'critical' || analysis.severity === 'low') {
          await notifyDonorsForShortage(analysis.bloodType, analysis.severity);
        }
      }
    }
    
    // Call callback with analysis results
    if (callback) {
      callback(shortageAnalysis);
    }
  });
  
  return unsubscribe;
};

/**
 * Get severity badge styling for UI
 */
export const getSeverityBadge = (severity) => {
  switch (severity) {
    case 'critical':
      return {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: '🚨',
        label: 'CRITICAL'
      };
    case 'low':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: '⚠️',
        label: 'LOW'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-300',
        icon: '⚡',
        label: 'WARNING'
      };
    default:
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        icon: '✅',
        label: 'STABLE'
      };
  }
};

export default {
  analyzeBloodShortages,
  createShortageAlert,
  notifyDonorsForShortage,
  startShortageMonitoring,
  getSeverityBadge
};
