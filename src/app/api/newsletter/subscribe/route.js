import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Subscriber } from '@/server/models/Newsletter';

export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { email, name } = body;

    // Validate
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return NextResponse.json(
        { message: 'You are already subscribed to our newsletter!' },
        { status: 200 }
      );
    }

    // Create new subscriber
    const newSubscriber = new Subscriber({
      email,
      name,
      isSubscribed: true,
    });

    await newSubscriber.save();

    return NextResponse.json(
      { message: 'Successfully subscribed to the newsletter!' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe to newsletter' },
      { status: 500 }
    );
  }
}
