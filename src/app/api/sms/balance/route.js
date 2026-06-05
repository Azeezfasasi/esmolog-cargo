import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkBalance } from '@/server/utils/smsService';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const result = await checkBalance();

    if (result.success) {
      return NextResponse.json({
        message: 'Balance retrieved successfully',
        balance: result.balance,
        currency: result.currency,
        cached: result.cached,
        cacheAge: result.cacheAge,
        data: result.data,
      });
    } else {
      console.error('[SMS Balance] Balance check failed:', result.details);
      return NextResponse.json(
        {
          message: 'Failed to retrieve balance',
          error: result.error,
          details: result.details,
          hint: 'Check your BulkSMS API credentials and base URL in the environment variables.',
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error checking SMS balance:', error.message);
    return NextResponse.json(
      { error: 'Failed to check SMS balance', details: error.message },
      { status: 500 }
    );
  }
}
