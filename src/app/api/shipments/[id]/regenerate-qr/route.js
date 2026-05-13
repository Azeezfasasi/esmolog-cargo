import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';
import { generateQRCode } from '@/lib/qrcode';
import { ObjectId } from 'mongodb';

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * POST /api/shipments/[id]/regenerate-qr
 * Regenerate QR code for a shipment
 */
export async function POST(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = params;

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid shipment ID format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the shipment
    const shipment = await Shipment.findById(id);

    if (!shipment) {
      return NextResponse.json(
        { success: false, error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Generate new QR code
    const qrCodeUrl = await generateQRCode(shipment.trackingNumber);

    // Update shipment with new QR code
    const updatedShipment = await Shipment.findByIdAndUpdate(
      id,
      { $set: { qrCodeUrl } },
      { new: true }
    )
      .populate('sender', 'fullName email')
      .populate('replies.user', 'fullName email');

    return NextResponse.json({
      success: true,
      message: 'QR code regenerated successfully',
      data: updatedShipment,
    });
  } catch (error) {
    console.error('Error regenerating QR code:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to regenerate QR code', details: error.message },
      { status: 500 }
    );
  }
}
