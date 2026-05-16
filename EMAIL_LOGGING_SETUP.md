# Email Logging System - Implementation Guide

## Overview

A comprehensive email logging system has been implemented to track all successful and failed email sends across your application. This guide explains how to use and maintain the system.

## What's New

### 1. **Email Logger Utility** (`src/server/utils/emailLogger.js`)
A dedicated module that tracks all email sends with the following features:

- **Log Email Sends**: Records every email sent (successful or failed)
- **Email Statistics**: Tracks totals by type and status
- **Log Files**: Stored in `/logs/` directory
  - `email-logs.json` - Complete email history
  - `email-stats.json` - Summary statistics

### 2. **Enhanced Mailer** (`src/server/utils/mailer.js`)
Updated to integrate email logging:

- All emails logged automatically
- Support for email type categorization
- Maintains backward compatibility

### 3. **Email Logs API** (`src/app/api/email-logs/route.js`)
Admin-only endpoint to retrieve and manage logs:

- View all logs
- Filter by email type
- Export as CSV
- View statistics
- Clear old logs

## Email Types

The system categorizes emails by type for better tracking:

- `contact-form` - Contact form submissions
- `contact-reply` - Replies to contact form messages
- `shipment-status` - Shipment status updates
- `shipment-reply` - Replies to shipment messages
- `newsletter` - Newsletter subscriptions
- `general` - Default/uncategorized emails

## How to Use

### 1. **Sending Emails with Logging**

#### Basic Usage (Automatic Logging)

```javascript
import { sendMail } from '@/server/utils/mailer';

// Send email with type logging
await sendMail(
  'recipient@example.com',
  'Subject Line',
  '<p>HTML Content</p>',
  'Plain text content', // optional
  'reply@example.com',   // optional
  'contact-form'         // email type for logging
);
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `to` | string | Yes | Recipient email address |
| `subject` | string | Yes | Email subject |
| `htmlContent` | string | Yes | HTML email body |
| `textContent` | string | No | Plain text fallback |
| `replyTo` | string | No | Reply-to address |
| `emailType` | string | No | Email category (default: 'general') |

#### Example - Contact Form (Already Updated)

```javascript
// src/app/api/contact-form/route.js
await sendMail(
  process.env.BREVO_SENDER_EMAIL,
  `New Contact Form Submission from ${name}`,
  htmlContent,
  null,
  null,
  'contact-form'  // <- Type for logging
);
```

### 2. **Accessing Email Logs via API**

#### Get All Recent Logs

```bash
GET /api/email-logs?limit=100
```

Response:
```json
{
  "logs": [
    {
      "id": "email_1234567890_abc123",
      "timestamp": "2024-05-16T10:30:00Z",
      "to": "user@example.com",
      "subject": "Contact Form Submission",
      "emailType": "contact-form",
      "success": true,
      "messageId": "brevo_msg_12345"
    }
  ],
  "count": 1,
  "timestamp": "2024-05-16T10:35:00Z"
}
```

#### Get Statistics

```bash
GET /api/email-logs?filter=stats
```

Response:
```json
{
  "stats": {
    "totalSent": 150,
    "totalFailed": 5,
    "byType": {
      "contact-form": { "sent": 50, "failed": 2 },
      "shipment-status": { "sent": 80, "failed": 2 },
      "contact-reply": { "sent": 15, "failed": 1 },
      "newsletter": { "sent": 5, "failed": 0 }
    },
    "byStatus": { "success": 150, "failed": 5 }
  }
}
```

#### Get Failed Emails Only

```bash
GET /api/email-logs?filter=failed
```

#### Get Emails by Type

```bash
GET /api/email-logs?type=contact-form
```

#### Get Recent Logs (Last 24 hours)

```bash
GET /api/email-logs?filter=recent&hours=24
```

#### Export as CSV

```bash
GET /api/email-logs?format=csv
```

### 3. **Direct Logger Access**

You can also use the logger directly in your code:

```javascript
const {
  logEmail,
  getAllLogs,
  getStats,
  getLogsByType,
  getFailedEmails,
  getSuccessfulEmailsCount,
  getRecentLogs,
  exportLogsAsCSV,
  clearOldLogs
} = require('@/server/utils/emailLogger');

