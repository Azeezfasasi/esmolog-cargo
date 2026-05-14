import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { verifyAuth } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    // Verify authentication - admin or employee can edit users
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    // Check authorization - only admin and employees can edit users
    if (!['admin', 'employee'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not have permission to edit users' },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Parse request body
    const body = await request.json();
    
    // Allowed fields for editing
    const allowedFields = ['name', 'email', 'role', 'gender', 'phoneNumber', 'homeAddress', 'country', 'state', 'isDisabled', 'isSuspended'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
