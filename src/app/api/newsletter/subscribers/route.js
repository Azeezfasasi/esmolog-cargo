import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Subscriber } from '@/server/models/Newsletter';
import { sendMail } from '@/server/utils/mailer';

export async function GET(request) {
  try {
    // Check authentication (admin only)
    const authResult = await requireAuth(request, ['admin']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();

    // Fetch all subscribers
    const subscribers = await Subscriber.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(subscribers, { status: 200 });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    console.log('📧 Newsletter Subscription API called with email:', email);

    await connectDB();

    // Check if the email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json({ error: 'Email is already subscribed' }, { status: 409 });
    }

    // Add new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    // Send confirmation email
    const subject = 'Thank you for subscribing!';
    const htmlContent = `<p>Hi,</p><p>Thank you for subscribing to our newsletter!</p>`;
    await sendMail(email, subject, htmlContent);

    return NextResponse.json({ message: 'Subscription successful' }, { status: 201 });
  } catch (error) {
    console.error('Error in Newsletter Subscribers API:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}
