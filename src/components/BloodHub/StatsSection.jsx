const donorStats = [
    { label: 'Lives Saved', value: '124,532' },
    { label: 'Donors', value: '58,271' },
    { label: 'Hospitals', value: '1,230' },
    { label: 'Emergencies Resolved', value: '28,471' },
  ];
  
  export default function StatsSection() {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-4">
            {donorStats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-red-50 rounded-xl">
                <div className="text-3xl font-bold text-red-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }