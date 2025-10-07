import React from 'react';
import { X, Check, Gift, Copy, Calendar, Trophy } from 'lucide-react';

const RewardSuccessModal = React.memo(({ show, setShow, rewardData }) => {
  const [copied, setCopied] = React.useState(false);

  if (!show || !rewardData) return null;

  const { reward, code, pointsRemaining } = rewardData;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl text-center">
          <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Reward Redeemed!</h2>
          <p className="text-green-100">Your reward is ready to use</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Reward Details */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className={`bg-gradient-to-r ${reward.color} p-3 rounded-xl text-white`}>
                {React.createElement(reward.icon, { size: 28 })}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{reward.title}</h3>
                <p className="text-sm text-gray-600">{reward.benefit}</p>
              </div>
            </div>

            {/* Validity */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3 mb-3">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Calendar size={16} />
                Valid for
              </span>
              <span className="font-semibold text-gray-900">{reward.validity}</span>
            </div>

            {/* Points Spent */}
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={16} />
                Points Spent
              </span>
              <span className="font-semibold text-purple-600">{reward.cost}</span>
            </div>
          </div>

          {/* Reward Code */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-6">
            <p className="text-sm text-yellow-800 font-medium mb-2">Your Reward Code:</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-white border-2 border-yellow-400 rounded-lg p-3 font-mono text-center text-lg font-bold text-gray-900">
                {code}
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg transition-colors"
                title="Copy code"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 font-medium mt-2 text-center">✓ Code copied to clipboard!</p>
            )}
          </div>

          {/* Points Remaining */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-sm text-blue-700 mb-1">Points Remaining</p>
            <p className="text-3xl font-bold text-blue-900">{pointsRemaining.toLocaleString()}</p>
          </div>

          {/* How to Use */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <Gift size={18} className="text-purple-600" />
              How to Use This Reward
            </h4>
            <ul className="text-sm text-gray-700 space-y-1.5">
              {reward.id === 'discount_10' && (
                <>
                  <li>• Use code at checkout when hosting an event</li>
                  <li>• Applies to Plus or Pro tier only</li>
                  <li>• Enter code in payment modal to get 10% off</li>
                  <li>• Valid for 30 days from redemption</li>
                </>
              )}
              {reward.id === 'early_access' && (
                <>
                  <li>• Your account now has early access enabled</li>
                  <li>• See events 24 hours before public release</li>
                  <li>• Register before slots fill up</li>
                  <li>• Active for the next 45 days</li>
                </>
              )}
              {reward.id === 'priority_registration' && (
                <>
                  <li>• Your account has been upgraded with priority access</li>
                  <li>• Skip waitlists and get instant registration</li>
                  <li>• Priority badge shows on your profile</li>
                  <li>• Active for the next 60 days</li>
                </>
              )}
              {reward.id === 'analytics_access' && (
                <>
                  <li>• Advanced analytics unlocked for hosted events</li>
                  <li>• View detailed participant demographics</li>
                  <li>• Access dashboard in your hosted events section</li>
                  <li>• Valid for 180 days (6 months)</li>
                </>
              )}
              {reward.id === 'exclusive_merch' && (
                <>
                  <li>• A shipping form will appear after closing this</li>
                  <li>• Fill in your delivery address and preferences</li>
                  <li>• Choose between T-shirt, Cap, or Sticker Pack</li>
                  <li>• Delivery within 7-10 business days</li>
                </>
              )}
              {reward.id === 'referral_bonus' && (
                <>
                  <li>• Referral multiplier now active on your account</li>
                  <li>• Earn 2x points for every friend you refer</li>
                  <li>• Share your referral link to maximize earnings</li>
                  <li>• Active for the next 60 days</li>
                </>
              )}
              {reward.id === 'featured_badge' && (
                <>
                  <li>• Gold star badge is now live on your profile</li>
                  <li>• Visible on profile, leaderboards, and event pages</li>
                  <li>• Stands out to other community members</li>
                  <li>• Automatically removed after 90 days</li>
                </>
              )}
              {reward.id === 'free_pro_hosting' && (
                <>
                  <li>• Use this code when creating your next event</li>
                  <li>• Select Pro tier (₹2,999 value)</li>
                  <li>• Enter code to bypass payment entirely</li>
                  <li>• Valid for one event within 90 days</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShow(false)}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                handleCopyCode();
                setShow(false);
              }}
              className="flex-1 py-3 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
            >
              <Copy size={18} />
              Copy & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

RewardSuccessModal.displayName = 'RewardSuccessModal';

export default RewardSuccessModal;
