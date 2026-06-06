import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';
import mongoose from 'mongoose';

export async function PATCH(request, { params }) {
  try {
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Invalid appointment ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { newAppointmentDate, newAppointmentTime } = body;

    if (!newAppointmentDate || !newAppointmentTime) {
      return NextResponse.json(
        { message: 'New appointment date and time are required' },
        { status: 400 }
      );
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        appointmentDate: newAppointmentDate,
        appointmentTime: newAppointmentTime,
        status: 'rescheduled'
      },
      { new: true, runValidators: true }
    ).populate('bookedBy', 'name email');

    if (!updatedAppointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to reschedule appointment' },
      { status: 500 }
    );
  }
}
