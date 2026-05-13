import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';

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

    // Add reply to shipment
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      {
        $push: {
          replies: {
            message: body.message.trim(),
            user: authResult.user?.userId || null,
            timestamp: new Date(),
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

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      data: updatedShipment,
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add reply', details: error.message },
      { status: 500 }
    );
  }
}
