import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAllTemplates } from '@/server/utils/smsTemplates';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const templates = getAllTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching SMS templates:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch SMS templates' },
      { status: 500 }
    );
  }
}
