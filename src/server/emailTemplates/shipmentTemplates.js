/**
 * Shipment Email Templates
 */

const { getEmailLayout, getEmailHeader, getEmailFooter, formatDateForEmail } = require('./emailTemplate');

/**
 * Shipment created confirmation email for client
 */
const shipmentCreatedClient = (shipmentData) => {
  const { senderName, trackingNumber, origin, destination, weight, shipmentType, createdDate } = shipmentData;

  const content = `
    ${getEmailHeader('Shipment Created Successfully', `Tracking #${trackingNumber}`)}
    
    <div class="email-body">
      <p class="greeting">Hi ${senderName},</p>
      
      <p class="content">
        Your shipment with <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span> has been created successfully. 
        Track your shipment using the tracking number below.
      </p>

      <div class="success-box">
        <strong>✓ Shipment Created</strong><br>
        Your shipment is ready for processing and transit.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Shipment Information:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Tracking #:</span>
          <span class="info-value" style="font-weight: bold; color: #e74c3c;">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Origin:</span>
          <span class="info-value">${origin}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Destination:</span>
          <span class="info-value">${destination}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Weight:</span>
          <span class="info-value">${weight ? weight + ' kg' : 'Not specified'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Shipment Type:</span>
          <span class="info-value">${shipmentType || 'Standard'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Created Date:</span>
          <span class="info-value">${formatDateForEmail(createdDate)}</span>
        </div>
      </div>

      <div class="divider"></div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/track-shipment?tracking=${trackingNumber}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Track Your Shipment
        </a>
      </p>

      <p class="content">
        You can track your shipment in real-time using the tracking number above. Updates will be sent to this email as your shipment progresses.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Shipment created notification for admin
 */
const shipmentCreatedAdmin = (shipmentData) => {
  const { senderName, senderEmail, trackingNumber, origin, destination, weight, shipmentType, items } = shipmentData;

  const content = `
    ${getEmailHeader('New Shipment Created', `Tracking #${trackingNumber}`)}
    
    <div class="email-body">
      <p class="greeting">Admin Alert - New Shipment Created</p>
      
      <p class="content">
        A new shipment has been created and is awaiting processing.
      </p>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Sender Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${senderName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Email:</span>
          <span class="info-value"><a href="mailto:${senderEmail}" style="color: #e74c3c; text-decoration: none;">${senderEmail}</a></span>
        </div>
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Shipment Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Tracking #:</span>
          <span class="info-value" style="font-weight: bold; color: #e74c3c;">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Origin:</span>
          <span class="info-value">${origin}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Destination:</span>
          <span class="info-value">${destination}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Weight:</span>
          <span class="info-value">${weight ? weight + ' kg' : 'Not specified'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Type:</span>
          <span class="info-value">${shipmentType || 'Standard'}</span>
        </div>
      </div>

      ${items && items.length > 0 ? `
        <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Items:</p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          ${items.map(item => `<li>${item}</li>`).join('')}
        </ul>
      ` : ''}

      <div class="divider"></div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/dashboard/allshipments" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Manage Shipment
        </a>
      </p>

      <p class="content">
        Please review the shipment details and update the status as it progresses through your system.
      </p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Shipment status update email for client
 */
const shipmentStatusUpdateClient = (shipmentData) => {
  const { senderName, trackingNumber, status, location, updateTime, notes } = shipmentData;

  const statusEmojis = {
    'pending': '⏳',
    'in-transit': '🚚',
    'in-warehouse': '📦',
    'out-for-delivery': '🚗',
    'delivered': '✅',
    'cancelled': '❌',
    'on-hold': '⚠️'
  };

  const statusEmoji = statusEmojis[status?.toLowerCase()] || '📫';

  const content = `
    ${getEmailHeader('Shipment Status Update', `${statusEmoji} ${status}`)}
    
    <div class="email-body">
      <p class="greeting">Hi ${senderName},</p>
      
      <p class="content">
        Your shipment with <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span> has been updated. 
        Check the details below for the latest information.
      </p>

      <div class="success-box">
        <strong>${statusEmoji} Current Status: ${status}</strong><br>
        Updated on ${formatDateForEmail(updateTime)}
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Update Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Tracking #:</span>
          <span class="info-value" style="font-weight: bold; color: #e74c3c;">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value">${status}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="info-value">${location || 'Unknown'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Updated:</span>
          <span class="info-value">${formatDateForEmail(updateTime)}</span>
        </div>
      </div>

      ${notes ? `
        <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Notes:</p>
        <div class="info-box">
          ${notes}
        </div>
      ` : ''}

      <div class="divider"></div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/track-shipment?tracking=${trackingNumber}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Track Full Journey
        </a>
      </p>

      <p class="content">
        Continue to track your shipment for more updates. If you have any questions, please contact our support team.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Shipment delivered email for client
 */
const shipmentDeliveredClient = (shipmentData) => {
  const { senderName, trackingNumber, deliveryTime, location, signedBy } = shipmentData;

  const content = `
    ${getEmailHeader('Shipment Delivered', '✅ Successfully Delivered')}
    
    <div class="email-body">
      <p class="greeting">Hi ${senderName},</p>
      
      <p class="content">
        Great news! Your shipment with <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span> has been successfully delivered.
      </p>

      <div class="success-box">
        <strong>✅ Delivery Confirmed</strong><br>
        Your shipment has arrived at its destination.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Delivery Information:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Tracking #:</span>
          <span class="info-value" style="font-weight: bold; color: #e74c3c;">${trackingNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Delivered At:</span>
          <span class="info-value">${formatDateForEmail(deliveryTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Location:</span>
          <span class="info-value">${location || 'As scheduled'}</span>
        </div>
        ${signedBy ? `
          <div class="info-row">
            <span class="info-label">Signed By:</span>
            <span class="info-value">${signedBy}</span>
          </div>
        ` : ''}
      </div>

      <div class="divider"></div>

      <p class="content">
        Thank you for using <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span>. We appreciate your business and trust in us. 
        If you have any feedback or concerns about your delivery, please don't hesitate to reach out.
      </p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/track-shipment?tracking=${trackingNumber}" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          View Delivery Details
        </a>
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

module.exports = {
  shipmentCreatedClient,
  shipmentCreatedAdmin,
  shipmentStatusUpdateClient,
  shipmentDeliveredClient
};
