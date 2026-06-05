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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const filter = {};
    if (startDate || endDate) {
      filter.sentAt = {};
      if (startDate) {
        // Start from beginning of the day
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.sentAt.$gte = start;
      }
      if (endDate) {
        // End at end of the day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.sentAt.$lte = end;
      }
    }

    const total = await SMSLog.countDocuments(filter);
    const sent = await SMSLog.countDocuments({ ...filter, status: 'sent' });
    const failed = await SMSLog.countDocuments({ ...filter, status: 'failed' });
    const pending = await SMSLog.countDocuments({ ...filter, status: 'pending' });
    const delivered = await SMSLog.countDocuments({ ...filter, status: 'delivered' });

    // Get breakdown by event type
    const byEventType = await SMSLog.aggregate([
      { $match: filter },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Get breakdown by recipient type
    const byRecipientType = await SMSLog.aggregate([
      { $match: filter },
      { $group: { _id: '$recipientType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json({
      summary: {
        total,
        sent,
        failed,
        pending,
        delivered,
        successRate: total > 0 ? ((sent / total) * 100).toFixed(2) + '%' : '0%',
      },
      byEventType,
      byRecipientType,
    });
  } catch (error) {
    console.error('Error fetching SMS statistics:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch SMS statistics' },
      { status: 500 }
    );
  }
}
