import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Event from '@/server/models/Event';

export async function GET(request) {
  try {
    await connectDB();

    // Fetch only upcoming and published events, sorted by date
    const events = await Event.find({ status: 'upcoming' })
      .sort({ date: 1 })
      .lean();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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

    // Create the new event
    const newEvent = new Event({
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
      status: 'upcoming',
      isRecurring: isRecurring || false,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceEndDate: isRecurring ? new Date(recurrenceEndDate) : null,
      recurrenceDetails: isRecurring && recurrenceType === 'monthly_day' ? {
        dayOfWeek: monthlyRecurrenceDayOfWeek || null,
        ordinal: monthlyRecurrenceOrdinal || null,
      } : { dayOfWeek: null, ordinal: null },
    });

    await newEvent.save();

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}
