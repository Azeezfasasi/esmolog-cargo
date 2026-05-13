import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hero from '@/server/models/Hero';

export async function GET() {
  try {
    await connectDB();
    const slides = await Hero.find({ isActive: true }).sort({ order: 1 });
    return NextResponse.json(slides, { status: 200 });
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    
    const contentType = req.headers.get('content-type') || '';
    let headline, description, image, alt, cta, buttonText, order;

    if (contentType.includes('multipart/form-data')) {
      // Parse FormData
      const formData = await req.formData();
      headline = formData.get('headline');
      description = formData.get('description');
      alt = formData.get('alt');
      cta = formData.get('cta');
      buttonText = formData.get('buttonText');
      order = formData.get('order') || 0;
      
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
      order = data.order || 0;
    }

    if (!headline || !description || !image || !alt || !cta || !buttonText) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 });
    }

    const slide = await Hero.create({
      headline,
      description,
      image,
      alt,
      cta,
      buttonText,
      order: order || 0,
      isActive: true
    });

    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    console.error('Error creating hero slide:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

