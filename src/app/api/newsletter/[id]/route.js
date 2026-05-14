import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Newsletter } from '@/server/models/Newsletter';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    await connectDB();

    // Fetch single newsletter
    const newsletter = await Newsletter.findById(id).populate('sentBy', 'name email');

    if (!newsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    return NextResponse.json(newsletter, { status: 200 });
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to fetch newsletter' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const body = await request.json();
    const { subject, content } = body;

    // Validate
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Update newsletter
    const updatedNewsletter = await Newsletter.findByIdAndUpdate(
      id,
      { subject, content },
      { new: true }
    ).populate('sentBy', 'name email');

    if (!updatedNewsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    return NextResponse.json(updatedNewsletter, { status: 200 });
  } catch (error) {
    console.error('Error updating newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to update newsletter' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const deletedNewsletter = await Newsletter.findByIdAndDelete(id);

    if (!deletedNewsletter) {
      return NextResponse.json({ error: 'Newsletter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Newsletter deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to delete newsletter' },
      { status: 500 }
    );
  }
}
