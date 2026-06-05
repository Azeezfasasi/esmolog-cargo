import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import SMSLog from '@/server/models/SMSLog';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const shipmentId = searchParams.get('shipmentId');
    const status = searchParams.get('status');
    const eventType = searchParams.get('eventType');

    const skip = (page - 1) * limit;
    const filter = {};

    if (shipmentId) filter.shipmentId = shipmentId;
    if (status) filter.status = status;
    if (eventType) filter.eventType = eventType;

    const logs = await SMSLog.find(filter)
      .populate('shipmentId', 'trackingNumber senderName recipientName')
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await SMSLog.countDocuments(filter);

    return NextResponse.json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching SMS logs:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch SMS logs' },
      { status: 500 }
    );
  }
}
