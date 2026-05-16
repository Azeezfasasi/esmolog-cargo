import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const appointments = await Appointment.find()
      .populate('bookedBy', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, email, phoneNumber, address, country, state, message, appointmentDate, appointmentTime } = body;

    // Basic validation
    if (!name || !email || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { message: 'Name, email, appointment date, and time are required.' },
        { status: 400 }
      );
    }

    // Get user from auth if authenticated
    const authResult = await requireAuth(request, ['admin', 'employee', 'agent', 'client']);
    const userId = authResult.user?.id || null;

    const newAppointment = new Appointment({
      name,
      email,
      phoneNumber,
      address,
      country,
      state,
      message,
      appointmentDate,
      appointmentTime,
      bookedBy: userId,
      status: 'pending'
    });

    await newAppointment.save();

    return NextResponse.json(
      {
        message: 'Appointment request submitted successfully. Check your email for confirmation.',
        appointment: newAppointment
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { message: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}
