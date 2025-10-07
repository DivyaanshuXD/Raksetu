import React, { useState, useEffect } from 'react';
import { X, CreditCard, Smartphone, Building2, Wallet, Shield, Lock, CheckCircle, AlertCircle, Tag, Sparkles } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const PaymentModal = React.memo(({ 
  show, 
  setShow, 
  tier, 
  userProfile, 
  onPaymentSuccess,
  onPaymentFailure 
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountedPrice, setDiscountedPrice] = useState(tier?.price || 0);

  // Reset coupon when modal opens/closes or tier changes
  useEffect(() => {
    if (show) {
      setCouponCode('');
      setAppliedCoupon(null);
      setCouponError('');
      setDiscountedPrice(tier?.price || 0);
    }
  }, [show, tier]);

  // Load Razorpay script
  useEffect(() => {
    if (show && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('Razorpay loaded');
      script.onerror = () => setError('Failed to load payment gateway. Please refresh and try again.');
      document.body.appendChild(script);
    }
  }, [show]);

  // Validate and apply coupon code
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      // Query rewardRedemptions collection for matching code
      const redemptionsRef = collection(db, 'rewardRedemptions');
      const q = query(
        redemptionsRef,
        where('userId', '==', userProfile?.uid),
        where('rewardId', '==', 'discount_10'),
        where('status', '==', 'active')
      );

      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setCouponError('Invalid or expired coupon code');
        setCouponLoading(false);
        return;
      }

      // Find matching code (codes are generated, so we check manually)
      let matchingDoc = null;
      snapshot.forEach((doc) => {
        const code = `RKS-DISCOUNT_10-${doc.id}`;
        if (couponCode.toUpperCase() === code.toUpperCase() || 
            couponCode.toUpperCase().includes(doc.id.toUpperCase())) {
          matchingDoc = { id: doc.id, ...doc.data() };
        }
      });

      if (!matchingDoc) {
        setCouponError('Invalid coupon code');
        setCouponLoading(false);
        return;
      }

      // Check if expired
      if (matchingDoc.expiresAt && matchingDoc.expiresAt.toDate() < new Date()) {
        setCouponError('This coupon has expired');
        setCouponLoading(false);
        return;
      }

      // Apply 10% discount
      const discount = Math.round(tier.price * 0.10);
      const finalPrice = tier.price - discount;

      setAppliedCoupon({
        code: couponCode,
        discount: discount,
        docId: matchingDoc.id
      });
      setDiscountedPrice(finalPrice);
      setCouponError('');
      
    } catch (err) {
      console.error('Coupon validation error:', err);
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  // Remove applied coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountedPrice(tier.price);
    setCouponCode('');
    setCouponError('');
  };

  const handlePayment = async () => {
    if (!window.Razorpay) {
      setError('Payment gateway not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Use discounted price if coupon applied
      const finalAmount = discountedPrice;
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: finalAmount * 100, // Amount in paise
        currency: 'INR',
        name: 'Raksetu',
        description: `${tier.name} Tier - Host Community Event${appliedCoupon ? ' (10% Discount Applied)' : ''}`,
        image: '/Raksetu.png',
        
        prefill: {
          name: userProfile?.name || '',
          email: userProfile?.email || '',
          contact: userProfile?.phone || ''
        },
        
        notes: {
          tier: tier.id,
          tierName: tier.name,
          userId: userProfile?.uid || '',
          purpose: 'event_hosting',
          originalPrice: tier.price,
          discountApplied: appliedCoupon ? appliedCoupon.discount : 0,
          couponCode: appliedCoupon ? appliedCoupon.code : null
        },
        
        theme: {
          color: '#dc2626', // Red color matching your brand
          backdrop_color: '#00000080'
        },
        
        // Payment methods
        config: {
          display: {
            blocks: {
              banks: {
                name: 'All payment methods',
                instruments: [
                  {
                    method: 'upi'
                  },
                  {
                    method: 'card'
                  },
                  {
                    method: 'netbanking'
                  },
                  {
                    method: 'wallet'
                  }
                ]
              }
            },
            sequence: ['block.banks'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        
        // Callback handlers
        handler: async function (response) {
          console.log('Payment Success:', response);
          
          // Mark coupon as used if applied
          if (appliedCoupon) {
            try {
              const couponRef = doc(db, 'rewardRedemptions', appliedCoupon.docId);
              await updateDoc(couponRef, {
                status: 'used',
                usedAt: new Date(),
                usedFor: 'event_hosting',
                paymentId: response.razorpay_payment_id
              });
            } catch (err) {
              console.error('Failed to mark coupon as used:', err);
            }
          }
          
          // Payment successful
          const paymentData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            tier: tier,
            amount: discountedPrice,
            originalAmount: tier.price,
            discountApplied: appliedCoupon ? appliedCoupon.discount : 0,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            timestamp: new Date().toISOString()
          };
          
          onPaymentSuccess(paymentData);
          setShow(false);
        },
        
        modal: {
          ondismiss: function() {
            setLoading(false);
            console.log('Payment cancelled by user');
          },
          
          confirm_close: true,
          escape: true,
          backdropclose: false
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment Failed:', response.error);
        setError(response.error.description || 'Payment failed. Please try again.');
        onPaymentFailure({
          code: response.error.code,
          description: response.error.description,
          reason: response.error.reason
        });
        setLoading(false);
      });

      razorpay.open();
      
    } catch (err) {
      console.error('Payment error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!show || !tier) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" style={{ willChange: 'opacity' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-md" style={{ transform: 'translateZ(0)', willChange: 'transform' }}>
        {/* Header */}
        <div className={`bg-gradient-to-r ${tier.color} text-white p-4 sm:p-6 rounded-t-2xl relative`}>
          <button
            onClick={() => setShow(false)}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg disabled:opacity-50"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/30 px-3 sm:px-4 py-2 rounded-full mb-4">
              <Lock size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="text-xs sm:text-sm font-semibold">Secure Payment</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Complete Your Payment</h2>
            <p className="text-white/90 text-xs sm:text-sm">You're one step away from hosting your event</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 font-medium">Plan Selected</span>
              <span className="text-gray-900 font-bold text-lg">{tier.name} Tier</span>
            </div>
            
            {appliedCoupon && (
              <>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Original Price</span>
                  <span className="text-gray-700 font-semibold">₹{tier.price}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Tag size={16} />
                    Discount (10%)
                  </span>
                  <span className="text-green-600 font-semibold">-₹{appliedCoupon.discount}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
              <span className="text-gray-900 font-bold text-lg">
                {appliedCoupon ? 'Final Amount' : 'Total Amount'}
              </span>
              <span className={`text-3xl font-bold ${appliedCoupon ? 'text-green-600' : 'text-red-600'}`}>
                ₹{discountedPrice}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">+ Applicable taxes as per gateway</p>
          </div>

          {/* Coupon Code Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Tag size={20} className="text-yellow-600" />
              Have a Coupon Code?
            </h3>
            
            {!appliedCoupon ? (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code (e.g., RKS-DISCOUNT_10-XXX)"
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm font-mono"
                    disabled={couponLoading || loading}
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || loading || !couponCode.trim()}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {couponLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Checking...
                      </>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
                {couponError && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle size={14} />
                    {couponError}
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-green-50 border-2 border-green-300 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-green-600" />
                    <span className="font-mono text-sm font-semibold text-green-800">{appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    disabled={loading}
                    className="text-red-600 hover:text-red-700 text-xs font-medium disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-700">Discount Applied:</span>
                  <span className="font-bold text-green-800">-₹{appliedCoupon.discount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Payment Methods */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CreditCard size={20} className="text-red-600" />
              Available Payment Methods
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center gap-2">
                <Smartphone size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-gray-700">UPI</span>
              </div>
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Cards</span>
              </div>
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-3 flex items-center gap-2">
                <Building2 size={20} className="text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Net Banking</span>
              </div>
              <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-3 flex items-center gap-2">
                <Wallet size={20} className="text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Wallets</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Security Info */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 mb-1">100% Secure & Safe</p>
                <p className="text-xs text-green-700">
                  Powered by Razorpay. Your payment information is encrypted and secure. 
                  We don't store your card details.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-transform duration-150 active:scale-95 flex items-center justify-center gap-2 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : `bg-gradient-to-r ${tier.color} hover:shadow-xl`
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Processing...
                </>
              ) : (
                <>
                  <Lock size={20} />
                  Pay ₹{tier.price} Securely
                </>
              )}
            </button>

            <button
              onClick={() => setShow(false)}
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-150 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By proceeding, you agree to our{' '}
            <a href="#" className="text-red-600 hover:underline">Terms & Conditions</a>
            {' '}and{' '}
            <a href="#" className="text-red-600 hover:underline">Refund Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
});

PaymentModal.displayName = 'PaymentModal';

export default PaymentModal;
