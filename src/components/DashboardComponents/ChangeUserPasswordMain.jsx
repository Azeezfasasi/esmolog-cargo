'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function ChangeUserPasswordMain() {
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();
  const router = useRouter();

  const [targetUserEmail, setTargetUserEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [targetUserEmail, newPassword, confirmNewPassword]);

  // Mutation for changing user password by admin/pastor
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData) => {
      // This endpoint is protected by authorizeRole(['admin', 'pastor']) on the backend
      const response = await axios.patch(`${API_BASE_URL}/profile/admin/change-password`, passwordData);
      return response.data;
    },
    onSuccess: (data) => {
      setSuccessMessage(data.message || 'Password changed successfully!');
      setLocalError('');
      // Clear form fields
      setTargetUserEmail('');
      setNewPassword('');
      setConfirmNewPassword('');
      // Optional: Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard/allusers');
      }, 2000);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to change password. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Client-side validation
    if (!targetUserEmail.trim() || !newPassword.trim() || !confirmNewPassword.trim()) {
      setLocalError('All fields are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(targetUserEmail)) {
      setLocalError('Please enter a valid email address for the target user.');
      return;
    }
    if (newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setLocalError('New password and confirm password do not match.');
      return;
    }

    // Trigger the mutation
    changePasswordMutation.mutate({
      email: targetUserEmail,
      newPassword: newPassword,
    });
  };

  // Determine if the user has permission
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

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

  // Check if user has required roles
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator or Pastor to change user passwords.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Change User Password
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
            <label htmlFor="targetUserEmail" className="block text-sm font-medium text-gray-700 mb-1">
User&apos;s Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="targetUserEmail"
              value={targetUserEmail}
              onChange={(e) => setTargetUserEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmNewPassword"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Change Password'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ChangeUserPasswordMain;
