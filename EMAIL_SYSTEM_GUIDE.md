# Email Template System - ESMOLOG Cargo and Logistics

A comprehensive email template and sending system designed for ESMOLOG Cargo and Logistics. This system provides professional, branded email templates with consistent styling across all client communications.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Brand Colors](#brand-colors)
- [Setup](#setup)
- [Usage Examples](#usage-examples)
- [Available Templates](#available-templates)
- [API Reference](#api-reference)

## 🎯 Overview

The email system consists of:

1. **Mailer Utility** (`/src/server/utils/mailer.js`) - Handles Brevo integration
2. **Email Templates** (`/src/server/emailTemplates/`) - Reusable HTML templates
3. **Email Service** (`/src/server/services/emailService.js`) - Coordinates template rendering
4. **Controller Integrations** - Updated to use the new system

## 🏗️ System Architecture

```
┌─────────────────────────────────┐
│   Controllers (API Routes)      │
│  - appointments                 │
│  - shipments                    │
│  - contact-forms               │
│  - newsletters                 │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    Email Service                │
│  - AppointmentEmailService      │
│  - ShipmentEmailService         │
│  - NotificationEmailService     │
│  - NewsletterEmailService       │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    Email Templates              │
│  - appointmentTemplates.js      │
│  - shipmentTemplates.js         │
│  - notificationTemplates.js     │
│  - emailTemplate.js (base)      │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    Mailer Utility               │
│  (Brevo API Integration)        │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│    Brevo (Sendinblue)           │
│    Email Delivery Service       │
└─────────────────────────────────┘
```

## ✨ Features

### Professional HTML Templates
- Responsive design (mobile-friendly)
- Brand-consistent styling with green (#1abc9c) and red (#e74c3c) colors
- Organized layout with header, body, and footer sections
- Accessible email markup

### Multiple Email Types
- **Appointment Emails**
  - Confirmation for clients
  - Notification for admin
  - Reschedule notifications
  - Cancellation notices

- **Shipment Emails**
  - Creation confirmation
  - Status updates
  - Delivery notifications
  - Admin alerts

- **Contact Form Emails**
  - Submission confirmation
  - Admin notifications
  - Reply emails

- **Newsletter Emails**
  - Subscription confirmation
  - Unsubscription confirmation
  - Newsletter distribution

### Flexible Template System
- Variable substitution with `{{ variableName }}` syntax
- Helper functions for formatting dates and times
- Reusable layout components
- Easy customization

## 🎨 Brand Colors

The email system uses your brand colors:

- **Primary Green**: `#1abc9c` - Header backgrounds, CTAs
- **Accent Red**: `#e74c3c` - Highlights, alerts
- **Secondary Green**: `#16a085` - Gradient overlays
- **Darker Red**: `#c0392b` - Gradient overlays

## 🚀 Setup

### Environment Variables Required

```env
# Brevo (Sendinblue) Credentials
BREVO_API_KEY=your_api_key_here
BREVO_SENDER_EMAIL=info@cargorealmandlogistics.com
BREVO_SENDER_NAME=ESMOLOG Cargo and Logistics

# Optional: Admin emails for notifications
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Installation

The system is already integrated into the controllers. No additional dependencies are needed beyond what's already in your `package.json`.

## 📧 Usage Examples

### Sending Appointment Confirmation

```javascript
const { AppointmentEmailService } = require('../services/emailService');

// Send confirmation to client
await AppointmentEmailService.sendConfirmationToClient({
  name: 'John Doe',
  email: 'john@example.com',
  appointmentDate: new Date('2026-05-20'),
  appointmentTime: '14:30',
  appointmentId: appointmentId,
  message: 'Initial consultation needed'
});

// Send notification to admin
await AppointmentEmailService.sendConfirmationToAdmin({
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  appointmentDate: new Date('2026-05-20'),
  appointmentTime: '14:30',
  appointmentId: appointmentId,
  message: 'Initial consultation needed',
  bookedBy: userId
});
```

### Sending Shipment Updates

```javascript
const { ShipmentEmailService } = require('../services/emailService');

// Send shipment created notification
await ShipmentEmailService.sendCreatedToClient({
  senderName: 'John Doe',
  senderEmail: 'john@example.com',
  trackingNumber: 'CAR20265123456',
  origin: 'Lagos, Nigeria',
  destination: 'New York, USA',
  weight: 50,
  shipmentType: 'Express',
  createdDate: new Date()
});

// Send status update
await ShipmentEmailService.sendStatusUpdateToClient({
  senderName: 'John Doe',
  senderEmail: 'john@example.com',
  trackingNumber: 'CAR20265123456',
  status: 'in-transit',
  location: 'Cairo, Egypt',
  updateTime: new Date(),
  notes: 'Package left warehouse and is on its way'
});

// Send delivery confirmation
await ShipmentEmailService.sendDeliveredToClient({
  senderName: 'John Doe',
  senderEmail: 'john@example.com',
  trackingNumber: 'CAR20265123456',
  deliveryTime: new Date(),
  location: 'Recipient Address, New York',
  signedBy: 'Jane Smith'
});
```

### Sending Contact Form Replies

```javascript
const { NotificationEmailService } = require('../services/emailService');

// Send reply to client
await NotificationEmailService.sendContactFormReplyToClient({
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Your Shipping Quote',
  replyContent: '<p>We have reviewed your request...</p>'
});
```

### Sending Newsletter

```javascript
const { NewsletterEmailService } = require('../services/emailService');

const subscribers = await Subscriber.find({ isSubscribed: true });
const emails = subscribers.map(s => s.email);

await NewsletterEmailService.sendNewsletterToAllSubscribers(
  'Our May Newsletter',
  '<p>This month\'s updates...</p>',
  emails
);
```

## 📚 Available Templates

### Appointment Templates
- `appointmentConfirmationClient()` - Client confirmation
- `appointmentConfirmationAdmin()` - Admin notification
- `appointmentRescheduledClient()` - Reschedule notification
- `appointmentCancelledClient()` - Cancellation notice

### Shipment Templates
- `shipmentCreatedClient()` - Creation confirmation
- `shipmentCreatedAdmin()` - Admin alert
- `shipmentStatusUpdateClient()` - Status update
- `shipmentDeliveredClient()` - Delivery confirmation

### Notification Templates
- `contactFormSubmissionClient()` - Contact form confirmation
- `contactFormSubmissionAdmin()` - Contact form alert
- `contactFormReplyClient()` - Reply email
- `newsletterSubscriptionConfirmation()` - Subscription confirmation
- `newsletterUnsubscriptionConfirmation()` - Unsubscription confirmation
- `adminNotification()` - Generic admin notification

## 🔧 API Reference

### Email Service Classes

#### AppointmentEmailService

```javascript
AppointmentEmailService.sendConfirmationToClient(appointmentData)
AppointmentEmailService.sendConfirmationToAdmin(appointmentData)
AppointmentEmailService.sendRescheduledToClient(appointmentData)
AppointmentEmailService.sendCancelledToClient(appointmentData)
```

#### ShipmentEmailService

```javascript
ShipmentEmailService.sendCreatedToClient(shipmentData)
ShipmentEmailService.sendCreatedToAdmin(shipmentData)
ShipmentEmailService.sendStatusUpdateToClient(shipmentData)
ShipmentEmailService.sendDeliveredToClient(shipmentData)
```

#### NotificationEmailService

```javascript
NotificationEmailService.sendContactFormConfirmationToClient(contactData)
NotificationEmailService.sendContactFormNotificationToAdmin(contactData)
NotificationEmailService.sendContactFormReplyToClient(contactData)
NotificationEmailService.sendNewsletterSubscriptionConfirmation(subscriberData)
NotificationEmailService.sendNewsletterUnsubscriptionConfirmation(subscriberData)
NotificationEmailService.sendAdminNotification(notificationData)
NotificationEmailService.sendCustomEmail(to, subject, htmlContent)
NotificationEmailService.sendCustomEmailToMultiple(recipients, subject, htmlContent)
```

#### NewsletterEmailService

```javascript
NewsletterEmailService.sendNewsletterToAllSubscribers(subject, htmlContent, subscriberEmails)
NewsletterEmailService.sendNewsletterToSubscriber(email, subject, htmlContent)
```

### Mailer Utility Functions

```javascript
// Send single email
await sendMail(to, subject, htmlContent, textContent?, replyTo?)

// Send to multiple recipients
await sendMailToMultiple(recipients[], subject, htmlContent)

// Strip HTML tags for plain text
stripHtmlTags(htmlContent)
```

### Template Utilities

```javascript
// Layout and structure
getEmailLayout(content, options)
getEmailHeader(title, subtitle?, options)
getEmailFooter(options)

// Variable substitution
replaceVariables(template, variablesObject)

// Formatting helpers
formatDateForEmail(date)
formatTimeForEmail(time)
```

## 📝 Customization Guide

### Changing Brand Colors

Edit the options in email template functions:

```javascript
const htmlContent = appointmentTemplates.appointmentConfirmationClient(
  appointmentData,
  {
    headerBgColor: '#your-color',
    accentColor: '#your-color',
    companyName: 'Your Company Name'
  }
);
```

### Creating Custom Templates

1. Create a new file in `/src/server/emailTemplates/`:

```javascript
// customTemplates.js
const { getEmailLayout, getEmailHeader, getEmailFooter } = require('./emailTemplate');

const myCustomEmail = (data) => {
  const content = `
    ${getEmailHeader('My Custom Email', 'Subtitle')}
    <div class="email-body">
      <p>Your custom content here</p>
    </div>
    ${getEmailFooter()}
  `;
  
  return getEmailLayout(content);
};

module.exports = { myCustomEmail };
```

2. Add a corresponding method to `/src/server/services/emailService.js`:

```javascript
const sendMyCustomEmail = async (recipientEmail, data) => {
  const htmlContent = require('../emailTemplates/customTemplates').myCustomEmail(data);
  return await sendMail(recipientEmail, 'Subject', htmlContent);
};
```

### Adding New Recipients

To automatically send to new user roles:

```javascript
// In emailService.js
const adminUsers = await User.find({ 
  role: { $in: ['admin', 'employee', 'your-new-role'] } 
});
```

## 🔐 Security Considerations

- API keys stored in environment variables
- Emails sanitized against injection attacks
- HTML content properly escaped
- Email addresses validated before sending

## 📊 Email Tracking

Currently, the system sends emails and logs success/failure. For enhanced tracking:

1. Enable tracking in Brevo dashboard
2. Set up webhooks for delivery events
3. Store message IDs in your database for correlation

## 🐛 Troubleshooting

### Emails Not Sending

1. Check `BREVO_API_KEY` is set correctly in `.env.local`
2. Verify email address is valid
3. Check Brevo API status at status.brevo.com
4. Review application logs for specific errors

### Template Not Rendering

1. Ensure all template variables are provided
2. Check for typos in variable names
3. Verify HTML syntax in custom templates
4. Use browser DevTools to inspect email rendering

### Recipient Not Found

- Ensure User model is properly configured
- Check database connection
- Verify user roles are set correctly

## 📞 Support

For issues or questions about the email system, refer to the inline code comments or check the Brevo API documentation at https://developers.brevo.com

---

**System Version**: 1.0  
**Last Updated**: May 15, 2026  
**Brand**: ESMOLOG Cargo and Logistics
