/**
 * Email Template Service
 * Handles template rendering and variable substitution
 */

/**
 * Base email layout wrapper
 * @param {string} content - Main email content
 * @param {Object} options - Styling options
 * @returns {string} - Complete HTML email
 */
const getEmailLayout = (content, options = {}) => {
  const {
    headerBgColor = '#1abc9c',
    headerTextColor = '#ffffff',
    accentColor = '#e74c3c',
    companyName = 'ESMOLOG Worldwide Cargo and Logistics'
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ESMOLOG Worldwide Cargo and Logistics</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background: linear-gradient(135deg, ${headerBgColor} 0%, #16a085 100%);
      color: ${headerTextColor};
      padding: 30px 20px;
      text-align: center;
    }
    .email-header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .email-header .logo {
      font-size: 14px;
      opacity: 0.9;
    }
    .email-body {
      padding: 30px 25px;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 20px;
      color: #333;
    }
    .content {
      font-size: 15px;
      line-height: 1.8;
      color: #555;
      margin-bottom: 25px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, ${accentColor} 0%, #c0392b 100%);
      color: white;
      padding: 12px 30px;
      border-radius: 5px;
      text-decoration: none;
      font-weight: bold;
      margin: 20px 0;
      transition: opacity 0.3s ease;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .info-box {
      background-color: #f9f9f9;
      border-left: 4px solid ${accentColor};
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      padding: 8px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: ${accentColor};
      width: 40%;
      flex-shrink: 0;
    }
    .info-value {
      color: #555;
      word-break: break-word;
    }
    .divider {
      height: 2px;
      background: linear-gradient(to right, ${accentColor}, transparent);
      margin: 25px 0;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px 25px;
      text-align: center;
      border-top: 1px solid #e0e0e0;
      font-size: 12px;
      color: #777;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: ${accentColor};
      text-decoration: none;
      font-weight: 600;
    }
    .highlight {
      color: ${accentColor};
      font-weight: bold;
    }
    .warning-box {
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      color: #856404;
    }
    .success-box {
      background-color: #d4edda;
      border: 1px solid #28a745;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      color: #155724;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    table th {
      background-color: ${headerBgColor};
      color: white;
      padding: 10px;
      text-align: left;
      font-weight: bold;
    }
    table td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    table tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .contact-info {
      background-color: #ecf0f1;
      padding: 15px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 13px;
    }
    .contact-info a {
      color: ${accentColor};
      text-decoration: none;
      font-weight: 600;
    }
    @media (max-width: 600px) {
      .email-container {
        margin: 10px;
      }
      .email-header {
        padding: 20px 15px;
      }
      .email-header h1 {
        font-size: 24px;
      }
      .email-body {
        padding: 20px 15px;
      }
      .info-row {
        flex-direction: column;
      }
      .info-label {
        width: 100%;
        margin-bottom: 5px;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>
  `;
};

/**
 * Get email header HTML
 */
const getEmailHeader = (title, subtitle = null, options = {}) => {
  const { headerBgColor = '#1abc9c', headerTextColor = '#ffffff' } = options;

  return `
    <div class="email-header" style="background: linear-gradient(135deg, ${headerBgColor} 0%, #16a085 100%); color: ${headerTextColor}; padding: 30px 20px; text-align: center;">
      <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 5px;">${title}</h1>
      ${subtitle ? `<div class="logo" style="font-size: 14px; opacity: 0.9;">${subtitle}</div>` : ''}
    </div>
  `;
};

/**
 * Get email footer HTML
 */
const getEmailFooter = (options = {}) => {
  const { showSocial = true } = options;

  return `
    <div class="email-footer" style="background-color: #f5f5f5; padding: 20px 25px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 12px; color: #777;">
      <p style="margin: 0 0 5px 0;">This is an automated email from <strong>ESMOLOG Cargo and Logistics</strong>.</p>
      <p style="margin: 0 0 10px 0;">Please do not reply to this email directly. Use our contact form instead.</p>
      <div class="contact-info" style="background-color: #ecf0f1; padding: 10px; border-radius: 4px; margin-top: 10px; font-size: 12px;">
        <p style="margin: 5px 0;"><strong>Contact Us:</strong></p>
        <p style="margin: 2px 0;">📧 Email: <a href="mailto:info@esmologworldwide.com" style="color: #e74c3c; text-decoration: none; font-weight: 600;">info@esmologworldwide.com</a></p>
        <p style="margin: 2px 0;">🌐 Website: <a href="https://esmologworldwide.com" style="color: #e74c3c; text-decoration: none; font-weight: 600;">esmologworldwide.com</a></p>
      </div>
      <p style="margin: 15px 0 0 0;">&copy; ${new Date().getFullYear()} ESMOLOG Worldwide Cargo and Logistics. All rights reserved.</p>
    </div>
  `;
};

/**
 * Replace template variables
 */
const replaceVariables = (template, variables = {}) => {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || 'N/A');
  }
  return result;
};

/**
 * Format date for email display
 */
const formatDateForEmail = (date) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format time for email display
 */
const formatTimeForEmail = (time) => {
  if (!time) return 'N/A';
  // If it's a string like "14:30", format it nicely
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }
  return time;
};

module.exports = {
  getEmailLayout,
  getEmailHeader,
  getEmailFooter,
  replaceVariables,
  formatDateForEmail,
  formatTimeForEmail
};
