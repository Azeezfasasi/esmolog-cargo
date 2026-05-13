import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Facility from '@/server/models/Facility';

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

    const updatedFacility = await Facility.findByIdAndUpdate(
      id,
      {
        name: body.name,
        code: body.code,
        country: body.country,
        state: body.state,
        city: body.city,
        address: body.address,
        phone: body.phone,
        email: body.email,
      },
      { new: true }
    );

    if (!updatedFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedFacility);
  } catch (error) {
    console.error('Error updating facility:', error);
    return NextResponse.json(
      { error: 'Failed to update facility' },
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

    const deletedFacility = await Facility.findByIdAndDelete(id);

    if (!deletedFacility) {
      return NextResponse.json(
        { error: 'Facility not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Facility deleted successfully' });
  } catch (error) {
    console.error('Error deleting facility:', error);
    return NextResponse.json(
      { error: 'Failed to delete facility' },
      { status: 500 }
    );
  }
}
