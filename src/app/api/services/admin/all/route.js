import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Services from '@/server/models/Services';
import { verifyAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const services = await Services.find().sort({ createdAt: -1 });
    return NextResponse.json(services, { status: 200 });
  } catch (error) {
    console.error('Error fetching all services:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
