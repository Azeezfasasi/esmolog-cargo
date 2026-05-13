import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Hero from '@/server/models/Hero';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const slides = await Hero.find().sort({ order: 1 });
    return NextResponse.json(slides, { status: 200 });
  } catch (error) {
    console.error('Error fetching all hero slides:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
