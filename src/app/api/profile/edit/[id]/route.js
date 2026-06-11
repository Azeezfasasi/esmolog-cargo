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

    // Parse request body - handle both JSON and FormData
    let body = {};
    
    try {
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        body = await request.json();
      } else if (contentType.includes('multipart/form-data')) {
        // Handle FormData
        const formData = await request.formData();
        for (const [key, value] of formData.entries()) {
          body[key] = value;
        }
      } else {
        body = await request.json();
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Allowed fields for editing
    const allowedFields = ['name', 'email', 'role', 'gender', 'phoneNumber', 'homeAddress', 'country', 'state', 'isDisabled', 'isSuspended', 'profileImageUrl'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (body[field] !== undefined && body[field] !== '') {
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
