import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Return empty array for now - to be implemented with actual data fetching
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching contact form responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact form responses' },
      { status: 500 }
    );
  }
}
