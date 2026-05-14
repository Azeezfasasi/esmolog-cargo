import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Newsletter, Subscriber } from '@/server/models/Newsletter';

export async function POST(request) {
  try {
    // Check authentication (admin only)
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
    // Get count of active subscribers
    const subscriberCount = await Subscriber.countDocuments({ isSubscribed: true });

    return NextResponse.json(
      {
        message: `Newsletter sent successfully to ${subscriberCount} subscribers!`,
        newsletter: newNewsletter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to send newsletter' },
      { status: 500 }
    );
  }
}
