import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Handshake, 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp,
  Building2,
  Heart,
  Target,
  Award,
  Zap,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Crown,
  Shield,
  BarChart3,
  Mail,
  Phone,
  Globe,
  Share2,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import SuccessModal from './SuccessModal';
import AuthModal from './AuthModal';
import HostTierSelectionModal from './HostTierSelectionModal';
import PaymentModal from './PaymentModal';
import CreateEventModal from './CreateEventModal';
import RedeemRewardsModal from './RedeemRewardsModal';
import RewardSuccessModal from './RewardSuccessModal';
import ShippingFormModal from './ShippingFormModal';
import PartnerApplicationModal from './PartnerApplicationModal';
import PartnershipSuccessModal from './PartnershipSuccessModal';
import ConfirmEventModal from './ConfirmEventModal';

export default function CommunitySection({ userProfile, setShowAuthModal, isLoggedIn }) {
  const [activeTab, setActiveTab] = useState('participate'); // participate, host, partner
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHostModal, setShowHostModal] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedPartnerTier, setSelectedPartnerTier] = useState(null);
  const [showPartnershipSuccess, setShowPartnershipSuccess] = useState(false);
  const [partnershipDetails, setPartnershipDetails] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);
  const [registrationDetails, setRegistrationDetails] = useState(null);
  const [selectedHostingTier, setSelectedHostingTier] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [showTierSelectionModal, setShowTierSelectionModal] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [showAuthModal, setShowAuthModalLocal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showRewardSuccessModal, setShowRewardSuccessModal] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const [showShippingForm, setShowShippingForm] = useState(false);
  const [pendingMerchOrder, setPendingMerchOrder] = useState(null);
  const [showConfirmEventModal, setShowConfirmEventModal] = useState(false);
  const [eventToConfirm, setEventToConfirm] = useState(null);
  const [hasPriorityAccess, setHasPriorityAccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Fetch events and user points
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch events
      const eventsQuery = query(
        collection(db, 'communityEvents'),
        where('status', '==', 'active'),
        orderBy('startDate', 'asc')
      );
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEvents(eventsData);

      // Fetch user points if logged in
      if (isLoggedIn && auth.currentUser) {
        const userDoc = await getDocs(query(
          collection(db, 'users'),
          where('__name__', '==', auth.currentUser.uid)
        ));
        if (!userDoc.empty) {
          setUserPoints(userDoc.docs[0].data().communityPoints || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching community data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isLoggedIn]);

  // Subscription tiers for event hosting - India-friendly pricing
  const hostingPlans = [
    {
      name: 'Community Free',
      price: 'Free',
      icon: <Heart className="text-red-500" size={32} />,
      features: [
        'Unlimited events',
        'Basic event page',
        'Up to 100 participants',
        'Email notifications',
        'Community badge',
        '30-day event listing',
        'QR code check-in'
      ],
      cta: 'Start Free',
      color: 'red',
      popular: true,
      recommended: 'Best for most organizers'
    },
    {
      name: 'Community Plus',
      price: '₹999',
      period: '/event',
      icon: <Crown className="text-blue-500" size={32} />,
      popular: false,
      features: [
        'Everything in Free',
        'Premium event page with branding',
        'Up to 500 participants',
        'SMS + Email notifications',
        'Social media promotion',
        'Basic analytics dashboard',
        'Priority placement in listings',
        'Event certificates'
      ],
      cta: 'Upgrade',
      color: 'blue'
    },
    {
      name: 'Pro',
      price: '₹2,999',
      period: '/event',
      icon: <Building2 className="text-purple-500" size={32} />,
      features: [
        'Everything in Plus',
        'Unlimited participants',
        'Dedicated event coordinator',
        'Advanced analytics & reporting',
        'Volunteer management tools',
        'Venue booking assistance',
        'Media coverage support',
        'Custom branding'
      ],
      cta: 'Go Pro',
      color: 'purple'
    }
  ];

  // Partnership tiers - Affordable for Indian organizations
  const partnershipTiers = [
    {
      name: 'Healthcare Partner',
      for: 'Hospitals & Clinics',
      fee: 'Free',
      icon: <Building2 className="text-blue-500" size={28} />,
      benefits: [
        'Priority blood request listings',
        'Verified partner badge',
        'Direct donor matching',
        'Email support',
        'Monthly blood drive hosting',
        'Basic analytics dashboard',
        'Co-branding opportunities'
      ],
      popular: true
    },
    {
      name: 'NGO Alliance',
      for: 'Non-Profit Organizations',
      fee: 'Free',
      icon: <Heart className="text-red-500" size={28} />,
      benefits: [
        'Campaign co-creation',
        'Joint fundraising events',
        'Volunteer database access',
        'Social media promotion',
        'Event hosting support',
        'Community mobilization tools',
        'Impact reporting'
      ],
      popular: true
    },
    {
      name: 'Corporate Partner',
      for: 'Companies & CSR Programs',
      fee: '₹4,999/year',
      icon: <Trophy className="text-yellow-500" size={28} />,
      benefits: [
        'Employee engagement programs',
        'Unlimited blood donation drives',
        'CSR documentation',
        'Brand visibility in app',
        'Annual impact reports',
        'Executive donor recognition',
        'Team building support',
        'Priority support',
        'Analytics dashboard'
      ]
    }
  ];

  // Rewards & Referral System
  const rewardsInfo = {
    pointsSystem: [
      { action: 'Attend first event', points: 100, icon: <Star /> },
      { action: 'Attend 5 events', points: 500, icon: <Trophy /> },
      { action: 'Volunteer at event', points: 200, icon: <Users /> },
      { action: 'Refer a friend', points: 150, icon: <Share2 /> },
      { action: 'Host successful event', points: 1000, icon: <Calendar /> }
    ],
    redeemOptions: [
      { item: '10% off next event', cost: 200, icon: <Gift /> },
      { item: 'Priority registration', cost: 500, icon: <Zap /> },
      { item: 'Exclusive merchandise', cost: 1000, icon: <Award /> },
      { item: 'Featured profile badge', cost: 1500, icon: <Shield /> },
      { item: 'Free Pro event hosting', cost: 3000, icon: <Crown /> }
    ]
  };

  // Handle event registration
  const handleEventRegistration = async (event) => {
    if (!isLoggedIn) {
      setShowAuthModalLocal(true);
      return;
    }

    try {
      // Check if user has priority access
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      const priorityAccess = !!(userData?.priorityAccess?.active && 
        userData?.priorityAccess?.expiresAt?.toDate() > new Date());

      // Check if event is full (unless user has priority access)
      const currentParticipants = event.participants || 0;
      const maxCapacity = event.capacity || 100;
      
      if (!priorityAccess && currentParticipants >= maxCapacity) {
        alert('Sorry, this event is full! Redeem "Priority Registration" reward to skip waitlists.');
        return;
      }

      // Show confirmation modal first
      setEventToConfirm(event);
      setHasPriorityAccess(priorityAccess);
      setShowConfirmEventModal(true);

    } catch (error) {
      console.error('Error checking event registration:', error);
      alert('An error occurred. Please try again.');
    }
  };

  // Function to actually register after confirmation
  const confirmEventRegistration = async () => {
    if (!eventToConfirm) return;

    setIsRegistering(true);
    try {
      // Add registration to Firestore
      await addDoc(collection(db, 'eventRegistrations'), {
        eventId: eventToConfirm.id,
        userId: auth.currentUser.uid,
        userName: userProfile?.name || 'Anonymous',
        userEmail: userProfile?.email || '',
        registeredAt: Timestamp.now(),
        status: hasPriorityAccess ? 'priority' : 'registered',
        checkInStatus: 'pending',
        priorityRegistration: hasPriorityAccess
      });

      // Update event participants count
      const eventRef = doc(db, 'communityEvents', eventToConfirm.id);
      await updateDoc(eventRef, {
        participants: increment(1)
      });

      // Award points
      let pointsAwarded = 50; // Base points
      if (userPoints === 0) {
        pointsAwarded = 100; // Bonus for first event
      }
      if (hasPriorityAccess) {
        pointsAwarded += 20; // Bonus for priority users
      }
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        communityPoints: increment(pointsAwarded)
      });
      setUserPoints(prev => prev + pointsAwarded);

      // Format event details for display
      const eventDate = new Date(eventToConfirm.startDate?.toDate()).toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      const eventTime = new Date(eventToConfirm.startDate?.toDate()).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });

      // Note: Email sending requires Firebase Blaze plan
      // TODO: Implement email service when plan is upgraded
      console.log('Event registration email would be sent to:', userProfile?.email);

      // Show success modal with structured details
      setRegistrationDetails({
        eventTitle: eventToConfirm.title,
        location: eventToConfirm.location,
        city: eventToConfirm.city,
        date: eventDate,
        time: eventTime,
        organizer: eventToConfirm.organizer,
        pointsAwarded: pointsAwarded,
        email: userProfile?.email
      });
      
      // Close confirmation modal and show success modal
      setShowConfirmEventModal(false);
      setShowRegistrationSuccess(true);
      
      // Refresh events to update participant count
      fetchData();
      
    } catch (error) {
      console.error('Error registering for event:', error);
      
      let errorMessage = '❌ Registration failed. ';
      
      if (error.code === 'permission-denied') {
        errorMessage = '❌ Permission denied. Please log in again.';
      } else if (error.code === 'unavailable') {
        errorMessage = '❌ Network error. Please check your connection.';
      } else {
        errorMessage += error.message || 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsRegistering(false);
      setEventToConfirm(null);
      setHasPriorityAccess(false);
    }
  };

  // Generate HTML email for event registration
  const generateEventEmailHTML = ({ userName, eventTitle, eventType, eventLocation, eventCity, eventDate, eventTime, organizerName, contactEmail, contactPhone, pointsAwarded }) => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; }
          .details-table { width: 100%; background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; }
          .details-table td { padding: 12px 15px; border-bottom: 1px solid #e5e7eb; }
          .details-table td:first-child { font-weight: bold; color: #6b7280; width: 40%; }
          .badge { background: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .checklist { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .checklist li { margin: 10px 0; }
          .button { background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #6b7280; padding: 20px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Registration Confirmed!</h1>
            <p>You're all set for the event</p>
          </div>
          
          <div class="content">
            <p>Dear ${userName},</p>
            <p>Great news! Your registration for <strong>${eventTitle}</strong> has been confirmed.</p>
            
            <div class="badge">✨ You earned ${pointsAwarded} community points!</div>
            
            <table class="details-table">
              <tr><td>📅 Event</td><td>${eventTitle}</td></tr>
              <tr><td>🏷️ Type</td><td>${eventType === 'bloodDrive' ? '🩸 Blood Donation Drive' : eventType === 'awareness' ? '📢 Awareness Program' : '🎓 Training Session'}</td></tr>
              <tr><td>📍 Location</td><td>${eventLocation}, ${eventCity}</td></tr>
              <tr><td>🗓️ Date</td><td>${eventDate}</td></tr>
              <tr><td>⏰ Time</td><td>${eventTime}</td></tr>
              <tr><td>👤 Organizer</td><td>${organizerName}</td></tr>
              <tr><td>📧 Contact</td><td>${contactEmail}</td></tr>
              <tr><td>� Phone</td><td>${contactPhone}</td></tr>
            </table>
            
            <div class="checklist">
              <h3>📋 What to Bring:</h3>
              <ul>
                <li>✅ Valid photo ID (Aadhaar, PAN, Driver's License)</li>
                <li>✅ Comfortable clothing</li>
                <li>✅ Water bottle (stay hydrated)</li>
                <li>✅ Any relevant medical documents</li>
              </ul>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <strong>⚠️ Important Reminders:</strong>
              <ul>
                <li>Please arrive 15 minutes early</li>
                <li>Eat a good meal before the event</li>
                <li>Bring your registration confirmation</li>
                <li>Contact the organizer if you need to cancel</li>
              </ul>
            </div>
            
            <center>
              <a href="https://raksetu.vercel.app/bloodhub?tab=community" class="button">View Event Details</a>
            </center>
          </div>
          
          <div class="footer">
            <p><strong>Raksetu - रक्षेतु</strong></p>
            <p>Saving Lives, One Donation at a Time 🩸</p>
            <p style="font-size: 12px; color: #9ca3af;">This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  // Handle tier selection
  const handleTierSelection = async (tier) => {
    if (!isLoggedIn) {
      setShowAuthModalLocal(true);
      return;
    }

    setSelectedHostingTier(tier);

    if (tier.id === 'free') {
      // Free tier: directly open event creation form
      setShowTierSelectionModal(false);
      setShowCreateEventModal(true);
    } else if (tier.voucherApplied) {
      // Pro tier with voucher: mark voucher as used and open event creation
      try {
        const voucherRef = doc(db, 'rewardRedemptions', tier.voucherData.docId);
        await updateDoc(voucherRef, {
          status: 'used',
          usedAt: Timestamp.now(),
          usedFor: 'pro_event_hosting'
        });
        
        // Open event creation modal directly (no payment needed)
        setShowTierSelectionModal(false);
        setShowCreateEventModal(true);
        
        alert('🎉 Pro tier voucher applied successfully! Create your event now.');
      } catch (error) {
        console.error('Error applying voucher:', error);
        alert('Failed to apply voucher. Please try again.');
      }
    } else {
      // Plus/Pro tiers without voucher: open payment modal
      setShowTierSelectionModal(false);
      setShowPaymentModal(true);
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (payment) => {
    console.log('Payment successful:', payment);
    setPaymentData(payment);
    setShowPaymentModal(false);
    setShowCreateEventModal(true);
  };

  // Handle payment failure
  const handlePaymentFailure = (error) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error.description || 'Please try again'}`);
  };

  // Handle reward redemption
  const handleRedeemClick = () => {
    if (!isLoggedIn) {
      setShowAuthModalLocal(true);
      return;
    }
    setShowRedeemModal(true);
  };

  const handleRedeemSuccess = async (rewardData) => {
    setRedeemedReward(rewardData);
    
    // Check if it's a merchandise reward - show shipping form
    if (rewardData.reward.id === 'exclusive_merch') {
      setPendingMerchOrder(rewardData);
      setShowRewardSuccessModal(true);
      // Shipping form will appear after closing success modal
    } else {
      setShowRewardSuccessModal(true);
    }
    
    // Update local points state
    setUserPoints(rewardData.pointsRemaining);
    
    // Refresh user data
    await fetchData();
  };

  // Handle shipping form submission success
  const handleShippingSubmitSuccess = () => {
    alert('Shipping details submitted successfully! Your merchandise will be dispatched soon.');
    setPendingMerchOrder(null);
  };

  // Handle partner application submission
  const handlePartnerApplication = async (formData) => {
    if (!isLoggedIn) {
      setShowAuthModalLocal(true);
      return;
    }

    try {
      // Save partnership application to Firestore
      const docRef = await addDoc(collection(db, 'partnershipApplications'), {
        ...formData,
        userId: auth.currentUser.uid,
        partnershipTier: selectedPartnerTier?.name,
        fee: selectedPartnerTier?.fee,
        appliedAt: Timestamp.now(),
        status: 'pending', // pending, approved, rejected
        reviewedAt: null,
        reviewedBy: null,
        notes: ''
      });

      // Set success modal details
      setPartnershipDetails({
        organizationName: formData.organizationName,
        partnershipTier: selectedPartnerTier?.name,
        fee: selectedPartnerTier?.fee,
        email: formData.email,
        phone: formData.phone,
        applicationId: docRef.id.substring(0, 8).toUpperCase()
      });

      setShowPartnerModal(false);
      setSelectedPartnerTier(null);
      setShowPartnershipSuccess(true);
    } catch (error) {
      console.error('Error submitting partnership application:', error);
      alert('❌ Failed to submit application. Please try again.');
    }
  };

  // Handle event creation
  const handleCreateEvent = async (eventData) => {
    try {
      // Combine event data with tier and payment info
      const startDateTime = new Date(`${eventData.startDate}T${eventData.startTime}`);
      const endDateTime = new Date(`${eventData.startDate}T${eventData.endTime}`);

      const newEvent = {
        ...eventData,
        startDate: Timestamp.fromDate(startDateTime),
        endDate: Timestamp.fromDate(endDateTime),
        tier: selectedHostingTier.id,
        tierName: selectedHostingTier.name,
        organizerId: auth.currentUser.uid,
        organizer: eventData.organizerName,
        participants: 0,
        status: 'active',
        featured: selectedHostingTier.id !== 'free',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      // Add payment info if paid tier
      if (paymentData) {
        newEvent.payment = {
          amount: selectedHostingTier.price,
          paymentId: paymentData.razorpay_payment_id,
          orderId: paymentData.razorpay_order_id,
          paidAt: paymentData.timestamp
        };
      }

      // Save event to Firestore
      const docRef = await addDoc(collection(db, 'communityEvents'), newEvent);
      console.log('Event created with ID:', docRef.id);

      // Award points to organizer (100 for hosting an event)
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        communityPoints: increment(100)
      });
      setUserPoints(prev => prev + 100);

      // Show success message
      setRegistrationDetails({
        eventTitle: eventData.title,
        location: eventData.location,
        city: eventData.city,
        date: new Date(startDateTime).toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        time: new Date(startDateTime).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        organizer: eventData.organizerName,
        pointsAwarded: 100,
        email: null // Don't show email section for event creation
      });

      // Close modal and show success
      setShowCreateEventModal(false);
      setShowRegistrationSuccess(true);

      // Reset states
      setSelectedHostingTier(null);
      setPaymentData(null);

      // Refresh events list
      fetchData();
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-gradient-to-r from-red-100 to-blue-100 px-6 py-2 rounded-full mb-4">
            <Sparkles size={20} className="text-red-600 mr-2" />
            <span className="text-sm font-semibold text-gray-700">Community Hub - Where Impact Happens</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-4 px-4">
            Join the Raksetu Community
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Host impactful events, participate in life-saving drives, and partner with us to create a world where no one dies from blood shortage.
          </p>
        </div>

        {/* Points Dashboard (if logged in) */}
        {isLoggedIn && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-4 sm:p-6 mb-8 text-white shadow-2xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="bg-white/20 p-3 sm:p-4 rounded-xl">
                  <Trophy size={28} className="sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-xs sm:text-sm opacity-90">Your Community Points</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold">{userPoints.toLocaleString()}</p>
                </div>
              </div>
              <button 
                onClick={handleRedeemClick}
                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all w-full sm:w-auto text-sm sm:text-base whitespace-nowrap"
              >
                Redeem Rewards →
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12 px-4">
          <div className="inline-flex bg-white rounded-2xl shadow-lg p-2 w-full max-w-3xl overflow-x-auto">
            {[
              { id: 'participate', label: 'Participate in Events', icon: <Calendar size={20} /> },
              { id: 'host', label: 'Host an Event', icon: <Users size={20} /> },
              { id: 'partner', label: 'Partner With Us', icon: <Handshake size={20} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base whitespace-nowrap
                  ${activeTab === tab.id 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg scale-105' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }
                `}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in duration-500">
          {activeTab === 'participate' && (
            <ParticipateTab 
              events={events} 
              loading={loading}
              onRegister={handleEventRegistration}
              rewardsInfo={rewardsInfo}
              userPoints={userPoints}
            />
          )}
          
          {activeTab === 'host' && (
            <HostTab 
              plans={hostingPlans}
              onSelectPlan={() => setShowTierSelectionModal(true)}
            />
          )}
          
          {activeTab === 'partner' && (
            <PartnerTab 
              tiers={partnershipTiers}
              onApply={(tier) => {
                if (!isLoggedIn) {
                  setShowAuthModalLocal(true);
                  return;
                }
                setSelectedPartnerTier(tier);
                setShowPartnerModal(true);
              }}
            />
          )}
        </div>
      </div>

      {/* Registration Success Modal */}
      <SuccessModal
        show={showRegistrationSuccess}
        setShow={setShowRegistrationSuccess}
        heading="🎉 Success!"
        details={registrationDetails}
      />

      {/* Tier Selection Modal */}
      <HostTierSelectionModal
        show={showTierSelectionModal}
        setShow={setShowTierSelectionModal}
        onSelectTier={handleTierSelection}
      />

      {/* Payment Modal */}
      <PaymentModal
        show={showPaymentModal}
        setShow={setShowPaymentModal}
        tier={selectedHostingTier}
        userProfile={userProfile}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        show={showCreateEventModal}
        setShow={setShowCreateEventModal}
        tier={selectedHostingTier}
        userProfile={userProfile}
        onSubmit={handleCreateEvent}
      />

      {/* Redeem Rewards Modal */}
      <RedeemRewardsModal
        show={showRedeemModal}
        setShow={setShowRedeemModal}
        userPoints={userPoints}
        onRedeemSuccess={handleRedeemSuccess}
      />

      {/* Reward Success Modal */}
      <RewardSuccessModal
        show={showRewardSuccessModal}
        setShow={(show) => {
          setShowRewardSuccessModal(show);
          // If closing success modal and there's a pending merch order, show shipping form
          if (!show && pendingMerchOrder) {
            setTimeout(() => setShowShippingForm(true), 300);
          }
        }}
        rewardData={redeemedReward}
      />

      {/* Shipping Form Modal for Merchandise */}
      <ShippingFormModal
        show={showShippingForm}
        setShow={setShowShippingForm}
        rewardData={pendingMerchOrder}
        onSubmitSuccess={handleShippingSubmitSuccess}
      />

      {/* Partner Application Modal */}
      <PartnerApplicationModal
        show={showPartnerModal}
        setShow={setShowPartnerModal}
        selectedTier={selectedPartnerTier}
        userProfile={userProfile}
        onSubmit={handlePartnerApplication}
      />

      {/* Partnership Success Modal */}
      <PartnershipSuccessModal
        show={showPartnershipSuccess}
        setShow={setShowPartnershipSuccess}
        details={partnershipDetails}
      />

      {/* Event Registration Confirmation Modal */}
      <ConfirmEventModal
        isOpen={showConfirmEventModal}
        onClose={() => {
          setShowConfirmEventModal(false);
          setEventToConfirm(null);
          setHasPriorityAccess(false);
        }}
        onConfirm={confirmEventRegistration}
        event={eventToConfirm}
        hasPriorityAccess={hasPriorityAccess}
        isProcessing={isRegistering}
      />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          show={showAuthModal}
          setShow={setShowAuthModalLocal}
        />
      )}
    </div>
  );
}

// Participate Tab Component
function ParticipateTab({ events, loading, onRegister, rewardsInfo, userPoints }) {
  const [filter, setFilter] = useState('all'); // all, bloodDrive, awareness, training
  const [currentPage, setCurrentPage] = useState(0);
  const EVENTS_PER_PAGE = 6;

  const filteredEvents = events.filter(event => 
    filter === 'all' || event.type === filter
  );

  const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = filteredEvents.slice(
    currentPage * EVENTS_PER_PAGE,
    (currentPage + 1) * EVENTS_PER_PAGE
  );

  // Reset to first page when filter changes
  React.useEffect(() => {
    setCurrentPage(0);
  }, [filter]);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div>
      {/* Rewards Section */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 text-white">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 flex items-center gap-3">
          <Gift size={24} className="sm:w-8 sm:h-8" />
          Earn Rewards & Discounts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">Earn Points</h4>
            <div className="space-y-3">
              {rewardsInfo.pointsSystem.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                  <div className="bg-white/20 p-2 rounded-lg text-sm sm:text-base">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{item.action}</p>
                  </div>
                  <div className="bg-yellow-400 text-purple-900 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
                    +{item.points}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg sm:text-xl font-semibold mb-4">Redeem Benefits</h4>
            <div className="space-y-3">
              {rewardsInfo.redeemOptions.map((item, index) => (
                <div key={index} className="flex items-center gap-3 bg-white/10 p-3 rounded-lg">
                  <div className="bg-white/20 p-2 rounded-lg text-sm sm:text-base">{item.icon}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{item.item}</p>
                  </div>
                  <div className="bg-white text-purple-600 px-2 sm:px-3 py-1 rounded-full font-bold text-xs sm:text-sm">
                    {item.cost} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Filters */}
      <div className="flex gap-3 sm:gap-4 mb-8 overflow-x-auto pb-2 px-4 sm:px-0">
        {[
          { id: 'all', label: 'All Events' },
          { id: 'bloodDrive', label: 'Blood Drives' },
          { id: 'awareness', label: 'Awareness Campaigns' },
          { id: 'training', label: 'Training & Workshops' }
        ].map(filterOption => (
          <button
            key={filterOption.id}
            onClick={() => setFilter(filterOption.id)}
            className={`
              px-4 sm:px-6 py-2 rounded-full font-medium whitespace-nowrap transition-all text-sm sm:text-base
              ${filter === filterOption.id 
                ? 'bg-red-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 hover:bg-red-50 border border-gray-200'
              }
            `}
          >
            {filterOption.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading amazing events...</p>
        </div>
      ) : filteredEvents.length > 0 ? (
        <>
          {/* Pagination Info */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4 px-4 sm:px-0">
            <div className="text-sm text-gray-600 text-center sm:text-left">
              Showing {currentPage * EVENTS_PER_PAGE + 1}-{Math.min((currentPage + 1) * EVENTS_PER_PAGE, filteredEvents.length)} of {filteredEvents.length} events
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="px-3 py-1 bg-red-100 text-red-600 rounded-lg font-medium text-sm">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages - 1}
                  className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            {paginatedEvents.map(event => (
              <EventCard key={event.id} event={event} onRegister={onRegister} />
            ))}
          </div>

          {/* Bottom Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 px-4 sm:px-0">
              <button
                onClick={prevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full sm:w-auto text-sm sm:text-base"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <div className="hidden sm:flex items-center gap-2">
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentPage(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === idx
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages - 1}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all w-full sm:w-auto text-sm sm:text-base"
              >
                Next
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl">
          <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
          <p className="text-xl text-gray-600">No events found. Check back soon!</p>
        </div>
      )}
    </div>
  );
}

// Event Card Component - Memoized for performance
const EventCard = React.memo(({ event, onRegister }) => {
  // Define color schemes for each event type
  const eventStyles = {
    bloodDrive: {
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      bgPattern: 'from-red-50 to-rose-50',
      borderColor: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badge: 'bg-gradient-to-r from-red-500 to-rose-500',
      button: 'from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
      ringColor: 'ring-red-200',
      emoji: '🩸',
      label: 'Blood Drive'
    },
    awareness: {
      gradient: 'from-blue-500 via-indigo-500 to-purple-500',
      bgPattern: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badge: 'bg-gradient-to-r from-blue-500 to-indigo-500',
      button: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      ringColor: 'ring-blue-200',
      emoji: '📢',
      label: 'Awareness Campaign'
    },
    training: {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgPattern: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      badge: 'bg-gradient-to-r from-emerald-500 to-teal-500',
      button: 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700',
      ringColor: 'ring-emerald-200',
      emoji: '🎓',
      label: 'Training Session'
    }
  };

  const style = eventStyles[event.type] || eventStyles.bloodDrive;
  
  // Format date
  const eventDate = event.startDate?.toDate ? new Date(event.startDate.toDate()) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit'
  });

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${style.borderColor} hover:scale-[1.02] group`}>
      {/* Header with Gradient Background */}
      <div className={`relative h-40 bg-gradient-to-br ${style.gradient} overflow-hidden`}>
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Event Type Badge */}
        <div className="absolute top-4 right-4">
          <div className={`${style.badge} text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm flex items-center gap-2`}>
            <span className="text-base">{style.emoji}</span>
            <span>{style.label}</span>
          </div>
        </div>
        
        {/* Event Title */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/60 to-transparent">
          <h3 className="text-2xl font-bold text-white mb-1 drop-shadow-lg leading-tight">
            {event.title}
          </h3>
          <p className="text-white/90 text-sm font-medium flex items-center gap-2">
            <Building2 size={14} />
            {event.organizer}
          </p>
        </div>
      </div>

      {/* Card Body */}
      <div className={`p-6 bg-gradient-to-br ${style.bgPattern}`}>
        {/* Event Details Grid */}
        <div className="space-y-3 mb-5">
          {/* Date & Time */}
          <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className={`${style.iconBg} p-2 rounded-lg`}>
              <Calendar size={20} className={style.iconColor} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Date & Time</p>
              <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
              <p className="text-xs text-gray-600 mt-0.5">{formattedTime}</p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className={`${style.iconBg} p-2 rounded-lg`}>
              <MapPin size={20} className={style.iconColor} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Location</p>
              <p className="text-sm font-bold text-gray-900">{event.location}</p>
              {event.city && <p className="text-xs text-gray-600 mt-0.5">{event.city}</p>}
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm">
            <div className={`${style.iconBg} p-2 rounded-lg`}>
              <Users size={20} className={style.iconColor} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Registered</p>
              <p className="text-sm font-bold text-gray-900">{event.participants || 0} participants</p>
            </div>
            <div className="flex -space-x-2">
              {[...Array(Math.min(3, event.participants || 0))].map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              {(event.participants || 0) > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                  +{(event.participants || 0) - 3}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Register Button */}
        <button
          onClick={() => onRegister(event)}
          className={`w-full bg-gradient-to-r ${style.button} text-white py-3.5 rounded-xl font-bold text-base hover:shadow-xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]`}
        >
          <span>Register Now</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Quick Info Footer */}
        {event.capacity && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-600 bg-white/50 rounded-lg p-2">
            <span className="flex items-center gap-1">
              <Target size={12} />
              Capacity: {event.capacity}
            </span>
            <span className={`font-bold ${(event.participants || 0) >= event.capacity ? 'text-red-600' : style.iconColor}`}>
              {event.capacity - (event.participants || 0)} spots left
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

// Host Tab Component
function HostTab({ plans, onSelectPlan }) {
  return (
    <div>
      {/* Hosting Benefits */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 text-white">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Why Host on Raksetu?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {[
            { icon: <Users size={24} className="sm:w-8 sm:h-8" />, title: 'Reach Thousands', desc: 'Connect with our 10K+ active community members' },
            { icon: <TrendingUp size={24} className="sm:w-8 sm:h-8" />, title: 'Proven Impact', desc: 'Average 250+ attendees per event hosted' },
            { icon: <BarChart3 size={24} className="sm:w-8 sm:h-8" />, title: 'Data Insights', desc: 'Track engagement, conversions, and ROI in real-time' }
          ].map((benefit, index) => (
            <div key={index} className="bg-white/10 p-4 sm:p-6 rounded-xl">
              <div className="bg-white/20 w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4">
                {benefit.icon}
              </div>
              <h4 className="text-lg sm:text-xl font-bold mb-2">{benefit.title}</h4>
              <p className="opacity-90 text-sm sm:text-base">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`
              bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden
              ${plan.popular ? 'ring-4 ring-blue-500 transform sm:scale-105' : ''}
            `}
          >
            {plan.popular && (
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center py-2 font-semibold text-sm">
                🔥 MOST POPULAR
              </div>
            )}
            <div className="p-6 sm:p-8">
              <div className="mb-6">
                {plan.icon}
                <h3 className="text-xl sm:text-2xl font-bold mt-4 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.period && <span className="text-gray-500 text-sm sm:text-base">{plan.period}</span>}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle size={18} className={`text-${plan.color}-500 mt-0.5 flex-shrink-0`} />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={onSelectPlan}
                className={`
                  w-full py-3 rounded-xl font-semibold transition-all text-sm sm:text-base
                  ${plan.popular 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800' 
                    : `bg-${plan.color}-50 text-${plan.color}-600 hover:bg-${plan.color}-100`
                  }
                `}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Partner Tab Component
function PartnerTab({ tiers, onApply }) {
  return (
    <div>
      {/* Partnership Value Proposition */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-4 sm:p-6 md:p-8 mb-8 sm:mb-12 text-white">
        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4">Amplify Your Impact</h3>
        <p className="text-base sm:text-lg opacity-90 mb-6">
          Join 500+ organizations leveraging Raksetu's platform to run successful blood donation campaigns, 
          engage communities, and save thousands of lives annually.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { value: '500+', label: 'Partner Organizations' },
            { value: '10M+', label: 'Lives Impacted' },
            { value: '95%', label: 'Partner Satisfaction' },
            { value: '24/7', label: 'Dedicated Support' }
          ].map((stat, index) => (
            <div key={index} className="bg-white/10 p-3 sm:p-4 rounded-xl text-center">
              <p className="text-2xl sm:text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs sm:text-sm opacity-90">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Partnership Tiers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12 px-4 sm:px-0">
        {tiers.map((tier, index) => (
          <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 sm:p-8">
            <div className="mb-6">
              {tier.icon}
              <h3 className="text-xl sm:text-2xl font-bold mt-4 mb-1">{tier.name}</h3>
              <p className="text-gray-600 text-sm mb-3">{tier.for}</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">{tier.fee}</p>
            </div>
            <ul className="space-y-3 mb-8">
              {tier.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => onApply(tier)}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all"
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>

      {/* Partner Testimonials */}
      <div className="bg-gray-50 rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-6 text-center">What Our Partners Say</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              name: 'City General Hospital',
              role: 'Chief Medical Officer',
              quote: 'Raksetu helped us connect with 500+ donors in our first month. Game-changing platform!',
              logo: <Building2 size={32} className="text-blue-500" />
            },
            {
              name: 'Blood Heroes NGO',
              role: 'Founder',
              quote: 'The partnership program amplified our campaigns 10x. Highly recommended!',
              logo: <Heart size={32} className="text-red-500" />
            },
            {
              name: 'TechCorp CSR Team',
              role: 'CSR Director',
              quote: 'Running employee blood drives has never been easier. Seamless experience!',
              logo: <Trophy size={32} className="text-yellow-500" />
            }
          ].map((testimonial, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
              <div className="mb-4">{testimonial.logo}</div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.quote}"</p>
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
