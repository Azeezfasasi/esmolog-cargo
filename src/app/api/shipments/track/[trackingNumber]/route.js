import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const { trackingNumber } = params;

    if (!trackingNumber) {
      return NextResponse.json(
        { error: 'Tracking number is required' },
        { status: 400 }
      );
    }

    const shipment = await Shipment.findOne({ trackingNumber })
      .populate('sender', 'name email phone')
      .lean();

    if (!shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(shipment);
  } catch (error) {
    console.error('Error tracking shipment:', error);
    return NextResponse.json(
      { error: 'Failed to track shipment' },
      { status: 500 }
    );
  }
}
