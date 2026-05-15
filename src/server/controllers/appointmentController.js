const Appointment = require('../models/Appointment');
const { AppointmentEmailService } = require('../services/emailService');
const User = require('../models/User');

exports.createAppointment = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, country, state, message, appointmentDate, appointmentTime } = req.body;

    // Basic validation
    if (!name || !email || !appointmentDate || !appointmentTime) {
      return res.status(400).json({ message: 'Name, email, appointment date, and time are required.' });
    }

    const newAppointment = new Appointment({
      name,
      email,
      phoneNumber,
      address,
      country,
      state,
      message,
      appointmentDate,
      appointmentTime,
      bookedBy: req.user ? req.user.id : null,
      status: 'pending'
    });

    await newAppointment.save();

    // Send confirmation email to client using template
    await AppointmentEmailService.sendConfirmationToClient({
      name,
      email,
      appointmentDate,
      appointmentTime,
      appointmentId: newAppointment._id,
      message
    }).catch(err => console.error('Failed to send client confirmation:', err));

    // Send notification to admin using template
    await AppointmentEmailService.sendConfirmationToAdmin({
      name,
      email,
      phoneNumber,
      appointmentDate,
      appointmentTime,
      appointmentId: newAppointment._id,
      message,
      bookedBy: req.user ? req.user.id : 'Visitor'
    }).catch(err => console.error('Failed to send admin notification:', err));

    res.status(201).json({
      message: 'Appointment request submitted successfully. Check your email for confirmation.',
      appointment: newAppointment
    });

  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('bookedBy', 'name email') // Populate who booked it if a logged-in user
      .populate('cancelledBy', 'name email') // Populate who cancelled it
      .sort({ appointmentDate: 1, appointmentTime: 1 }); 
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getMyAppointments = async (req, res) => { // <-- NEW FUNCTION
  try {
    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }

    const appointments = await Appointment.find({ bookedBy: req.user.id })
      .populate('bookedBy', 'name email')
      .populate('cancelledBy', 'name email')
      .sort({ appointmentDate: 1, appointmentTime: 1 });

    res.json(appointments);
  } catch (err) {
    console.error('Error fetching user appointments:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('bookedBy', 'name email')
      .populate('cancelledBy', 'name email');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Authorization: Only admin/pastor or the user who booked it can view
    if (req.user.role !== 'admin' && req.user.role !== 'pastor' &&
        (appointment.bookedBy && appointment.bookedBy.toString() !== req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this appointment.' });
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error fetching appointment by ID:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const { name, email, phoneNumber, address, country, state, message, appointmentDate, appointmentTime, status } = req.body;

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { name, email, phoneNumber, address, country, state, message, appointmentDate, appointmentTime, status },
      { new: true, runValidators: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    res.json({ message: 'Appointment updated successfully.', appointment: updatedAppointment });
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!deletedAppointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Optional: Send email notification about deletion
    const emailContent = `
      <p>Hi ${deletedAppointment.name},</p>
      <p>Your appointment scheduled for ${formatDateForEmail(deletedAppointment.appointmentDate)} at ${deletedAppointment.appointmentTime} has been deleted by ESMOLOG Worldwide Cargo and Logistics staff.</p>
      <p>If you have any questions, please contact us.</p>
      <p>Sincerely,</p>
      <p>ESMOLOG Worldwide Cargo and Logistics Team</p>
    `;
    await sendMail(deletedAppointment.email, 'Your Appointment Has Been Deleted', emailContent);

    res.json({ message: 'Appointment deleted successfully.' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.rescheduleAppointment = async (req, res) => {
  try {
    const { newAppointmentDate, newAppointmentTime } = req.body;

    if (!newAppointmentDate || !newAppointmentTime) {
      return res.status(400).json({ message: 'New appointment date and time are required for rescheduling.' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    // Store old details before updating
    const oldDate = appointment.appointmentDate;
    const oldTime = appointment.appointmentTime;

    appointment.rescheduledFrom = { date: oldDate, time: oldTime };
    appointment.appointmentDate = newAppointmentDate;
    appointment.appointmentTime = newAppointmentTime;
    appointment.status = 'rescheduled';

    await appointment.save();

    // Send rescheduled email to client using template
    await AppointmentEmailService.sendRescheduledToClient({
      name: appointment.name,
      email: appointment.email,
      oldDate,
      oldTime,
      newDate: newAppointmentDate,
      newTime: newAppointmentTime,
      appointmentId: appointment._id
    }).catch(err => console.error('Failed to send rescheduled email:', err));

    res.json({ message: 'Appointment rescheduled successfully.', appointment });
  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    appointment.status = 'cancelled';
    appointment.cancelledBy = req.user ? req.user.id : null;

    await appointment.save();

    // Send cancellation email to client using template
    await AppointmentEmailService.sendCancelledToClient({
      name: appointment.name,
      email: appointment.email,
      appointmentDate: appointment.appointmentDate,
      appointmentTime: appointment.appointmentTime,
      appointmentId: appointment._id,
      reason: req.body.reason || null
    }).catch(err => console.error('Failed to send cancellation email:', err));

    res.json({ message: 'Appointment cancelled successfully.' });


    res.json({ message: 'Appointment cancelled successfully.', appointment });
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.changeAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status provided.' });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    const oldStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    // Optional: Send email notification about status change
    let emailSubject = `Your Appointment Status Updated to: ${status.charAt(0).toUpperCase() + status.slice(1)}`;
    let emailContent = `
      <p>Hi ${appointment.name},</p>
      <p>The status of your appointment scheduled for ${formatDateForEmail(appointment.appointmentDate)} at ${appointment.appointmentTime} has been updated from '${oldStatus}' to '${status}'.</p>
      <p>Please log in to your portal or contact us for more details.</p>
      <p>Sincerely,</p>
      <p>ESMOLOG Worldwide Cargo and Logistics Team</p>
    `;

    if (appointment.email) {
      await sendMail(appointment.email, emailSubject, emailContent);
    }

    res.json({ message: `Appointment status changed to ${status}.`, appointment });
  } catch (err) {
    console.error('Error changing appointment status:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};
