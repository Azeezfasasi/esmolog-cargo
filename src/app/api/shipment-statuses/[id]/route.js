import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import ShipmentStatus from '@/server/models/ShipmentStatus';

export async function PUT(request, { params }) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = params;
    const body = await request.json();

    const updatedStatus = await ShipmentStatus.findByIdAndUpdate(
      id,
      {
        name: body.name,
        code: body.code,
        description: body.description,
        color: body.color,
        category: body.category,
      },
      { new: true }
    );

    if (!updatedStatus) {
      return NextResponse.json(
        { error: 'Status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedStatus);
  } catch (error) {
    console.error('Error updating shipment status:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = params;

    const deletedStatus = await ShipmentStatus.findByIdAndDelete(id);

    if (!deletedStatus) {
      return NextResponse.json(
        { error: 'Status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Status deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment status:', error);
    return NextResponse.json(
      { error: 'Failed to delete shipment status' },
      { status: 500 }
    );
  }
}
