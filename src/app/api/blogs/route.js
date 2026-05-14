import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import Blog from '@/server/models/Blog';
import User from '@/server/models/User';

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Fetch only published blogs, sorted by most recent first
    const blogs = await Blog.find({ status: 'published' })
      .populate('sentBy', 'name email')
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(blogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
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

    // Create a new blog post
    const newBlog = new Blog({
      blogTitle,
      category,
      description,
      sentBy: authResult.user.userId, // User ID from auth (decoded JWT has userId)
      status: 'draft', // Default status is draft
      date: new Date(),
    });

    await newBlog.save();

    // Populate the sentBy field before returning
    await newBlog.populate('sentBy', 'name email');

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
