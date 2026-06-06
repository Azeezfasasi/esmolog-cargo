import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import ShipmentStatus from '@/server/models/ShipmentStatus';

export async function GET(request) {
  try {
    await connectDB();
    
    const statuses = await ShipmentStatus.find({ isActive: true })
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json(statuses || []);
  } catch (error) {
    console.error('Error fetching shipment statuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipment statuses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const body = await request.json();

    const newStatus = new ShipmentStatus({
      name: body.name,
      code: body.code,
      description: body.description,
      color: body.color,
      category: body.category,
    });

    await newStatus.save();
    return NextResponse.json(newStatus, { status: 201 });
  } catch (error) {
    console.error('Error creating shipment status:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];
      return NextResponse.json(
        { error: `A shipment status with ${field} "${value}" already exists` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create shipment status' },
      { status: 500 }
    );
  }
}

