'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';

function ContactForm() {
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(''); 
  const [shippingType, setShippingType] = useState('');
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [weight, setWeight] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [message, setMessage] = useState('');

  // UI states
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Auto-dismiss success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear error message when form fields change
  useEffect(() => {
    setLocalError('');
  }, [name, email, phoneNumber, message, shippingType, originCountry, destinationCountry, weight, length, height]);

  // Mutation for submitting the contact form
  const submitContactFormMutation = useMutation({
    mutationFn: async (formData) => {
      // This endpoint is public, as per your backend routes
      console.log('Submitting contact form with data:', formData);
      const response = await axios.post(`${API_BASE_URL}/contact`, formData);
      console.log('Contact form response:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Contact form submitted successfully:', data);
      const trackingNumber = data.shipment?.trackingNumber;
      const message = trackingNumber 
        ? `Your quote request has been received! Your tracking number is: ${trackingNumber}. You can track your shipment at any time.`
        : 'Your message has been sent successfully! We will get back to you soon.';
      setSuccessMessage(message);
      setLocalError(''); // Clear any previous errors

      // Clear form fields after successful submission
      setName('');
      setEmail('');
      setPhoneNumber('');
      setMessage('');
      setShippingType('');
      setOriginCountry('');
      setDestinationCountry('');
      setWeight('');
      setLength('');
      setHeight('');
    },
    onError: (err) => {
      console.error('Contact form submission error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send message. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Client-side validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      setLocalError('Name, Email, and Message are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    console.log('Form validation passed, submitting...');
    // Trigger the mutation
    submitContactFormMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim() || undefined, // Send undefined if empty
      message: message.trim(),
      shippingType: shippingType.trim() || undefined,
      originCountry: originCountry.trim() || undefined,
      destinationCountry: destinationCountry.trim() || undefined, 
      weight: weight.trim() || undefined, 
      length: length.trim() || undefined, 
      height: height.trim() || undefined,
    });
  };

  return (
    <section className="bg-gray-200 flex justify-center mx-auto py-6 px-4 sm:px-6 lg:px-8 font-inter "> {/* Light gray background */}
      <div className="mx-auto flex flex-col justify-center items-center">

        {/* Left Section: Contact Form */}
        <div className="text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-6 uppercase tracking-wider">
            REQUEST A QUOTE
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {localError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                <span className="block sm:inline">{localError}</span>
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}

            <div>
              <label>Name</label>
              <input
                type="text"
                placeholder="Your full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label>Email</label>
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label>Phone Number</label>
              <input
                type="text"
                placeholder="Your Phone Number (Optional)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
              />
            </div>
            <div>
              <label>Shipping Type</label>
              <select name="shippingType" id="shippingType" value={shippingType} onChange={(e) => setShippingType(e.target.value)} className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500">
                <option value="">Select Shipping Type</option>
                <option value="Air Freight">Air Freight</option>
                <option value="Sea Freight">Sea Freight</option>
                <option value="Road Transport">Road Transport</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Origin Country</label>
              <input
                type="text"
                placeholder="Enter origin Country"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
              />
            </div>
            <div>
              <label>Destination Country</label>
              <input
                type="text"
                placeholder="Enter destination country"
                value={destinationCountry}
                onChange={(e) => setDestinationCountry(e.target.value)}
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
              />
            </div>
            <div className='grid grid-cols-3 gap-2'>
              <div>
                <label>Weight</label>
                <input
                  type="text"
                  placeholder="Enter weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
                />
              </div>
              <div>
                <label>Length</label>
                <input
                  type="text"
                  placeholder="Enter length (cm)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
                />
              </div>
              <div>
                <label>Height</label>
                <input
                  type="text"
                  placeholder="Enter height (cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500"
                />
              </div>
            </div>

            <div>
              <label>Shipping Details <span className='text-green-700 text-[14px]'>(You can list all the items you want to ship here)</span></label>
              <textarea
                placeholder="You can list all the items you want to ship here"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="6"
                className="w-full px-5 py-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-800 placeholder-gray-500 resize-y"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 bg-green-600 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={submitContactFormMutation.isPending} // Disable button when loading
            >
              {submitContactFormMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-gray-900 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'SEND MESSAGE'
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default ContactForm;

