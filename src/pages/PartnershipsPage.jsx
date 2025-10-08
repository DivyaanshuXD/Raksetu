import React from 'react';
import { Handshake, ArrowLeft, Building2, Heart, Users, TrendingUp, CheckCircle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PartnershipsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Handshake size={32} />
            </div>
            <h1 className="text-4xl font-bold">Partnerships</h1>
          </div>
          <p className="text-red-100 text-lg max-w-3xl">
            Join us in saving lives - Partner with Raksetu to make blood donation accessible to everyone
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          <p className="text-gray-700 text-lg">
            At Raksetu, we believe that collaboration is key to saving more lives. We partner with hospitals, blood banks, 
            NGOs, corporations, and educational institutions to create a sustainable ecosystem for blood donation in India.
          </p>

          {/* Partnership Types */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-blue-600" size={28} />
              1. Partnership Opportunities
            </h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <Heart size={20} />
                  Blood Banks & Hospitals
                </h3>
                <p className="text-gray-700 mb-3">
                  Register your blood bank or hospital on our platform to reach thousands of potential donors.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>Free listing on our platform</li>
                  <li>Real-time inventory management</li>
                  <li>Direct donor matching during emergencies</li>
                  <li>Dedicated support and training</li>
                  <li>Analytics dashboard for better planning</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                  <Users size={20} />
                  Corporate Partnerships
                </h3>
                <p className="text-gray-700 mb-3">
                  Engage your employees in life-saving activities through corporate blood donation camps.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>Organize on-site blood donation drives</li>
                  <li>Employee wellness programs</li>
                  <li>CSR initiative alignment</li>
                  <li>Custom branding and recognition</li>
                  <li>Impact reports and certificates</li>
                </ul>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <TrendingUp size={20} />
                  Educational Institutions
                </h3>
                <p className="text-gray-700 mb-3">
                  Partner with us to create awareness and organize blood donation camps on campus.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>Student volunteer programs</li>
                  <li>Awareness campaigns and workshops</li>
                  <li>Inter-college donation competitions</li>
                  <li>Recognition and certificates for participants</li>
                  <li>Free educational resources</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  <Heart size={20} />
                  NGOs & Community Organizations
                </h3>
                <p className="text-gray-700 mb-3">
                  Collaborate with us to expand your reach and impact in saving lives.
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700">
                  <li>Joint blood donation drives</li>
                  <li>Community outreach programs</li>
                  <li>Resource sharing and support</li>
                  <li>Volunteer mobilization</li>
                  <li>Co-branded initiatives</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Benefits of Partnership */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={28} />
              2. Benefits of Partnering with Raksetu
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Increased Visibility:</strong> Reach over 50,000+ registered donors across India
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Technology Platform:</strong> Access to our advanced donor management and matching system
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Real-time Coordination:</strong> Instant notifications and emergency blood request management
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Data & Analytics:</strong> Comprehensive reports on donation trends and impact metrics
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Marketing Support:</strong> Co-branded campaigns and social media promotion
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Training & Resources:</strong> Free training materials and best practice guides
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <strong>Community Impact:</strong> Be recognized as a life-saving organization in your community
                  </div>
                </li>
              </ul>
            </div>
          </section>

          {/* Our Partners */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="text-red-600" size={28} />
              3. Our Growing Network
            </h2>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
              <p className="text-gray-700 mb-4">
                Raksetu has partnered with over <strong>1,200+ blood banks</strong> and <strong>500+ hospitals</strong> across India. 
                Together, we have facilitated <strong>100,000+ successful blood donations</strong> and saved countless lives.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">1,200+</div>
                  <div className="text-gray-600 text-sm">Blood Banks</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">500+</div>
                  <div className="text-gray-600 text-sm">Hospitals</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-red-600">100K+</div>
                  <div className="text-gray-600 text-sm">Donations</div>
                </div>
              </div>
            </div>
          </section>

          {/* How to Partner */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Handshake className="text-purple-600" size={28} />
              4. How to Become a Partner
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Getting started is simple:</p>
              <ol className="list-decimal list-inside space-y-3 ml-4">
                <li>
                  <strong>Contact Us:</strong> Reach out via email or phone to express your interest
                </li>
                <li>
                  <strong>Initial Discussion:</strong> We'll schedule a call to understand your requirements and goals
                </li>
                <li>
                  <strong>Partnership Agreement:</strong> Sign a simple partnership agreement (typically takes 1-2 days)
                </li>
                <li>
                  <strong>Onboarding:</strong> Our team will help you set up your profile and train your staff
                </li>
                <li>
                  <strong>Go Live:</strong> Start connecting with donors and making an impact!
                </li>
              </ol>
              <p className="mt-4">
                The entire process typically takes <strong>3-5 business days</strong> from initial contact to going live.
              </p>
            </div>
          </section>

          {/* Partnership Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="text-blue-600" size={28} />
              5. Partnership Terms
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All partnerships are <strong>free of cost</strong> for blood banks, hospitals, and NGOs</li>
                <li>Corporate partnerships may involve customized packages based on requirements</li>
                <li>Partners must comply with all applicable medical and data protection regulations</li>
                <li>Raksetu reserves the right to terminate partnerships that violate our code of conduct</li>
                <li>Partners agree to provide accurate information about blood availability and services</li>
                <li>Both parties commit to promoting ethical blood donation practices</li>
              </ul>
            </div>
          </section>

          {/* Contact Information */}
          <section className="border-t-2 border-gray-200 pt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="text-red-600" size={28} />
              Get in Touch
            </h2>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl">
              <p className="text-gray-700 mb-4">
                Ready to save lives together? Contact our partnerships team:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Email:</strong> <a href="mailto:partnerships@raksetu.live" className="text-red-600 hover:underline">partnerships@raksetu.live</a></p>
                <p><strong>Phone:</strong> +91-XXXX-XXXXXX (Mon-Fri, 9 AM - 6 PM IST)</p>
                <p><strong>Address:</strong> Raksetu Technologies, India</p>
              </div>
              <div className="mt-6">
                <a 
                  href="mailto:partnerships@raksetu.live"
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  <Mail size={20} />
                  Contact Partnerships Team
                </a>
              </div>
            </div>
          </section>

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-8 rounded-xl text-center">
            <h3 className="text-2xl font-bold mb-3">Join the Raksetu Movement</h3>
            <p className="text-red-100 mb-6">
              Together, we can build a future where no one dies due to blood unavailability
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/"
                className="bg-white text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Explore Platform
              </Link>
              <a
                href="mailto:partnerships@raksetu.live"
                className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Become a Partner
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
