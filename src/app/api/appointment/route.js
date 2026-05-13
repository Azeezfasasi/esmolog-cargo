// Next.js API route wrappers (no express)
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';
import { requireAuth } from '@/lib/auth';

// NOTE: This file previously tried to mount an Express router inside Next.
// Rewriting to proper Next route handlers ensures build succeeds.




export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    // Minimal Next implementation to keep UI connected; extend as needed.
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
    } = body;

    if (!name || !email || !appointmentDate || !appointmentTime) {
      return NextResponse.json(
        { message: 'Name, email, appointment date, and time are required.' },
        { status: 400 }
      );
    }

    // Auth is optional; if token exists, store bookedBy.
    const auth = await requireAuth(request);
    const bookedBy = auth?.user?.userId ?? null;

    const appointment = await Appointment.create({
      name,
      email,
      phoneNumber,
      address,
      country,
      state,
      message,
      appointmentDate,
      appointmentTime,
      bookedBy,
      status: 'pending',
    });

    return NextResponse.json({ message: 'Appointment created', appointment }, { status: 201 });
  } catch (error) {
    console.error('Appointment POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


