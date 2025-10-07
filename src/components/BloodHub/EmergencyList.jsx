import EmergencyCard from './EmergencyCard';

const emergencyData = [
  { id: 1, bloodType: 'O+', hospital: 'City Medical Center', location: 'Sector 12, Delhi', urgency: 'Critical', timePosted: '10 min ago', distance: '2.3 km', units: 3 },
  { id: 2, bloodType: 'A-', hospital: 'Apollo Hospital', location: 'MG Road, Bangalore', urgency: 'High', timePosted: '25 min ago', distance: '4.1 km', units: 2 },
  { id: 3, bloodType: 'B+', hospital: 'Fortis Healthcare', location: 'Andheri, Mumbai', urgency: 'Medium', timePosted: '45 min ago', distance: '5.6 km', units: 4 },
  { id: 4, bloodType: 'AB+', hospital: 'AIIMS Hospital', location: 'Saket, Delhi', urgency: 'High', timePosted: '32 min ago', distance: '3.7 km', units: 1 },
  { id: 5, bloodType: 'O-', hospital: 'Max Hospital', location: 'Gurgaon', urgency: 'Critical', timePosted: '5 min ago', distance: '8.2 km', units: 2 },
];

export default function EmergencyList({ filteredEmergencies, setViewingEmergency, setSelectedEmergency, setCurrentView }) {
  return (
    <div className="space-y-4">
      {filteredEmergencies.map((emergency) => (
        <EmergencyCard
          key={emergency.id}
          emergency={emergency}
          onClick={() => {
            setSelectedEmergency(emergency);
            setViewingEmergency(true);
            setCurrentView('emergency-detail');
          }}
        />
      ))}
    </div>
  );
}