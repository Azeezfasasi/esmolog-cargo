import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import connectDB from '@/lib/db';
import { verifyAuth } from '@/lib/auth';
import Gallery from '@/server/models/Gallery';
import User from '@/server/models/User';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET: Fetch a single gallery image
export async function GET(request, { params }) {
  try {
    const { id } = params;

    await connectDB();

    const image = await Gallery.findById(id).populate('uploadedBy', 'name email');

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(image, { status: 200 });
  } catch (error) {
    console.error('Error fetching gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

// PUT: Update gallery image caption
export async function PUT(request, { params }) {
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
    const { caption } = body;

    // Validate required fields
    if (caption === undefined) {
      return NextResponse.json(
        { error: 'Caption is required' },
        { status: 400 }
      );
    }

    // Update the image
    const updatedImage = await Gallery.findByIdAndUpdate(
      id,
      { caption },
      { new: true }
    ).populate('uploadedBy', 'name email');

    if (!updatedImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    return NextResponse.json(updatedImage, { status: 200 });
  } catch (error) {
    console.error('Error updating gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a gallery image and remove from Cloudinary
export async function DELETE(request, { params }) {
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

    // Find the image first to get the publicId for Cloudinary deletion
    const image = await Gallery.findById(id);

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Delete from Cloudinary if publicId exists
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (cloudError) {
        console.error('Cloudinary deletion error:', cloudError);
        // Continue with DB deletion even if Cloudinary deletion fails
      }
    }

    // Delete from database
    await Gallery.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Image deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
