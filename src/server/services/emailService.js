/**
 * Email Service
 * Central service for handling all email operations
 * Coordinates template rendering and sending
 */

const { sendMail, sendMailToMultiple } = require('../utils/mailer');
const User = require('../models/User');

// Import all templates
const appointmentTemplates = require('../emailTemplates/appointmentTemplates');
const shipmentTemplates = require('../emailTemplates/shipmentTemplates');
const notificationTemplates = require('../emailTemplates/notificationTemplates');

/**
 * EMAIL SERVICE FOR APPOINTMENTS
 */
const AppointmentEmailService = {
  /**
   * Send appointment confirmation to client
   */
  sendConfirmationToClient: async (appointmentData) => {
    try {
      const htmlContent = appointmentTemplates.appointmentConfirmationClient(appointmentData);
      return await sendMail(
        appointmentData.email,
        `Appointment Confirmation - ${appointmentData.appointmentDate}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending appointment confirmation to client:', error);
      throw error;
    }
  },

  /**
   * Send appointment notification to admin
   */
  sendConfirmationToAdmin: async (appointmentData) => {
    try {
      const htmlContent = appointmentTemplates.appointmentConfirmationAdmin(appointmentData);
      
      // Get all admin users
      const adminUsers = await User.find({ role: 'admin' });
      const adminEmails = adminUsers.map(admin => admin.email).filter(Boolean);

      if (adminEmails.length === 0) {
        console.warn('No admin users found to notify');
        return { success: false, message: 'No admin users found' };
      }

      return await sendMailToMultiple(
        adminEmails,
        'New Appointment Request - Action Required',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending appointment notification to admin:', error);
      throw error;
    }
  },

  /**
   * Send appointment rescheduled email to client
   */
  sendRescheduledToClient: async (appointmentData) => {
    try {
      const htmlContent = appointmentTemplates.appointmentRescheduledClient(appointmentData);
      return await sendMail(
        appointmentData.email,
        `Appointment Rescheduled - New Date: ${appointmentData.newDate}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending rescheduled appointment email:', error);
      throw error;
    }
  },

  /**
   * Send appointment cancelled email to client
   */
  sendCancelledToClient: async (appointmentData) => {
    try {
      const htmlContent = appointmentTemplates.appointmentCancelledClient(appointmentData);
      return await sendMail(
        appointmentData.email,
        'Appointment Cancelled',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending appointment cancellation email:', error);
      throw error;
    }
  }
};

/**
 * EMAIL SERVICE FOR SHIPMENTS
 */
const ShipmentEmailService = {
  /**
   * Send shipment created confirmation to client
   */
  sendCreatedToClient: async (shipmentData) => {
    try {
      const htmlContent = shipmentTemplates.shipmentCreatedClient(shipmentData);
      return await sendMail(
        shipmentData.senderEmail,
        `Shipment Created - Tracking #${shipmentData.trackingNumber}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending shipment creation email to client:', error);
      throw error;
    }
  },

  /**
   * Send shipment created notification to admin
   */
  sendCreatedToAdmin: async (shipmentData) => {
    try {
      const htmlContent = shipmentTemplates.shipmentCreatedAdmin(shipmentData);

      // Get all admin and employee users
      const adminUsers = await User.find({ role: { $in: ['admin', 'employee'] } });
      const adminEmails = adminUsers.map(admin => admin.email).filter(Boolean);

      if (adminEmails.length === 0) {
        console.warn('No admin/employee users found to notify');
        return { success: false, message: 'No admin users found' };
      }

      return await sendMailToMultiple(
        adminEmails,
        `New Shipment - Tracking #${shipmentData.trackingNumber}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending shipment creation notification to admin:', error);
      throw error;
    }
  },

  /**
   * Send shipment status update to client
   */
  sendStatusUpdateToClient: async (shipmentData) => {
    try {
      const htmlContent = shipmentTemplates.shipmentStatusUpdateClient(shipmentData);
      return await sendMail(
        shipmentData.senderEmail,
        `Shipment Status Update - ${shipmentData.status}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending shipment status update email:', error);
      throw error;
    }
  },

  /**
   * Send shipment delivered confirmation to client
   */
  sendDeliveredToClient: async (shipmentData) => {
    try {
      const htmlContent = shipmentTemplates.shipmentDeliveredClient(shipmentData);
      return await sendMail(
        shipmentData.senderEmail,
        `Shipment Delivered - Tracking #${shipmentData.trackingNumber}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending shipment delivery email:', error);
      throw error;
    }
  }
};

/**
 * EMAIL SERVICE FOR NOTIFICATIONS
 */
const NotificationEmailService = {
  /**
   * Send contact form submission confirmation to client
   */
  sendContactFormConfirmationToClient: async (contactData) => {
    try {
      const htmlContent = notificationTemplates.contactFormSubmissionClient(contactData);
      return await sendMail(
        contactData.email,
        'We Received Your Message - ESMOLOG Worldwide',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending contact form confirmation:', error);
      throw error;
    }
  },

  /**
   * Send contact form notification to admin
   */
  sendContactFormNotificationToAdmin: async (contactData) => {
    try {
      const htmlContent = notificationTemplates.contactFormSubmissionAdmin(contactData);

      // Get all admin users
      const adminUsers = await User.find({ role: 'admin' });
      const adminEmails = adminUsers.map(admin => admin.email).filter(Boolean);

      if (adminEmails.length === 0) {
        console.warn('No admin users found to notify');
        return { success: false, message: 'No admin users found' };
      }

      return await sendMailToMultiple(
        adminEmails,
        'New Contact Form Submission - Requires Response',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending contact form notification to admin:', error);
      throw error;
    }
  },

  /**
   * Send contact form reply to client
   */
  sendContactFormReplyToClient: async (contactData) => {
    try {
      const htmlContent = notificationTemplates.contactFormReplyClient(contactData);
      return await sendMail(
        contactData.email,
        `Re: ${contactData.subject}`,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending contact form reply:', error);
      throw error;
    }
  },

  /**
   * Send newsletter subscription confirmation
   */
  sendNewsletterSubscriptionConfirmation: async (subscriberData) => {
    try {
      const htmlContent = notificationTemplates.newsletterSubscriptionConfirmation(subscriberData);
      return await sendMail(
        subscriberData.email,
        'Welcome to ESMOLOG Worldwide Newsletter',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending newsletter subscription confirmation:', error);
      throw error;
    }
  },

  /**
   * Send newsletter unsubscription confirmation
   */
  sendNewsletterUnsubscriptionConfirmation: async (subscriberData) => {
    try {
      const htmlContent = notificationTemplates.newsletterUnsubscriptionConfirmation(subscriberData);
      return await sendMail(
        subscriberData.email,
        'You\'ve Been Unsubscribed from ESMOLOG Worldwide Newsletter',
        htmlContent
      );
    } catch (error) {
      console.error('Error sending newsletter unsubscription confirmation:', error);
      throw error;
    }
  },

  /**
   * Send generic notification to admin
   */
  sendAdminNotification: async (notificationData) => {
    try {
      const htmlContent = notificationTemplates.adminNotification(notificationData);

      // Get all admin and employee users
      const users = await User.find({ role: { $in: ['admin', 'employee', 'staff'] } });
      const emails = users.map(user => user.email).filter(Boolean);

      if (emails.length === 0) {
        console.warn('No admin/staff users found to notify');
        return { success: false, message: 'No users found' };
      }

      return await sendMailToMultiple(
        emails,
        notificationData.title,
        htmlContent
      );
    } catch (error) {
      console.error('Error sending admin notification:', error);
      throw error;
    }
  },

  /**
   * Send custom HTML email
   */
  sendCustomEmail: async (to, subject, htmlContent) => {
    try {
      return await sendMail(to, subject, htmlContent);
    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  },

  /**
   * Send custom email to multiple recipients
   */
  sendCustomEmailToMultiple: async (recipients, subject, htmlContent) => {
    try {
      return await sendMailToMultiple(recipients, subject, htmlContent);
    } catch (error) {
      console.error('Error sending custom email to multiple recipients:', error);
      throw error;
    }
  }
};

/**
 * EMAIL SERVICE FOR NEWSLETTERS
 */
const NewsletterEmailService = {
  /**
   * Send newsletter to all subscribers
   */
  sendNewsletterToAllSubscribers: async (subject, htmlContent, subscriberEmails) => {
    try {
      if (!Array.isArray(subscriberEmails) || subscriberEmails.length === 0) {
        throw new Error('No subscriber emails provided');
      }

      return await sendMailToMultiple(subscriberEmails, subject, htmlContent);
    } catch (error) {
      console.error('Error sending newsletter to subscribers:', error);
      throw error;
    }
  },

  /**
   * Send newsletter to specific subscriber
   */
  sendNewsletterToSubscriber: async (email, subject, htmlContent) => {
    try {
      return await sendMail(email, subject, htmlContent);
    } catch (error) {
      console.error('Error sending newsletter to subscriber:', error);
      throw error;
    }
  }
};

/**
 * Export all email services
 */
module.exports = {
  AppointmentEmailService,
  ShipmentEmailService,
  NotificationEmailService,
  NewsletterEmailService,
  // For backwards compatibility
  sendMail,
  sendMailToMultiple
};
