import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import User from '@/server/models/User';
import { generateQRCode } from '@/lib/qrcode';

/**
 * GET /api/shipments
 * Fetch all shipments (paginated)
 */
export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Parse pagination parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Fetch shipments with pagination
    const shipments = await Shipment.find()
      .populate('sender', 'fullName email')
      .populate('replies.user', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Shipment.countDocuments();

    return NextResponse.json({
      success: true,
      data: shipments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching shipments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shipments', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shipments
 * Create a new shipment
 */
export async function POST(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const body = await request.json();

    // Validate required fields
    const errors = [];

    if (!body.trackingNumber) errors.push('Tracking number is required');
    if (!body.senderName) errors.push('Sender name is required');
    if (!body.recipientName) errors.push('Recipient name is required');
    if (!body.origin) errors.push('Origin is required');
    if (!body.destination) errors.push('Destination is required');
    if (!body.shipmentFacility) errors.push('Shipment facility is required');
    if (!body.weight && body.weight !== 0) errors.push('Weight is required');

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation failed',
          errors 
        },
        { status: 400 }
      );
    }

    // Generate QR code
    const qrCodeUrl = await generateQRCode(body.trackingNumber);

    // Create new shipment
    const newShipment = new Shipment({
      trackingNumber: body.trackingNumber,
      sender: body.sender || null,
      senderName: body.senderName,
      senderPhone: body.senderPhone || '',
      senderEmail: body.senderEmail || '',
      senderAddress: body.senderAddress || '',
      recipientName: body.recipientName,
      recipientPhone: body.recipientPhone || '',
      recipientAddress: body.recipientAddress || '',
      receiverEmail: body.receiverEmail || '',
      origin: body.origin,
      destination: body.destination,
      status: body.status || 'pending',
      items: Array.isArray(body.items) ? body.items : [],
      weight: body.weight ? Number(body.weight) : 0,
      length: body.length || '',
      width: body.width || '',
      height: body.height || '',
      breadth: body.breadth || '',
      volume: body.volume ? Number(body.volume) : null,
      cost: body.cost ? Number(body.cost) : null,
      shipmentDate: body.shipmentDate ? new Date(body.shipmentDate) : new Date(),
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      notes: body.notes || '',
      shipmentPieces: body.shipmentPieces || '',
      shipmentType: body.shipmentType || '',
      shipmentPurpose: body.shipmentPurpose || '',
      shipmentFacility: body.shipmentFacility,
      qrCodeUrl: qrCodeUrl,
      trackingHistory: [
        {
          status: body.status || 'pending',
          location: body.origin,
          timestamp: new Date(),
        },
      ],
      replies: [],
    });

    // Save to database
    await newShipment.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Shipment created successfully',
        data: newShipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating shipment:', error);

    // Handle duplicate tracking number
    if (error.code === 11000 && error.keyPattern?.trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Duplicate tracking number',
          code: 11000,
          errmsg: error.message,
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create shipment',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
