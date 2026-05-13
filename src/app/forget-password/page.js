'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useMutation } from '@tanstack/react-query';
import { useProfile } from '@/components/context-api/ProfileContext';

function ForgetPasswordMain() {
  // Get forgotPassword function, clearError, and context-level error from ProfileContext
  const { forgotPassword, clearError, error: contextError } = useProfile();

  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState(''); // For client-side validation errors
  const [successMessage, setSuccessMessage] = useState(''); // For success messages

  // Effect to clear messages when email input changes or component mounts
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
    clearError(); // Clear context error as well when email changes
  }, [email, clearError]);

  // React Query useMutation hook for the forgot password process
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword, // The actual async function to call from ProfileContext
    onSuccess: (data) => {
      // This callback runs when the 'forgotPassword' function resolves successfully.
      if (data.success) {
        setSuccessMessage(data.message || 'If an account with that email exists, a password reset link has been sent to your inbox.');
        setLocalError(''); // Explicitly clear any local errors on success
        clearError(); // Explicitly clear any context errors on success
        setEmail(''); // Clear the email field after successful submission
      } else {
        // This case should ideally be caught by onError, but as a fallback
        setLocalError(data.error || 'Failed to send reset email due to an unexpected response.');
        setSuccessMessage(''); // Clear success message if this fallback error occurs
      }
    },
    onError: (err) => {
      // This callback runs when the 'forgotPassword' function rejects (e.g., network error, 4xx/5xx status)
      const errorMessage = err.response?.data?.message || 'An unexpected error occurred. Please try again.';
      setLocalError(errorMessage); // Set local error for display
      setSuccessMessage(''); // Explicitly clear success message on error
      clearError(); // Ensure context error is also cleared/updated by the mutation's error
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors before new submission
    setSuccessMessage(''); // Clear previous success messages before new submission
    clearError(); // Clear context error before new submission

    // Basic client-side validation
    if (!email || !email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    // Call the mutate function from useMutation
    forgotPasswordMutation.mutate(email); // Pass only the email string
  };

  // Determine which message to display
  // Prioritize success message, then local error, then context error
  const displayError = successMessage ? null : (localError || contextError);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Forgot Your Password?
        </h2>
        <p className="text-center text-gray-600 mb-8">
Enter your email address below and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Error Message */}
          {displayError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{displayError}</span>
            </div>
          )}
          {/* Display Success Message */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 placeholder-gray-400 transition duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={forgotPasswordMutation.isPending} // Use isPending from React Query
          >
            {forgotPasswordMutation.isPending ? ( // Use isPending for loading state
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
Remember your password?{' '}
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500 transition duration-200">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgetPasswordMain;
