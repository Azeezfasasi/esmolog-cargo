import { NextResponse } from 'next/server';
import { sendMail } from '@/server/utils/mailer';

// NOTE: Converted from an Express router to a Next.js route.
// Extend with real contact form DB/email logic as needed.

export async function POST(request) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    console.log('📧 Contact Form API called with data:', { name, email, message });

    // Send email to admin
    const subject = `New Contact Form Submission from ${name}`;
    const htmlContent = `<p><strong>Name:</strong> ${name}</p>
                         <p><strong>Email:</strong> ${email}</p>
                         <p><strong>Message:</strong></p>
                         <p>${message}</p>`;

    await sendMail(process.env.BREVO_SENDER_EMAIL, subject, htmlContent, null, null, 'contact-form');

    return NextResponse.json({ message: 'Contact form submitted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error in Contact Form API:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Contact form route not implemented (Next conversion required)' }, { status: 501 });
}

