import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Newsletter, Subscriber } from '@/server/models/Newsletter';

export async function POST(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    const body = await request.json();
    const { subject, content } = body;

    // Validate
    if (!subject || !content) {
      return NextResponse.json(
        { error: 'Subject and content are required' },
        { status: 400 }
      );
    }

    // Check if subscriber exists
    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
    }

    // Create newsletter record
    const newNewsletter = new Newsletter({
      subject,
      content,
      sentBy: authResult.user.userId,
      date: new Date(),
    });

    await newNewsletter.save();

    // TODO: Integrate actual email sending service (SendGrid, Mailgun, etc.)
    // For now, we just save the newsletter to database
    // In production, send email to subscriber.email

    return NextResponse.json(
      {
        message: `Newsletter sent successfully to ${subscriber.email}!`,
        newsletter: newNewsletter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending newsletter to subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
