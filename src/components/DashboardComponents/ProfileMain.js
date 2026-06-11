'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';
import Image from 'next/image';

function ProfileMain() {
  const queryClient = useQueryClient();
  const { currentUser: loggedInUser, isAuthenticated, isLoading: authLoading, token } = useProfile();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [country, setCountry] = useState('');
  const [homeAddress, setHomeAddress] = useState('');
  const [state, setState] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null); // For local image preview

  // UI states
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Mutation for updating user profile
  const updateProfileMutation = useMutation({
    mutationFn: async ({ formData, userId }) => {
      const response = await axios.put(`${API_BASE_URL}/profile/edit/${userId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - axios will set it automatically for FormData
        },
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Profile updated successfully!');
      setLocalError('');
      setProfileImageFile(null); // Clear file input after successful upload

      // Invalidate and refetch the profile data to show immediate updates
      // This will trigger the onSuccess of the useQuery again, which will re-populate states
      queryClient.invalidateQueries({ queryKey: ['myProfile', loggedInUser._id] });

      // Set a timeout to clear the success message after a few seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (err) => {
      setLocalError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      setSuccessMessage(''); // Clear success message on error
    },
  });

  // Fetch user data
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
    error: fetchError,
  } = useQuery({
    queryKey: ['myProfile', loggedInUser?._id], // Key depends on loggedInUser ID
    queryFn: async () => {
      if (!loggedInUser?._id) {
        throw new Error('User ID not available for fetching profile.');
      }
      // const response = await axios.get(`${API_BASE_URL}/profile/me`,)
      const response = await axios.get(`${API_BASE_URL}/profile/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.user;
    },
    enabled: !!loggedInUser?._id, // Only run query if loggedInUser._id exists
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    // Removed onSuccess from here to manage state population in a separate useEffect
    onError: (err) => {
      console.error("Error fetching profile:", err);
      setLocalError(err.response?.data?.message || 'Failed to load profile data.');
    }
  });

  // NEW useEffect: Populate form fields ONLY when userData changes (and is not null/undefined)
  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setEmail(userData.email || '');
      setPhoneNumber(userData.phoneNumber || '');
      setGender(userData.gender || '');
      setCountry(userData.country || '');
      setHomeAddress(userData.homeAddress || '');
      setState(userData.state || '');
      if (userData.profileImageUrl) {
        setProfileImagePreview(userData.profileImageUrl);
      } else {
        setProfileImagePreview(null);
      }
    }
  }, [userData]); // Dependency on userData ensures this runs when data is fetched or refetched

  // Effect to clear local error/success messages
  // This effect is now simpler and less likely to interfere with data population.
  useEffect(() => {
    // Clear messages when a form field is actively changed by the user
    // or when a mutation starts/finishes (handled by onSuccess/onError of mutation itself)
    if (localError || successMessage) {
      const timer = setTimeout(() => {
        setLocalError('');
        setSuccessMessage('');
      }, 3000); // Clear messages after 3 seconds
      return () => clearTimeout(timer); // Cleanup timer
    }
  }, [localError, successMessage]); // Run when messages themselves change


  // Handle file input change for profile image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create a URL for local preview
      setProfileImagePreview(URL.createObjectURL(file));
      setLocalError(''); // Clear error on new file selection
    } else {
      setProfileImageFile(null);
      // If no file selected, revert to current stored image or null
      // This will now correctly show the Cloudinary URL if it exists in userData
      setProfileImagePreview(userData?.profileImageUrl || null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Check if user ID is available
    if (!loggedInUser?._id) {
      setLocalError('User ID not available. Please refresh the page.');
      return;
    }

    // Client-side validation
    if (!name.trim() || !email.trim()) {
      setLocalError('Name and Email are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError('Please enter a valid email address.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('phoneNumber', phoneNumber.trim());
    formData.append('gender', gender);
    formData.append('country', country);
    formData.append('homeAddress', homeAddress);
    formData.append('state', state);

    // Logic for handling profile image update/removal
    if (profileImageFile) {
      // A new file was selected, append it for upload
      formData.append('profileImage', profileImageFile);
    } else if (profileImagePreview === null && userData?.profileImageUrl) {
      // User explicitly clicked "Remove Current Image" or preview became null
      // and there *was* an image from backend. Signal to backend to clear it.
      formData.append('profileImageUrl', ''); // Send empty string to clear the URL in DB
    } else if (profileImagePreview !== null && !profileImageFile && userData?.profileImageUrl) {
      // No new file selected, but there's an existing image and it's still in preview.
      // Send the existing Cloudinary URL to ensure it's not accidentally removed
      // if other fields are updated.
      formData.append('profileImageUrl', userData.profileImageUrl);
    }
    // If profileImagePreview is null and userData.profileImageUrl was also null,
    // then nothing needs to be sent for the image, as there's no image to begin with.


    updateProfileMutation.mutate({ formData, userId: loggedInUser._id });
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
          Checking authentication...
        </div>
      </section>
    );
  }

  // If not authenticated, redirect or show access denied
  if (!isAuthenticated) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. Please log in to view your profile.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for user data
  if (userLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your profile...
        </div>
      </section>
    );
  }

  // Render error state for user data
  if (userError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading profile: {fetchError?.response?.data?.message || fetchError?.message || 'Unknown error.'}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          My Profile
        </h2>

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-green-300 shadow-md">
              {profileImagePreview ? (
                <Image
                  src={profileImagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect fill="%23e0e0e0" width="128" height="128"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'; }}
                  width={128}
                  height={128}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm text-center px-2">No Image</span>
                </div>
              )}
              <label htmlFor="profileImageInput" className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs font-bold opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                Change Image
              </label>
              <input
                type="file"
                id="profileImageInput"
                name="profileImage" // Important: Matches multer field name
                accept="image/jpeg,image/png,image/gif"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">Click image to change</p>
            {userData?.profileImageUrl && profileImageFile === null && ( // Show clear button only if there's an existing image and no new file selected
              <button
                type="button"
                onClick={() => {
                  setProfileImageFile(null);
                  setProfileImagePreview(null); // Clear preview
                }}
                className="mt-2 text-red-600 hover:text-red-800 text-sm"
              >
                Remove Current Image
              </button>
            )}
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              id="country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={updateProfileMutation.isPending}
          >
            {updateProfileMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Update Profile'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ProfileMain;
