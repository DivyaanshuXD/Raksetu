/**
 * SMS Notification Service
 * Handles SMS notifications via backend API
 * 
 * Features:
 * - Send SMS to responders confirming their donation commitment
 * - Send SMS to emergency creators when someone responds
 * - Format messages with emergency details
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * Send SMS using backend API
 * @param {string} toPhone - Recipient phone number (E.164 format)
 * @param {string} message - SMS message text
 */
const sendSMS = async (toPhone, message) => {
  try {
    // Validate phone number format
    if (!toPhone || !toPhone.startsWith('+')) {
      logger.error('❌ Invalid phone number format:', toPhone);
      throw new Error('Phone number must be in E.164 format (e.g., +1234567890)');
    }

    // Validate phone number has at least 10 digits after +
    const digitsOnly = toPhone.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      logger.error('❌ Phone number too short:', toPhone);
      throw new Error('Phone number must have at least 10 digits');
    }

    logger.info('📱 Sending SMS via backend to:', toPhone);
    logger.info('📝 Message preview:', message.substring(0, 50) + '...');

    // Call backend API
    const response = await fetch(`${BACKEND_URL}/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: toPhone,
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
      throw new Error(data.error || data.message || 'Failed to send SMS');
    }

    logger.info('✅ SMS sent successfully via backend');
    return { success: true, data };

  } catch (error) {
    logger.error('❌ SMS sending failed:', error.message);
    logger.error('Full error:', error);
    // Don't throw - allow app to continue
    logger.warn('⚠️  SMS notification failed, but response was recorded');
    return { success: false, error: error.message };
  }
};

/**
 * Send confirmation SMS to responder
 * @param {string} responderPhone - Responder's phone number
 * @param {object} emergency - Emergency request details
 */
export const sendResponderConfirmationSMS = async (responderPhone, emergency) => {
  try {
    if (!responderPhone || !responderPhone.startsWith('+')) {
      logger.warn('⚠️  Responder phone number invalid, skipping SMS:', responderPhone);
      return { success: false, error: 'Invalid phone number' };
    }

    // Shortened for Twilio trial (160 char limit)
    const message = `Raksetu: Response confirmed for ${emergency.bloodType} at ${emergency.hospital}. Contact ASAP. Thank you!`;

    return await sendSMS(responderPhone, message);
  } catch (error) {
    logger.error('Failed to send responder confirmation SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send notification SMS to emergency creator
 * @param {string} creatorPhone - Emergency creator's phone number
 * @param {object} responder - Responder details
 * @param {object} emergency - Emergency request details
 */
export const sendCreatorNotificationSMS = async (creatorPhone, responder, emergency) => {
  try {
    if (!creatorPhone || !creatorPhone.startsWith('+')) {
      logger.warn('⚠️  Creator phone number invalid, skipping SMS:', creatorPhone);
      return { success: false, error: 'Invalid phone number' };
    }

    const responderName = responder.displayName || responder.name || 'A donor';
    const responderPhone = responder.phoneNumber || 'Not provided';
    const responderBloodType = responder.bloodType || emergency.bloodType;

    // Shortened for Twilio trial (160 char limit)
    const message = `Raksetu: ${responderName} (${responderBloodType}) will help! Contact: ${responderPhone}`;

    return await sendSMS(creatorPhone, message);
  } catch (error) {
    logger.error('Failed to send creator notification SMS:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Forward chat message via SMS
 * @param {string} recipientPhone - Recipient's phone number
 * @param {string} senderName - Sender's name
 * @param {string} message - Chat message content
 * @param {string} emergencyId - Emergency request ID
 */
export const forwardChatMessageViaSMS = async (recipientPhone, senderName, message, emergencyId) => {
  try {
    const formattedMessage = `💬 New message from ${senderName}:

"${message}"

Emergency ID: ${emergencyId}

Reply via Raksetu app or call directly.

- Raksetu Blood Donation Platform`;

    return await sendSMS(recipientPhone, formattedMessage);
  } catch (error) {
    logger.error('Failed to forward chat message via SMS:', error);
    throw error;
  }
};

/**
 * Send urgent emergency notification SMS
 * @param {string} donorPhone - Donor's phone number
 * @param {object} emergency - Emergency request details
 */
export const sendUrgentEmergencySMS = async (donorPhone, emergency) => {
  try {
    const message = `🚨 URGENT BLOOD NEEDED

Blood Type: ${emergency.bloodType}
Hospital: ${emergency.hospital}
Location: ${emergency.location}
Units: ${emergency.units || 1}
Urgency: ${emergency.urgency}

Can you help? Open Raksetu app to respond.

- Raksetu Blood Donation Platform`;

    return await sendSMS(donorPhone, message);
  } catch (error) {
    logger.error('Failed to send urgent emergency SMS:', error);
    throw error;
  }
};

export default {
  sendResponderConfirmationSMS,
  sendCreatorNotificationSMS,
  forwardChatMessageViaSMS,
  sendUrgentEmergencySMS,
};

