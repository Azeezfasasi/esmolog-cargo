'use client';

import React, { useState } from 'react';

function DonateMain() {
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const handleDonateSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess('');
    setFormError('');

    // Basic client-side validation
    if (!amount || parseFloat(amount) <= 0) {
      setFormError('Please enter a valid donation amount.');
      setFormLoading(false);
      return;
    }
    if (!name.trim() || !email.trim()) {
      setFormError('Please enter your name and email.');
      setFormLoading(false);
      return;
    }

    // Simulate API call for donation processing
    // In a real application, you would integrate with a payment gateway here (e.g., Stripe, PayPal, Paystack)
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

      // Simulate successful submission
      setFormSuccess('Thank you for your generous donation! You will receive a confirmation email shortly.');
      setAmount('');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Donation submission error:', error);
      setFormError('Failed to process your donation. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCopyClick = (text) => {
    // This is a workaround for document.execCommand('copy') which might be deprecated
    // but navigator.clipboard.writeText() might not work in all iframe environments.
    // For a production app outside Canvas, navigator.clipboard.writeText() is preferred.
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      alert('Copied to clipboard!'); // For Canvas, use a custom modal instead of alert
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(textarea);
  };


  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* Left Section: Donation Form */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Make a Donation
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Your generosity helps us continue our mission and ministries.
          </p>

          {formSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">
              {formSuccess}
            </div>
          )}
          {formError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              {formError}
            </div>
          )}

          <form onSubmit={handleDonateSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount (₦)
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 5000"
                min="1"
                step="any"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name (Optional)
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email (for receipt)
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message with your donation..."
                rows="3"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={formLoading}
            >
              {formLoading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Donate Now'
              )}
            </button>
          </form>
        </div>

        {/* Right Section: Bank Account Details */}
        <div className="bg-white p-8 rounded-xl shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Bank Transfer Details
            </h2>
            <p className="text-center text-gray-600 mb-8">
              You can also make a direct bank transfer using the details below.
            </p>

            <div className="space-y-6 text-left">
              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500">Bank Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-800">First National Bank</p>
                  <button onClick={() => handleCopyClick('First National Bank')} className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500">Account Name</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-800">The Church of Faith</p>
                  <button onClick={() => handleCopyClick('The Church of Faith')} className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                </div>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <p className="text-sm text-gray-500">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-800">1234567890</p>
                  <button onClick={() => handleCopyClick('1234567890')} className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Bank SWIFT/BIC (International)</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-gray-800">FNBMUS33</p>
                  <button onClick={() => handleCopyClick('FNBMUS33')} className="text-blue-600 hover:text-blue-800 text-sm">Copy</button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-8 text-center">
            Please include your name or &apos;Anonymous&APOS; in the transfer reference.
          </p>
        </div>

      </div>
    </section>
  );
}

export default DonateMain;
