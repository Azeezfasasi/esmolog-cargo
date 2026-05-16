import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';
import { sendMail } from '@/server/utils/mailer';
import { shipmentStatusUpdateClient, shipmentStatusUpdateAdmin } from '@/server/emailTemplates/shipmentTemplates';

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * PATCH /api/shipments/[id]/status
 * Update shipment status and add tracking history entry
 */
export async function PATCH(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { error: 'Invalid shipment ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    if (!body.status || typeof body.status !== 'string') {
      return NextResponse.json(
        { error: 'Status is required and must be a string' },
        { status: 400 }
      );
    }

    // Generate a single timestamp for status update and email
    const statusTimestamp = new Date();

    // Update status and add to tracking history
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      {
        $set: { status: body.status },
        $push: {
          trackingHistory: {
            status: body.status,
            location: body.location || '',
            timestamp: statusTimestamp,
          },
        },
      },
      { new: true, runValidators: true }
    )
      .populate('sender', 'fullName email')
      .populate('replies.user', 'fullName email');

    if (!updatedShipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    console.log('📨 SHIPMENT STATUS UPDATE RECEIVED:', {
      timestamp: statusTimestamp.toISOString(),
      shipmentId: updatedShipment._id,
      status: body.status,
      location: body.location || ''
    });

    // Get client name and email with fallback to shipment fields
    const clientName = updatedShipment.sender?.fullName || updatedShipment.senderName || 'Client';
    const clientEmail = updatedShipment.sender?.email || updatedShipment.senderEmail;

    console.log('📋 CLIENT EMAIL DEBUG:', {
      senderExists: !!updatedShipment.sender,
      senderEmail: updatedShipment.sender?.email,
      senderName: updatedShipment.senderName,
      senderEmailField: updatedShipment.senderEmail,
      resolvedClientEmail: clientEmail,
      resolvedClientName: clientName
    });

    // Send confirmation email to client
    try {
      if (!clientEmail) {
        console.warn('⚠️ Client email not found, skipping client notification');
      } else {
        const userEmailContent = shipmentStatusUpdateClient({
          senderName: clientName,
          trackingNumber: updatedShipment.trackingNumber,
          status: body.status,
          location: body.location || '',
          updateTime: statusTimestamp.toISOString()
        });

        console.log(`📧 ATTEMPTING TO SEND CLIENT EMAIL to ${clientEmail}...`);

        await sendMail(
          clientEmail,
          `Your Shipment Status Has Been Updated to ${body.status}`,
          userEmailContent,
          null,
          null,
          'shipment-status-update'
        );

        console.log(`✅ CLIENT CONFIRMATION EMAIL SENT to ${clientEmail}`);
      }
    } catch (userEmailError) {
      console.error(`❌ FAILED TO SEND CLIENT EMAIL to ${clientEmail || updatedShipment.senderEmail}:`, userEmailError.message);
      console.error('Full error:', userEmailError);
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

        const adminEmailContent = shipmentStatusUpdateAdmin({
          shipmentId: updatedShipment._id,
          clientName: adminClientName,
          clientEmail: adminClientEmail,
          status: body.status,
          location: body.location || '',
          timestamp: statusTimestamp.toISOString()
        });

        // Send to each admin user
        let successCount = 0;
        let failureCount = 0;

        for (const adminEmail of adminEmails) {
          try {
            const replyToEmail = updatedShipment.sender?.email || updatedShipment.senderEmail || adminClientEmail;
            
            await sendMail(
              adminEmail,
              `Shipment ${updatedShipment._id} Status Updated to ${body.status}`,
              adminEmailContent,
              null,
              replyToEmail,
              'shipment-status-update'
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

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: updatedShipment,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return NextResponse.json(
      { error: 'Failed to update status', details: error.message },
      { status: 500 }
    );
  }
}
