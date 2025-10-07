import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Crown, Gift, TrendingUp, Users, Calendar, Megaphone, Shield, Star, Sparkles, Tag } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const HostTierSelectionModal = React.memo(({ show, setShow, onSelectTier }) => {
  const [selectedTier, setSelectedTier] = useState(null);
  const [hasProVoucher, setHasProVoucher] = useState(false);
  const [voucherData, setVoucherData] = useState(null);
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  useEffect(() => {
    if (show && auth.currentUser) {
      checkForProVoucher();
    }
  }, [show]);

  const checkForProVoucher = async () => {
    setCheckingVoucher(true);
    try {
      const voucherQuery = query(
        collection(db, 'rewardRedemptions'),
        where('userId', '==', auth.currentUser.uid),
        where('rewardId', '==', 'free_pro_hosting'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(voucherQuery);
      
      if (!snapshot.empty) {
        const voucher = snapshot.docs[0];
        const data = voucher.data();
        
        // Check if voucher is not expired
        if (!data.expiresAt || data.expiresAt.toDate() > new Date()) {
          setHasProVoucher(true);
          setVoucherData({
            docId: voucher.id,
            ...data
          });
        }
      }
    } catch (error) {
      console.error('Error checking for Pro voucher:', error);
    } finally {
      setCheckingVoucher(false);
    }
  };

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      icon: Gift,
      color: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      popular: false,
      features: [
        { text: 'Host 1 event', included: true },
        { text: 'Basic event listing', included: true },
        { text: 'Up to 50 participants', included: true },
        { text: 'Email support', included: true },
        { text: 'Event registration tracking', included: true },
        { text: 'Featured listing', included: false },
        { text: 'Priority support', included: false },
        { text: 'Custom branding', included: false },
        { text: 'Analytics dashboard', included: false },
      ]
    },
    {
      id: 'plus',
      name: 'Plus',
      price: 999,
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-300',
      bgColor: 'bg-purple-50',
      popular: true,
      features: [
        { text: 'Host unlimited events', included: true },
        { text: 'Featured listing (7 days)', included: true },
        { text: 'Up to 200 participants', included: true },
        { text: 'Priority email support', included: true },
        { text: 'Event registration tracking', included: true },
        { text: 'Basic analytics dashboard', included: true },
        { text: 'Social media promotion', included: true },
        { text: 'Custom branding', included: false },
        { text: 'Advanced analytics', included: false },
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50',
      popular: false,
      features: [
        { text: 'Host unlimited events', included: true },
        { text: 'Featured listing (30 days)', included: true },
        { text: 'Unlimited participants', included: true },
        { text: '24/7 Priority support', included: true },
        { text: 'Event registration tracking', included: true },
        { text: 'Advanced analytics dashboard', included: true },
        { text: 'Social media promotion', included: true },
        { text: 'Custom branding & logos', included: true },
        { text: 'Dedicated account manager', included: true },
      ]
    }
  ];

  const handleSelectTier = (tier) => {
    setSelectedTier(tier.id);
    
    // If Pro tier selected and has voucher, pass voucher info
    const tierData = { ...tier };
    if (tier.id === 'pro' && hasProVoucher) {
      tierData.voucherApplied = true;
      tierData.voucherData = voucherData;
      tierData.originalPrice = tier.price;
      tierData.price = 0; // Free with voucher
    }
    
    // Small delay for visual feedback
    setTimeout(() => {
      onSelectTier(tierData);
      setShow(false);
    }, 200);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl my-8" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X size={24} />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/30 px-4 py-2 rounded-full mb-4">
              <Sparkles size={20} />
              <span className="text-sm font-semibold">Choose Your Plan</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Host Your Event</h2>
            <p className="text-red-100 text-lg">Select the perfect tier for your community event</p>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((tier) => {
              const IconComponent = tier.icon;
              const isSelected = selectedTier === tier.id;
              
              return (
                <div
                  key={tier.id}
                  className={`relative bg-white border-2 rounded-2xl overflow-hidden transition-shadow duration-200 hover:shadow-2xl ${
                    isSelected 
                      ? 'border-red-500 scale-105 shadow-xl' 
                      : tier.borderColor
                  } ${tier.popular ? 'ring-4 ring-purple-200' : ''}`}
                >
                  {/* Popular Badge */}
                  {tier.popular && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 text-sm font-bold rounded-bl-xl flex items-center gap-1">
                      <Star size={14} fill="currentColor" />
                      POPULAR
                    </div>
                  )}

                  {/* Free with Voucher Badge for Pro Tier */}
                  {tier.id === 'pro' && hasProVoucher && (
                    <div className="absolute top-0 left-0 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-1 text-sm font-bold rounded-br-xl flex items-center gap-1 animate-pulse">
                      <Tag size={14} />
                      FREE WITH VOUCHER!
                    </div>
                  )}

                  {/* Tier Header */}
                  <div className={`bg-gradient-to-r ${tier.color} p-6 text-white`}>
                    <div className="flex items-center justify-between mb-4">
                      <IconComponent size={32} className="drop-shadow-lg" />
                      <div className="text-right">
                        {tier.id === 'pro' && hasProVoucher ? (
                          <>
                            <div className="text-2xl line-through opacity-60">₹{tier.price}</div>
                            <div className="text-4xl font-bold text-green-300">FREE</div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl font-bold">₹{tier.price}</div>
                            <div className="text-sm opacity-90">per event</div>
                          </>
                        )}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{tier.name}</h3>
                    <p className="text-sm opacity-90">
                      {tier.id === 'free' && 'Perfect for first-time organizers'}
                      {tier.id === 'plus' && 'Great for regular events'}
                      {tier.id === 'pro' && hasProVoucher && 'Redeemed with your reward voucher! 🎉'}
                      {tier.id === 'pro' && !hasProVoucher && 'Best for large-scale events'}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="p-6 space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div 
                        key={idx}
                        className={`flex items-start gap-3 ${
                          !feature.included ? 'opacity-40' : ''
                        }`}
                      >
                        {feature.included ? (
                          <div className="bg-green-100 rounded-full p-1 flex-shrink-0">
                            <Check size={14} className="text-green-600" />
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-full p-1 flex-shrink-0">
                            <X size={14} className="text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm text-gray-700">{feature.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Select Button */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={() => handleSelectTier(tier)}
                      className={`w-full py-3 px-6 rounded-xl font-semibold transition-transform duration-150 active:scale-95 ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-lg'
                          : `bg-gradient-to-r ${tier.color} text-white hover:shadow-lg`
                      }`}
                    >
                      {tier.id === 'free' ? 'Create Event' : 'Continue to Payment'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Footer */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="flex flex-col items-center gap-2">
                <Shield size={28} className="text-blue-600" />
                <h4 className="font-semibold text-gray-900">Secure Payments</h4>
                <p className="text-sm text-gray-600">UPI, Cards, Net Banking supported</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Users size={28} className="text-purple-600" />
                <h4 className="font-semibold text-gray-900">Verified Organizers</h4>
                <p className="text-sm text-gray-600">All events are reviewed by our team</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <TrendingUp size={28} className="text-pink-600" />
                <h4 className="font-semibold text-gray-900">Reach Thousands</h4>
                <p className="text-sm text-gray-600">Connect with blood donors nationwide</p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShow(false)}
              className="text-gray-600 hover:text-gray-900 font-medium px-6 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

HostTierSelectionModal.displayName = 'HostTierSelectionModal';

export default HostTierSelectionModal;
