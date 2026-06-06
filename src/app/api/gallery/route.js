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

// GET: Fetch all active gallery images (public endpoint)
export async function GET() {
  try {
    await connectDB();
    const images = await Gallery.find({ status: 'active' })
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });
    return NextResponse.json(images, { status: 200 });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery images' },
      { status: 500 }
    );
  }
}

// POST: Upload a new gallery image (admin/employee only)
export async function POST(request) {
  try {
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
    const { image, caption } = body;

    // Validate required fields
    if (!image) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // Upload image to Cloudinary with timeout configuration
    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: 'lasu-mba/gallery',
      resource_type: 'auto',
      timeout: 30000, // 30 second timeout
    });

    // Create gallery record
    const galleryImage = await Gallery.create({
      imageUrl: uploadResult.secure_url,
      caption: caption || '',
      uploadedBy: user._id,
      publicId: uploadResult.public_id,
      status: 'active',
    });

    // Populate uploadedBy before returning
    await galleryImage.populate('uploadedBy', 'name email');

    return NextResponse.json(galleryImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

