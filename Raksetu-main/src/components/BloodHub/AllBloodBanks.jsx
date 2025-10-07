import { useState, useEffect } from 'react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { calculateDistance } from '../utils/geolocation';
import { MapPin, Phone, ArrowLeft } from 'lucide-react';

export default function AllBloodBanks({ userLocation, setActiveSection }) {
  const [bloodBanks, setBloodBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  useEffect(() => {
    if (userLocation) {
      const bloodBanksQuery = query(collection(db, 'bloodBanks'));
      const unsubscribe = onSnapshot(bloodBanksQuery, (snapshot) => {
        const banks = snapshot.docs.map(doc => {
          const data = doc.data();
          const coordinates = {
            latitude: data.coordinates?.latitude || userLocation.lat,
            longitude: data.coordinates?.longitude || userLocation.lng,
          };
          const distance = calculateDistance(userLocation.lat, userLocation.lng, coordinates.latitude, coordinates.longitude);
          return {
            id: doc.id,
            ...data,
            coordinates,
            distance,
            location: data.address || 'Hyderabad, Telangana',
            displayLocation: `Hyderabad, Telangana (${distance.toFixed(1)} km)`,
            availability: parseAvailability(data.availability),
            state: data.state || 'Telangana',
            district: data.district || 'Hyderabad',
          };
        }).filter(bank => bank.distance <= 100).sort((a, b) => a.distance - b.distance);
        setBloodBanks(banks);
        setLoading(false);
      }, (error) => {
        console.error('Error fetching blood banks:', error);
        setError('Failed to load blood banks.');
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [userLocation]);

  const parseAvailability = (availabilityString) => {
    if (!availabilityString || availabilityString.includes('Not Available')) return {};
    const entries = availabilityString.split(',').map(item => {
      const [type, count] = item.trim().split(':');
      return [type.replace('Ve', ''), parseInt(count) || 0];
    });
    return Object.fromEntries(entries);
  };

  const filteredBloodBanks = bloodBanks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bank.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesState = stateFilter ? bank.state === stateFilter : true;
    const matchesDistrict = districtFilter ? bank.district === districtFilter : true;
    return matchesSearch && matchesState && matchesDistrict;
  });

  const states = [...new Set(bloodBanks.map(bank => bank.state))];
  const districts = [...new Set(bloodBanks.map(bank => bank.district))];

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setActiveSection('donate')}
            className="flex items-center text-red-600 hover:text-red-800 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" /> Back to Donate
          </button>
          <h2 className="text-3xl font-bold text-center flex-1">All Nearby Blood Banks</h2>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>

        <div className="text-center mb-10">
          <p className="text-gray-600 max-w-3xl mx-auto">
            Find blood banks near your location. Use the search and filters to find the right one for you.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg mb-6 flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by name or location..."
            className="flex-1 border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={stateFilter}
            onChange={(e) => setStateFilter(e.target.value)}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
          >
            <option value="">All Districts</option>
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mb-2"></div>
            <p>Loading blood banks...</p>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600">
            <p>{error}</p>
          </div>
        ) : filteredBloodBanks.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">No blood banks found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
            {filteredBloodBanks.map((bank) => (
              <div key={bank.id} className="bg-white p-4 rounded-xl shadow-sm">
                <h4 className="font-medium mb-1">{bank.name}</h4>
                <div className="flex items-center text-sm text-gray-500 mb-1">
                  <MapPin size={14} className="mr-1" /> {bank.displayLocation}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  <Phone size={14} className="mr-1 inline" /> {bank.contactPhone || 'Not available'}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Email: {bank.email || 'Not available'}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Category: {bank.category}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  Type: {bank.type}
                </div>

                <div className="mb-3">
                  <div className="text-sm font-medium mb-2">Blood Availability:</div>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(bank.availability || {}).map(([type, count]) => (
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
                  <button
                    onClick={() => {
                      setActiveSection('donate');
                      // You might want to pass the selected bank to schedule a visit
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Schedule Visit
                  </button>
                  <a href={`tel:${bank.contactPhone || '1234567890'}`} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                    <Phone size={16} />
                  </a>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${bank.coordinates.latitude},${bank.coordinates.longitude}`} target="_blank" rel="noopener noreferrer" className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors">
                    <MapPin size={16} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}