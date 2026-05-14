import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Gallery from '@/server/models/Gallery';
import User from '@/server/models/User';

// PATCH: Toggle gallery image status (active/archived)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;

    // Check authentication using Bearer token
    const user = verifyAuth(request);
    if (!user || !['admin', 'employee'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { status } = body;

    // Validate status value
    if (!status || !['active', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be either "active" or "archived"' },
        { status: 400 }
      );
    }

    // Update the image status
    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!updatedImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(updatedImage, { status: 200 });
  } catch (error) {
    console.error('Error updating gallery image status:', error);
    return NextResponse.json(
      { error: 'Failed to update image status' },
      { status: 500 }
    );
  }
}
