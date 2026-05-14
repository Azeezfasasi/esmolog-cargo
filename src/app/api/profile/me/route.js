import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(request) {
  try {
    // Verify authentication
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch the current user by ID from the decoded token
    const user = await User.findById(decoded._id).select('-password').lean();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}
