import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    // TODO: Implement fetching registrations from database
    // Filter by status if provided (e.g., 'pending', 'approved', 'rejected')
    
    return NextResponse.json({
      registrations: [],
      message: 'No registrations found'
    });
  } catch (error) {
    console.error('Programmes registrations API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}
