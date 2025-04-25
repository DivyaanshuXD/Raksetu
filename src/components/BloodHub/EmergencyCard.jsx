import { MapPin } from 'lucide-react';

export default function EmergencyCard({ emergency, onClick }) {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 text-red-600 font-bold text-xl h-12 w-12 rounded-full flex items-center justify-center">
            {emergency.bloodType}
          </div>
          <div>
            <h4 className="font-medium text-gray-800 text-lg">{emergency.hospital}</h4>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={14} className="mr-1" /> {emergency.location}
            </div>
          </div>
        </div>
        <span className={`text-sm px-2 py-1 rounded-full ${getUrgencyColor(emergency.urgency)}`}>
          {emergency.urgency}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-b border-gray-100 py-3">
        <div>
          <div className="text-gray-500 text-xs">Units</div>
          <div className="font-semibold">{emergency.units}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Distance</div>
          <div className="font-semibold">{emergency.distance}</div>
        </div>
        <div>
          <div className="text-gray-500 text-xs">Posted</div>
          <div className="font-semibold">{emergency.timePosted}</div>
        </div>
      </div>
    </div>
  );
}