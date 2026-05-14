import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Blog from '@/server/models/Blog';
import User from '@/server/models/User';

export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: draft, published, or archived' },
        { status: 400 }
      );
    }

    // Update the blog status
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('sentBy', 'name email');

    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error('Error updating blog status:', error);
    return NextResponse.json(
      { error: 'Failed to update blog status' },
      { status: 500 }
    );
  }
}
