import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import connectDB from '@/lib/db';
import { sendMail } from '@/server/utils/mailer';
import { contactFormSubmissionClient, contactFormSubmissionAdmin } from '@/server/emailTemplates/notificationTemplates';

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

    console.log('📨 CONTACT FORM SUBMISSION RECEIVED:', {
      timestamp: new Date().toISOString(),
      name,
      email,
      message: message.substring(0, 50)
    });

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

    console.log('✅ CONTACT MESSAGE SAVED TO DATABASE:', {
      id: contactMessage._id,
      email: contactMessage.email,
      name: contactMessage.name,
      createdAt: contactMessage.createdAt
    });

    // Send confirmation email to user
    try {
      const userEmailContent = contactFormSubmissionClient({
        name,
        email,
        message
      });

      await sendMail(
        email,
        'We Received Your Message',
        userEmailContent,
        null,
        null,
        'contact-form'
      );

      console.log(`✅ USER CONFIRMATION EMAIL SENT to ${email}`);
    } catch (userEmailError) {
      console.error(`❌ FAILED TO SEND USER EMAIL to ${email}:`, userEmailError.message);
    }

    // Send notification email to all admin and employee users
    try {
      // Import User model
      const { default: User } = await import('@/server/models/User');

      // Find all admin and employee users
      const adminUsers = await User.find({
        role: { $in: ['admin', 'employee'] }
      }).select('email fullName -_id');

      if (!adminUsers || adminUsers.length === 0) {
        console.warn('⚠️ No admin or employee users found to send notification.');
      } else {
        // Get unique email addresses
        const adminEmails = [...new Set(adminUsers.map(u => u.email).filter(Boolean))];

        console.log(`📧 SENDING ADMIN NOTIFICATION TO ${adminEmails.length} ADMIN USERS:`, adminEmails);

        const adminEmailContent = contactFormSubmissionAdmin({
          name,
          email,
          phoneNumber,
          message,
          createdAt: contactMessage.createdAt
        });

        // Send to each admin user
        let successCount = 0;
        let failureCount = 0;

        for (const adminEmail of adminEmails) {
          try {
            await sendMail(
              adminEmail,
              `New Contact Form Submission from ${name} - Requires Response`,
              adminEmailContent,
              null,
              email, // Reply-to sender's email
              'contact-form'
            );

            console.log(`✅ ADMIN NOTIFICATION EMAIL SENT to ${adminEmail}`);
            successCount++;
          } catch (emailError) {
            console.error(`❌ FAILED TO SEND ADMIN EMAIL to ${adminEmail}:`, emailError.message);
            failureCount++;
          }
        }

        console.log(
          `📊 ADMIN NOTIFICATION SUMMARY: ${successCount} sent successfully, ${failureCount} failed`
        );
      }
    } catch (adminEmailError) {
      console.error(`❌ ERROR SENDING ADMIN NOTIFICATIONS:`, adminEmailError.message);
    }

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
