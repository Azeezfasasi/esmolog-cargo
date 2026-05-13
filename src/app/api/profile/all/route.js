import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { requireAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    
    // Fetch all users
    const users = await User.find({}).select('-password').lean();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
