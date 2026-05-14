import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Event from '@/server/models/Event';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Fetch ALL events (admin view)
    const events = await Event.find({})
      .sort({ date: 1 })
      .lean();

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    console.error('Error fetching all events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}
