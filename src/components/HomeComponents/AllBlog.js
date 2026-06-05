'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import Link from 'next/link'; // Import Link
import { Newspaper } from 'lucide-react';

function AllBlog() {
  const fetchBlogPosts = async () => {
    const response = await axios.get(`${API_BASE_URL}/blogs`);
    return response.data;
  };

  const {
    data: blogPosts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['blogPosts'],
    queryFn: fetchBlogPosts,
    staleTime: 5 * 60 * 1000,
  });

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

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading blog posts...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading blog posts: {error.message}
        </div>
      </section>
    );
  }

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
            SHARE, INSPIRE, INNOVATE
          </p>

          <h2 className="text-3xl text-white md:text-4xl font-extrabold">
            READ OUR BLOG
          </h2>

          <div className="h-1 w-20 rounded-full bg-white/60" />
          <p className="text-white/85">
            Dive into our blog for the latest insights, industry trends, and expert tips on global logistics and cargo shipping. Stay informed and inspired with our in-depth articles and updates.
          </p>
        </div>
      </div>
    </div>
    <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter">
      <div className="max-w-7xl mx-auto text-center">

        {blogPosts && blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {blogPosts.map((post) => (
              <Link href={`/blog/${post._id}`} 
                key={post._id}
                className="bg-white p-6 rounded-lg shadow-md flex flex-col text-left group overflow-hidden"
              >
                <p className="text-sm uppercase tracking-widest text-green-600 mb-2">
                  {post.category}
                </p>
                <div className="block">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight group-hover:text-green-600 transition-colors duration-200">
                    {post.blogTitle}
                  </h3>
                </div>
                <div className="text-gray-700 leading-relaxed mb-6 flex-grow">
                  {post.description}
                </div>
                <div className="text-gray-600 text-sm mt-auto">
                  <p className="font-semibold">{post.sentBy ? post.sentBy.name : 'Unknown Author'}</p>
                  <p className="text-xs">{formatDate(post.date)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">No blog posts found.</p>
        )}
      </div>
    </section>
    </>
  );
}

export default AllBlog;
