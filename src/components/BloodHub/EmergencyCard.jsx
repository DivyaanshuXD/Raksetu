import { MapPin } from 'lucide-react';

export default function EmergencyCard({ emergency, onClick, compact = false }) {
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
      className={`bg-white ${compact ? 'p-3' : 'p-4'} rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
          <div className={`bg-red-100 text-red-600 font-bold ${compact ? 'text-lg h-10 w-10' : 'text-xl h-12 w-12'} rounded-full flex items-center justify-center`}>
            {emergency.bloodType}
          </div>
          <div>
            <h4 className={`font-medium text-gray-800 ${compact ? 'text-base' : 'text-lg'}`}>{emergency.hospital}</h4>
            <div className="flex items-center text-sm text-gray-500">
              <MapPin size={compact ? 12 : 14} className="mr-1" /> {emergency.location}
            </div>
          </div>
        </div>
        <span className={`${compact ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'} rounded-full ${getUrgencyColor(emergency.urgency)}`}>
          {emergency.urgency}
        </span>
      </div>
      <div className={`mt-${compact ? '3' : '4'} grid grid-cols-3 gap-2 text-center border-t border-b border-gray-100 ${compact ? 'py-2' : 'py-3'}`}>
        <div>
          <div className={`text-gray-500 ${compact ? 'text-2xs' : 'text-xs'}`}>Units</div>
          <div className={`font-semibold ${compact ? 'text-sm' : ''}`}>{emergency.units}</div>
        </div>
        <div>
          <div className={`text-gray-500 ${compact ? 'text-2xs' : 'text-xs'}`}>Distance</div>
          <div className={`font-semibold ${compact ? 'text-sm' : ''}`}>{emergency.distance}</div>
        </div>
        <div>
          <div className={`text-gray-500 ${compact ? 'text-2xs' : 'text-xs'}`}>Posted</div>
          <div className={`font-semibold ${compact ? 'text-sm' : ''}`}>{emergency.timePosted}</div>
        </div>
      </div>
    </div>
  );
}