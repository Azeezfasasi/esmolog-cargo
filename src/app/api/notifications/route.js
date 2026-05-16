import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import PrayerRequest from '@/server/models/PrayerRequest';
import Shipment from '@/server/models/Shipment';
import { Subscriber } from '@/server/models/Newsletter';
import User from '@/server/models/User';

/**
 * GET /api/notifications
 * Fetch all notifications (prayer requests, shipment updates, subscriber changes)
 */
export async function GET(request) {
  try {
    // Check authentication (admin/employee only)
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Fetch pending prayer requests
    const prayerRequests = await PrayerRequest.find({ status: 'pending' })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch recent shipment status updates (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const shipments = await Shipment.find({
      'trackingHistory.timestamp': { $gte: oneDayAgo }
    })
      .populate('sender', 'fullName email')
      .sort({ 'trackingHistory.timestamp': -1 })
      .limit(10)
      .lean();

    // Fetch recent subscriber changes (subscriptions in last 24 hours)
    const subscribers = await Subscriber.find({
      updatedAt: { $gte: oneDayAgo }
    })
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean();

    // Fetch recent user changes (registrations in last 24 hours)
    const users = await User.find({
      createdAt: { $gte: oneDayAgo }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        prayerRequests,
        shipments,
        subscribers,
        users
      },
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error.message },
      { status: 500 }
    );
  }
}