// Get all logs
const logs = getAllLogs();

// Get logs by type
const contactFormLogs = getLogsByType('contact-form');

// Get failed emails
const failedEmails = getFailedEmails();

// Get statistics
const stats = getStats();

// Get recent logs (last 24 hours)
const recentLogs = getRecentLogs(24);

// Export logs as CSV
const csv = exportLogsAsCSV();

// Clear logs older than 30 days
const removed = clearOldLogs(30);
```

## Integration Checklist

### Already Updated Endpoints
- ✅ `POST /api/contact-form` - Contact form submissions
- ✅ `POST /api/shipment/shipment-status` - Shipment status updates
- ✅ `POST /api/contact/[id]/reply` - Contact form replies

### Endpoints to Update

To add email logging to other endpoints that send emails:

#### 1. Shipment Replies (`src/app/api/shipments/[id]/reply/route.js`)

```javascript
import { sendMail } from '@/server/utils/mailer';

// After updating shipment with reply
try {
  const htmlContent = `<p>${body.message}</p>`;
  await sendMail(
    shipment.senderEmail,
    `New Reply for Shipment: #${shipment.trackingNumber}`,
    htmlContent,
    null,
    null,
    'shipment-reply'  // <- Add this
  );
} catch (emailError) {
  console.error('Failed to send shipment reply email:', emailError.message);
}
```

#### 2. Newsletter Subscriptions

When sending newsletter confirmation emails:

```javascript
await sendMail(
  subscriberEmail,
  'Welcome to ESMOLOG Newsletter',
  htmlContent,
  null,
  null,
  'newsletter'  // <- Add this
);
```

#### 3. Bulk Emails (Multiple Recipients)

```javascript
import { sendMailToMultiple } from '@/server/utils/mailer';

const recipients = ['user1@example.com', 'user2@example.com'];

await sendMailToMultiple(
  recipients,
  'Newsletter - May 2024',
  htmlContent,
  'newsletter'  // <- Add email type
);
```

## Log File Locations

- **Main Log File**: `logs/email-logs.json`
- **Statistics File**: `logs/email-stats.json`

### Log File Structure

**email-logs.json**:
```json
{
  "logs": [
    {
      "id": "email_1234567890_abc123",
      "timestamp": "2024-05-16T10:30:00Z",
      "to": "user@example.com",
      "subject": "Email Subject",
      "emailType": "contact-form",
      "success": true,
      "messageId": "brevo_msg_12345",
      "error": null,
      "userId": "user_id_123",
      "metadata": {},
      "loggedAt": "2024-05-16T10:30:00Z"
    }
  ],
  "lastUpdated": "2024-05-16T10:35:00Z"
}
```

**email-stats.json**:
```json
{
  "totalSent": 150,
  "totalFailed": 5,
  "byType": {
    "contact-form": { "sent": 50, "failed": 2 },
    "shipment-status": { "sent": 80, "failed": 2 },
    "contact-reply": { "sent": 15, "failed": 1 },
    "newsletter": { "sent": 5, "failed": 0 }
  },
  "byStatus": { "success": 150, "failed": 5 },
  "lastUpdated": "2024-05-16T10:35:00Z"
}
```

## Console Output

When emails are sent, you'll see console logs like:

### Successful Send
```
✅ EMAIL LOG [CONTACT-FORM]: {
  to: 'user@example.com',
  subject: 'New Contact Form Submission from...',
  success: true,
  messageId: 'brevo_msg_12345',
  timestamp: '2024-05-16T10:30:00Z'
}
```

### Failed Send
```
✅ EMAIL LOG [SHIPMENT-STATUS]: {
  to: 'user@example.com',
  subject: 'Shipment Status Update...',
  success: false,
  error: 'Failed to connect to Brevo API',
  timestamp: '2024-05-16T10:30:00Z'
}
```

## Maintenance

### Log Rotation

Logs are automatically limited to the last 10,000 entries. To manually clear old logs:

```javascript
// Clear logs older than 30 days
const removed = clearOldLogs(30);
console.log(`Removed ${removed} old logs`);
```

Or via API:

```bash
POST /api/email-logs
Content-Type: application/json

