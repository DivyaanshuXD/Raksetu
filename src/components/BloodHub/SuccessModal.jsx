import { CheckCircle, MapPin, Calendar, Clock, User, Gift, Mail } from 'lucide-react';

export default function SuccessModal({ show, setShow, heading, message, details }) {
  if (!show) return null;

  // Parse details if it's a structured object
  const renderContent = () => {
    if (details) {
      // Structured details object
      return (
        <div className="space-y-4">
          {details.eventTitle && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">{details.eventTitle}</h4>
              
              <div className="space-y-2.5 text-left">
                {details.location && (
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{details.location}, {details.city}</span>
                  </div>
                )}
                
                {details.date && (
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{details.date}</span>
                  </div>
                )}
                
                {details.time && (
                  <div className="flex items-start gap-3">
                    <Clock size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{details.time}</span>
                  </div>
                )}
                
                {details.organizer && (
                  <div className="flex items-start gap-3">
                    <User size={18} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{details.organizer}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {details.pointsAwarded && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <Gift size={24} className="text-amber-600" />
                <span className="text-lg font-bold text-amber-900">
                  {details.pointsAwarded} Points Earned!
                </span>
              </div>
            </div>
          )}

          {details.email && (
            <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
              <div className="flex items-start gap-2 text-left">
                <Mail size={16} className="text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-900 font-medium">Event Details Saved</p>
                  <p className="text-xs text-gray-600 mt-0.5">Your registration: {details.email}</p>
                  <p className="text-xs text-gray-500 mt-1">You can view this event in your dashboard</p>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    } else {
      // Plain text message with line break support
      return (
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line text-left">
          {message}
        </p>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="text-center pt-6 pb-4 px-6">
          <div className="h-20 w-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CheckCircle size={44} className="text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{heading}</h3>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
          <button
            onClick={() => setShow(false)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            Got it, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
}