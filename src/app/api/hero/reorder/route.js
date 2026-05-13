import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hero from '@/server/models/Hero';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { slides } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Invalid slides data' }, { status: 400 });
    }

    // Update all slides with new order
    const updatePromises = slides.map(({ id, order }) =>
      Hero.findByIdAndUpdate(id, { order }, { new: true })
    );

    const updatedSlides = await Promise.all(updatePromises);
    return NextResponse.json(updatedSlides, { status: 200 });
  } catch (error) {
    console.error('Error reordering hero slides:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
