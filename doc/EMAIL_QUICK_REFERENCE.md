# Email Template System - Quick Reference Guide

## Quick Start

### 1. Import the Service You Need

```javascript
// For appointments
const { AppointmentEmailService } = require('../services/emailService');

// For shipments
const { ShipmentEmailService } = require('../services/emailService');

// For notifications/contact forms/newsletters
const { NotificationEmailService } = require('../services/emailService');

// For newsletters
const { NewsletterEmailService } = require('../services/emailService');
```

### 2. Call the Method with Data

```javascript
await AppointmentEmailService.sendConfirmationToClient({
  name: 'Customer Name',
  email: 'customer@example.com',
  appointmentDate: appointment.appointmentDate,
  appointmentTime: appointment.appointmentTime,
  appointmentId: appointment._id,
  message: 'Any additional message'
});
```

## Common Patterns

### Pattern 1: Send to Client + Send to Admin

```javascript
// After creating a shipment
await ShipmentEmailService.sendCreatedToClient({
  senderName: shipment.senderName,
  senderEmail: shipment.senderEmail,
  trackingNumber: shipment.trackingNumber,
  origin: shipment.origin,
  destination: shipment.destination,
  weight: shipment.weight,
  shipmentType: shipment.shipmentType,
  createdDate: new Date()
});

await ShipmentEmailService.sendCreatedToAdmin({
  senderName: shipment.senderName,
  senderEmail: shipment.senderEmail,
  trackingNumber: shipment.trackingNumber,
  // ... other data
});
```

### Pattern 2: Handle Errors Gracefully

```javascript
// Use .catch() to prevent email errors from breaking your code
await AppointmentEmailService.sendConfirmationToClient(data)
  .catch(err => console.error('Email failed:', err));
```

### Pattern 3: Send to Multiple Recipients

```javascript
const recipients = await User.find({ role: { $in: ['admin', 'employee'] } });
const emails = recipients.map(u => u.email);

await NotificationEmailService.sendCustomEmailToMultiple(
  emails,
  'Subject Line',
  htmlContent
);
```

## Data Requirements by Template

### Appointments

```javascript
{
  name: string,              // Client name
  email: string,             // Client email
  phoneNumber: string,       // Optional
  appointmentDate: Date,     // ISO date
  appointmentTime: string,   // Format: "HH:MM" or "14:30"
  appointmentId: ObjectId,   // MongoDB ObjectId
  message: string,           // Optional
  bookedBy: string           // Optional, user ID
}
```

### Shipments

```javascript
{
  senderName: string,
  senderEmail: string,
  trackingNumber: string,    // Format: "CAR20265123456"
  origin: string,            // Country/location
  destination: string,
  weight: number,
  shipmentType: string,
  createdDate: Date,
  items: string[],           // Optional
  status: string,
  location: string,
  updateTime: Date,
  notes: string,             // Optional
  signedBy: string           // Optional, for delivery
}
```

### Contact Forms

```javascript
{
  name: string,
  email: string,
  phoneNumber: string,       // Optional
  message: string,
  subject: string,
  replyContent: string,      // For replies
  createdAt: Date
}
```

### Subscribers

```javascript
{
  name: string,
  email: string
}
```

## Complete Controller Example

```javascript
const Appointment = require('../models/Appointment');
const { AppointmentEmailService } = require('../services/emailService');

exports.createAppointment = async (req, res) => {
  try {
    const { name, email, appointmentDate, appointmentTime, message } = req.body;

    // Validate
    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Create appointment
    const appointment = new Appointment({
      name,
      email,
      appointmentDate,
      appointmentTime,
      message,
      bookedBy: req.user?.id,
      status: 'pending'
    });

    await appointment.save();

    // Send emails (don't block on failure)
    await AppointmentEmailService.sendConfirmationToClient({
      name,
      email,
      appointmentDate,
      appointmentTime,
      appointmentId: appointment._id,
      message
    }).catch(err => console.error('Client email failed:', err));

    await AppointmentEmailService.sendConfirmationToAdmin({
      name,
      email,
      appointmentDate,
      appointmentTime,
      appointmentId: appointment._id,
      message,
      bookedBy: req.user?.id
    }).catch(err => console.error('Admin email failed:', err));

    // Respond to client
    res.status(201).json({
      message: 'Appointment created successfully',
      appointment
    });

  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
```

## Email Sending Status Codes

All email service methods return:

```javascript
{
  success: true,
  messageId: 'unique-id-from-brevo',
  recipient: 'email@example.com',
  subject: 'Email Subject'
}
```

Or throw an error:

```javascript
try {
  await AppointmentEmailService.sendConfirmationToClient(data);
} catch (error) {
  // error.message contains details
  console.error(error.message);
}
```

## Testing Email Templates

### Development

1. Replace real emails with test email: `test@example.com`
2. Check logs for send confirmation
3. Verify HTML in Brevo dashboard

### Production Checklist

- [ ] BREVO_API_KEY is set
- [ ] BREVO_SENDER_EMAIL is correct
- [ ] BREVO_SENDER_NAME is set
- [ ] Database connections working
- [ ] User.find() queries work
- [ ] Error logging enabled

## Customize Email Content

### Add Custom HTML to Template

```javascript
const customContent = notificationTemplates.contactFormSubmissionClient({
  name: 'John',
  email: 'john@example.com',
  message: 'Custom message'
});

// Inject custom CSS or modify template
const modified = customContent.replace(
  'class="email-body"',
  'class="email-body" style="background: #f5f5f5;"'
);

await NotificationEmailService.sendCustomEmail(email, subject, modified);
```

### Send Plain Text Alternative

```javascript
const { stripHtmlTags } = require('../utils/mailer');

const htmlContent = appointmentTemplates.appointmentConfirmationClient(data);
const textContent = stripHtmlTags(htmlContent);

// Brevo automatically creates text version
await sendMail(email, subject, htmlContent, textContent);
```

## Common Mistakes to Avoid

❌ **Wrong:**
```javascript
// Trying to send without await
AppointmentEmailService.sendConfirmationToClient(data);

// Missing email address
await AppointmentEmailService.sendConfirmationToClient({
  name: 'John'
  // email is missing!
});

// Wrong date format
appointmentDate: '2026-05-20' // String instead of Date

// Not handling errors
await emailService.send(...); // If this fails, API crashes
```

✅ **Right:**
```javascript
// Always await
await AppointmentEmailService.sendConfirmationToClient(data);

// Include all required fields
await AppointmentEmailService.sendConfirmationToClient({
  name: 'John',
  email: 'john@example.com',  // Required!
  appointmentDate: new Date('2026-05-20'),
  appointmentTime: '14:30'
});

// Always handle errors
await AppointmentEmailService.sendConfirmationToClient(data)
  .catch(err => console.error('Email failed:', err));
```

## Environment Variables Required

```env
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx
BREVO_SENDER_EMAIL=info@cargorealmandlogistics.com
BREVO_SENDER_NAME=ESMOLOG Cargo and Logistics
MONGODB_URI=mongodb://...
JWT_SECRET=your-secret
```

## Support Files

- **Full Documentation**: `EMAIL_SYSTEM_GUIDE.md`
- **Templates**: `/src/server/emailTemplates/`
- **Services**: `/src/server/services/emailService.js`
- **Mailer**: `/src/server/utils/mailer.js`

---

**Version**: 1.0  
**Last Updated**: May 15, 2026
