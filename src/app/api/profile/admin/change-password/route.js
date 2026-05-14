import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { hashPassword } from '@/lib/auth';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request) {
  try {
    // Verify authentication - only admin or employee can change user passwords
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized - authentication required' },
        { status: 401 }
      );
    }

    // Check authorization - only admin and employees can change user passwords
    if (!['admin', 'employee'].includes(decoded.role)) {
      return NextResponse.json(
        { error: 'Unauthorized - only admins and employees can change user passwords' },
        { status: 403 }
      );
    }

    await connectDB();

    // Parse request body
    const { email, newPassword } = await request.json();

    // Validation
    if (!email || !newPassword) {
      return NextResponse.json(
        { error: 'Email and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error changing user password:', error);
    return NextResponse.json(
      { error: 'Failed to change user password' },
      { status: 500 }
    );
  }
}
