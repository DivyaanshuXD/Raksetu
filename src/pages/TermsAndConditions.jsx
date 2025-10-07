import React from 'react';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
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
              <FileText size={32} />
            </div>
            <h1 className="text-4xl font-bold">Terms and Conditions</h1>
          </div>
          <p className="text-red-100 text-lg max-w-3xl">
            Last Updated: January 7, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          <p className="text-gray-700 text-lg">
            Welcome to Raksetu! By accessing or using our website and services, you agree to be bound by these Terms and Conditions.
          </p>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                By accessing and using Raksetu ("the Platform"), you accept and agree to be bound by these Terms and Conditions. 
                If you do not agree with any part of these terms, you must not use our services.
              </p>
            </div>
          </section>

          {/* Eligibility */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Eligibility</h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>You must be at least 18 years old to use our services</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You agree to notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          {/* Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Services Provided</h2>
            <div className="space-y-3 text-gray-700">
              <p>Raksetu provides the following services:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Blood Bank Locator:</strong> Find nearby blood banks and check availability</li>
                <li><strong>Emergency Requests:</strong> Request or provide emergency blood assistance</li>
                <li><strong>Donation Tracking:</strong> Track your blood donation history and schedule appointments</li>
                <li><strong>Community Events:</strong> Participate in or host blood donation drives and awareness campaigns</li>
                <li><strong>Gamification:</strong> Earn points and rewards for active participation</li>
              </ul>
            </div>
          </section>

          {/* User Responsibilities */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
            <div className="space-y-3 text-gray-700">
              <p>As a user of Raksetu, you agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate medical and personal information</li>
                <li>Use the platform for its intended purpose only</li>
                <li>Not misuse emergency request features</li>
                <li>Respect other users and maintain appropriate conduct</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not share false or misleading information</li>
                <li>Not engage in any fraudulent activities</li>
              </ul>
            </div>
          </section>

          {/* Event Hosting */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Event Hosting Terms</h2>
            <div className="space-y-3 text-gray-700">
              <h3 className="font-semibold text-lg">5.1 Event Organizers</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Must provide accurate event information</li>
                <li>Are responsible for event execution and participant safety</li>
                <li>Must comply with all local health and safety regulations</li>
                <li>Must honor the tier features paid for</li>
                <li>Cannot transfer event hosting rights to others</li>
              </ul>

              <h3 className="font-semibold text-lg mt-4">5.2 Raksetu's Role</h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Raksetu acts as a platform facilitator only</li>
                <li>We are not responsible for the actual conduct of events</li>
                <li>We reserve the right to remove events that violate policies</li>
                <li>We may verify event details before publication</li>
              </ul>
            </div>
          </section>

          {/* Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments and Billing</h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All payments are processed securely through Razorpay</li>
                <li>Prices are listed in Indian Rupees (INR)</li>
                <li>Payment must be completed before event publication (for paid tiers)</li>
                <li>Transaction fees may apply based on payment method</li>
                <li>Refunds are subject to our <Link to="/refund-policy" className="text-red-600 hover:underline">Cancellation & Refund Policy</Link></li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                All content, features, and functionality on Raksetu, including but not limited to text, graphics, logos, 
                and software, are owned by Raksetu and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>You may not:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Copy, modify, or distribute our content without permission</li>
                <li>Use our logo or branding without authorization</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Create derivative works from our platform</li>
              </ul>
            </div>
          </section>

          {/* Medical Disclaimer */}
          <section className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-900 mb-4">8. Medical Disclaimer</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                <strong>IMPORTANT:</strong> Raksetu is an information and coordination platform only. We do not provide medical advice, 
                diagnoses, or treatment.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Always consult qualified healthcare professionals</li>
                <li>Blood donation eligibility is determined by medical professionals</li>
                <li>We are not responsible for medical complications</li>
                <li>Emergency features are complementary, not replacement for 911/emergency services</li>
              </ul>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                To the fullest extent permitted by law, Raksetu shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages arising from:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use or inability to use our services</li>
                <li>Unauthorized access to or alteration of your data</li>
                <li>Any conduct of third parties on the platform</li>
                <li>Medical complications from blood donation</li>
                <li>Event organizer misconduct</li>
              </ul>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Privacy and Data Protection</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Your privacy is important to us. Please review our <Link to="/privacy-policy" className="text-red-600 hover:underline">Privacy Policy</Link> to 
                understand how we collect, use, and protect your personal information.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Termination</h2>
            <div className="space-y-3 text-gray-700">
              <p>We reserve the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Suspend or terminate your account for violations</li>
                <li>Remove content that violates our policies</li>
                <li>Modify or discontinue services at any time</li>
                <li>Refuse service to anyone for any reason</li>
              </ul>
            </div>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update these Terms and Conditions from time to time. Changes will be effective immediately upon 
                posting on this page. Your continued use of the platform after changes constitutes acceptance.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Governing Law</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                These Terms and Conditions are governed by and construed in accordance with the laws of India. 
                Any disputes shall be subject to the exclusive jurisdiction of courts in [Your City], India.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about these Terms and Conditions, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> legal@raksetu.live</p>
              <p><strong>Phone:</strong> +91-XXXX-XXXXXX</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="text-sm text-gray-600 border-t pt-6">
            <p>
              By using Raksetu, you acknowledge that you have read, understood, and agree to be bound by these 
              Terms and Conditions.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
