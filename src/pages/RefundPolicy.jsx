import React from 'react';
import { Shield, ArrowLeft, Clock, CreditCard, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Shield size={32} />
            </div>
            <h1 className="text-4xl font-bold">Cancellation & Refund Policy</h1>
          </div>
          <p className="text-red-100 text-lg max-w-3xl">
            Last Updated: January 7, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Event Hosting Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <XCircle className="text-red-600" size={28} />
              Event Hosting Cancellations
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Free Tier Events</h3>
                <p>Events created under the Free tier can be cancelled anytime without any charges.</p>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-2">Plus Tier (₹999)</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>More than 7 days before event:</strong> Full refund (₹999)</li>
                  <li><strong>3-7 days before event:</strong> 50% refund (₹500)</li>
                  <li><strong>Less than 3 days before event:</strong> No refund</li>
                </ul>
              </div>

              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
                <h3 className="font-semibold text-amber-900 mb-2">Pro Tier (₹2,999)</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>More than 14 days before event:</strong> Full refund (₹2,999)</li>
                  <li><strong>7-14 days before event:</strong> 70% refund (₹2,099)</li>
                  <li><strong>3-7 days before event:</strong> 30% refund (₹900)</li>
                  <li><strong>Less than 3 days before event:</strong> No refund</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-green-600" size={28} />
              Refund Processing Time
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>Once a refund is approved, it will be processed based on your original payment method:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">UPI/Wallets</h3>
                  <p className="text-sm">1-3 business days</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Credit/Debit Cards</h3>
                  <p className="text-sm">5-7 business days</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Net Banking</h3>
                  <p className="text-sm">5-7 business days</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">Bank Transfer</h3>
                  <p className="text-sm">7-10 business days</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mt-4">
                * Processing times may vary based on your bank's policies. Refunds are processed to the original payment method only.
              </p>
            </div>
          </section>

          {/* How to Request */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="text-blue-600" size={28} />
              How to Request a Refund
            </h2>
            <div className="space-y-4 text-gray-700">
              <ol className="list-decimal list-inside space-y-3">
                <li>Log in to your Raksetu account</li>
                <li>Go to "My Events" in the Community Hub</li>
                <li>Select the event you want to cancel</li>
                <li>Click "Request Cancellation"</li>
                <li>Provide a reason for cancellation (optional)</li>
                <li>Submit the request</li>
              </ol>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <p className="text-yellow-900">
                  <strong>Note:</strong> You will receive a confirmation email once your refund request is processed. 
                  If you don't receive an email within 24 hours, please contact our support team.
                </p>
              </div>
            </div>
          </section>

          {/* Non-Refundable */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Non-Refundable Scenarios</h2>
            <div className="space-y-3 text-gray-700">
              <p>Refunds will <strong>NOT</strong> be provided in the following cases:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Event already completed</li>
                <li>Event cancelled within 3 days of scheduled date (Plus tier)</li>
                <li>Violation of Terms & Conditions</li>
                <li>Fraudulent activity detected</li>
                <li>Multiple cancellation requests for the same event</li>
              </ul>
            </div>
          </section>

          {/* Event Participant Cancellations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Participant Cancellations</h2>
            <div className="space-y-3 text-gray-700">
              <p>If you registered for an event as a participant:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Event registration is <strong>FREE</strong> for all participants</li>
                <li>You can cancel your registration anytime before the event</li>
                <li>No refund applicable as registration is free</li>
                <li>Community points earned will be retained</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-gray-700 mb-4">
              For any questions regarding cancellations or refunds, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> support@raksetu.live</p>
              <p><strong>Phone:</strong> +91-XXXX-XXXXXX</p>
              <p><strong>Support Hours:</strong> Mon-Sat, 9 AM - 6 PM IST</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="text-sm text-gray-600 border-t pt-6">
            <p>
              <strong>Disclaimer:</strong> Raksetu reserves the right to modify this policy at any time. 
              Changes will be effective immediately upon posting on this page. Please review this policy 
              periodically for updates. Continued use of our services after changes constitutes acceptance 
              of the modified policy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
