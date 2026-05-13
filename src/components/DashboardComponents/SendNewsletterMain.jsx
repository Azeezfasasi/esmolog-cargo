'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function SendNewsletterMain() {
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();
  const router = useRouter();
    
     // Determine if the user has permission to manage events
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // State for form fields
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [subject, content]);

  // Mutation for sending a newsletter
  const sendNewsletterMutation = useMutation({
    mutationFn: async (newsletterData) => {
      // Your backend route POST /newsletter/send is protected by authorize('admin').
      const response = await axios.post(`${API_BASE_URL}/newsletter/send`, newsletterData);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Newsletter sent successfully to all subscribers!');
      setLocalError(''); // Clear any previous errors
      // Invalidate any queries that might display a list of sent newsletters
      // For example, if you had a 'sentNewsletters' query:
      // queryClient.invalidateQueries({ queryKey: ['sentNewsletters'] });

      // Clear form fields
      setSubject('');
      setContent('');

      // Optional: Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/allnewsletter');
      }, 2000);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to send newsletter. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Client-side validation
    if (!subject.trim() || !content.trim()) {
      setLocalError('Subject and Content cannot be empty.');
      return;
    }

    // Trigger the mutation
    sendNewsletterMutation.mutate({ subject, content });
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking permissions...
        </div>
      </section>
    );
  }

  // Check if user is authenticated and is an admin
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to send newsletters.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Send New Newsletter
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
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here..."
              rows="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={sendNewsletterMutation.isPending}
          >
            {sendNewsletterMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Send Newsletter'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default SendNewsletterMain;
