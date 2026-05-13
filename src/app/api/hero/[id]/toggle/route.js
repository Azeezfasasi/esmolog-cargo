import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hero from '@/server/models/Hero';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const slide = await Hero.findById(id);
    if (!slide) {
      return NextResponse.json({ error: 'Hero slide not found' }, { status: 404 });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    return NextResponse.json(slide, { status: 200 });
  } catch (error) {
    console.error('Error toggling hero slide status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
