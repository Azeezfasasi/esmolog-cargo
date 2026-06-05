import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { sendSMS } from '@/server/utils/smsService';
import SMSLog from '@/server/models/SMSLog';

export async function POST(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { phoneNumber, message } = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    console.log('[SMS Test] Sending test SMS to:', phoneNumber);
    const result = await sendSMS(phoneNumber, message);

    // Log the SMS
    const smsLog = new SMSLog({
      phoneNumber,
      message,
      status: result.success ? 'sent' : 'failed',
      eventType: 'CUSTOM',
      recipientType: 'other',
      messageId: result.messageId,
      apiResponse: result.data,
      error: result.error,
    });

    await smsLog.save();

    if (result.success) {
      return NextResponse.json({
        message: 'Test SMS sent successfully',
        result,
      });
    } else {
      console.error('[SMS Test] Failed to send SMS:', result.details);
      return NextResponse.json(
        {
          message: 'Failed to send test SMS',
          error: result.error,
          details: result.details,
          hint: 'Check your BulkSMS API credentials and base URL in the environment variables.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error sending test SMS:', error.message);
    return NextResponse.json(
      { error: 'Failed to send test SMS', details: error.message },
      { status: 500 }
    );
  }
}
