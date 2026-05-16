// Next.js API route wrappers (no express)
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Appointment from '@/server/models/Appointment';
import { requireAuth } from '@/lib/auth';
import { sendMail } from '@/server/utils/mailer';
import { appointmentConfirmationClient, appointmentConfirmationAdmin } from '@/server/emailTemplates/appointmentTemplates';

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

    // Send confirmation email to client
    try {
      const userEmailContent = appointmentConfirmationClient({
        name,
        appointmentDate,
        appointmentTime,
        appointmentId: appointment._id.toString(),
        message
      });

      await sendMail(
        email,
        'Appointment Request Confirmed',
        userEmailContent,
        null,
        null,
        'appointment'
      );

      console.log(`✅ CLIENT CONFIRMATION EMAIL SENT to ${email}`);
    } catch (userEmailError) {
      console.error(`❌ FAILED TO SEND CLIENT EMAIL to ${email}:`, userEmailError.message);
    }

    // Send notification email to all admin and employee users
    try {
      const { default: User } = await import('@/server/models/User');

      const adminUsers = await User.find({
        role: { $in: ['admin', 'employee'] }
      }).select('email fullName -_id');

      if (adminUsers && adminUsers.length > 0) {
        const adminEmails = [...new Set(adminUsers.map(u => u.email).filter(Boolean))];

        console.log(`📧 SENDING ADMIN NOTIFICATION TO ${adminEmails.length} ADMIN USERS`);

        const adminEmailContent = appointmentConfirmationAdmin({
          name,
          email,
          phoneNumber,
          appointmentDate,
          appointmentTime,
          appointmentId: appointment._id.toString(),
          message,
          bookedBy
        });

        let successCount = 0;
        let failureCount = 0;

        for (const adminEmail of adminEmails) {
          try {
            await sendMail(
              adminEmail,
              `New Appointment Request from ${name}`,
              adminEmailContent,
              null,
              email,
              'appointment'
            );

            console.log(`✅ ADMIN NOTIFICATION EMAIL SENT to ${adminEmail}`);
            successCount++;
          } catch (emailError) {
            console.error(`❌ FAILED TO SEND ADMIN EMAIL to ${adminEmail}:`, emailError.message);
            failureCount++;
          }
        }

        console.log(`📊 ADMIN NOTIFICATION SUMMARY: ${successCount} sent, ${failureCount} failed`);
      }
    } catch (adminEmailError) {
      console.error(`❌ ERROR SENDING ADMIN NOTIFICATIONS:`, adminEmailError.message);
    }

    return NextResponse.json({ message: 'Appointment created', appointment }, { status: 201 });
  } catch (error) {
    console.error('Appointment POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


