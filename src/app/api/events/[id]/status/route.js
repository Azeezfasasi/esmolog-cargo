import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Event from '@/server/models/Event';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['upcoming', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Status must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Update event status
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error updating event status:', error);
    return NextResponse.json(
      { error: 'Failed to update event status' },
      { status: 500 }
    );
  }
}
