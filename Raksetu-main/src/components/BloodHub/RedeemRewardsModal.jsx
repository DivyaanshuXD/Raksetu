import React, { useState } from 'react';
import { X, Gift, Zap, Award, Shield, Crown, Check, Trophy, Sparkles, AlertCircle, TrendingUp, Clock, Users, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { db, auth } from '../utils/firebase';
import { doc, updateDoc, increment, addDoc, collection, Timestamp } from 'firebase/firestore';

const RedeemRewardsModal = React.memo(({ show, setShow, userPoints, onRedeemSuccess }) => {
  const [selectedReward, setSelectedReward] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  
  const REWARDS_PER_PAGE = 3;

  const rewards = [
    {
      id: 'discount_10',
      title: '10% Off Next Event',
      description: 'Get 10% discount on your next event registration (Plus or Pro tier)',
      cost: 200,
      icon: Gift,
      color: 'from-blue-500 to-cyan-500',
      benefit: '10% discount code',
      validity: '30 days',
      type: 'coupon'
    },
    {
      id: 'early_access',
      title: 'Early Event Access',
      description: 'See and register for events 24 hours before public release',
      cost: 400,
      icon: Clock,
      color: 'from-indigo-500 to-blue-500',
      benefit: 'Early access privilege',
      validity: '45 days',
      type: 'access'
    },
    {
      id: 'priority_registration',
      title: 'Priority Registration',
      description: 'Skip waitlists and get priority access to events for next 60 days',
      cost: 500,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      benefit: 'Priority access',
      validity: '60 days',
      type: 'access'
    },
    {
      id: 'analytics_access',
      title: 'Event Analytics Access',
      description: 'Advanced analytics dashboard for your hosted events with detailed insights',
      cost: 750,
      icon: TrendingUp,
      color: 'from-teal-500 to-cyan-500',
      benefit: 'Analytics dashboard',
      validity: '180 days',
      type: 'feature'
    },
    {
      id: 'exclusive_merch',
      title: 'Exclusive Merchandise',
      description: 'Raksetu branded T-shirt, cap, or sticker pack delivered to your address',
      cost: 1000,
      icon: Award,
      color: 'from-green-500 to-emerald-500',
      benefit: 'Physical merch',
      validity: 'One-time',
      type: 'physical'
    },
    {
      id: 'referral_bonus',
      title: 'Referral Bonus Multiplier',
      description: 'Earn 2x points for every friend you refer (instead of 1x)',
      cost: 1200,
      icon: Users,
      color: 'from-orange-500 to-red-500',
      benefit: '2x referral points',
      validity: '60 days',
      type: 'multiplier'
    },
    {
      id: 'featured_badge',
      title: 'Featured Profile Badge',
      description: 'Gold star badge displayed on your profile for 90 days',
      cost: 1500,
      icon: Shield,
      color: 'from-purple-500 to-pink-500',
      benefit: 'Profile badge',
      validity: '90 days',
      type: 'badge'
    },
    {
      id: 'free_pro_hosting',
      title: 'Free Pro Event Hosting',
      description: 'Host one event with Pro tier benefits (₹2,999 value)',
      cost: 3000,
      icon: Crown,
      color: 'from-red-500 to-pink-500',
      benefit: 'Pro tier access',
      validity: '90 days',
      type: 'voucher'
    }
  ];

  const handleRedeemClick = (reward) => {
    setError('');
    if (userPoints < reward.cost) {
      setError(`You need ${reward.cost - userPoints} more points to redeem this reward.`);
      return;
    }
    setSelectedReward(reward);
  };

  const confirmRedeem = async () => {
    if (!selectedReward || !auth.currentUser) return;

    setRedeeming(true);
    setError('');

    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Deduct points
      await updateDoc(userRef, {
        communityPoints: increment(-selectedReward.cost)
      });

      // Calculate expiry date
      const expiryDate = selectedReward.validity !== 'One-time' 
        ? new Date(Date.now() + parseInt(selectedReward.validity) * 24 * 60 * 60 * 1000)
        : null;

      // Generate unique code
      const uniqueCode = `RKS-${selectedReward.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Create redemption record
      const redemptionData = {
        userId: auth.currentUser.uid,
        rewardId: selectedReward.id,
        rewardTitle: selectedReward.title,
        rewardType: selectedReward.type,
        pointsSpent: selectedReward.cost,
        uniqueCode: uniqueCode,
        redeemedAt: Timestamp.now(),
        status: 'active',
        expiresAt: expiryDate ? Timestamp.fromDate(expiryDate) : null
      };

      await addDoc(collection(db, 'rewardRedemptions'), redemptionData);

      // Handle reward-specific setup based on type
      const updateData = {};
      
      switch (selectedReward.type) {
        case 'access':
          // Priority Registration or Early Access
          if (selectedReward.id === 'priority_registration') {
            updateData.priorityAccess = {
              active: true,
              expiresAt: Timestamp.fromDate(expiryDate),
              redeemedAt: Timestamp.now()
            };
          } else if (selectedReward.id === 'early_access') {
            updateData.earlyAccess = {
              active: true,
              expiresAt: Timestamp.fromDate(expiryDate),
              redeemedAt: Timestamp.now()
            };
          }
          break;

        case 'badge':
          // Featured Profile Badge
          updateData.featuredBadge = {
            active: true,
            activatedAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(expiryDate)
          };
          break;

        case 'feature':
          // Analytics Access
          updateData.analyticsAccess = {
            active: true,
            expiresAt: Timestamp.fromDate(expiryDate),
            redeemedAt: Timestamp.now()
          };
          break;

        case 'multiplier':
          // Referral Bonus Multiplier
          updateData.referralMultiplier = {
            active: true,
            multiplier: 2,
            expiresAt: Timestamp.fromDate(expiryDate),
            redeemedAt: Timestamp.now()
          };
          break;

        case 'coupon':
        case 'voucher':
        case 'physical':
          // These use the unique code system only
          break;

        default:
          break;
      }

      // Update user document with reward-specific flags
      if (Object.keys(updateData).length > 0) {
        await updateDoc(userRef, updateData);
      }

      // Call success callback
      onRedeemSuccess({
        reward: selectedReward,
        code: uniqueCode,
        pointsRemaining: userPoints - selectedReward.cost,
        expiresAt: expiryDate
      });

      // Close modal and reset
      setSelectedReward(null);
      setShow(false);
    } catch (err) {
      console.error('Redemption error:', err);
      setError('Failed to redeem reward. Please try again.');
    } finally {
      setRedeeming(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-4 max-h-[95vh] overflow-y-auto" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-xl sticky top-0 z-10">
          <button
            onClick={() => {
              setShow(false);
              setSelectedReward(null);
              setError('');
            }}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
          >
            <X size={20} />
          </button>
          
          <div className="text-center pr-8">
            <div className="inline-flex items-center gap-1.5 bg-white/30 px-3 py-1 rounded-full mb-2">
              <Sparkles size={14} />
              <span className="text-xs font-semibold">Rewards Store</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-1">Redeem Your Points</h2>
            <p className="text-purple-100 text-sm">
              You have <span className="text-lg sm:text-xl font-bold text-yellow-300">{userPoints.toLocaleString()}</span> points
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Rewards Grid with Pagination */}
          <div className="mb-6">
            {/* Pagination Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-600">
                Showing {currentPage * REWARDS_PER_PAGE + 1}-{Math.min((currentPage + 1) * REWARDS_PER_PAGE, rewards.length)} of {rewards.length} rewards
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                  className="p-2 rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">
                  {currentPage + 1} / {Math.ceil(rewards.length / REWARDS_PER_PAGE)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(rewards.length / REWARDS_PER_PAGE) - 1, prev + 1))}
                  disabled={currentPage >= Math.ceil(rewards.length / REWARDS_PER_PAGE) - 1}
                  className="p-2 rounded-lg bg-white border-2 border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Rewards Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {rewards
                .slice(currentPage * REWARDS_PER_PAGE, (currentPage + 1) * REWARDS_PER_PAGE)
                .map((reward) => {
                  const Icon = reward.icon;
                  const canAfford = userPoints >= reward.cost;
                  const isSelected = selectedReward?.id === reward.id;

              return (
                <div
                  key={reward.id}
                  className={`relative bg-white border-2 rounded-xl overflow-hidden transition-all duration-200 shadow-md ${
                    isSelected
                      ? 'border-purple-500 shadow-xl ring-2 ring-purple-200'
                      : canAfford
                      ? 'border-gray-300 hover:border-purple-400 hover:shadow-xl cursor-pointer'
                      : 'border-gray-200 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => canAfford && handleRedeemClick(reward)}
                >
                  {/* Can't Afford Overlay */}
                  {!canAfford && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2.5 py-1 text-xs font-bold rounded-full z-10 shadow-lg">
                      🔒 Locked
                    </div>
                  )}

                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 bg-purple-600 text-white px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 z-10 shadow-lg animate-pulse">
                      <Check size={12} />
                      Selected
                    </div>
                  )}

                  {/* Icon Header */}
                  <div className={`bg-gradient-to-r ${reward.color} p-4 text-white`}>
                    <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                      <Icon size={28} />
                    </div>
                    <h3 className="text-base font-bold mb-1 leading-tight">{reward.title}</h3>
                    <p className="text-xs opacity-90 leading-tight">{reward.benefit}</p>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-3 leading-snug">{reward.description}</p>
                    
                    <div className="flex items-center justify-between mb-3 text-xs bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-600 font-medium">Valid for</span>
                      <span className="font-bold text-gray-900">{reward.validity}</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t-2 border-gray-100">
                      <span className="text-gray-700 font-bold text-sm">Cost</span>
                      <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-50 to-orange-50 px-3 py-1.5 rounded-lg">
                        <Trophy className="text-yellow-500" size={16} />
                        <span className="text-xl font-black text-purple-600">{reward.cost}</span>
                        <span className="text-xs text-gray-500 font-semibold">pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          </div>

          {/* Selected Reward Confirmation */}
          {selectedReward && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-4">
              <h3 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Check className="text-green-500" size={18} />
                Confirm Redemption
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">You're redeeming:</p>
                  <p className="text-sm font-bold text-gray-900">{selectedReward.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Points required:</p>
                  <p className="text-base font-bold text-purple-600 flex items-center gap-1">
                    <Trophy className="text-yellow-500" size={14} />
                    {selectedReward.cost}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Current Points:</span>
                  <span className="font-bold text-gray-900">{userPoints.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-gray-600">After Redemption:</span>
                  <span className="font-bold text-green-600">
                    {(userPoints - selectedReward.cost).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedReward(null);
                    setError('');
                  }}
                  disabled={redeeming}
                  className="flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRedeem}
                  disabled={redeeming}
                  className="flex-1 py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {redeeming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Redeeming...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Confirm Redemption
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Info Footer */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mt-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm flex items-center gap-1.5">
              <Sparkles className="text-blue-600" size={14} />
              How It Works
            </h4>
            <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
              <li>Select a reward you can afford</li>
              <li>Confirm redemption to deduct points</li>
              <li>Receive a unique code/activation instantly</li>
              <li>Use your reward as per validity period</li>
              <li>Earn more points by attending events!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
});

RedeemRewardsModal.displayName = 'RedeemRewardsModal';

export default RedeemRewardsModal;
