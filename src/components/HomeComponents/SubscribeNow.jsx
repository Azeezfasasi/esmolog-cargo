'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api'; // Adjust path as needed

function SubscribeNow() {
  const queryClient = useQueryClient();

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // State for messages and loading
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [name, email]);

  // Mutation for subscribing to the newsletter
  const subscribeMutation = useMutation({
    mutationFn: async (subscriberData) => {
      // This endpoint is public, as per your newsletter routes
      const response = await axios.post(`${API_BASE_URL}/newsletter/subscribe`, subscriberData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Successfully subscribed to the newsletter!');
      setLocalError(''); // Clear any previous errors
      // Optionally, invalidate any queries that list subscribers if this component is also used
      // in an admin view that shows real-time subscriber count.
      queryClient.invalidateQueries({ queryKey: ['allSubscribers'] });

      // Clear form fields after successful submission
      setName('');
      setEmail('');
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to subscribe. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Client-side validation
    if (!name.trim() || !email.trim()) {
      setLocalError('Please enter your name and email address.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    // Trigger the mutation
    subscribeMutation.mutate({ name, email });
  };

  return (
    <div className="lg:col-span-1 md:col-span-2 text-left p-6 rounded-xl bg-gray-900 shadow-lg"> {/* Added padding and background for better visual */}
      <h3 className="text-[14px] font-extrabold text-white mb-4">
        SUBSCRIBE TO GET LATEST <br /> UPDATES AND NEWS
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4"> {/* Increased gap for better spacing */}
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

        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
          required
        />
        <input
          type="email"
          placeholder="Yourmail@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-grow px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
          required
        />
        <button
          type="submit"
          className="px-6 py-3 bg-green-300 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-green-400 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={subscribeMutation.isPending} // Disable button when loading
        >
          {subscribeMutation.isPending ? (
            <svg className="animate-spin h-5 w-5 text-gray-900 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            'SUBSCRIBE'
          )}
        </button>
      </form>
    </div>
  );
}

export default SubscribeNow;
