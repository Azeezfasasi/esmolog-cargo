/**
 * Appointment Email Templates
 */

const { getEmailLayout, getEmailHeader, getEmailFooter, formatDateForEmail, formatTimeForEmail } = require('./emailTemplate');

/**
 * Appointment confirmation email for client
 */
const appointmentConfirmationClient = (appointmentData) => {
  const { name, appointmentDate, appointmentTime, appointmentId, message } = appointmentData;

  const content = `
    ${getEmailHeader('Appointment Request Confirmed', 'Scheduled for ' + formatDateForEmail(appointmentDate))}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Thank you for booking an appointment with <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span>. 
        We have received your appointment request and will review it shortly.
      </p>

      <div class="success-box">
        <strong>✓ Appointment Scheduled</strong><br>
        Your request has been submitted successfully. Our team will confirm availability and get back to you within 24 hours.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Appointment Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDateForEmail(appointmentDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${formatTimeForEmail(appointmentTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value">Pending Confirmation</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reference ID:</span>
          <span class="info-value">${appointmentId}</span>
        </div>
      </div>

      ${message ? `
        <p style="margin-top: 20px;"><strong>Your Message:</strong></p>
        <div class="info-box">
          ${message}
        </div>
      ` : ''}

      <div class="divider"></div>

      <p class="content">
        If you need to reschedule or cancel this appointment, please contact us as soon as possible. 
        You can reply to this email or use our contact form on the website.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Appointment confirmation email for admin
 */
const appointmentConfirmationAdmin = (appointmentData) => {
  const { name, email, phoneNumber, appointmentDate, appointmentTime, appointmentId, message, bookedBy } = appointmentData;

  const content = `
    ${getEmailHeader('New Appointment Request', 'Action Required')}
    
    <div class="email-body">
      <p class="greeting">Admin Alert - New Appointment Booking</p>
      
      <p class="content">
        A new appointment request has been submitted and is awaiting your review and confirmation.
      </p>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Client Details:</p>
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
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Appointment Details:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDateForEmail(appointmentDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${formatTimeForEmail(appointmentTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reference ID:</span>
          <span class="info-value">${appointmentId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Booked By:</span>
          <span class="info-value">${bookedBy || 'Visitor'}</span>
        </div>
      </div>

      ${message ? `
        <p style="margin-top: 20px;"><strong>Client Message:</strong></p>
        <div class="info-box">
          ${message}
        </div>
      ` : ''}

      <div class="divider"></div>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/dashboard/allappointments" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Review & Confirm Appointment
        </a>
      </p>

      <p class="content">
        Please log in to your admin panel to confirm or reschedule this appointment.
      </p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Appointment rescheduled email for client
 */
const appointmentRescheduledClient = (appointmentData) => {
  const { name, oldDate, oldTime, newDate, newTime, appointmentId } = appointmentData;

  const content = `
    ${getEmailHeader('Appointment Rescheduled', 'Updated Schedule')}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Your appointment with <span class="highlight">ESMOLOG Worldwide Cargo and Logistics</span> has been rescheduled.
      </p>

      <div class="success-box">
        <strong>✓ Rescheduled Successfully</strong><br>
        Your new appointment details are below.
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">Previous Appointment:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDateForEmail(oldDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${formatTimeForEmail(oldTime)}</span>
        </div>
      </div>

      <p style="font-weight: bold; margin-top: 20px; color: #1abc9c;">New Appointment:</p>
      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span class="info-value">${formatDateForEmail(newDate)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Time:</span>
          <span class="info-value">${formatTimeForEmail(newTime)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reference ID:</span>
          <span class="info-value">${appointmentId}</span>
        </div>
      </div>

      <div class="divider"></div>

      <p class="content">
        We look forward to meeting you at the new scheduled time. If you have any questions or need to make further changes, 
        please don't hesitate to contact us.
      </p>

      <p style="margin-top: 30px; color: #555;">Best regards,</p>
      <p style="font-weight: bold; color: #e74c3c; margin: 5px 0;">The ESMOLOG Worldwide Cargo and Logistics Team</p>
    </div>

    ${getEmailFooter()}
  `;

  return getEmailLayout(content);
};

/**
 * Appointment cancelled email for client
 */
const appointmentCancelledClient = (appointmentData) => {
  const { name, appointmentDate, appointmentTime, appointmentId, reason } = appointmentData;

  const content = `
    ${getEmailHeader('Appointment Cancelled', 'Action Required')}
    
    <div class="email-body">
      <p class="greeting">Hi ${name},</p>
      
      <p class="content">
        Your appointment scheduled for <span class="highlight">${formatDateForEmail(appointmentDate)}</span> 
        at <span class="highlight">${formatTimeForEmail(appointmentTime)}</span> has been cancelled.
      </p>

      <div class="warning-box">
        <strong>⚠ Appointment Cancelled</strong><br>
        ${reason ? `Reason: ${reason}` : 'Please contact us if you would like to reschedule.'}
      </div>

      <div class="info-box">
        <div class="info-row">
          <span class="info-label">Cancelled Date:</span>
          <span class="info-value">${formatDateForEmail(new Date())}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Reference ID:</span>
          <span class="info-value">${appointmentId}</span>
        </div>
      </div>

      <div class="divider"></div>

      <p class="content">
        If you wish to rebook, please visit our website or contact us directly. We'd be happy to schedule a new appointment at your convenience.
      </p>

      <p style="text-align: center; margin: 25px 0;">
        <a href="https://esmologworldwide.com/bookappointment" class="cta-button" style="display: inline-block; background: linear-gradient(135deg, #1abc9c 0%, #16a085 100%); color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; font-weight: bold;">
          Schedule New Appointment
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
  appointmentConfirmationClient,
  appointmentConfirmationAdmin,
  appointmentRescheduledClient,
  appointmentCancelledClient
};
