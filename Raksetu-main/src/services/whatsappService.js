/**
 * WhatsApp Notification Service
 * Handles WhatsApp notifications via backend API
 * 
 * Features:
 * - Send WhatsApp messages to emergency creators
 * - Forward chat messages via WhatsApp
 * - Rich formatting with emojis and structured content
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Send WhatsApp message using backend API
 * @param {string} toPhone - Recipient phone number (E.164 format)
 * @param {string} message - WhatsApp message text
 */
const sendWhatsApp = async (toPhone, message) => {
  try {
    // Validate phone number
    if (!toPhone) {
      logger.warn('⚠️  No phone number provided for WhatsApp');
      return { success: false, error: 'No phone number provided' };
    }

    // Remove whatsapp: prefix if present, validate E.164 format, then add back
    const cleanPhone = toPhone.replace('whatsapp:', '');
    
    // Validate E.164 format
    if (!cleanPhone.startsWith('+')) {
      logger.error('❌ Invalid phone number format for WhatsApp:', cleanPhone);
      return { success: false, error: 'Phone number must be in E.164 format' };
    }

    // Validate phone number has at least 10 digits after +
    const digitsOnly = cleanPhone.replace(/\\D/g, '');
    if (digitsOnly.length < 10) {
      logger.error('❌ Phone number too short for WhatsApp:', cleanPhone);
      return { success: false, error: 'Phone number must have at least 10 digits' };
    }

    const formattedPhone = `whatsapp:${cleanPhone}`;
    logger.info('💬 Sending WhatsApp via backend to:', formattedPhone);
    logger.info('📝 Message preview:', message.substring(0, 50) + '...');

    // Call backend API (same endpoint as SMS, but with whatsapp: prefix)
    const response = await fetch(`${BACKEND_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: formattedPhone,
        message: message,
      }),
    });

    // Get response as text first to handle non-JSON responses
    const responseText = await response.text();
    logger.info('📥 Backend response status:', response.status);
    logger.info('📥 Backend response preview:', responseText.substring(0, 200));

    // Try to parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logger.error('❌ Backend returned non-JSON response:', responseText.substring(0, 300));
      throw new Error(`Backend error (${response.status}): ${responseText.substring(0, 150)}`);
    }

    logger.info('Backend response:', data);

    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to send WhatsApp message');
    }

    logger.info('✅ WhatsApp sent successfully via backend');
    return { success: true, data };

  } catch (error) {
    logger.error('❌ WhatsApp sending failed:', error.message);
    logger.error('Full error:', error);
    // Don't throw - allow SMS to still work
    logger.warn('⚠️  WhatsApp notification failed, but SMS may have succeeded');
    return { success: false, error: error.message };
  }
};

/**
 * Send notification WhatsApp to emergency creator when someone responds
 * @param {string} creatorPhone - Emergency creator's phone number
 * @param {object} responder - Responder details
 * @param {object} emergency - Emergency request details
 */
export const sendCreatorWhatsAppNotification = async (creatorPhone, responder, emergency) => {
  try {
    const responderName = responder.displayName || responder.name || 'A donor';
    const responderPhone = responder.phoneNumber || 'Not provided';
    const responderBloodType = responder.bloodType || emergency.bloodType;

    const message = `🎉 *Help is on the way!*

A donor has responded to your *${emergency.bloodType}* blood request.

*Donor Details:*
• Name: ${responderName}
• Phone: ${responderPhone}
• Blood Type: ${responderBloodType}

*Emergency Details:*
• Hospital: ${emergency.hospital}
• Location: ${emergency.location}
• Urgency: ${emergency.urgency}

They will contact you soon. Thank you for using Raksetu! 🩸`;

    return await sendWhatsApp(creatorPhone, message);
  } catch (error) {
    logger.error('Failed to send creator WhatsApp notification:', error);
    throw error;
  }
};

/**
 * Forward chat message via WhatsApp
 * @param {string} recipientPhone - Recipient's phone number
 * @param {string} senderName - Sender's name
 * @param {string} message - Chat message content
 * @param {string} emergencyId - Emergency request ID
 */
export const forwardChatMessageViaWhatsApp = async (recipientPhone, senderName, message, emergencyId) => {
  try {
    const formattedMessage = `💬 *New message from ${senderName}:*

"${message}"

*Emergency ID:* ${emergencyId}

Reply via Raksetu app or call directly.

- Raksetu Blood Donation Platform`;

    return await sendWhatsApp(recipientPhone, formattedMessage);
  } catch (error) {
    logger.error('Failed to forward chat message via WhatsApp:', error);
    throw error;
  }
};

/**
 * Send urgent emergency notification via WhatsApp
 * @param {string} donorPhone - Donor's phone number
 * @param {object} emergency - Emergency request details
 */
export const sendUrgentEmergencyWhatsApp = async (donorPhone, emergency) => {
  try {
    const message = `🚨 *URGENT BLOOD NEEDED*

*Blood Type:* ${emergency.bloodType}
*Hospital:* ${emergency.hospital}
*Location:* ${emergency.location}
*Units:* ${emergency.units || 1}
*Urgency:* ${emergency.urgency}

Can you help? Open Raksetu app to respond immediately.

- Raksetu Blood Donation Platform`;

    return await sendWhatsApp(donorPhone, message);
  } catch (error) {
    logger.error('Failed to send urgent emergency WhatsApp:', error);
    throw error;
  }
};

/**
 * Send confirmation WhatsApp to responder
 * @param {string} responderPhone - Responder's phone number
 * @param {object} emergency - Emergency request details
 */
export const sendResponderWhatsAppConfirmation = async (responderPhone, emergency) => {
  try {
    const message = `✅ *Response Confirmed!*

You've committed to donating *${emergency.bloodType}* blood.

*Emergency Details:*
• Hospital: ${emergency.hospital}
• Location: ${emergency.location}
• Urgency: ${emergency.urgency}
• Units Needed: ${emergency.units || 1}

Please contact the hospital as soon as possible.

Thank you for saving a life! 🩸

- Raksetu Blood Donation Platform`;

    return await sendWhatsApp(responderPhone, message);
  } catch (error) {
    logger.error('Failed to send responder WhatsApp confirmation:', error);
    throw error;
  }
};

export default {
  sendCreatorWhatsAppNotification,
  forwardChatMessageViaWhatsApp,
  sendUrgentEmergencyWhatsApp,
  sendResponderWhatsAppConfirmation,
};

