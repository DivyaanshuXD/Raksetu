import { MapPin, Phone } from 'lucide-react';

export default function BloodBankList({ bloodBanks }) {
  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-4">Nearby Blood Banks</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bloodBanks.map((bank) => (
          <div key={bank.id} className="bg-white p-4 rounded-xl shadow-sm">
            <h4 className="font-medium mb-1">{bank.name}</h4>
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <MapPin size={14} className="mr-1" /> {bank.location} ({bank.distance})
            </div>
            <div className="mb-3">
              <div className="text-sm font-medium mb-2">Blood Availability:</div>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(bank.availability).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div
                      className={`text-sm font-bold rounded-full w-8 h-8 mx-auto flex items-center justify-center ${
                        count < 5 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {type}
                    </div>
                    <div className="text-xs mt-1">{count} units</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Schedule Visit
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                <Phone size={16} />
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                <MapPin size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}