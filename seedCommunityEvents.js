// Seed sample community events for testing
// HOW TO RUN IN BROWSER:
// 1. Make sure you're logged in to the app
// 2. Open browser console (F12)
// 3. Copy this ENTIRE file content
// 4. Paste in console and press Enter

(async function seedEvents() {
  console.log('🌱 Starting to seed community events...\n');
  
  // Check if we're in browser with Firebase SDK v9
  if (typeof window === 'undefined') {
    console.error('❌ This script must run in browser console!');
    return;
  }
  
  // Import Firestore functions from the module
  const { db } = await import('./src/utils/firebase.js');
  const { collection, addDoc, Timestamp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
  
  const sampleEvents = [
    {
      title: "Blood Donation Camp - Andheri West",
      type: "bloodDrive",
      description: "Join us for a community blood donation drive. Help save lives in your neighborhood. Refreshments and certificates provided to all donors. Free health checkup included.",
      location: "Andheri Sports Complex, S.V. Road, Andheri West",
      city: "Mumbai",
      state: "Maharashtra",
      startDate: new Date("2025-10-15T09:00:00"),
      endDate: new Date("2025-10-15T17:00:00"),
      capacity: 150,
      participants: 45,
      organizer: "Red Cross Mumbai",
      organizerId: "sample_organizer_1",
      contactEmail: "mumbai@redcross.org.in",
      contactPhone: "+91 9876543210",
      tier: "free",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Blood Donation Awareness Workshop",
      type: "awareness",
      description: "Learn about the importance of blood donation, eligibility criteria, and how you can become a regular donor. Interactive session with healthcare professionals.",
      location: "Ramaiah Medical College, Bengaluru",
      city: "Bengaluru",
      state: "Karnataka",
      startDate: new Date("2025-10-20T14:00:00"),
      endDate: new Date("2025-10-20T16:00:00"),
      capacity: 80,
      participants: 23,
      organizer: "Rotary Club Bengaluru",
      organizerId: "sample_organizer_2",
      contactEmail: "rotary@bangalore.org",
      contactPhone: "+91 9123456789",
      tier: "free",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Emergency Response Training",
      type: "training",
      description: "Certified first aid and emergency response training. Learn CPR, basic life support, and emergency protocols. Certificate provided upon completion.",
      location: "AIIMS Delhi, Ansari Nagar",
      city: "Delhi",
      state: "Delhi",
      startDate: new Date("2025-10-18T10:00:00"),
      endDate: new Date("2025-10-18T15:00:00"),
      capacity: 50,
      participants: 38,
      organizer: "AIIMS Medical Team",
      organizerId: "sample_organizer_3",
      contactEmail: "training@aiims.edu",
      contactPhone: "+91 9988776655",
      tier: "plus",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Corporate Blood Drive - Tech Park",
      type: "bloodDrive",
      description: "Annual blood donation drive for IT companies in Hitech City. Special CSR event with employee engagement activities. Participate and earn CSR credits.",
      location: "Mindspace IT Park, Hitech City",
      city: "Hyderabad",
      state: "Telangana",
      startDate: new Date("2025-10-25T09:00:00"),
      endDate: new Date("2025-10-25T18:00:00"),
      capacity: 300,
      participants: 127,
      organizer: "TechCorp India CSR Team",
      organizerId: "sample_organizer_4",
      contactEmail: "csr@techcorp.in",
      contactPhone: "+91 9876123456",
      tier: "pro",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Community Health Camp & Blood Drive",
      type: "bloodDrive",
      description: "Free health checkups, blood donation, and awareness sessions. Open to all ages. Volunteers needed for coordination.",
      location: "Rajiv Gandhi Stadium, Pune",
      city: "Pune",
      state: "Maharashtra",
      startDate: new Date("2025-11-01T08:00:00"),
      endDate: new Date("2025-11-01T16:00:00"),
      capacity: 200,
      participants: 67,
      organizer: "Lions Club Pune",
      organizerId: "sample_organizer_5",
      contactEmail: "pune@lionsclub.org",
      contactPhone: "+91 9123987654",
      tier: "free",
      status: "active",
      verified: false,
      createdAt: Timestamp.now()
    },
    {
      title: "World Blood Donor Day Celebration",
      type: "awareness",
      description: "Celebrating World Blood Donor Day with cultural programs, talks by doctors, and felicitation of regular donors. Free entry for all.",
      location: "Nehru Stadium, Indore",
      city: "Indore",
      state: "Madhya Pradesh",
      startDate: new Date("2025-10-14T17:00:00"),
      endDate: new Date("2025-10-14T20:00:00"),
      capacity: 500,
      participants: 89,
      organizer: "State Health Department",
      organizerId: "sample_organizer_6",
      contactEmail: "health@mp.gov.in",
      contactPhone: "+91 9876567890",
      tier: "free",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Student Blood Donation Camp",
      type: "bloodDrive",
      description: "Annual blood donation camp for college students. First-time donors welcome. Free snacks and certificates. Parents can accompany.",
      location: "IIT Kharagpur Campus",
      city: "Kharagpur",
      state: "West Bengal",
      startDate: new Date("2025-10-22T10:00:00"),
      endDate: new Date("2025-10-22T16:00:00"),
      capacity: 120,
      participants: 54,
      organizer: "NSS IIT Kharagpur",
      organizerId: "sample_organizer_7",
      contactEmail: "nss@iitkgp.ac.in",
      contactPhone: "+91 9234567890",
      tier: "free",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    },
    {
      title: "Volunteer Training Program",
      type: "training",
      description: "Training session for volunteers interested in coordinating blood donation events. Learn event management, donor care, and emergency protocols.",
      location: "Community Center, Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      startDate: new Date("2025-10-28T11:00:00"),
      endDate: new Date("2025-10-28T14:00:00"),
      capacity: 40,
      participants: 12,
      organizer: "Raksetu Volunteer Team",
      organizerId: "sample_organizer_8",
      contactEmail: "volunteers@raksetu.live",
      contactPhone: "+91 9345678901",
      tier: "free",
      status: "active",
      verified: true,
      createdAt: Timestamp.now()
    }
  ];
  
  try {
    // Use the imported db and addDoc from Firebase v9
    const eventsCollection = collection(db, 'communityEvents');
    
    for (let i = 0; i < sampleEvents.length; i++) {
      const event = sampleEvents[i];
      const docRef = await addDoc(eventsCollection, event);
      console.log(`✅ Added event ${i + 1}/${sampleEvents.length}: "${event.title}" (ID: ${docRef.id})`);
    }
    
    console.log('\n🎉 Successfully seeded all events!');
    console.log('\n📊 Summary:');
    console.log(`   - Total events: ${sampleEvents.length}`);
    console.log(`   - Blood Drives: ${sampleEvents.filter(e => e.type === 'bloodDrive').length}`);
    console.log(`   - Awareness: ${sampleEvents.filter(e => e.type === 'awareness').length}`);
    console.log(`   - Training: ${sampleEvents.filter(e => e.type === 'training').length}`);
    console.log('\n🔗 Refresh the Community tab to see these events!');
    
  } catch (error) {
    console.error('❌ Error seeding events:', error);
    console.log('\n💡 Make sure you are on the app page with Firebase initialized!');
  }
})();
