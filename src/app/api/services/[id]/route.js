import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Services from '@/server/models/Services';
import { verifyAuth } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const { id } = params;
    const service = await Services.findById(id);
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Error fetching service:', error);
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
    const { title, description, isActive } = await req.json();

    const service = await Services.findById(id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    // Update fields if provided
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();
    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Error updating service:', error);
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

    const service = await Services.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(service, { status: 200 });
  } catch (error) {
    console.error('Error patching service:', error);
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

    const service = await Services.findByIdAndDelete(id);
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
