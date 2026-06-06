import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';

export async function GET(request) {
  try {
    // Check authentication - user must be logged in
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const userEmail = authResult.user?.email;
    const userId = authResult.user?._id;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in authentication' },
        { status: 400 }
      );
    }

    // Query appointments where either:
    // 1. bookedBy matches the user ID, OR
    // 2. email matches the user's email (for backwards compatibility)
    const appointments = await Appointment.find({
      $or: [
        { bookedBy: userId },
        { email: { $regex: `^${userEmail}$`, $options: 'i' } } // Case-insensitive email match
      ]
    })
      .populate('bookedBy', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
