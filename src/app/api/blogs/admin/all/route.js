import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Blog from '@/server/models/Blog';
import User from '@/server/models/User';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Fetch ALL blogs (admin view) - published, draft, and archived
    const blogs = await Blog.find({})
      .populate('sentBy', 'name email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
