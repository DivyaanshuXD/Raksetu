import React from 'react';
import { CheckCircle, X, Mail, Phone, Building2, Calendar, Sparkles } from 'lucide-react';

export default function PartnershipSuccessModal({ show, setShow, details }) {
  if (!show || !details) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-8 rounded-t-2xl text-center relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)',
              backgroundSize: '40px 40px'
            }}></div>
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4">
              <CheckCircle size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-green-100 text-lg">
              Thank you for your interest in partnering with Raksetu
            </p>
          </div>

          <button
            onClick={() => setShow(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Application Summary */}
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Building2 size={20} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">Organization</p>
                <p className="text-lg font-bold text-gray-900">{details.organizationName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Partnership Type</p>
                <p className="text-sm font-semibold text-gray-900">{details.partnershipTier}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Fee</p>
                <p className="text-sm font-semibold text-green-600">{details.fee}</p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 mb-6">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-500" />
              What Happens Next?
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-green-100 text-green-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Application Review</p>
                  <p className="text-xs text-gray-600">Our team will review your application within 2-3 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-teal-100 text-teal-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Verification Call</p>
                  <p className="text-xs text-gray-600">We'll schedule a brief call to discuss your goals and expectations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Partnership Activation</p>
                  <p className="text-xs text-gray-600">Once approved, you'll get access to all partnership benefits</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm font-semibold text-gray-900 mb-3">We'll contact you at:</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Mail size={16} className="text-gray-400" />
                <span>{details.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Phone size={16} className="text-gray-400" />
                <span>{details.phone}</span>
              </div>
            </div>
          </div>

          {/* Application ID */}
          <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-100 mb-1">Application ID</p>
                <p className="font-mono font-bold">{details.applicationId}</p>
              </div>
              <div className="bg-white/20 p-2 rounded-lg">
                <Calendar size={20} />
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="text-center text-sm text-gray-600 mb-6">
            <p>A confirmation email has been sent to <span className="font-semibold text-gray-900">{details.email}</span></p>
          </div>

          {/* Action Button */}
          <button
            onClick={() => setShow(false)}
            className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3.5 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            Got it, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
