import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';
import { sendMail } from '@/server/utils/mailer';
import { shipmentCreatedClient, shipmentCreatedAdmin } from '@/server/emailTemplates/shipmentTemplates';

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

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

    // Send confirmation email to client
    try {
      const userEmailContent = shipmentCreatedClient({
        name: updatedShipment.sender.fullName,
        shipmentId: updatedShipment._id,
        message: body.message.trim(),
        timestamp: replyTimestamp.toISOString()
      });
      await sendMail(
        updatedShipment.sender.email,
        'Your Shipment Has a New Reply',
        userEmailContent,
        null,
        null,
        'shipment-reply'
      );
    } catch (emailError) {
      // Replace with a robust logger in production, e.g., winston
      // logger.error('Error sending email to client:', emailError);
      console.error('Error sending email to client:', emailError);
    }

    // Send notification email to all admin and employee users
    const adminUsers = await User.find({ role: { $in: ['admin', 'employee'] } }).select('email fullName -_id');
    for (const user of adminUsers) {
      await sendMail(
        user.email,
        'New Shipment Reply',
        `A new reply has been added to shipment ${updatedShipment._id}.`,
        null,
        null,
        'shipment-reply'
      );
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
