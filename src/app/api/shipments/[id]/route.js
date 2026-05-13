import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * GET /api/shipments/[id]
 * Fetch a single shipment by ID
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shipment ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    const shipment = await Shipment.findById(id)
      .populate('sender', 'fullName email')
      .populate('replies.user', 'fullName email');

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: shipment,
    });
  } catch (error) {
    console.error('Error fetching shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch shipment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/shipments/[id]
 * Update a shipment
 */
export async function PUT(request, { params }) {
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

    // Remove fields that shouldn't be updated
    const { _id, createdAt, trackingNumber, ...updateData } = body;

    // Update shipment
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
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
      message: 'Shipment updated successfully',
      data: updatedShipment,
    });
  } catch (error) {
    console.error('Error updating shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update shipment', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shipments/[id]
 * Delete a shipment
 */
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent']);
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

    const deletedShipment = await Shipment.findByIdAndDelete(id);

    if (!deletedShipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Shipment deleted successfully',
      data: deletedShipment,
    });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete shipment', details: error.message },
      { status: 500 }
    );
  }
}
