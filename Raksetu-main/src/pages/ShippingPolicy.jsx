import React from 'react';
import { Truck, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ShippingPolicy() {
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
              <Truck size={32} />
            </div>
            <h1 className="text-4xl font-bold">Shipping & Delivery Policy</h1>
          </div>
          <p className="text-red-100 text-lg max-w-3xl">
            Last Updated: January 7, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Info size={24} className="text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-blue-900 mb-2">Important Notice</h2>
                <p className="text-blue-800">
                  Raksetu is a <strong>digital platform</strong> that connects blood donors, recipients, and organizes 
                  community events. We do <strong>not sell</strong> or <strong>ship physical products</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* What We Provide */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Provide</h2>
            <div className="space-y-4 text-gray-700">
              <p>Raksetu offers the following services:</p>
              
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h3 className="font-semibold text-red-900 mb-2">🩸 Blood Bank Locator</h3>
                  <p className="text-sm">Find and connect with blood banks near you</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-2">🆘 Emergency Assistance</h3>
                  <p className="text-sm">Request urgent blood requirements</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-2">📅 Appointment Booking</h3>
                  <p className="text-sm">Schedule blood donation appointments</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-2">🎪 Community Events</h3>
                  <p className="text-sm">Host or participate in blood donation drives</p>
                </div>
              </div>
            </div>
          </section>

          {/* Digital Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Digital Services Delivery</h2>
            <div className="space-y-4 text-gray-700">
              <p>All services on Raksetu are delivered digitally and instantly:</p>
              
              <ul className="list-disc list-inside space-y-3 ml-4">
                <li>
                  <strong>Account Access:</strong> Immediate upon registration
                </li>
                <li>
                  <strong>Event Hosting:</strong> Available immediately after payment confirmation (for paid tiers)
                </li>
                <li>
                  <strong>Appointment Confirmations:</strong> Sent via email/SMS instantly
                </li>
                <li>
                  <strong>Event Registrations:</strong> Processed in real-time
                </li>
                <li>
                  <strong>Points & Rewards:</strong> Credited immediately to your account
                </li>
              </ul>
            </div>
          </section>

          {/* No Physical Shipping */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Physical Shipping</h2>
            <div className="space-y-3 text-gray-700">
              <p>Since Raksetu is a digital platform:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We do not ship any physical products</li>
                <li>No delivery charges apply</li>
                <li>No tracking numbers are issued</li>
                <li>No physical goods are couriered</li>
              </ul>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
                <p className="text-yellow-900">
                  <strong>Note:</strong> Raksetu does NOT transport, ship, or deliver blood or blood products. 
                  We connect users with blood banks and healthcare facilities who handle all medical procedures 
                  according to regulatory guidelines.
                </p>
              </div>
            </div>
          </section>

          {/* Event Materials */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Materials (Optional)</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                For users hosting community events through our platform, we may offer optional promotional materials 
                in the future:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Digital posters and banners (downloadable)</li>
                <li>Event certificates (digital)</li>
                <li>Registration confirmations (email/SMS)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-4">
                * Any physical promotional materials (if offered in future) will be subject to separate terms and delivery policies.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
            <div className="space-y-3 text-gray-700">
              <p>Our platform is available:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Geographic Coverage:</strong> Pan-India (all states and union territories)</li>
                <li><strong>Operating Hours:</strong> 24/7 online access</li>
                <li><strong>Support Hours:</strong> Monday-Saturday, 9 AM - 6 PM IST</li>
                <li><strong>Emergency Features:</strong> Available round the clock</li>
              </ul>
            </div>
          </section>

          {/* Payment & Access */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment & Service Access</h2>
            <div className="space-y-3 text-gray-700">
              <p>For paid services (Event Hosting - Plus/Pro tiers):</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payment is processed securely through Razorpay</li>
                <li>Service access is granted immediately upon successful payment</li>
                <li>No waiting period or shipping time</li>
                <li>Instant activation of tier features</li>
              </ul>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-2 border-red-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about our services or this policy, please contact us:
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
              This Shipping & Delivery Policy applies to all services provided by Raksetu. We reserve the right 
              to update this policy at any time. Changes will be posted on this page with an updated revision date.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
