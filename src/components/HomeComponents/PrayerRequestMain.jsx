'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';
import PrayerCard from './PrayerCard';

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

function PrayerRequestMain() {
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useProfile();
  const userId = user ? user._id : null;

  // State for the new prayer request form
  const [newPrayerRequestText, setNewPrayerRequestText] = useState('');
  const [formCategory, setFormCategory] = useState(''); 

  // --- React Query for fetching all prayer requests ---
  const {
    data: prayers,
    isLoading: prayersLoading,
    error: prayersError,
  } = useQuery({
    queryKey: ['allPrayerRequests'],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await axios.get(`${API_BASE_URL}/prayer-requests`);
      return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // --- React Query for sending a new prayer request ---
  const sendPrayerRequestMutation = useMutation({
    mutationFn: async (requestData) => {
      const response = await axios.post(`${API_BASE_URL}/prayer-requests`, requestData);
      return response.data;
    },
    onSuccess: () => {
      setNewPrayerRequestText(''); 
      setFormCategory('');
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] });
    },
    onError: (err) => {
      console.error('Error sending prayer request:', err);
    },
  });

  const handleNewPrayerSubmit = (e) => {
    e.preventDefault();
    if (!newPrayerRequestText.trim()) {
      sendPrayerRequestMutation.reset();
      sendPrayerRequestMutation.error = { response: { data: { message: "Prayer request cannot be empty." } } };
      return;
    }
    if (!formCategory.trim() || formCategory === 'Choose Category') { 
        sendPrayerRequestMutation.reset();
        sendPrayerRequestMutation.error = { response: { data: { message: "Please select a category." } } };
        return;
    }

    sendPrayerRequestMutation.mutate({
      request: newPrayerRequestText,
      category: formCategory
    });
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking authentication...
        </div>
      </section>
    );
  }

  // Check if user is authenticated before allowing submission or showing prayers
  if (!isAuthenticated) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          You must be logged in to send or view prayer requests.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Prayer Request Form (for sending new requests) */}
        <div className="bg-white p-8 rounded-xl shadow-lg mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Submit Your Prayer Request
          </h2>
          {sendPrayerRequestMutation.isSuccess && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">
              Your prayer request has been sent successfully!
            </div>
          )}
          {sendPrayerRequestMutation.isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
              {sendPrayerRequestMutation.error.response?.data?.message || 'Failed to send prayer request.'}
            </div>
          )}
          <form onSubmit={handleNewPrayerSubmit} className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                id="category"
                value={formCategory} // Controlled component
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                required
              >
                <option value="">Choose Prayer Category</option>
                <option value="General">General</option>
                <option value="Healing">Healing</option>
                <option value="Guidance">Guidance</option>
                <option value="Finances">Finances</option>
                <option value="Family">Family</option>
                <option value="Job Opportunity">Job Opportunity</option>
                <option value="Protection">Protection</option>
                <option value="Favour">Favour</option>
                <option value="Thanksgiving">Thanksgiving</option>
              </select>
            </div>

            <div>
              <label htmlFor="request" className="block text-sm font-medium text-gray-700 mb-1">
                Prayer Needed <span className="text-red-500">*</span>
              </label>
              <textarea
                id="request"
                value={newPrayerRequestText}
                onChange={(e) => setNewPrayerRequestText(e.target.value)}
                placeholder="Type your prayer request here..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              disabled={sendPrayerRequestMutation.isPending}
            >
              {sendPrayerRequestMutation.isPending ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Submit Prayer Request'
              )}
            </button>
          </form>
        </div>

        {/* Display All Prayers */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          All Prayer Requests
        </h2>

        {prayersLoading && (
          <div className="text-center text-lg text-gray-700 flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading prayers...
          </div>
        )}
        {prayersError && (user?.role === 'admin' ? (
          <div className="text-center text-lg text-red-600">
            Error loading prayers: {prayersError.response?.data?.message || prayersError.message}.
            <br />
            Make sure you are logged in as an Admin to view all requests.
          </div>
        ) : (
          <div className="text-center text-lg text-red-600">
            You do not have permission to view all prayer requests.
            <br />
            (Backend route &apos;/api/prayer-requests&apos; requires &apos;admin&apos; role)
          </div>
        ))}

        {!prayersLoading && !prayersError && (prayers?.length === 0 || !prayers) ? (
          <p className="text-center text-gray-600">No prayer requests yet. Be the first to submit one!</p>
        ) : (
          <div className="space-y-8">
            {prayers && prayers.map((prayer) => (
              <PrayerCard
                key={prayer._id} // Use _id from MongoDB
                prayer={prayer}
                userId={userId}
                isAuthenticated={isAuthenticated}
                formatTimestamp={formatTimestamp}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default PrayerRequestMain;
