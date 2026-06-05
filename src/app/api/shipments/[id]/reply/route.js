import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';
import { sendMail } from '@/server/utils/mailer';
import { shipmentReplyClient, shipmentReplyAdmin } from '@/server/emailTemplates/shipmentTemplates';
import { sendSMS } from '@/server/utils/smsService';
import SMSLog from '@/server/models/SMSLog';

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

// Helper function to log SMS to database
const logSMSToDB = async (shipmentId, trackingNumber, phoneNumber, message, result, eventType, recipientType) => {
  try {
    const smsLog = new SMSLog({
      shipmentId,
      trackingNumber,
      phoneNumber,
      message,
      status: result.success ? 'sent' : 'failed',
      eventType,
      recipientType,
      messageId: result.messageId,
      apiResponse: result.data,
      error: result.error,
      creditsCost: result.data?.data?.cost || 0,
    });
    await smsLog.save();
    console.log('[SMS LOG] Saved to database:', smsLog._id);
  } catch (error) {
    console.error('[SMS LOG ERROR]:', error.message);
  }
};

/**
 * POST /api/shipments/[id]/reply
 * Add a reply to a shipment
 */
export async function POST(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    if (authResult.error) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shipment ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    if (!body.message || typeof body.message !== 'string' || body.message.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Message is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Generate a single timestamp for reply and email
    const replyTimestamp = new Date();

    // Add reply to shipment
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      {
        $push: {
          replies: {
            message: body.message.trim(),
            user: authResult.user?.userId || null,
            timestamp: replyTimestamp,
          },
        },
      },
      { new: true }
    )
      .populate('sender', 'fullName email')
      .populate('replies.user', 'fullName email');

    if (!updatedShipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Get client name and email with fallback to shipment fields
    const clientName = updatedShipment.sender?.fullName || updatedShipment.senderName || 'Client';
    const clientEmail = updatedShipment.sender?.email || updatedShipment.senderEmail;

    // Send confirmation email to client
    try {
      if (!clientEmail) {
        console.warn('⚠️ Client email not found, skipping client notification');
      } else {
        const userEmailContent = shipmentReplyClient({
          senderName: clientName,
          trackingNumber: updatedShipment.trackingNumber,
          message: body.message.trim(),
          timestamp: replyTimestamp.toISOString()
        });
        await sendMail(
          clientEmail,
          'Your Shipment Has a New Reply',
          userEmailContent,
          null,
          null,
          'shipment-reply'
        );
        console.log(`✅ CLIENT CONFIRMATION EMAIL SENT to ${clientEmail}`);
      }
    } catch (userEmailError) {
      console.error(`❌ FAILED TO SEND CLIENT EMAIL to ${clientEmail || updatedShipment.senderEmail}:`, userEmailError.message);
    }

    // Send notification email to all admin and employee users
    try {
      // Import User model
      const { default: User } = await import('@/server/models/User');

      // Find all admin and employee users
      const adminUsers = await User.find({
        role: { $in: ['admin', 'employee'] }
      }).select('email fullName -_id');

      if (!adminUsers || adminUsers.length === 0) {
        console.warn('⚠️ No admin or employee users found to send notification.');
      } else {
        // Get unique email addresses
        const adminEmails = [...new Set(adminUsers.map(u => u.email).filter(Boolean))];

        console.log(`📧 SENDING ADMIN NOTIFICATION TO ${adminEmails.length} ADMIN USERS:`, adminEmails);

        const adminClientName = updatedShipment.sender?.fullName || updatedShipment.senderName || 'Unknown';
        const adminClientEmail = updatedShipment.sender?.email || updatedShipment.senderEmail || 'unknown@example.com';

        const adminEmailContent = shipmentReplyAdmin({
          shipmentId: updatedShipment._id,
          clientName: adminClientName,
          clientEmail: adminClientEmail,
          message: body.message.trim(),
          timestamp: replyTimestamp.toISOString()
        });

        // Send to each admin user
        let successCount = 0;
        let failureCount = 0;

        for (const adminEmail of adminEmails) {
          try {
            const replyToEmail = updatedShipment.sender?.email || updatedShipment.senderEmail || adminClientEmail;
            
            await sendMail(
              adminEmail,
              `New Reply on Shipment ${updatedShipment._id}`,
              adminEmailContent,
              null,
              replyToEmail,
              'shipment-reply'
            );
            console.log(`✅ ADMIN NOTIFICATION EMAIL SENT to ${adminEmail}`);
            successCount++;
          } catch (emailError) {
            console.error(`❌ FAILED TO SEND ADMIN EMAIL to ${adminEmail}:`, emailError.message);
            failureCount++;
          }
        }

        console.log(
          `📊 ADMIN NOTIFICATION SUMMARY: ${successCount} sent successfully, ${failureCount} failed`
        );
      }
    } catch (adminEmailError) {
      console.error(`❌ ERROR SENDING ADMIN NOTIFICATIONS:`, adminEmailError.message);
    }

    // --- SMS NOTIFICATION: NEW REPLY (Sender & Recipient) ---
    try {
      console.log('[SHIPMENT REPLY API] Sending SMS for new reply:', updatedShipment.trackingNumber);
      
      const phones = [];
      const recipients = [];

      if (updatedShipment.senderPhone) {
        phones.push(updatedShipment.senderPhone);
        recipients.push({ phone: updatedShipment.senderPhone, type: 'sender' });
      }

      if (updatedShipment.recipientPhone) {
        phones.push(updatedShipment.recipientPhone);
        recipients.push({ phone: updatedShipment.recipientPhone, type: 'receiver' });
      }

      if (phones.length > 0) {
        const messagePreview = body.message.trim().substring(0, 50) + (body.message.trim().length > 50 ? '...' : '');
        const messageTemplate = `New reply on your shipment ${updatedShipment.trackingNumber}: "${messagePreview}"`;

        for (const recipient of recipients) {
          try {
            const result = await sendSMS(recipient.phone, messageTemplate);
            await logSMSToDB(
              updatedShipment._id,
              updatedShipment.trackingNumber,
              recipient.phone,
              messageTemplate,
              result,
              'SHIPMENT_REPLY',
              recipient.type
            );
          } catch (smsError) {
            console.error('[SHIPMENT REPLY API] Error sending SMS:', smsError.message);
          }
        }
      }
    } catch (smsError) {
      console.error('[SHIPMENT REPLY API] Error in SMS sending:', smsError.message);
    }

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      data: updatedShipment,
    });
  } catch (error) {
    // Replace with a robust logger in production, e.g., winston
    // logger.error('Error adding reply:', error);
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add reply', details: error.message },
      { status: 500 }
    );
  }
}
