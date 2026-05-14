'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';

function AddNewPostMain() {
  const router = useRouter();
  const queryClient = useQueryClient(); // Get QueryClient instance
  const { isAdmin, isEmployee, isAuthenticated, isLoading: authLoading } = useProfile(); // Get user role and auth status

  const [blogTitle, setBlogTitle] = useState('');
  const [category, setCategory] = useState('Shipment'); // Default category
  const [description, setDescription] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [blogTitle, category, description]);

  // Function to create a new blog post
  const createBlogPost = async (newBlogData) => {
    const response = await axios.post(`${API_BASE_URL}/blogs`, newBlogData);
    return response.data;
  };

  // useMutation hook for creating a blog post
  const createBlogMutation = useMutation({
    mutationFn: createBlogPost,
    onSuccess: () => {
      setSuccessMessage('Blog post created successfully!');
      setLocalError(''); // Clear any previous errors
      // Invalidate the 'blogPosts' query to refetch the list in AllBlog component
      queryClient.invalidateQueries({ queryKey: ['blogPosts'] });

      // Clear form fields
      setBlogTitle('');
      setCategory('Shipment');
      setDescription('');

      // Optional: Redirect to the blog list page or the newly created blog post
      setTimeout(() => {
        router.push('/dashboard/allblogpost'); 
      }, 2000);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to create blog post. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage(''); // Clear success message on error
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(''); // Clear previous local errors
    setSuccessMessage(''); // Clear previous success messages

    // Client-side validation
    if (!blogTitle.trim() || !category.trim() || !description.trim()) {
      setLocalError('Please fill in all fields.');
      return;
    }

    // Trigger the mutation
    createBlogMutation.mutate({ blogTitle, category, description });
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
  if (!isAuthenticated && !isAdmin && isEmployee) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to create blog posts.
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
          Create New Blog Post
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
            <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Blog Title
            </label>
            <input
              type="text"
              id="blogTitle"
              value={blogTitle}
              onChange={(e) => setBlogTitle(e.target.value)}
              placeholder="Enter blog title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              required
            >
              <option value="">Choose Category</option>
              <option value="Shipment">Shipment</option>
              <option value="Air Freight">Air Freight</option>
              <option value="Cargo">Cargo</option>
              <option value="Events">Events</option>
              <option value="Testimony">Testimony</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Blog Content
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your blog post content here..."
              rows="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={createBlogMutation.isPending}
          >
            {createBlogMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Publish Blog Post'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddNewPostMain;
