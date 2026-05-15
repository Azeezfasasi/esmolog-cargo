/**
 * Contact Form & General Notification Email Templates
 */

const { getEmailLayout, getEmailHeader, getEmailFooter, formatDateForEmail } = require('./emailTemplate');

/**
 * Contact form submission confirmation for client
 */
const contactFormSubmissionClient = (contactData) => {
  const { name, email, subject = 'We Received Your Message', message } = contactData;

  const content = `
    ${getEmailHeader('We Received Your Message', 'Thank You for Contacting Us')}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Thank you for reaching out to <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span>. 
        We have received your message and will review it carefully.
      </p>

      <div class="success-box">
        <strong>✓ Message Received</strong><br>
        Our team will get back to you as soon as possible, usually within 24-48 hours.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Your Message:</p>
      <div class="info-box">
        <blockquote style="border-left: 4px solid #e74c3c; margin: 0; padding-left: 15px; color: #555; font-style: italic;">
          ${message}
        </blockquote>
      </div>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Received:</span>
          <span class="info-value">${formatDateForEmail(new Date())}</span>
        </div>
      </div>

      <div class="divider"></div>

      <p class="content">
        We take every inquiry seriously and will provide you with a thoughtful response. 
        If your matter is urgent, please call us directly at our office.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Contact form submission notification for admin
 */
const contactFormSubmissionAdmin = (contactData) => {
  const { name, email, phoneNumber, message, subject = 'New Contact Form Submission', createdAt } = contactData;

  const content = `
    ${getEmailHeader('New Contact Form Submission', 'Requires Response')}
    
    <div class="email-body">
      <p class="greeting">Admin Alert - New Message Received</p>
      
      <p class="content">
        A new contact form submission has been received and requires your attention.
      </p>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Sender Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${name}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value"><a href="mailto:${email}" style="color: #e74c3c; text-decoration: none;">${email}</a></span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${phoneNumber || 'Not provided'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Received:</span>
          <span class="info-value">${formatDateForEmail(createdAt)}</span>
        </div>
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Message:</p>
      <div class="info-box">
        <blockquote style="border-left: 4px solid #e74c3c; margin: 0; padding-left: 15px; color: #555;">
          ${message}
        </blockquote>
      </div>

      <div class="divider"></div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/dashboard/contactformresponses" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View & Reply in Dashboard
        </a>
      </p>

      <p class="content">
        Please review this message and provide a timely response to the sender.
      </p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Contact form reply email for client
 */
const contactFormReplyClient = (contactData) => {
  const { name, email, subject, replyContent } = contactData;

  const content = `
    ${getEmailHeader('We\'ve Replied to Your Message', subject)}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Thank you for your message. Here's our response:
      </p>

      <div class="info-box">
        <div style="line-height: 1.8; color: #555;">
          ${replyContent}
        </div>
      </div>

      <div class="divider"></div>

      <p class="content">
        If you have any follow-up questions or need further assistance, please don't hesitate to contact us.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Newsletter subscription confirmation
 */
const newsletterSubscriptionConfirmation = (subscriberData) => {
  const { name, email } = subscriberData;

  const content = `
    ${getEmailHeader('Welcome to Our Newsletter', 'Subscription Confirmed')}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Welcome to the <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span> newsletter! 
        We're excited to have you join our community.
      </p>

      <div class="success-box">
        <strong>✓ Subscription Confirmed</strong><br>
        You will now receive updates about our services, industry news, and special offers.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">What to Expect:</p>
      <div class="info-box">
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Weekly updates on cargo logistics trends</li>
          <li>Special discounts and promotional offers</li>
          <li>Service announcements and updates</li>
          <li>Industry insights and best practices</li>
          <li>Customer testimonials and success stories</li>
        </ul>
      </div>

      <div class="divider"></div>

      <p class="content">
        We respect your inbox and promise not to spam. You'll receive newsletters typically once a week.
      </p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Visit Our Website
        </a>
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Newsletter unsubscription confirmation
 */
const newsletterUnsubscriptionConfirmation = (subscriberData) => {
  const { name, email } = subscriberData;

  const content = `
    ${getEmailHeader('Unsubscribed from Newsletter', 'We\'ll Miss You')}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        We've successfully unsubscribed your email from our newsletter. You will no longer receive emails from us.
      </p>

      <div class="info-box">
        <p style="margin: 0; color: #555;">
          If you change your mind and would like to resubscribe, you can do so anytime on our website.
        </p>
      </div>

      <div class="divider"></div>

      <p class="content">
        Thank you for being part of our community. If you have any feedback about our newsletter, we'd love to hear from you.
      </p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Resubscribe Anytime
        </a>
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Generic notification email for admin/staff
 */
const adminNotification = (notificationData) => {
  const { title, message, actionUrl, actionText = 'View Details', priority = 'normal' } = notificationData;

  const priorityColors = {
    'low': '#3498db',
    'normal': '#1abc9c',
    'high': '#f39c12',
    'critical': '#e74c3c'
  };

  const priorityEmojis = {
    'low': 'ℹ️',
    'normal': '📢',
    'high': '⚠️',
    'critical': '🔴'
  };

  const bgColor = priorityColors[priority] || '#1abc9c';
  const emoji = priorityEmojis[priority] || '📢';

  const content = `
    ${getEmailHeader(`${emoji} ${title}`, priority.toUpperCase())}
    
    <div class="email-body">
      <div class="info-box" style="background-color: rgba(231, 76, 60, 0.1); border-left-color: ${bgColor};">
        <div style="color: ${bgColor}; font-weight: bold; margin-bottom: 10px;">Priority: ${priority.toUpperCase()}</div>
        <div style="color: #555; line-height: 1.8;">
          ${message}
        </div>
      </div>

      <div class="divider"></div>

      ${actionUrl ? `
        <p style="text-align: center; margin: 25px 0;">
          <a href="${actionUrl}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, ${bgColor} 0%, ${shadeColor(bgColor, -20)} 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
            ${actionText}
          </a>
        </p>
      ` : ''}

      <p style="margin-top: 30px; font-size: 12px; color: #999;">
        This is an automated notification email. Please do not reply to this email.
      </p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Helper to shade colors
 */
const shadeColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  return `#${(0x1000000 + (R < 16 ? 0 : '') * R * 0x10000 + (G < 16 ? 0 : '') * G * 0x100 + (B < 16 ? 0 : '') * B).toString(16).slice(1)}`;
};

module.exports = {
  contactFormSubmissionClient,
  contactFormSubmissionAdmin,
  contactFormReplyClient,
  newsletterSubscriptionConfirmation,
  newsletterUnsubscriptionConfirmation,
  adminNotification
};
