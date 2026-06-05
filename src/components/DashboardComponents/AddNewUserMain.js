'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AddNewUserMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();
  const router = useRouter();

   // Determine if the user has permission to manage events
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('client'); // Default role
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [name, email, password, role, gender, phoneNumber, homeAddress, country, state]);

  // Mutation for adding a new user (using the existing register endpoint)
  const addUserMutation = useMutation({
    mutationFn: async (newUserData) => {
      // Note: Your backend's /register endpoint is currently public.
      // For a truly admin-only user creation, consider a new backend route
      // protected by authorizeRole(['admin']).
      const response = await axios.post(`${API_BASE_URL}/profile/register`, newUserData);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('User added successfully!');
      setLocalError(''); // Clear any previous errors
      // Invalidate the 'allUsers' query to refetch the list in ManageUsers
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });

      // Clear form fields
      setName('');
      setEmail('');
      setPassword('');
      setRole('client');
      setGender('');
      setPhoneNumber('');
      setHomeAddress('');
      setCountry('');
      setState('');

      // Optional: Redirect to the manage users page after a short delay
      setTimeout(() => {
        router.push('/dashboard/allusers');
      }, 2000);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to add user. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) {
      setLocalError('Please fill in all required fields (Name, Email, Password, Role).');
      return;
    }
    if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
        setLocalError('Please enter a valid email address.');
        return;
    }

    // Trigger the mutation
    addUserMutation.mutate({
      name,
      email,
      password,
      role,
      gender: gender || undefined, // Send undefined if empty to avoid empty string in DB if schema allows
      phoneNumber: phoneNumber || undefined,
      homeAddress: homeAddress || undefined,
      country: country || undefined,
      state: state || undefined,
    });
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
          Access Denied. You must be logged in as an Administrator to add new users.
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
          Add New User
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              required
            >
              <option value="">Choose Role</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
              <option value="client">Client</option>
              <option value="agent">Agent</option>
            </select>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select name="gender" id="gender" onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="080******"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="homeAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Home Address
            </label>
            <input
              type="text"
              id="homeAddress"
              value={homeAddress}
              onChange={(e) => setHomeAddress(e.target.value)}
              placeholder="123 Main St, City"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="E.g. Nigeria"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="E.g. Lagos State"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={addUserMutation.isPending}
          >
            {addUserMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Add User'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddNewUserMain;
