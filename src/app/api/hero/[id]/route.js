import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hero from '@/server/models/Hero';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const slide = await Hero.findById(id);
    
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }
    
    return NextResponse.json(slide, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    
    const contentType = req.headers.get('content-type') || '';
    let headline, description, image, alt, cta, buttonText, order, isActive;

    if (contentType.includes('multipart/form-data')) {
      // Parse FormData
      const formData = await req.formData();
      headline = formData.get('headline');
      description = formData.get('description');
      alt = formData.get('alt');
      cta = formData.get('cta');
      buttonText = formData.get('buttonText');
      order = formData.get('order');
      isActive = formData.get('isActive');
      
      const imageFile = formData.get('image');
      if (imageFile && imageFile instanceof File) {
        const buffer = await imageFile.arrayBuffer();
        const base64 = Buffer.from(buffer).toString('base64');
        const mimeType = imageFile.type || 'image/jpeg';
        image = `data:${mimeType};base64,${base64}`;
      }
    } else {
      // Parse JSON
      const data = await req.json();
      headline = data.headline;
      description = data.description;
      image = data.image;
      alt = data.alt;
      cta = data.cta;
      buttonText = data.buttonText;
      order = data.order;
      isActive = data.isActive;
    }

    const slide = await Hero.findById(id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    // Update fields if provided
    if (headline !== undefined && headline !== null) slide.headline = headline;
    if (description !== undefined && description !== null) slide.description = description;
    if (image !== undefined && image !== null) slide.image = image;
    if (alt !== undefined && alt !== null) slide.alt = alt;
    if (cta !== undefined && cta !== null) slide.cta = cta;
    if (buttonText !== undefined && buttonText !== null) slide.buttonText = buttonText;
    if (order !== undefined && order !== null) slide.order = order;
    if (isActive !== undefined && isActive !== null) slide.isActive = isActive;

    await slide.save();
    return NextResponse.json(slide, { status: 200 });
  } catch (error) {
    console.error('Error updating hero slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;
    const updates = await req.json();

    const slide = await Hero.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    return NextResponse.json(slide, { status: 200 });
  } catch (error) {
    console.error('Error patching hero slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const slide = await Hero.findByIdAndDelete(id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Hero slide deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting hero slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
