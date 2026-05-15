const ContactForm = require('../models/ContactForm');
const Shipment = require('../models/Shipment');
const { NotificationEmailService } = require('../services/emailService');
const User = require('../models/User');

// Helper function to generate unique tracking number
const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-5); // Last 5 digits of timestamp
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0'); // 6 random digits
  return `CAR${timestamp}${random}`;
};

exports.submitContactForm = async (req, res) => {
  try {
    console.log('📨 CONTACT FORM SUBMISSION RECEIVED:', {
      timestamp: new Date().toISOString(),
      body: req.body
    });
    
    const { 
      name, 
      email, 
      phoneNumber, 
      message,
      shippingType,
      originCountry,
      destinationCountry,
      weight,
      length,
      height
    } = req.body;
    
    const contact = new ContactForm({ 
      name, 
      email, 
      phoneNumber, 
      message,
      shippingType: shippingType || undefined,
      originCountry: originCountry || undefined,
      destinationCountry: destinationCountry || undefined,
      weight: weight || undefined,
      length: length || undefined,
      height: height || undefined
    });
    await contact.save();
    
    console.log('✅ CONTACT FORM SAVED TO DATABASE:', {
      id: contact._id,
      email: contact.email,
      name: contact.name,
      createdAt: contact.createdAt
    });

    // Create a corresponding Shipment record
    const trackingNumber = generateTrackingNumber();
    const shipment = new Shipment({
      trackingNumber,
      senderName: name,
      senderEmail: email,
      senderPhone: phoneNumber,
      recipientName: 'TBD', // To be determined after quote approval
      receiverEmail: email,
      origin: originCountry || 'Not specified',
      destination: destinationCountry || 'Not specified',
      status: 'pending', // Quote pending status
      items: message ? [message] : ['Shipment items to be determined'],
      weight: weight ? parseFloat(weight) : undefined,
      length: length || undefined,
      height: height || undefined,
      shipmentType: shippingType || 'Standard',
      shipmentPurpose: 'Quote Request',
      shipmentDate: new Date(),
      notes: `Quote request from ${name}. ${message ? 'Details: ' + message : ''}`,
      // Initialize tracking history with the initial state
      trackingHistory: [{
        status: 'pending',
        location: originCountry || 'Quote received',
        timestamp: new Date()
      }]
    });
    await shipment.save();

    console.log('✅ SHIPMENT CREATED FROM CONTACT FORM:', {
      id: shipment._id,
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      createdAt: shipment.createdAt
    });

    // Send confirmation email to client using template
    await NotificationEmailService.sendContactFormConfirmationToClient({
      name,
      email,
      subject: 'Quote Request Received',
      message
    }).catch(err => console.error('Failed to send client confirmation:', err));

    // Send notification to admin using template
    await NotificationEmailService.sendContactFormNotificationToAdmin({
      name,
      email,
      phoneNumber,
      message,
      createdAt: new Date()
    }).catch(err => console.error('Failed to send admin notification:', err));

    console.log('📤 SENDING RESPONSE:', { contactId: contact._id, shipmentId: shipment._id, trackingNumber: shipment.trackingNumber, status: 201 });
    res.status(201).json({
      success: true,
      message: 'Quote request received and shipment created successfully!',
      contact,
      shipment: {
        id: shipment._id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status
      }
    });
  } catch (err) {
    console.error('❌ ERROR SUBMITTING CONTACT FORM:', {
      message: err.message,
      stack: err.stack,
      body: req.body
    });
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

exports.getAllContactForms = async (req, res) => {
  try {
    // Populate repliedBy field to show who replied
    const contacts = await ContactForm.find().populate('repliedBy', 'name email').sort({ createdAt: -1 });
    res.json(contacts);
  } catch (err) {
    console.error('Error fetching all contact forms:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.editContactForm = async (req, res) => {
  try {
    const contact = await ContactForm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contact) return res.status(404).json({ message: 'Contact form not found' });
    res.json(contact);
  } catch (err) {
    console.error('Error editing contact form:', err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteContactForm = async (req, res) => {
  try {
    const contact = await ContactForm.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact form not found' });
    res.json({ message: 'Contact form deleted' });
  } catch (err) {
    console.error('Error deleting contact form:', err);
    res.status(500).json({ message: err.message });
  }
};

// Function to reply to a contact form submission
exports.replyToContactForm = async (req, res) => {
  try {
    const { id } = req.params; // Contact form ID
    const { subject, replyContent } = req.body;

    const contactForm = await ContactForm.findById(id);
    if (!contactForm) {
      return res.status(404).json({ message: 'Contact form not found.' });
    }
    if (!contactForm.email) {
      return res.status(400).json({ message: 'Cannot reply: Sender email not available.' });
    }

    // Send reply email to the sender using template
    await NotificationEmailService.sendContactFormReplyToClient({
      name: contactForm.name || 'Valued Member',
      email: contactForm.email,
      subject,
      replyContent
    }).catch(err => console.error('Failed to send reply email:', err));

    // Update contact form status, repliedBy, and repliedAt
    contactForm.status = 'replied';
    contactForm.repliedBy = req.user.id; // User who is logged in and replying
    contactForm.repliedAt = new Date();
    await contactForm.save();

    res.json({ message: 'Reply sent successfully and contact form updated.', contactForm });

  } catch (err) {
    console.error('Error replying to contact form:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
