import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Facility from '@/server/models/Facility';

export async function GET(request) {
  try {
    await connectDB();
    
    const facilities = await Facility.find({})
      .select('name code country state city address phone email')
      .lean();
    
    return NextResponse.json(facilities || []);
  } catch (error) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication - admin only
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const body = await request.json();

    const newFacility = new Facility({
      name: body.name,
      code: body.code,
      country: body.country,
      state: body.state,
      city: body.city,
      address: body.address,
      phone: body.phone,
      email: body.email,
    });

    await newFacility.save();
    return NextResponse.json(newFacility, { status: 201 });
  } catch (error) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}
