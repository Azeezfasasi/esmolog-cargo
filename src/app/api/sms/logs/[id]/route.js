import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import SMSLog from '@/server/models/SMSLog';

export async function DELETE(request, { params }) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectDB();
    const { id } = params;

    const log = await SMSLog.findByIdAndDelete(id);

    if (!log) {
      return NextResponse.json(
        { error: 'SMS log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'SMS log deleted successfully' });
  } catch (error) {
    console.error('Error deleting SMS log:', error.message);
    return NextResponse.json(
      { error: 'Failed to delete SMS log' },
      { status: 500 }
    );
  }
}
