import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Blog from '@/server/models/Blog';
import User from '@/server/models/User';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Connect to database
    await connectDB();

    // Fetch single blog
    const blog = await Blog.findById(id).populate('sentBy', 'name email');

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
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
    const { blogTitle, category, description } = body;

    // Validate required fields
    if (!blogTitle || !category || !description) {
      return NextResponse.json(
        { error: 'Blog title, category, and description are required' },
        { status: 400 }
      );
    }

    // Update the blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      {
        blogTitle,
        category,
        description,
      },
      { new: true }
    ).populate('sentBy', 'name email');

    if (!updatedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json(updatedBlog, { status: 200 });
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
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Delete the blog
    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Blog deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
