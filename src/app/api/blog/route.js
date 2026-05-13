import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Blog from '@/server/models/Blog';
import { requireAuth } from '@/lib/auth';

// Get all blogs (admin) or published blogs (public)
export async function GET(request) {
  try {
    await connectDB();
    
    // Return all blogs for admin/employee, published for others
    const blogs = await Blog.find({})
      .populate('sentBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Get blogs error:', error);
    return NextResponse.json({ error: 'Failed to fetch blogs' }, { status: 500 });
  }
}

// Create new blog (protected)
export async function POST(request) {
  try {
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const body = await request.json();

    const blog = new Blog({
      title: body.title,
      author: body.author,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      status: body.status || 'draft',
      sentBy: authResult.user.userId,
    });

    await blog.save();
    
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Create blog error:', error);
    return NextResponse.json({ error: 'Failed to create blog' }, { status: 500 });
  }
}

