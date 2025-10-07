/**
 * CSV Export Service
 * Handles exporting data to CSV format for download
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header labels
 * @returns {string} - CSV string
 */
const arrayToCSV = (data, headers) => {
  if (!data || data.length === 0) return '';

  // Create header row
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value).replace(/"/g, '""');
      return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of the file to download
 */
const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export donation history to CSV
 * @param {Array} donations - Array of donation objects
 * @param {string} userName - User's name for filename
 * @returns {boolean} - Success status
 */
export const exportDonationHistoryCSV = (donations, userName = 'User') => {
  try {
    if (!donations || donations.length === 0) {
      alert('No donation history to export');
      return false;
    }

    const headers = ['date', 'bloodType', 'location', 'status', 'impactPoints', 'type'];
    
    const formattedData = donations.map(donation => ({
      date: donation.date?.toDate ? donation.date.toDate().toLocaleDateString() : donation.date || 'N/A',
      bloodType: donation.bloodType || 'N/A',
      location: donation.location || donation.hospital || 'N/A',
      status: donation.status || 'Completed',
      impactPoints: donation.impactPoints || 0,
      type: donation.type || 'Regular'
    }));

    const csvContent = arrayToCSV(formattedData, headers);
    const filename = `Raksetu-Donation-History-${userName.replace(/\s+/g, '-')}-${Date.now()}.csv`;
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting donation history:', error);
    alert('Failed to export donation history');
    return false;
  }
};

/**
 * Export emergency requests to CSV
 * @param {Array} emergencies - Array of emergency request objects
 * @returns {boolean} - Success status
 */
export const exportEmergencyRequestsCSV = (emergencies) => {
  try {
    if (!emergencies || emergencies.length === 0) {
      alert('No emergency requests to export');
      return false;
    }

    const headers = ['patientName', 'bloodType', 'hospital', 'contactPhone', 'status', 'urgency', 'createdAt'];
    
    const formattedData = emergencies.map(emergency => ({
      patientName: emergency.patientName || 'N/A',
      bloodType: emergency.bloodType || 'N/A',
      hospital: emergency.hospital || emergency.location || 'N/A',
      contactPhone: emergency.contactPhone || 'N/A',
      status: emergency.status || 'Pending',
      urgency: emergency.urgency || 'Medium',
      createdAt: emergency.createdAt?.toDate ? emergency.createdAt.toDate().toLocaleString() : 'N/A'
    }));

    const csvContent = arrayToCSV(formattedData, headers);
    const filename = `Raksetu-Emergency-Requests-${Date.now()}.csv`;
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting emergency requests:', error);
    alert('Failed to export emergency requests');
    return false;
  }
};

/**
 * Export blood banks to CSV
 * @param {Array} bloodBanks - Array of blood bank objects
 * @returns {boolean} - Success status
 */
export const exportBloodBanksCSV = (bloodBanks) => {
  try {
    if (!bloodBanks || bloodBanks.length === 0) {
      alert('No blood banks to export');
      return false;
    }

    const headers = ['name', 'address', 'phone', 'email', 'status', 'verified'];
    
    const formattedData = bloodBanks.map(bank => ({
      name: bank.name || 'N/A',
      address: bank.address || 'N/A',
      phone: bank.phone || 'N/A',
      email: bank.email || 'N/A',
      status: bank.status || 'Active',
      verified: bank.verified ? 'Yes' : 'No'
    }));

    const csvContent = arrayToCSV(formattedData, headers);
    const filename = `Raksetu-Blood-Banks-${Date.now()}.csv`;
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting blood banks:', error);
    alert('Failed to export blood banks');
    return false;
  }
};

/**
 * Export users to CSV (Admin only)
 * @param {Array} users - Array of user objects
 * @returns {boolean} - Success status
 */
export const exportUsersCSV = (users) => {
  try {
    if (!users || users.length === 0) {
      alert('No users to export');
      return false;
    }

    const headers = ['name', 'email', 'bloodType', 'role', 'totalDonations', 'createdAt'];
    
    const formattedData = users.map(user => ({
      name: user.name || 'N/A',
      email: user.email || 'N/A',
      bloodType: user.bloodType || 'N/A',
      role: user.role || 'donor',
      totalDonations: user.totalDonations || 0,
      createdAt: user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'
    }));

    const csvContent = arrayToCSV(formattedData, headers);
    const filename = `Raksetu-Users-${Date.now()}.csv`;
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting users:', error);
    alert('Failed to export users');
    return false;
  }
};

/**
 * Export testimonials to CSV
 * @param {Array} testimonials - Array of testimonial objects
 * @returns {boolean} - Success status
 */
export const exportTestimonialsCSV = (testimonials) => {
  try {
    if (!testimonials || testimonials.length === 0) {
      alert('No testimonials to export');
      return false;
    }

    const headers = ['userName', 'message', 'createdAt'];
    
    const formattedData = testimonials.map(testimonial => ({
      userName: testimonial.userName || 'Anonymous',
      message: testimonial.message || '',
      createdAt: testimonial.createdAt?.toDate ? testimonial.createdAt.toDate().toLocaleString() : 'N/A'
    }));

    const csvContent = arrayToCSV(formattedData, headers);
    const filename = `Raksetu-Testimonials-${Date.now()}.csv`;
    
    downloadCSV(csvContent, filename);
    return true;
  } catch (error) {
    console.error('Error exporting testimonials:', error);
    alert('Failed to export testimonials');
    return false;
  }
};
