import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import SMSSettings from '@/server/models/SMSSettings';

export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    let settings = await SMSSettings.findOne();

    if (!settings) {
      settings = new SMSSettings();
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching SMS settings:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch SMS settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const updates = await request.json();

    // Prevent updating critical fields
    delete updates._id;
    delete updates.createdAt;

    let settings = await SMSSettings.findOne();

    if (!settings) {
      settings = new SMSSettings(updates);
    } else {
      Object.assign(settings, updates);
    }

    settings.updatedAt = new Date();
    await settings.save();

    return NextResponse.json({ message: 'SMS settings updated successfully', settings });
  } catch (error) {
    console.error('Error updating SMS settings:', error.message);
    return NextResponse.json(
      { error: 'Failed to update SMS settings' },
      { status: 500 }
    );
  }
}
