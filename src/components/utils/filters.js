export const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  export const filterEmergencies = (emergencies, filterType, filterValue) => {
    if (!filterValue || filterValue === 'All') return emergencies;
    
    return emergencies.filter((emergency) => {
      switch (filterType) {
        case 'bloodType':
          return emergency.bloodType === filterValue;
        case 'urgency':
          return emergency.urgency === filterValue;
        case 'location':
          return emergency.location.toLowerCase().includes(filterValue.toLowerCase());
        default:
          return true;
      }
    });
  };