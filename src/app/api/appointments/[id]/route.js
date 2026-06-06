import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';
import mongoose from 'mongoose';

// PUT - Update appointment details
export async function PUT(request, { params }) {
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
    const {
      name,
      email,
      phoneNumber,
      address,
      country,
      state,
      message,
      appointmentDate,
      appointmentTime,
      status
    } = body;

    // Find and update the appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phoneNumber,
        address,
        country,
        state,
        message,
        appointmentDate,
        appointmentTime,
        status
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
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// PATCH - Handle specific appointment actions (reschedule, cancel, status change)
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
    const url = new URL(request.url);
    const pathname = url.pathname;

    let updatedAppointment;

    // Handle reschedule
    if (pathname.includes('/reschedule')) {
      const { newAppointmentDate, newAppointmentTime } = body;

      if (!newAppointmentDate || !newAppointmentTime) {
        return NextResponse.json(
          { message: 'New appointment date and time are required' },
          { status: 400 }
        );
      }

      updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        {
          appointmentDate: newAppointmentDate,
          appointmentTime: newAppointmentTime,
          status: 'rescheduled'
        },
        { new: true, runValidators: true }
      ).populate('bookedBy', 'name email');
    }
    // Handle cancel
    else if (pathname.includes('/cancel')) {
      updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        { status: 'cancelled' },
        { new: true, runValidators: true }
      ).populate('bookedBy', 'name email');
    }
    // Handle status change
    else if (pathname.includes('/status')) {
      const { status } = body;

      if (!status) {
        return NextResponse.json(
          { message: 'Status is required' },
          { status: 400 }
        );
      }

      const validStatuses = ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }

      updatedAppointment = await Appointment.findByIdAndUpdate(
        id,
        { status },
        { new: true, runValidators: true }
      ).populate('bookedBy', 'name email');
    }

    if (!updatedAppointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAppointment, { status: 200 });
  } catch (error) {
    console.error('Error patching appointment:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

// DELETE - Delete an appointment
export async function DELETE(request, { params }) {
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

    const deletedAppointment = await Appointment.findByIdAndDelete(id);

    if (!deletedAppointment) {
      return NextResponse.json(
        { message: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
