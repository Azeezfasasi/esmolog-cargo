import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['client', 'admin', 'employee', 'agent']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Get user's shipments - filter by sender ID
    const userId = authResult.user.userId;
    const shipments = await Shipment.find({ sender: userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(shipments || []);
  } catch (error) {
    console.error('Error fetching user shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments' },
      { status: 500 }
    );
  }
}
