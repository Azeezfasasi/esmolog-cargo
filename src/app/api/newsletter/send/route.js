import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { Newsletter, Subscriber } from '@/server/models/Newsletter';
import { sendMail } from '@/server/utils/mailer';

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

    // Get active subscribers
    const subscribers = await Subscriber.find({ isSubscribed: true }).select('email name -_id');
    
    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json(
        {
          message: 'Newsletter created but no active subscribers found',
          newsletter: newNewsletter,
          subscriberCount: 0
        },
        { status: 201 }
      );
    }

    // Send newsletter to all active subscribers
    let successCount = 0;
    let failureCount = 0;

    console.log(`📧 SENDING NEWSLETTER TO ${subscribers.length} SUBSCRIBERS`);

    for (const subscriber of subscribers) {
      try {
        // Send the newsletter content to each subscriber
        await sendMail(
          subscriber.email,
          subject,
          content,
          null,
          null,
          'newsletter'
        );

        console.log(`✅ NEWSLETTER SENT to ${subscriber.email}`);
        successCount++;
      } catch (emailError) {
        console.error(`❌ FAILED TO SEND NEWSLETTER to ${subscriber.email}:`, emailError.message);
        failureCount++;
      }
    }

    console.log(`📊 NEWSLETTER SEND SUMMARY: ${successCount} sent successfully, ${failureCount} failed`);

    return NextResponse.json(
      {
        message: `Newsletter sent successfully to ${successCount}/${subscribers.length} subscribers!`,
        newsletter: newNewsletter,
        subscriberCount: subscribers.length,
        sentCount: successCount,
        failedCount: failureCount
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
