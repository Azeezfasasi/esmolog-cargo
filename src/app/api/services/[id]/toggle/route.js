import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Services from '@/server/models/Services';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    const user = await verifyAuth(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { id } = params;

    const service = await Services.findById(id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    service.isActive = !service.isActive;
    await service.save();

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Error toggling service status:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
