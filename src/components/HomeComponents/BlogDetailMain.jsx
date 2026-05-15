'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { Newspaper } from 'lucide-react';

function BlogDetailMain() {
  const { id } = useParams();
  // Function to fetch a single blog post by ID
  const fetchBlogPostById = async (blogId) => {
    const response = await axios.get(`${API_BASE_URL}/blogs/${blogId}`);
    return response.data;
  };

  // Use useQuery to manage fetching state for a single blog post
  const {
    data: blogPost,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['blogPost', id], // Query key includes ID so React Query knows to refetch for different IDs
    queryFn: () => fetchBlogPostById(id),
    enabled: !!id, 
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  });

  // Helper function to format date (re-used from AllBlog)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      return date.toLocaleDateString(undefined, options);
    } catch (e) {
      console.error("Error parsing date:", dateString, e);
      return 'Invalid Date';
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading blog post...
        </div>
      </section>
    );
  }

  // Render error state
  if (isError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading blog post: {error.message}
          <div className="mt-4">
            <Link href="/blog" className="text-green-600 hover:underline">Back to All Blogs</Link>
          </div>
        </div>
      </section>
    );
  }

  // Handle case where blogPost is null (e.g., ID not found, but no error thrown)
  if (!blogPost) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700">
          Blog post not found.
          <div className="mt-4">
            <Link href="/blog" className="text-blue-600 hover:underline">Back to All Blogs</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render blog post details
  return (
    <>
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-green-700 to-green-600 py-10 md:py-10">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,white_0%,transparent_55%)]" />
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-start gap-3">
          <p className="inline-flex items-center gap-2 text-white/90 text-sm uppercase tracking-widest">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              {/* mail icon */}
              <Newspaper className="h-4 w-4 text-white" />
            </span>
            {blogPost.category}
          </p>

          <h2 className="text-3xl text-white md:text-4xl font-extrabold">
            {blogPost.blogTitle}
          </h2>

          <div className="h-1 w-20 rounded-full bg-white/60" />
          <p className="text-white/85">
            By: {blogPost.sentBy ? blogPost.sentBy.name : 'Unknown Author'}
          </p>
        </div>
      </div>
    </div>
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blog" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to All Blogs
          </Link>
        </div>

        {/* Blog Post Content */}
        <p className="text-sm uppercase tracking-widest text-orange-500 mb-2">
          {blogPost.category}
        </p>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
          {blogPost.blogTitle}
        </h1>
        <div className="text-gray-600 text-sm mb-8">
          <p className="font-semibold">By {blogPost.sentBy ? blogPost.sentBy.name : 'Unknown Author'}</p>
          <p className="text-xs">Published on {formatDate(blogPost.date)}</p>
        </div>

        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
          {/* Using dangerouslySetInnerHTML if description contains HTML, otherwise just {blogPost.description} */}
          <p>{blogPost.description}</p>
        </div>
      </div>
    </section>
    </>
  );
}

export default BlogDetailMain;
