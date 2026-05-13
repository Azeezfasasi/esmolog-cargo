'use client';

import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/components/context-api/ProfileContext';

function BookAppointmentMain() {
  const router = useRouter();
  const { isAuthenticated } = useProfile();// NEW: Get isAuthenticated from context

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [message, setMessage] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // UI states
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);

  // Clear messages when form fields change (except after successful submission)
  useEffect(() => {
    if (!showSuccessScreen) {
      setLocalError('');
      setSuccessMessage('');
    }
  }, [name, email, phoneNumber, address, country, state, message, appointmentDate, appointmentTime, showSuccessScreen]);

  // Mutation for booking an appointment
  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      // NEW LOGIC: Choose endpoint based on authentication status
      const endpoint = isAuthenticated ? `${API_BASE_URL}/appointments/authenticated` : `${API_BASE_URL}/appointments`;
      const response = await axios.post(endpoint, appointmentData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Appointment request submitted successfully! We will contact you shortly to confirm.');
      setLocalError('');
      setShowSuccessScreen(true);

      // Clear form fields after successful submission
      setName('');
      setEmail('');
      setPhoneNumber('');
      setAddress('');
      setCountry('');
      setState('');
      setMessage('');
      setAppointmentDate('');
      setAppointmentTime('');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to book appointment. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage('');
      setShowSuccessScreen(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');
    setShowSuccessScreen(false);

    // Client-side validation
    if (!name.trim() || !email.trim() || !appointmentDate || !appointmentTime) {
      setLocalError('Name, Email, Appointment Date, and Appointment Time are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (isNaN(selectedDateTime.getTime())) {
      setLocalError('Invalid date or time selected.');
      return;
    }
    if (selectedDateTime < new Date()) {
      setLocalError('Appointment date and time cannot be in the past.');
      return;
    }

    // Trigger the mutation
    bookAppointmentMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined,
      address: address.trim() || undefined,
      country: country.trim() || undefined,
      state: state.trim() || undefined,
      message: message.trim() || undefined,
      appointmentDate,
      appointmentTime,
    });
  };

  const handleBookAnotherAppointment = () => {
    setShowSuccessScreen(false);
    setSuccessMessage('');
    setLocalError('');
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-3xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Book An Appointment
        </h2>

        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{localError}</span>
          </div>
        )}

        {showSuccessScreen ? (
          <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-2xl font-bold text-green-800 mb-4">
              Appointment Scheduled!
            </h3>
            <p className="text-lg text-green-700 mb-6">
              {successMessage}
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleBookAnotherAppointment}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
              >
                Book Another Appointment
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
              >
                Go to Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-center text-gray-600 mb-6">
              Please fill out the form below to request an appointment with our church staff.
              We will get back to you to confirm the details.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john.doe@example.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country (Optional)
                  </label>
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State (Optional)
                  </label>
                  <input
                    type="text"
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="California"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="appointmentDate"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    id="appointmentTime"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Briefly describe the purpose of your appointment..."
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={bookAppointmentMutation.isPending}
              >
                {bookAppointmentMutation.isPending ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Book Appointment'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}

export default BookAppointmentMain;
