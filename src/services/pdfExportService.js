import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * PDF Export Service for Blood Donation Certificates
 * 
 * Features:
 * - Professional certificate generation
 * - QR code for verification
 * - Beautiful design with colors
 * - Downloadable PDF format
 */

/**
 * Generate a professional PDF certificate for blood donation
 * @param {Object} userData - User information
 * @param {string} userData.name - User's full name
 * @param {string} userData.bloodType - Blood type (e.g., "A+")
 * @param {number} userData.totalDonations - Number of donations
 * @param {number} userData.totalImpactPoints - Impact points earned
 * @param {string} userData.badgeLabel - Badge level (e.g., "Gold Donor")
 * @returns {boolean} - Success status
 */
export const generatePDFCertificate = (userData) => {
  try {
    // Create new PDF document (A4 landscape for certificate)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Modern color scheme
    const primaryRed = [220, 38, 38]; // #dc2626
    const secondaryRed = [239, 68, 68]; // #ef4444
    const lightRed = [254, 242, 242]; // #fef2f2
    const darkGray = [17, 24, 39]; // #111827
    const mediumGray = [107, 114, 128]; // #6b7280
    const lightGray = [156, 163, 175]; // #9ca3af
    const gold = [251, 191, 36]; // #fbbf24

    // Background gradient effect
    pdf.setFillColor(254, 242, 242);
    pdf.rect(0, 0, pageWidth, pageHeight, 'F');

    // Outer border with gradient effect
    pdf.setDrawColor(...primaryRed);
    pdf.setLineWidth(1.5);
    pdf.rect(15, 15, pageWidth - 30, pageHeight - 30, 'S');
    
    // Inner border
    pdf.setDrawColor(220, 38, 38, 0.3);
    pdf.setLineWidth(0.5);
    pdf.rect(20, 20, pageWidth - 40, pageHeight - 40, 'S');

    // Add badge in top right corner
    const badgeX = pageWidth - 50;
    const badgeY = 25;
    
    pdf.setFillColor(...gold);
    pdf.roundedRect(badgeX - 5, badgeY - 5, 40, 12, 3, 3, 'F');
    
    pdf.setFontSize(9);
    pdf.setTextColor(120, 53, 15); // Dark gold
    pdf.setFont('helvetica', 'bold');
    pdf.text(userData.badgeLabel.toUpperCase(), badgeX + 15, badgeY + 2, { align: 'center' });

    // Add modern logo (heart icon)
    pdf.setFontSize(35);
    pdf.setTextColor(...primaryRed);
    pdf.text('♥', pageWidth / 2 - 10, 40, { align: 'center' });
    
    // Organization name next to logo
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text('RAKSETU', pageWidth / 2 + 15, 42, { align: 'center' });

    // Modern title with large font
    pdf.setFontSize(42);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text('Certificate of Honor', pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('LIFE-SAVING BLOOD DONATION', pageWidth / 2, 70, { align: 'center' });

    // "Presented to" text
    pdf.setFontSize(11);
    pdf.setTextColor(...lightGray);
    pdf.text('This is proudly presented to', pageWidth / 2, 85, { align: 'center' });

    // Recipient name - large and bold
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text(userData.name, pageWidth / 2, 100, { align: 'center' });

    // Underline for name
    pdf.setDrawColor(...primaryRed);
    pdf.setLineWidth(0.8);
    const nameWidth = pdf.getTextWidth(userData.name);
    pdf.line(
      (pageWidth / 2) - (nameWidth / 2),
      102,
      (pageWidth / 2) + (nameWidth / 2),
      102
    );

    // Stats cards (4 boxes)
    const statsY = 115;
    const statsBoxWidth = 50;
    const statsBoxHeight = 22;
    const statsGap = 5;
    const totalStatsWidth = (statsBoxWidth * 4) + (statsGap * 3);
    const startX = (pageWidth - totalStatsWidth) / 2;

    // Donation count
    pdf.setFillColor(...lightRed);
    pdf.roundedRect(startX, statsY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(userData.totalDonations.toString(), startX + statsBoxWidth / 2, statsY + 10, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('YOUR DONATIONS', startX + statsBoxWidth / 2, statsY + 17, { align: 'center' });

    // Blood type
    pdf.setFillColor(...lightRed);
    pdf.roundedRect(startX + statsBoxWidth + statsGap, statsY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(userData.bloodType, startX + statsBoxWidth + statsGap + statsBoxWidth / 2, statsY + 10, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('BLOOD TYPE', startX + statsBoxWidth + statsGap + statsBoxWidth / 2, statsY + 17, { align: 'center' });

    // Lives touched
    pdf.setFillColor(...lightRed);
    pdf.roundedRect(startX + (statsBoxWidth + statsGap) * 2, statsY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text((userData.totalDonations * 3).toString(), startX + (statsBoxWidth + statsGap) * 2 + statsBoxWidth / 2, statsY + 10, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('LIVES TOUCHED', startX + (statsBoxWidth + statsGap) * 2 + statsBoxWidth / 2, statsY + 17, { align: 'center' });

    // Impact points
    pdf.setFillColor(...lightRed);
    pdf.roundedRect(startX + (statsBoxWidth + statsGap) * 3, statsY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');
    pdf.setFontSize(22);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(userData.totalImpactPoints.toString(), startX + (statsBoxWidth + statsGap) * 3 + statsBoxWidth / 2, statsY + 10, { align: 'center' });
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('IMPACT POINTS', startX + (statsBoxWidth + statsGap) * 3 + statsBoxWidth / 2, statsY + 17, { align: 'center' });

    // Certificate message
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    const message1 = 'In recognition of your extraordinary commitment to saving lives through voluntary blood donation.';
    const message2 = 'Your selfless contribution has made a profound impact on countless individuals and families.';
    pdf.text(message1, pageWidth / 2, 148, { align: 'center', maxWidth: pageWidth - 60 });
    pdf.text(message2, pageWidth / 2, 155, { align: 'center', maxWidth: pageWidth - 60 });

    // Footer signatures
    const footerY = pageHeight - 40;

    // Left signature
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text('Dr. Rajesh Kumar', 45, footerY);

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(...primaryRed);
    pdf.line(30, footerY + 3, 85, footerY + 3);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Medical Director', 57.5, footerY + 9, { align: 'center' });
    pdf.text('Raksetu Blood Services', 57.5, footerY + 14, { align: 'center' });

    // Center - Issue date
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...lightGray);
    pdf.text('Issue Date', pageWidth / 2, footerY - 3, { align: 'center' });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text(currentDate, pageWidth / 2, footerY + 4, { align: 'center' });

    // Right signature
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text('Raksetu Foundation', pageWidth - 45, footerY, { align: 'right' });

    pdf.setLineWidth(0.5);
    pdf.setDrawColor(...primaryRed);
    pdf.line(pageWidth - 85, footerY + 3, pageWidth - 30, footerY + 3);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Authorized Signatory', pageWidth - 57.5, footerY + 9, { align: 'center' });
    pdf.text('Ministry of Health', pageWidth - 57.5, footerY + 14, { align: 'center' });

    // Certificate ID at bottom
    const certId = `RAKSETU-${Date.now().toString(36).toUpperCase()}-${userData.name.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...lightGray);
    pdf.text(`Certificate ID: ${certId}`, pageWidth / 2, pageHeight - 18, { align: 'center' });

    // Verification note
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Verify at: raksetu.live/verify', pageWidth / 2, pageHeight - 13, { align: 'center' });

    // Generate filename
    const filename = `Raksetu-Certificate-${userData.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    // Save the PDF
    pdf.save(filename);


/**
 * Generate an annual donation report PDF
 * @param {Object} reportData - Report information
 * @param {string} reportData.userName - User's name
 * @param {string} reportData.bloodType - Blood type
 * @param {number} reportData.year - Report year
 * @param {number} reportData.totalDonations - Total donations in year
 * @param {number} reportData.totalImpactPoints - Total impact points
 * @param {Array} reportData.donations - Array of donation records
 * @returns {boolean} - Success status
 */
export const generateAnnualReport = (reportData) => {
  try {
    // Create new PDF document (A4 portrait for report)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const primaryRed = [196, 30, 58];
    const darkGray = [44, 62, 80];
    const mediumGray = [102, 102, 102];

    // Header
    pdf.setFillColor(...primaryRed);
    pdf.rect(0, 0, pageWidth, 40, 'F');

    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Annual Donation Report', pageWidth / 2, 15, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Year ${reportData.year}`, pageWidth / 2, 25, { align: 'center' });

    pdf.setFontSize(12);
    pdf.text(reportData.userName, pageWidth / 2, 33, { align: 'center' });

    // Summary section
    let yPos = 55;
    
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text('Summary', 20, yPos);

    yPos += 10;

    // Summary boxes
    const boxWidth = (pageWidth - 50) / 3;
    const boxHeight = 25;
    const boxY = yPos;

    // Total Donations
    pdf.setFillColor(255, 240, 240);
    pdf.roundedRect(20, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(reportData.totalDonations.toString(), 20 + boxWidth / 2, boxY + 12, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Total Donations', 20 + boxWidth / 2, boxY + 20, { align: 'center' });

    // Lives Saved
    pdf.setFillColor(255, 240, 240);
    pdf.roundedRect(25 + boxWidth, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text((reportData.totalDonations * 3).toString(), 25 + boxWidth * 1.5, boxY + 12, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Lives Saved', 25 + boxWidth * 1.5, boxY + 20, { align: 'center' });

    // Impact Points
    pdf.setFillColor(255, 240, 240);
    pdf.roundedRect(30 + boxWidth * 2, boxY, boxWidth, boxHeight, 2, 2, 'F');
    
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(reportData.totalImpactPoints.toString(), 30 + boxWidth * 2.5, boxY + 12, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Impact Points', 30 + boxWidth * 2.5, boxY + 20, { align: 'center' });

    yPos += 40;

    // Donation history table
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text('Donation History', 20, yPos);

    yPos += 5;

    // Create table with donation records
    const tableData = reportData.donations.map((donation, index) => [
      (index + 1).toString(),
      donation.date,
      donation.location || 'N/A',
      donation.bloodType || reportData.bloodType,
      donation.status || 'Completed'
    ]);

    pdf.autoTable({
      startY: yPos,
      head: [['#', 'Date', 'Location', 'Blood Type', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: primaryRed,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      styles: {
        fontSize: 9,
        cellPadding: 3
      },
      alternateRowStyles: {
        fillColor: [255, 250, 250]
      },
      margin: { left: 20, right: 20 }
    });

    // Footer
    const finalY = pdf.lastAutoTable.finalY + 20;
    
    pdf.setFillColor(...primaryRed);
    pdf.rect(0, finalY, pageWidth, 30, 'F');

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('Thank you for saving lives!', pageWidth / 2, finalY + 12, { align: 'center' });

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Every donation makes a difference', pageWidth / 2, finalY + 20, { align: 'center' });

    // Generate filename
    const filename = `Raksetu-Annual-Report-${reportData.year}-${reportData.userName.replace(/\s+/g, '-')}.pdf`;

    // Save the PDF
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating annual report:', error);
    alert('Failed to generate annual report. Please try again.');
    return false;
  }
};
