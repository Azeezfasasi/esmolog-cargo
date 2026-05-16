/**
 * Email Mailer Utility
 * Handles sending emails via Brevo (Sendinblue) API
 * Supports both HTML and plain text emails
 * Includes comprehensive logging of all email sends
 */

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
} else {
  require('dotenv').config();
}

if (!process.env.BREVO_API_KEY) {
  throw new Error('BREVO_API_KEY is not set in the environment. Please configure it.');
}

console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY); // Debug log to verify environment variable

const axios = require('axios');
const { logEmail } = require('./emailLogger');

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'info@esmologworldwide.com';
const BREVO_SENDER_NAME = process.env.BREVO_SENDER_NAME || 'ESMOLOG Worldwide';
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

/**
 * Send email via Brevo
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {string} textContent - Plain text email content (optional)
 * @param {string} replyTo - Reply-to email address (optional)
 * @param {string} emailType - Type of email for logging (optional, default: 'general')
 * @returns {Promise<Object>} - Response from Brevo API
 */
const sendMail = async (to, subject, htmlContent, textContent = null, replyTo = null, emailType = 'general') => {
  try {
    // Validate required parameters
    if (!to || !subject || !htmlContent) {
      throw new Error('Missing required email parameters: to, subject, htmlContent');
    }

    if (!BREVO_API_KEY) {
      console.error('ERROR: BREVO_API_KEY is not configured in environment variables');
      throw new Error('Email service is not properly configured');
    }

    // Prepare recipient email
    const recipient = to.toLowerCase().trim();

    // Make API call to Brevo
    const response = await axios.post(
      BREVO_API_URL,
      {
        sender: {
          name: BREVO_SENDER_NAME,
          email: BREVO_SENDER_EMAIL
        },
        to: [
          {
            email: recipient,
            name: recipient.split('@')[0]
          }
        ],
        subject: subject.trim(),
        htmlContent: htmlContent,
        textContent: textContent || stripHtmlTags(htmlContent),
        replyTo: replyTo ? { email: replyTo } : undefined,
        headers: {
          'X-Mailer': 'ESMOLOG-Logistics-System',
          'X-Priority': '3 (Normal)'
        }
      },
      {
        headers: {
          'api-key': BREVO_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('📧 Sending email with the following details:', {
      to,
      subject,
      htmlContent,
      textContent,
      replyTo
    });

    console.log(`✅ Email sent successfully to ${recipient}:`, {
      messageId: response.data.messageId,
      timestamp: new Date().toISOString()
    });

    // Log the successful email send
    logEmail({
      to: recipient,
      subject,
      emailType,
      success: true,
      messageId: response.data.messageId,
      timestamp: new Date().toISOString()
    });

    return {
      success: true,
      messageId: response.data.messageId,
      recipient,
      subject
    };
  } catch (error) {
    console.error('❌ Error sending email:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      recipient: to,
      subject
    });

    // Log the failed email send
    logEmail({
      to,
      subject,
      emailType,
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });

    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }
};

/**
 * Send emails to multiple recipients
 * @param {string[]} recipients - Array of recipient email addresses
 * @param {string} subject - Email subject
 * @param {string} htmlContent - HTML email content
 * @param {string} emailType - Type of email for logging (optional, default: 'general')
 * @returns {Promise<Array>} - Array of send results
 */
const sendMailToMultiple = async (recipients, subject, htmlContent, emailType = 'general') => {
  try {
    if (!Array.isArray(recipients) || recipients.length === 0) {
      throw new Error('Recipients must be a non-empty array');
    }

    const results = [];
    for (const recipient of recipients) {
      try {
        const result = await sendMail(recipient, subject, htmlContent, null, null, emailType);
        results.push(result);
      } catch (err) {
        console.warn(`Failed to send email to ${recipient}:`, err.message);
        results.push({
          success: false,
          recipient,
          error: err.message
        });
      }
    }

    return results;
  } catch (error) {
    console.error('Error in sendMailToMultiple:', error.message);
    throw error;
  }
};

/**
 * Helper function to strip HTML tags from content
 * Used for plain text fallback
 * @param {string} html - HTML content
 * @returns {string} - Plain text content
 */
const stripHtmlTags = (html) => {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\n\n+/g, '\n\n')
    .trim();
};

module.exports = {
  sendMail,
  sendMailToMultiple,
  stripHtmlTags,
  BREVO_SENDER_EMAIL,
  BREVO_SENDER_NAME,
  // Export email logger functions
  logEmail,
  emailLogger: require('./emailLogger')
};