{
  "action": "clear-old",
  "days": 30
}
```

## Monitoring Dashboard

To view email logs in your admin dashboard, you can create a dashboard page using the API:

```javascript
// Example component
const EmailLogsPage = async () => {
  // Fetch stats
  const statsRes = await fetch('/api/email-logs?filter=stats');
  const stats = await statsRes.json();

  // Fetch recent logs
  const logsRes = await fetch('/api/email-logs?limit=50');
  const logs = await logsRes.json();

  return (
    <div>
      <h1>Email Logs</h1>
      <div>
        <p>Total Sent: {stats.stats?.totalSent}</p>
        <p>Total Failed: {stats.stats?.totalFailed}</p>
      </div>
      <table>
        <tbody>
          {logs.logs?.map(log => (
            <tr key={log.id}>
              <td>{log.timestamp}</td>
              <td>{log.to}</td>
              <td>{log.subject}</td>
              <td>{log.emailType}</td>
              <td>{log.success ? '✅' : '❌'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

## Troubleshooting

### Logs not being created?

1. Check that `/logs` directory exists and has write permissions
2. Ensure `emailLogger.js` is properly imported in `mailer.js`
3. Check console for any import errors

### Missing email type?

If you notice emails aren't being categorized properly:

1. Check the email sending code uses the 6th parameter: `'your-email-type'`
2. Ensure the email type matches one of the standard types or create a new one
3. All email types are tracked in statistics

### Performance concerns?

- Logs are capped at 10,000 entries
- Old logs can be cleared via the `clearOldLogs()` function
- For high-volume applications, consider implementing log archival

## Best Practices

1. **Always specify email type** - Use descriptive email types for better tracking
2. **Handle failures gracefully** - Wrap email sends in try-catch blocks
3. **Review failed emails** - Regularly check failed emails and investigate
4. **Archive old logs** - Keep logs manageable with periodic cleanup
5. **Monitor metrics** - Use the stats endpoint to track email health

## API Reference

### GET /api/email-logs

Retrieve email logs with filters.

**Query Parameters:**
- `limit` (number) - Limit number of results (default: 100)
- `type` (string) - Filter by email type
- `filter` (string) - Predefined filter: 'stats', 'failed', 'recent', or omit for all
- `hours` (number) - For 'recent' filter, hours to look back (default: 24)
- `format` (string) - Response format: 'json' (default) or 'csv'

**Example Requests:**

```bash
# Get last 50 logs
GET /api/email-logs?limit=50

# Get all failed emails
GET /api/email-logs?filter=failed

# Get contact form emails
GET /api/email-logs?type=contact-form

# Get statistics
GET /api/email-logs?filter=stats

# Export last 500 logs as CSV
GET /api/email-logs?limit=500&format=csv
```

### POST /api/email-logs

Perform actions on email logs.

**Body:**
```json
{
  "action": "clear-old",
  "days": 30
}
```

**Actions:**
- `clear-old` - Remove logs older than specified days

## Summary

Your email system now has:

✅ **Comprehensive Logging** - All emails tracked with timestamps, recipients, and status
✅ **Email Type Categorization** - Emails organized by purpose (contact-form, shipment-status, etc.)
✅ **Statistics Tracking** - See success rates and volumes by type
✅ **API Access** - Retrieve logs programmatically for dashboards
✅ **CSV Export** - Export logs for analysis
✅ **Failure Tracking** - Easily identify and debug failed emails
✅ **Automatic Cleanup** - Old logs automatically managed
✅ **Console Logging** - Immediate feedback in development

You can now monitor email sends across your entire application!
