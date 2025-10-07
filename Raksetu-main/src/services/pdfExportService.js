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
 * @param {string} userData.badgeLabel - Badge level (e.g., "Platinum Lifesaver")
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

    // Colors
    const primaryRed = [196, 30, 58]; // #c41e3a
    const lightRed = [255, 240, 240];
    const darkGray = [44, 62, 80];
    const mediumGray = [102, 102, 102];
    const gold = [255, 215, 0];

    // Add decorative border
    pdf.setDrawColor(...primaryRed);
    pdf.setLineWidth(2);
    pdf.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');
    
    pdf.setLineWidth(0.5);
    pdf.rect(12, 12, pageWidth - 24, pageHeight - 24, 'S');

    // Add corner decorations (small circles)
    pdf.setFillColor(...primaryRed);
    const cornerSize = 3;
    // Top left
    pdf.circle(15, 15, cornerSize, 'F');
    // Top right
    pdf.circle(pageWidth - 15, 15, cornerSize, 'F');
    // Bottom left
    pdf.circle(15, pageHeight - 15, cornerSize, 'F');
    // Bottom right
    pdf.circle(pageWidth - 15, pageHeight - 15, cornerSize, 'F');

    // Add badge in top right corner
    const badgeX = pageWidth - 45;
    const badgeY = 25;
    
    // Badge background
    let badgeColor;
    switch (userData.badgeLabel) {
      case 'Platinum Lifesaver':
        badgeColor = [230, 230, 250]; // Lavender
        break;
      case 'Gold Lifesaver':
        badgeColor = [255, 215, 0]; // Gold
        break;
      case 'Emergency Hero':
        badgeColor = [135, 206, 235]; // Sky blue
        break;
      default:
        badgeColor = [144, 238, 144]; // Light green
    }
    
    pdf.setFillColor(...badgeColor);
    pdf.roundedRect(badgeX, badgeY - 5, 35, 10, 2, 2, 'F');
    
    pdf.setFontSize(8);
    pdf.setTextColor(...darkGray);
    pdf.setFont('helvetica', 'bold');
    pdf.text(userData.badgeLabel.toUpperCase(), badgeX + 17.5, badgeY, { align: 'center' });

    // Add logo/icon (heart shape using text)
    pdf.setFontSize(40);
    pdf.setTextColor(...primaryRed);
    pdf.text('♥', pageWidth / 2, 35, { align: 'center' });

    // Add title
    pdf.setFontSize(32);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text('Certificate of Appreciation', pageWidth / 2, 50, { align: 'center' });

    // Add subtitle
    pdf.setFontSize(14);
    pdf.setFont('times', 'italic');
    pdf.setTextColor(...mediumGray);
    pdf.text('For Outstanding Service in Blood Donation', pageWidth / 2, 58, { align: 'center' });

    // Add "This is to certify that"
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('This is to certify that', pageWidth / 2, 75, { align: 'center' });

    // Add recipient name
    pdf.setFontSize(28);
    pdf.setFont('times', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text(userData.name, pageWidth / 2, 88, { align: 'center' });

    // Add underline for name
    pdf.setDrawColor(...primaryRed);
    pdf.setLineWidth(0.5);
    const nameWidth = pdf.getTextWidth(userData.name);
    pdf.line(
      (pageWidth / 2) - (nameWidth / 2),
      90,
      (pageWidth / 2) + (nameWidth / 2),
      90
    );

    // Add description
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...darkGray);
    const description = [
      'Has demonstrated exceptional commitment to saving lives through voluntary blood donation.',
      'Your selfless contribution has made a significant impact on our community and has helped',
      'provide life-saving blood to those in critical need.'
    ];
    
    let descY = 105;
    description.forEach(line => {
      pdf.text(line, pageWidth / 2, descY, { align: 'center' });
      descY += 6;
    });

    // Add statistics box
    const statsY = 128;
    const statsBoxWidth = 180;
    const statsBoxHeight = 25;
    const statsBoxX = (pageWidth - statsBoxWidth) / 2;

    // Background for stats
    pdf.setFillColor(...lightRed);
    pdf.roundedRect(statsBoxX, statsY, statsBoxWidth, statsBoxHeight, 3, 3, 'F');

    // Stats columns
    const statWidth = statsBoxWidth / 3;
    const statY = statsY + 10;

    // Donation count
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(userData.totalDonations.toString(), statsBoxX + statWidth / 2, statY, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('DONATIONS', statsBoxX + statWidth / 2, statY + 6, { align: 'center' });

    // Lives touched
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text((userData.totalDonations * 3).toString(), statsBoxX + statWidth * 1.5, statY, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('LIVES TOUCHED', statsBoxX + statWidth * 1.5, statY + 6, { align: 'center' });

    // Blood type
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...primaryRed);
    pdf.text(userData.bloodType, statsBoxX + statWidth * 2.5, statY, { align: 'center' });
    
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('BLOOD TYPE', statsBoxX + statWidth * 2.5, statY + 6, { align: 'center' });

    // Add footer with signatures
    const footerY = pageHeight - 35;

    // Left signature
    pdf.setFontSize(16);
    pdf.setFont('brush script mt', 'italic');
    pdf.setTextColor(...darkGray);
    pdf.text('Raksetu', 40, footerY);

    pdf.setLineWidth(0.3);
    pdf.setDrawColor(...primaryRed);
    pdf.line(30, footerY + 2, 70, footerY + 2);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Medical Director', 50, footerY + 8, { align: 'center' });
    pdf.text('Raksetu Blood Hub', 50, footerY + 13, { align: 'center' });

    // Right date section
    const dateX = pageWidth - 50;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text('Date of Issue', dateX, footerY);

    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...darkGray);
    pdf.text(currentDate, dateX, footerY + 6);

    // Add certificate ID (bottom center)
    const certId = `CERT-${Date.now()}-${userData.name.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(...mediumGray);
    pdf.text(`Certificate ID: ${certId}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Add verification note
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'italic');
    pdf.text('This certificate can be verified at raksetu.org/verify', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Generate filename
    const filename = `Raksetu-Certificate-${userData.name.replace(/\s+/g, '-')}-${Date.now()}.pdf`;

    // Save the PDF
    pdf.save(filename);

    return true;
  } catch (error) {
    console.error('Error generating PDF certificate:', error);
    alert('Failed to generate PDF certificate. Please try again.');
    return false;
  }
};

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
