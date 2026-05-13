import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Blog from '@/server/models/Blog';

export async function PUT(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = params;
    const body = await request.json();

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        title: body.title,
        author: body.author,
        content: body.content,
        category: body.category,
        tags: body.tags || [],
        status: body.status || 'draft',
      },
      { new: true }
    );

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
