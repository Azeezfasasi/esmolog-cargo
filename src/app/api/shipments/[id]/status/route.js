import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';

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

    // Update status and add to tracking history
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      {
        $set: { status: body.status },
        $push: {
          trackingHistory: {
            status: body.status,
            location: body.location || '',
            timestamp: new Date(),
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
