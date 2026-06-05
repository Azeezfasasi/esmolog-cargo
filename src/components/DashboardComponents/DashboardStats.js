'use client';

import React from 'react';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { FaSpinner, FaTimesCircle, FaUsers, FaPrayingHands, FaCalendarAlt, FaHandshake, FaDollarSign, FaBlog, FaBox, FaClipboard } from 'react-icons/fa';
import Link from 'next/link';

// Helper function to fetch data with auth token
const fetchData = async (url) => {
  const token = localStorage.getItem('token');
  // --- START: CRITICAL LOGS FOR FETCHDATA ---
  console.log('--- DashboardStats fetchData ---');
  console.log('URL being fetched:', url);
  console.log('Token from localStorage (raw):', token); // Log the actual token string (for debugging only, remove in production)
  console.log('Type of token from localStorage:', typeof token);
  console.log('Length of token from localStorage:', token ? token.length : 'N/A');
  // --- END: CRITICAL LOGS FOR FETCHDATA ---

  if (!token) {
    throw new Error('Authentication token not found. Please log in.');
  }
  const response = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const StatCard = ({ icon: Icon, title, value, isLoading, isError, error }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 flex items-center space-x-4 border border-gray-100">
      <div className="flex-shrink-0">
        <div className="h-14 w-14 rounded-full bg-blue-100 text-green-600 flex items-center justify-center text-2xl">
          {Icon && <Icon />}
        </div>
      </div>
      <div className="flex-grow">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        {isLoading ? (
          <FaSpinner className="animate-spin text-green-500 text-xl mt-1" />
        ) : isError ? (
          <FaTimesCircle className="text-red-500 text-xl mt-1" title={error?.message || 'Error'} />
        ) : (
          <p className="text-gray-900 text-3xl font-bold">{value}</p>
        )}
      </div>
    </div>
  );
};

const DashboardStats = () => {
  // Use useQueries to fetch multiple data points in parallel
  const results = useQueries({
    queries: [
      {
        queryKey: ['usersCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/profile/all`),
        select: (data) => data.length, // Transform data to just the count
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['shipmentCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/shipments`),
        select: (data) => {
          const shipmentsData = Array.isArray(data) ? data : (data?.data || []);
          return Array.isArray(shipmentsData) ? shipmentsData.length : 0;
        },
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['eventsCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/events/admin/all`),
        select: (data) => data.length,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['appointmentsCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/appointments`),
        select: (data) => data.length,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['contactCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/contact`),
        select: (data) => data.length,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
      {
        queryKey: ['blogPostsCount'],
        queryFn: () => fetchData(`${API_BASE_URL}/blogs/admin/all`),
        select: (data) => data.length,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
      },
    ],
  });

  // Destructure results for easier access
  const [
    usersQuery,
    shipmentsQuery,
    eventsQuery,
    appointmentsQuery,
    contactQuery,
    blogPostsQuery,
  ] = results;

  // Determine overall loading/error states
  const overallLoading = results.some(query => query.isLoading);
  const overallError = results.some(query => query.isError);

  if (overallLoading && !overallError) { 
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading dashboard statistics...</p>
      </section>
    );
  }

  return (
    <>
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-8 text-center">
            Dashboard Overview
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/dashboard">
              <StatCard
                icon={FaUsers}
                title="Total Users"
                value={usersQuery.data !== undefined ? usersQuery.data : '--'}
                isLoading={usersQuery.isLoading}
                isError={usersQuery.isError}
                error={usersQuery.error}
              />
            </Link>
            <Link href="/dashboard/AllShipment">
              <StatCard
                icon={FaBox}
                title="Total Shipments"
                value={shipmentsQuery.data !== undefined ? shipmentsQuery.data : '--'}
                isLoading={shipmentsQuery.isLoading}
                isError={shipmentsQuery.isError}
                error={shipmentsQuery.error}
              />
            </Link>
            <Link href="/dashboard/ContactFormResponses">
              <StatCard
                icon={FaClipboard}
                title="Total Quote Requests"
                value={contactQuery.data !== undefined ? `${contactQuery.data}` : '--'}
                isLoading={contactQuery.isLoading}
                isError={contactQuery.isError}
                error={contactQuery.error}
              />
            </Link>
            <Link href="/dashboard/AllEvents">
              <StatCard
                icon={FaCalendarAlt}
                title="Total Events"
                value={eventsQuery.data !== undefined ? eventsQuery.data : '--'}
                isLoading={eventsQuery.isLoading}
                isError={eventsQuery.isError}
                error={eventsQuery.error}
              />
            </Link>
            <Link href="/dashboard/AllAppointments">
              <StatCard
                icon={FaHandshake}
                title="Total Appointments"
                value={appointmentsQuery.data !== undefined ? appointmentsQuery.data : '--'}
                isLoading={appointmentsQuery.isLoading}
                isError={appointmentsQuery.isError}
                error={appointmentsQuery.error}
              />
            </Link>
            <StatCard
              icon={FaBlog}
              title="Total Blog Posts"
              value={blogPostsQuery.data !== undefined ? blogPostsQuery.data : '--'}
              isLoading={blogPostsQuery.isLoading}
              isError={blogPostsQuery.isError}
              error={blogPostsQuery.error}
            />
          </div>

          {overallError && (
            <div className="mt-8 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center justify-center">
              <FaTimesCircle className="mr-3 text-2xl" />
              <p className="font-semibold">Some data failed to load. Please check your network or try again.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default DashboardStats;
