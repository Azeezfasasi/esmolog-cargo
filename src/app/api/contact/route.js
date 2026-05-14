import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Import the model here to avoid issues with serverless functions
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    // Fetch all contact messages, sorted by most recent first
    const contacts = await ContactMessage.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json(contacts, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact form responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact form responses' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phoneNumber, message, shippingType, originCountry, destinationCountry, weight, length, height } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Import the model here to avoid issues with serverless functions
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    // Create a new contact message document
    const contactMessage = new ContactMessage({
      name,
      email,
      phoneNumber: phoneNumber || null,
      message,
      shippingType: shippingType || null,
      originCountry: originCountry || null,
      destinationCountry: destinationCountry || null,
      weight: weight || null,
      length: length || null,
      height: height || null,
      status: 'new',
      createdAt: new Date(),
    });

    await contactMessage.save();

    return NextResponse.json(
      { 
        success: true, 
        message: 'Contact form submitted successfully',
        data: contactMessage 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
