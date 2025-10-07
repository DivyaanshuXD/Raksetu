import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission (Firebase or email service)
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }, 3000);
  };

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
              <MessageCircle size={32} />
            </div>
            <h1 className="text-4xl font-bold">Contact Us</h1>
          </div>
          <p className="text-red-100 text-lg max-w-3xl">
            We're here to help! Reach out with questions, support requests, or feedback.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          
          {/* Contact Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {/* Email */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Mail className="text-blue-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-600 mb-4">Send us an email anytime</p>
              <div className="space-y-2">
                <a href="mailto:support@raksetu.live" className="block text-blue-600 hover:underline">
                  support@raksetu.live
                </a>
                <a href="mailto:privacy@raksetu.live" className="block text-blue-600 hover:underline text-sm">
                  privacy@raksetu.live (Privacy)
                </a>
                <a href="mailto:legal@raksetu.live" className="block text-blue-600 hover:underline text-sm">
                  legal@raksetu.live (Legal)
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Phone className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Call Us</h3>
              <p className="text-gray-600 mb-4">Mon-Sat: 9 AM - 6 PM IST</p>
              <div className="space-y-2">
                <p className="text-green-600 font-semibold text-lg">+91-XXXX-XXXXXX</p>
                <p className="text-gray-500 text-sm">Toll-Free: 1800-XXX-XXXX</p>
                <p className="text-red-600 text-sm font-medium">Emergency: Available 24/7</p>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-purple-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Us</h3>
              <p className="text-gray-600 mb-4">Our office location</p>
              <address className="text-gray-700 not-italic">
                [Company Name]<br />
                [Street Address]<br />
                [City, State - PIN]<br />
                India
              </address>
            </div>
          </div>

          {/* Support Hours */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6 mb-12 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="text-blue-600" size={28} />
              <h2 className="text-2xl font-bold text-gray-900">Support Hours</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">General Support</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM IST</li>
                  <li><strong>Saturday:</strong> 9:00 AM - 2:00 PM IST</li>
                  <li><strong>Sunday:</strong> Closed</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-2">Emergency Support</h3>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Blood Emergencies:</strong> 24/7 Available</li>
                  <li><strong>Platform Issues:</strong> 24/7 Automated</li>
                  <li><strong>Critical Queries:</strong> 24/7 On-Call</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form & FAQ */}
          <div className="grid lg:grid-cols-5 gap-8">
            
            {/* Contact Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Send className="text-red-600" size={28} />
                Send Us a Message
              </h2>

              {submitted ? (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-8 text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-900 mb-2">Message Sent!</h3>
                  <p className="text-green-700">
                    Thank you for contacting us. We'll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="+91-XXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Subject *</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="event">Event Hosting</option>
                        <option value="payment">Payment Issue</option>
                        <option value="partnership">Partnership</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Message *</label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                      placeholder="Tell us how we can help..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-4 rounded-lg font-semibold hover:from-red-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send size={20} />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Quick FAQ */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Help</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">I need urgent blood</h4>
                    <p className="text-sm text-gray-600">
                      Use our Emergency Request feature on the home page. Our team monitors this 24/7.
                    </p>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Payment failed</h4>
                    <p className="text-sm text-gray-600">
                      Check your bank account. If amount was deducted, it will be refunded in 5-7 days.
                    </p>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Event hosting issues</h4>
                    <p className="text-sm text-gray-600">
                      Email <a href="mailto:support@raksetu.live" className="text-purple-600 hover:underline">support@raksetu.live</a> with your event ID.
                    </p>
                  </div>
                  <div className="border-l-4 border-orange-500 pl-4">
                    <h4 className="font-semibold text-gray-900 mb-1">Account issues</h4>
                    <p className="text-sm text-gray-600">
                      Try resetting your password. Still stuck? Contact us with your registered email.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl shadow-lg p-6 border-2 border-red-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Response Time</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-green-500 w-3 h-3 rounded-full mt-1"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Email</p>
                      <p className="text-sm text-gray-600">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500 w-3 h-3 rounded-full mt-1"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">Immediate (during hours)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-500 w-3 h-3 rounded-full mt-1"></div>
                    <div>
                      <p className="font-semibold text-gray-900">Emergency</p>
                      <p className="text-sm text-gray-600">Within 15 minutes</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">Social Media</h3>
                <p className="text-gray-600 text-sm mb-4">Connect with us on social platforms</p>
                <div className="flex gap-3">
                  <a href="#" className="bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                  <a href="#" className="bg-blue-400 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </a>
                  <a href="#" className="bg-pink-500 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
