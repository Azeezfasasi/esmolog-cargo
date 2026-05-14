import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/server/models/User';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    // Verify authentication - only admins can delete users
    const decoded = verifyAuth(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    // Check authorization - only admins can delete users
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can delete users' },
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

    // Prevent admin from deleting themselves
    if (id === decoded._id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Find and delete user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
