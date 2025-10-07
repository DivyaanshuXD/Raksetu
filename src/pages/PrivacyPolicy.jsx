import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Database, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
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
            At Raksetu, we are committed to protecting your privacy and ensuring the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your data.
          </p>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="text-blue-600" size={28} />
              1. Information We Collect
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2">Personal Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name, email address, phone number</li>
                  <li>Date of birth, gender</li>
                  <li>Blood group and medical information (optional)</li>
                  <li>Location data (city, state)</li>
                  <li>Profile photo (optional)</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-2">Medical Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Blood type</li>
                  <li>Donation history</li>
                  <li>Health eligibility information</li>
                  <li>Appointment and donation records</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-green-900 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <h3 className="font-semibold text-orange-900 mb-2">Payment Information</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Transaction IDs (we do NOT store card details)</li>
                  <li>Payment method used</li>
                  <li>Billing information</li>
                  <li>Purchase history</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="text-green-600" size={28} />
              2. How We Use Your Information
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>We use collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Delivery:</strong> Provide and maintain our blood donation platform</li>
                <li><strong>User Accounts:</strong> Create and manage your account</li>
                <li><strong>Communication:</strong> Send notifications, updates, and important information</li>
                <li><strong>Emergency Matching:</strong> Connect donors with recipients during emergencies</li>
                <li><strong>Event Management:</strong> Organize and promote community blood donation events</li>
                <li><strong>Analytics:</strong> Improve our services and user experience</li>
                <li><strong>Security:</strong> Detect and prevent fraud, abuse, and security incidents</li>
                <li><strong>Legal Compliance:</strong> Comply with legal obligations and regulations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="text-purple-600" size={28} />
              3. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We may share your information in the following situations:</p>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">With Blood Banks and Healthcare Providers</h3>
                  <p className="text-sm">
                    When you schedule appointments or respond to emergency requests, we share necessary 
                    information with healthcare facilities.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">With Other Users (Limited)</h3>
                  <p className="text-sm">
                    Event organizers can see participant names (with consent). Emergency request creators 
                    may see donor basic information when you respond.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">With Service Providers</h3>
                  <p className="text-sm">
                    We use third-party services for payment processing (Razorpay), cloud storage (Firebase), 
                    and analytics. These providers are bound by confidentiality agreements.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Legal Requirements</h3>
                  <p className="text-sm">
                    We may disclose information if required by law, court order, or government request, 
                    or to protect rights, safety, and security.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mt-4">
                <p className="text-red-900">
                  <strong>We NEVER:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Sell your personal information to third parties</li>
                  <li>Share your medical data for marketing purposes</li>
                  <li>Disclose sensitive health information without consent</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="text-red-600" size={28} />
              4. Data Security
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encrypted data transmission (HTTPS/SSL)</li>
                <li>Secure cloud storage (Firebase with security rules)</li>
                <li>Access controls and authentication</li>
                <li>Regular security audits</li>
                <li>Payment data handled by PCI-DSS compliant Razorpay</li>
                <li>Password hashing and protection</li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <p className="text-yellow-900">
                  <strong>Note:</strong> While we strive to protect your data, no method of transmission or 
                  storage is 100% secure. We cannot guarantee absolute security.
                </p>
              </div>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Privacy Rights</h2>
            <div className="space-y-3 text-gray-700">
              <p>You have the following rights regarding your personal data:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">Access</h3>
                  <p className="text-sm">Request copies of your personal data</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">Correction</h3>
                  <p className="text-sm">Update or correct inaccurate information</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">Deletion</h3>
                  <p className="text-sm">Request deletion of your data (with exceptions)</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="font-semibold text-orange-900 mb-2">Opt-Out</h3>
                  <p className="text-sm">Unsubscribe from marketing communications</p>
                </div>
              </div>

              <p className="mt-4">To exercise these rights, contact us at: <a href="mailto:privacy@raksetu.live" className="text-red-600 hover:underline">privacy@raksetu.live</a></p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookies and Tracking</h2>
            <div className="space-y-3 text-gray-700">
              <p>We use cookies and similar technologies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Analytics Cookies:</strong> Understand how users interact with our site</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p>You can control cookies through your browser settings. Note that disabling cookies may affect functionality.</p>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Children's Privacy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Raksetu is not intended for users under 18 years of age. We do not knowingly collect personal 
                information from children. If we discover that a child has provided us with personal information, 
                we will delete it immediately.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
            <div className="space-y-3 text-gray-700">
              <p>We retain your data for as long as necessary to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide our services</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes</li>
                <li>Maintain donation history records (as per healthcare regulations)</li>
              </ul>
              <p>You may request deletion of your account and data at any time, subject to legal requirements.</p>
            </div>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Your data is primarily stored in India. If we transfer data internationally, we ensure 
                appropriate safeguards are in place to protect your information in accordance with applicable 
                data protection laws.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Policy</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of significant changes 
                via email or platform notification. Please review this policy periodically.
              </p>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions, concerns, or requests regarding your privacy or this policy:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Privacy Team:</strong> privacy@raksetu.live</p>
              <p><strong>General Support:</strong> support@raksetu.live</p>
              <p><strong>Phone:</strong> +91-XXXX-XXXXXX</p>
              <p><strong>Address:</strong> [Your Business Address]</p>
            </div>
          </section>

          {/* Consent */}
          <section className="bg-green-50 border-2 border-green-300 p-6 rounded-xl">
            <h2 className="text-xl font-bold text-green-900 mb-3">Your Consent</h2>
            <p className="text-green-900">
              By using Raksetu, you consent to this Privacy Policy and agree to its terms. If you do not agree, 
              please do not use our services.
            </p>
          </section>

          {/* Disclaimer */}
          <section className="text-sm text-gray-600 border-t pt-6">
            <p>
              This Privacy Policy is governed by the laws of India and complies with applicable data protection 
              regulations including the Information Technology Act, 2000 and related rules.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
