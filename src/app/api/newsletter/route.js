import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Newsletter } from '@/server/models/Newsletter';
import User from '@/server/models/User';

export async function GET(request) {
  try {
    // Check authentication (admin only)
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Fetch all newsletters
    const newsletters = await Newsletter.find({})
      .populate('sentBy', 'name email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(newsletters, { status: 200 });
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletters' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  return NextResponse.json({ error: 'Use /api/newsletter/send for sending newsletters' }, { status: 400 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Newsletter route not implemented (Next conversion required)' }, { status: 501 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Newsletter route not implemented (Next conversion required)' }, { status: 501 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Newsletter route not implemented (Next conversion required)' }, { status: 501 });
}

