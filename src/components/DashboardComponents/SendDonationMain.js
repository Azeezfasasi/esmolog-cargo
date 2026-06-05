'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api'; 

function SendDonationMain() {
  // Form states
  const [donorName, setDonorName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // UI states
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [churchAccountDetails, setChurchAccountDetails] = useState(null);

  // Clear messages when form fields change (except after successful submission)
  useEffect(() => {
    if (!showAccountDetails) { // Only clear if not in success state
      setLocalError('');
      setSuccessMessage('');
    }
  }, [donorName, email, amount, phoneNumber, address, message, isAnonymous, showAccountDetails]);

  // Mutation for sending donation
  const createDonationMutation = useMutation({
    mutationFn: async (donationData) => {
      const response = await axios.post(`${API_BASE_URL}/donations`, donationData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Donation submitted successfully!');
      setLocalError('');
      setChurchAccountDetails(data.churchAccountDetails); // Capture account details from response
      setShowAccountDetails(true); // Show the account details section

      // Clear form fields after successful submission
      setDonorName('');
      setEmail('');
      setAmount('');
      setPhoneNumber('');
      setAddress('');
      setMessage('');
      setIsAnonymous(false);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to submit donation. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage('');
      setShowAccountDetails(false); // Ensure details are hidden on error
      setChurchAccountDetails(null);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Client-side validation
    if (!amount || parseFloat(amount) <= 0) {
      setLocalError('Please enter a valid donation amount.');
      return;
    }
    if (!isAnonymous) {
      if (!donorName.trim()) {
        setLocalError('Please enter your name or choose to be anonymous.');
        return;
      }
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setLocalError('Please enter a valid email address or choose to be anonymous.');
        return;
      }
    }

    // Prepare data to send
    const donationData = {
      amount: parseFloat(amount),
      message: message.trim() || undefined,
      isAnonymous: isAnonymous,
    };

    if (!isAnonymous) {
      donationData.name = donorName.trim();
      donationData.email = email.trim();
      donationData.phoneNumber = phoneNumber.trim() || undefined;
      donationData.address = address.trim() || undefined;
    }

    createDonationMutation.mutate(donationData);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Support Our Church
        </h2>
        <p className="text-center text-gray-600 mb-6">
          Your generous contributions help us continue our mission and ministries.
        </p>

        {localError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{localError}</span>
          </div>
        )}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-4" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        )}

        {!showAccountDetails ? (
          // Donation Form
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Donation Amount ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 50.00"
                min="0.01"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label htmlFor="isAnonymous" className="ml-2 block text-sm text-gray-900">
                Donate Anonymously
              </label>
            </div>

            {!isAnonymous && (
              <>
                <div>
                  <label htmlFor="donorName" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="donorName"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={!isAnonymous}
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required={!isAnonymous}
                  />
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                    placeholder="123 Main St, City, State, Country"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Message (Optional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message with your donation..."
                rows="4"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={createDonationMutation.isPending}
            >
              {createDonationMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Submit Donation'
              )}
            </button>
          </form>
        ) : (
          // Church Account Details Display
          <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-2xl font-bold text-blue-800 mb-4">
              Thank You for Your Generosity!
            </h3>
            <p className="text-lg text-blue-700 mb-6">
              Please use the following details to complete your donation transfer.
              These details have also been sent to your email.
            </p>
            {churchAccountDetails && (
              <div className="space-y-3 text-left max-w-sm mx-auto">
                <p className="text-gray-800">
                  <strong>Bank Name:</strong> <span className="font-semibold">{churchAccountDetails.bankName}</span>
                </p>
                <p className="text-gray-800">
                  <strong>Account Name:</strong> <span className="font-semibold">{churchAccountDetails.accountName}</span>
                </p>
                <p className="text-gray-800">
                  <strong>Account Number:</strong> <span className="font-semibold">{churchAccountDetails.accountNumber}</span>
                </p>
                {/* Add other details if available, e.g., Swift Code, Bank Address */}
              </div>
            )}
            <button
              onClick={() => setShowAccountDetails(false)}
              className="mt-8 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200"
            >
              Make Another Donation
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

export default SendDonationMain;
