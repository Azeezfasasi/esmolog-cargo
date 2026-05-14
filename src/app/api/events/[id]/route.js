import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Event from '@/server/models/Event';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await connectDB();

    // Fetch single event
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const body = await request.json();
    const {
      eventTitle,
      category,
      description,
      location,
      duration,
      time,
      date,
      address,
      organizer,
      coOrganizer,
      isRecurring,
      recurrenceType,
      recurrenceEndDate,
      monthlyRecurrenceDayOfWeek,
      monthlyRecurrenceOrdinal,
    } = body;

    // Validate required fields
    if (!eventTitle || !category || !description || !date) {
      return NextResponse.json(
        { error: 'Event title, category, description, and date are required' },
        { status: 400 }
      );
    }

    // Update the event
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      {
        eventTitle,
        category,
        description,
        location,
        duration,
        time,
        date: new Date(date),
        address,
        organizer,
        coOrganizer,
        isRecurring: isRecurring || false,
        recurrenceType: isRecurring ? recurrenceType : null,
        recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null,
        recurrenceDetails: isRecurring && recurrenceType === 'monthly_day' ? {
          dayOfWeek: monthlyRecurrenceDayOfWeek || null,
          ordinal: monthlyRecurrenceOrdinal || null,
        } : { dayOfWeek: null, ordinal: null },
      },
      { new: true }
    );

    if (!updatedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Event deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
