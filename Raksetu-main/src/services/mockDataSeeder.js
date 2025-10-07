import { collection, addDoc, getDocs, Timestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../components/utils/firebase';

/**
 * Mock Blood Bank Data Seeder
 * Populates Firebase with realistic blood bank data for testing and demo
 */

// Major Indian hospitals and blood banks data
const BLOOD_BANKS_DATA = [
  // Delhi NCR
  {
    name: 'AIIMS Blood Bank',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'All India Institute of Medical Sciences, Ansari Nagar, New Delhi',
    pincode: '110029',
    latitude: 28.5672,
    longitude: 77.2100,
    phone: '+91-11-26588500',
    email: 'bloodbank@aiims.edu',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage', 'Platelet Collection']
  },
  {
    name: 'Safdarjung Hospital Blood Bank',
    city: 'New Delhi',
    state: 'Delhi',
    address: 'Vardhman Mahavir Medical College, Safdarjung Hospital, New Delhi',
    pincode: '110029',
    latitude: 28.5679,
    longitude: 77.2067,
    phone: '+91-11-26165060',
    email: 'bloodbank@safdarjung.gov.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage', 'Emergency Services']
  },
  {
    name: 'Max Super Speciality Hospital',
    city: 'Saket, New Delhi',
    state: 'Delhi',
    address: '1, Press Enclave Road, Saket, New Delhi',
    pincode: '110017',
    latitude: 28.5244,
    longitude: 77.2066,
    phone: '+91-11-26515050',
    email: 'bloodbank@maxhealthcare.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage']
  },
  {
    name: 'Fortis Hospital Blood Bank',
    city: 'Vasant Kunj, New Delhi',
    state: 'Delhi',
    address: 'Sector B, Pocket 1, Aruna Asaf Ali Marg, Vasant Kunj',
    pincode: '110070',
    latitude: 28.5218,
    longitude: 77.1586,
    phone: '+91-11-42776222',
    email: 'bloodbank@fortishealthcare.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage', 'Platelet Collection']
  },
  {
    name: 'Indian Red Cross Society - Delhi',
    city: 'Red Cross Road, New Delhi',
    state: 'Delhi',
    address: '1, Red Cross Road, Near Supreme Court, New Delhi',
    pincode: '110001',
    latitude: 28.6231,
    longitude: 77.2397,
    phone: '+91-11-23711551',
    email: 'delhi@indianredcross.org',
    category: 'NGO Blood Bank',
    availability: '24x7',
    facilities: ['Blood Storage', 'Mobile Blood Donation Camps']
  },

  // Mumbai
  {
    name: 'Lilavati Hospital Blood Bank',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'A-791, Bandra Reclamation, Bandra West, Mumbai',
    pincode: '400050',
    latitude: 19.0596,
    longitude: 72.8295,
    phone: '+91-22-26567891',
    email: 'bloodbank@lilavatihospital.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage']
  },
  {
    name: 'Tata Memorial Hospital',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: 'Dr. Ernest Borges Marg, Parel, Mumbai',
    pincode: '400012',
    latitude: 19.0067,
    longitude: 72.8405,
    phone: '+91-22-24177000',
    email: 'bloodbank@tmc.gov.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage', 'Cancer Patient Support']
  },
  {
    name: 'KEM Hospital Blood Bank',
    city: 'Mumbai',
    state: 'Maharashtra',
    address: '489, Rasta Peth, Acharya Donde Marg, Pune',
    pincode: '411011',
    latitude: 18.5314,
    longitude: 73.8446,
    phone: '+91-20-26125051',
    email: 'bloodbank@kemhospitalpune.org',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },

  // Bangalore
  {
    name: 'NIMHANS Blood Bank',
    city: 'Bangalore',
    state: 'Karnataka',
    address: 'National Institute of Mental Health and Neuro Sciences, Hosur Road',
    pincode: '560029',
    latitude: 12.9433,
    longitude: 77.5963,
    phone: '+91-80-26995000',
    email: 'bloodbank@nimhans.ac.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Blood Storage', 'Component Separation']
  },
  {
    name: 'Apollo Hospital Blood Bank',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '154/11, Bannerghatta Road, Opposite IIM, Bangalore',
    pincode: '560076',
    latitude: 12.9065,
    longitude: 77.5963,
    phone: '+91-80-26304050',
    email: 'bloodbank@apollohospitals.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage']
  },
  {
    name: 'Fortis Hospital Bannerghatta Road',
    city: 'Bangalore',
    state: 'Karnataka',
    address: '154/9, Bannerghatta Road, Opposite IIM, Bangalore',
    pincode: '560076',
    latitude: 12.9039,
    longitude: 77.6309,
    phone: '+91-80-66214444',
    email: 'bloodbank.bangalore@fortishealthcare.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },

  // Chennai
  {
    name: 'Apollo Hospital Blood Bank',
    city: 'Chennai',
    state: 'Tamil Nadu',
    address: '21, Greams Lane, Off Greams Road, Chennai',
    pincode: '600006',
    latitude: 13.0569,
    longitude: 80.2503,
    phone: '+91-44-28296000',
    email: 'bloodbank.chennai@apollohospitals.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage']
  },
  {
    name: 'CMC Vellore Blood Bank',
    city: 'Vellore',
    state: 'Tamil Nadu',
    address: 'Christian Medical College, Ida Scudder Road, Vellore',
    pincode: '632004',
    latitude: 12.9260,
    longitude: 79.1333,
    phone: '+91-416-2282020',
    email: 'bloodbank@cmcvellore.ac.in',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage', 'Research']
  },

  // Hyderabad
  {
    name: 'Nizam Institute of Medical Sciences',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Punjagutta, Hyderabad',
    pincode: '500082',
    latitude: 17.4239,
    longitude: 78.4366,
    phone: '+91-40-23489000',
    email: 'bloodbank@nims.edu.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },
  {
    name: 'Apollo Hospital Blood Bank',
    city: 'Hyderabad',
    state: 'Telangana',
    address: 'Jubilee Hills, Road No. 72, Hyderabad',
    pincode: '500033',
    latitude: 17.4339,
    longitude: 78.4177,
    phone: '+91-40-23607777',
    email: 'bloodbank.hyderabad@apollohospitals.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage']
  },

  // Kolkata
  {
    name: 'SSKM Hospital Blood Bank',
    city: 'Kolkata',
    state: 'West Bengal',
    address: '244, AJC Bose Road, Kolkata',
    pincode: '700020',
    latitude: 22.5449,
    longitude: 88.3549,
    phone: '+91-33-22231661',
    email: 'bloodbank@sskm.gov.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },
  {
    name: 'Apollo Gleneagles Hospital',
    city: 'Kolkata',
    state: 'West Bengal',
    address: '58, Canal Circular Road, Kadapara, Kolkata',
    pincode: '700054',
    latitude: 22.5354,
    longitude: 88.3910,
    phone: '+91-33-23203040',
    email: 'bloodbank.kolkata@apollohospitals.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },

  // Pune
  {
    name: 'Ruby Hall Clinic Blood Bank',
    city: 'Pune',
    state: 'Maharashtra',
    address: '40, Sassoon Road, Pune',
    pincode: '411001',
    latitude: 18.5204,
    longitude: 73.8567,
    phone: '+91-20-66455000',
    email: 'bloodbank@rubyhall.com',
    category: 'Private Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },

  // Chandigarh
  {
    name: 'PGIMER Blood Bank',
    city: 'Chandigarh',
    state: 'Chandigarh',
    address: 'Post Graduate Institute of Medical Education & Research, Sector 12',
    pincode: '160012',
    latitude: 30.7325,
    longitude: 76.7744,
    phone: '+91-172-2747585',
    email: 'bloodbank@pgimer.edu.in',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Apheresis', 'Blood Storage', 'Research']
  },

  // Lucknow
  {
    name: 'KGMU Blood Bank',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    address: 'King George Medical University, Shahmina Road, Chowk',
    pincode: '226003',
    latitude: 26.8381,
    longitude: 80.9346,
    phone: '+91-522-2257450',
    email: 'bloodbank@kgmu.org',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  },

  // Jaipur
  {
    name: 'SMS Hospital Blood Bank',
    city: 'Jaipur',
    state: 'Rajasthan',
    address: 'JLN Marg, Jaipur',
    pincode: '302004',
    latitude: 26.9157,
    longitude: 75.8233,
    phone: '+91-141-2560291',
    email: 'bloodbank@smsmedicalcollege.com',
    category: 'Government Hospital',
    availability: '24x7',
    facilities: ['Component Separation', 'Blood Storage']
  }
];

/**
 * Generate realistic blood inventory based on time and demand patterns
 */
const generateRealisticInventory = () => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay();
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  // Demand patterns:
  // - Lower in evenings (post-surgery usage)
  // - Lower on weekends (fewer donations)
  // - Random spikes (emergency situations)
  
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isEvening = hour >= 18;
  const baseMultiplier = isWeekend ? 0.8 : 1.0;
  const eveningMultiplier = isEvening ? 0.7 : 1.0;
  const totalMultiplier = baseMultiplier * eveningMultiplier;
  
  return {
    'O+': Math.floor(random(40, 80) * totalMultiplier),
    'O-': Math.floor(random(10, 30) * totalMultiplier),
    'A+': Math.floor(random(30, 60) * totalMultiplier),
    'A-': Math.floor(random(5, 20) * totalMultiplier),
    'B+': Math.floor(random(25, 55) * totalMultiplier),
    'B-': Math.floor(random(3, 15) * totalMultiplier),
    'AB+': Math.floor(random(15, 35) * totalMultiplier),
    'AB-': Math.floor(random(2, 10) * totalMultiplier)
  };
};

/**
 * Generate blood components inventory
 */
const generateComponentsInventory = () => {
  const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
  return {
    wholeBlood: random(80, 200),
    platelets: random(30, 80),
    plasma: random(50, 120),
    cryoprecipitate: random(15, 40),
    packedRBC: random(60, 150)
  };
};

/**
 * Seed blood banks to Firebase
 */
export const seedBloodBanks = async () => {
  try {
    console.log('🌱 Starting blood bank seeding...');
    
    const bloodBanksRef = collection(db, 'bloodBanks');
    
    // Check if already seeded
    const existingBanks = await getDocs(bloodBanksRef);
    if (existingBanks.size > 0) {
      console.log('⚠️ Blood banks already exist in database.');
      console.log(`Found ${existingBanks.size} existing blood banks.`);
      const confirm = window.confirm(
        `Found ${existingBanks.size} blood banks already in database. Add ${BLOOD_BANKS_DATA.length} more?`
      );
      if (!confirm) {
        console.log('❌ Seeding cancelled by user');
        return { success: false, message: 'Cancelled by user' };
      }
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const bank of BLOOD_BANKS_DATA) {
      try {
        await addDoc(bloodBanksRef, {
          ...bank,
          inventory: generateRealisticInventory(),
          components: generateComponentsInventory(),
          verified: true,
          registrationDate: Timestamp.now(),
          lastUpdated: Timestamp.now(),
          totalDonorsRegistered: Math.floor(Math.random() * 5000) + 500,
          totalUnitsCollected: Math.floor(Math.random() * 10000) + 1000,
          activeStatus: true,
          licenseNumber: `BB${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
          responseTime: Math.floor(Math.random() * 20) + 5 // 5-25 minutes
        });
        successCount++;
        console.log(`✅ Added: ${bank.name}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to add ${bank.name}:`, error);
      }
    }
    
    console.log('\n🎉 Seeding Complete!');
    console.log(`✅ Successfully added: ${successCount} blood banks`);
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} blood banks`);
    }
    
    return {
      success: true,
      successCount,
      errorCount,
      message: `Successfully seeded ${successCount} blood banks!`
    };
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return {
      success: false,
      error: error.message,
      message: 'Failed to seed blood banks'
    };
  }
};

/**
 * Update inventory for existing blood banks (simulate real-time changes)
 */
export const updateBloodBankInventory = async (bloodBankId) => {
  try {
    const bloodBankRef = doc(db, 'bloodBanks', bloodBankId);
    await updateDoc(bloodBankRef, {
      inventory: generateRealisticInventory(),
      lastUpdated: Timestamp.now()
    });
    console.log(`✅ Updated inventory for blood bank: ${bloodBankId}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to update inventory:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Start automatic inventory updates (simulates real-time changes)
 */
export const startInventorySimulation = () => {
  console.log('🔄 Starting inventory simulation...');
  console.log('Blood bank inventories will update every 15 minutes');
  
  const interval = setInterval(async () => {
    try {
      const bloodBanksRef = collection(db, 'bloodBanks');
      const snapshot = await getDocs(bloodBanksRef);
      
      if (snapshot.empty) {
        console.log('⚠️ No blood banks found. Run seedBloodBanks() first.');
        return;
      }
      
      // Update 3-5 random blood banks
      const banksToUpdate = Math.floor(Math.random() * 3) + 3;
      const shuffled = snapshot.docs.sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, banksToUpdate);
      
      for (const bankDoc of selected) {
        await updateBloodBankInventory(bankDoc.id);
      }
      
      console.log(`🔄 Updated ${banksToUpdate} blood banks at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error('❌ Simulation error:', error);
    }
  }, 15 * 60 * 1000); // Every 15 minutes
  
  return interval;
};

/**
 * Clear all blood banks (use with caution!)
 */
export const clearAllBloodBanks = async () => {
  const confirm = window.confirm(
    '⚠️ WARNING: This will delete ALL blood banks from the database. Are you sure?'
  );
  
  if (!confirm) {
    console.log('❌ Deletion cancelled');
    return { success: false, message: 'Cancelled by user' };
  }
  
  try {
    const bloodBanksRef = collection(db, 'bloodBanks');
    const snapshot = await getDocs(bloodBanksRef);
    
    let deleteCount = 0;
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      deleteCount++;
    }
    
    console.log(`🗑️ Deleted ${deleteCount} blood banks`);
    return { success: true, deleteCount, message: `Deleted ${deleteCount} blood banks` };
  } catch (error) {
    console.error('❌ Deletion failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get seeding statistics
 */
export const getSeedingStats = () => {
  return {
    totalCities: [...new Set(BLOOD_BANKS_DATA.map(b => b.city))].length,
    totalStates: [...new Set(BLOOD_BANKS_DATA.map(b => b.state))].length,
    totalBanks: BLOOD_BANKS_DATA.length,
    categories: {
      government: BLOOD_BANKS_DATA.filter(b => b.category.includes('Government')).length,
      private: BLOOD_BANKS_DATA.filter(b => b.category.includes('Private')).length,
      ngo: BLOOD_BANKS_DATA.filter(b => b.category.includes('NGO')).length
    }
  };
};

// Export for use in admin dashboard
export default {
  seedBloodBanks,
  updateBloodBankInventory,
  startInventorySimulation,
  clearAllBloodBanks,
  getSeedingStats
};
