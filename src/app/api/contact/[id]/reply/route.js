import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { sendMail } from '@/server/utils/mailer';

export async function POST(request, { params }) {
  try {
    const { id } = params;

    // Check authentication
    const authResult = await requireAuth(request, ['admin', 'employee']);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // Connect to database
    await connectDB();

    // Import the models
    const { default: ContactMessage } = await import('@/server/models/ContactMessage');

    const body = await request.json();
    const { subject, replyContent } = body;

    if (!subject || !replyContent) {
      return NextResponse.json(
        { error: 'Subject and reply content are required' },
        { status: 400 }
      );
    }

    // Find the contact message
    const contact = await ContactMessage.findById(id);

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Update the contact message with reply information
    contact.status = 'responded';
    contact.repliedBy = {
      name: authResult.user?.name || 'Admin',
      email: authResult.user?.email || 'admin@localhost',
    };
    contact.repliedAt = new Date();
    contact.replySubject = subject;
    contact.replyContent = replyContent;
    contact.updatedAt = new Date();

    await contact.save();

    // Send email to contact.email with the reply
    try {
      const htmlContent = `
        <h2>${subject}</h2>
        <div>${replyContent}</div>
        <hr />
        <p style="font-size: 12px; color: #999;">
          Sent by: ${authResult.user?.name || 'Admin'}<br />
          Time: ${new Date().toISOString()}
        </p>
      `;
      
      await sendMail(
        contact.email,
        `Re: ${subject}`,
        htmlContent,
        null,
        null,
        'contact-reply'
      );

      console.log(`✅ Contact reply email sent to ${contact.email} for contact ID: ${id}`);
    } catch (emailError) {
      console.error(`❌ Failed to send contact reply email to ${contact.email}:`, emailError.message);
      // Don't fail the entire request if email fails, but log it
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Reply sent successfully',
        data: contact,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
  }
}
