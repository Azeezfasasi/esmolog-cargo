import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Subscriber } from '@/server/models/Newsletter';

export async function GET(request) {
  try {
    // Check authentication (admin only)
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Fetch all subscribers
    const subscribers = await Subscriber.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
