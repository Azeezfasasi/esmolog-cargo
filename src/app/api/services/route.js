import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Services from '@/server/models/Services';
import { verifyAuth } from '@/lib/auth';

// Get all active services
export async function GET() {
  try {
    await connectDB();
    
    const services = await Services.find({ isActive: true }).lean();
    
    // Convert Mongoose documents to plain objects for serialization
    const plainServices = JSON.parse(JSON.stringify(services));
    
    return NextResponse.json(plainServices);
  } catch (error) {
    console.error('Get services error:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}

// Create new service (protected)
export async function POST(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const service = new Services(body);
    await service.save();
    
    const plainService = JSON.parse(JSON.stringify(service));
    return NextResponse.json(plainService, { status: 201 });
  } catch (error) {
    console.error('Create service error:', error);
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 });
  }
}

// Update service (protected)
export async function PUT(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const body = await request.json();
    const service = await Services.findByIdAndUpdate(id, body, { new: true }).lean();
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    const plainService = JSON.parse(JSON.stringify(service));
    return NextResponse.json(plainService);
  } catch (error) {
    console.error('Update service error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}

// Delete service (protected)
export async function DELETE(request) {
  try {
    const user = await verifyAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Service ID required' }, { status: 400 });
    }

    const service = await Services.findByIdAndDelete(id);
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Service deleted' });
  } catch (error) {
    console.error('Delete service error:', error);
    return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
  }
}

