import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Import the model here to avoid issues with serverless functions
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    // Fetch single contact message
    const contact = await ContactMessage.findById(id);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(contact, { status: 200 });
  } catch (error) {
    console.error('Error fetching contact:', error);
    return NextResponse.json({ error: 'Failed to fetch contact' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Import the model here to avoid issues with serverless functions
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    const body = await request.json();
    const { name, email, phoneNumber, message, status } = body;

    // Update the contact message
    const updatedContact = await ContactMessage.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phoneNumber,
        message,
        status,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json(updatedContact, { status: 200 });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Import the model here to avoid issues with serverless functions
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    // Delete the contact message
    const deletedContact = await ContactMessage.findByIdAndDelete(id);

    if (!deletedContact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Contact deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting contact:', error);
    return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
  }
}
