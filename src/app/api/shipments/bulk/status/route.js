import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Shipment from '@/server/models/Shipment';

/**
 * PATCH /api/shipments/bulk/status
 * Update status for multiple shipments
 */
export async function PATCH(request) {
  try {
    // Check authentication - only admin and employees can perform bulk updates
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Parse request body
    const { shipmentIds, status } = await request.json();

    // Validate input
    if (!Array.isArray(shipmentIds) || shipmentIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid shipmentIds: must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!status || typeof status !== 'string') {
      return NextResponse.json(
        { error: 'Invalid status: must be a non-empty string' },
        { status: 400 }
      );
    }

    // Update all shipments with the new status
    const result = await Shipment.updateMany(
      { _id: { $in: shipmentIds } },
      {
        $set: {
          status: status,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No shipments found with the provided IDs' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: `Successfully updated ${result.modifiedCount} shipment(s) to status: ${status}`,
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating bulk shipment status:', error);
    return NextResponse.json(
      { error: 'Failed to update shipment statuses' },
      { status: 500 }
    );
  }
}
