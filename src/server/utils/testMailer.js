const { sendMail } = require('./mailer');

(async () => {
  try {
    const recipient = 'fas.azeez@gmail.com'; // Replace with your test email
    const subject = 'Test Email from ESMOLOG';
    const htmlContent = '<p>This is a test email sent from the ESMOLOG system.</p>';

    const result = await sendMail(recipient, subject, htmlContent);
    console.log('Test email sent successfully:', result);
  } catch (error) {
    console.error('Error sending test email:', error);
  }
})();