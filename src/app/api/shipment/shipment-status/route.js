import { NextResponse } from 'next/server';
import { sendMail } from '@/server/utils/mailer';

export async function GET() {
  return NextResponse.json({ error: 'Shipment-status route not implemented (Next conversion required)' }, { status: 501 });
}

export async function POST(request) {
  try {
    const { shipmentId, status, recipientEmail } = await request.json();

    if (!shipmentId || !status || !recipientEmail) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    console.log('📧 Shipment Status API called with data:', { shipmentId, status, recipientEmail });

    // Send email notification to the recipient
    const subject = `Shipment Status Update for ID: ${shipmentId}`;
    const htmlContent = `<p>Your shipment with ID <strong>${shipmentId}</strong> has been updated to the following status:</p>
                         <p><strong>Status:</strong> ${status}</p>`;

    await sendMail(recipientEmail, subject, htmlContent, null, null, 'shipment-status');

    return NextResponse.json({ message: 'Shipment status updated and notification sent' }, { status: 200 });
  } catch (error) {
    console.error('Error in Shipment Status API:', error);
    return NextResponse.json({ error: 'Failed to update shipment status' }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ error: 'Shipment-status route not implemented (Next conversion required)' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Shipment-status route not implemented (Next conversion required)' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Shipment-status route not implemented (Next conversion required)' }, { status: 501 });
}

