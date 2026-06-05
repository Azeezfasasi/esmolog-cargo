'use client';

import React, { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaSpinner, FaTimesCircle, FaChartPie } from 'react-icons/fa';

// Define colors for different user roles
const USER_ROLE_COLORS = {
  'admin': '#8884d8',    // Purple
  'employee': '#82CA9D', // Light Green
  'agent': '#FFBB28',    // Orange
  'client': '#0088FE',   // Blue
  'unknown': '#CCCCCC'   // Gray for undefined roles
};

// Custom tooltip content for the pie chart
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // The actual data object for the slice

    return (
      <div className="bg-white p-3 border border-gray-300 rounded-md shadow-lg">
        <p className="font-semibold text-gray-800">{`${data.name}: ${data.value} users`}</p>
        {/* <p className="text-gray-600 text-sm">{`Percentage: ${(percent * 100).toFixed(2)}%`}</p> */}
      </div>
    );
  }
  return null;
};

const UserRolesChart = () => { // Renamed component for clarity
  // Helper function to fetch user data with auth token
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found. Please log in.');
    }
    // Assuming you have an endpoint to get all users
    const response = await axios.get(`${API_BASE_URL}/profile/all`, { // Adjust this endpoint if different
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    // Handle different response formats - extract array from response
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.users)) {
      return data.users;
    } else if (data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  }, []);

  // Use useQuery to fetch all users
  const {
    data: users,
    isLoading, // Renamed from isLoadingUsers
    isError,   // Renamed from isErrorUsers
    error,     // Renamed from errorUsers
    refetch    // Renamed from refetchUsers
  } = useQuery({
    queryKey: ['userRolesChartData'],
    queryFn: fetchUserData,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  // Process data for the User Roles pie chart
  const processedUserData = React.useMemo(() => {
    // Ensure users is an array
    if (!users || !Array.isArray(users) || users.length === 0) {
      return [];
    }

    const roleCounts = users.reduce((acc, user) => {
      const role = user.role || 'unknown'; // Assuming user object has a 'role' property
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(roleCounts).map(role => ({
      name: role.charAt(0).toUpperCase() + role.slice(1),
      value: roleCounts[role],
      type: 'users' // Add a type for tooltip clarity
    }));
  }, [users]);

  // Loading state
  if (isLoading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-blue-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading user data...</p> {/* Updated message */}
      </section>
    );
  }

  // Error state
  if (isError) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-red-600">
        <FaTimesCircle className="text-5xl mb-4" />
        <p className="text-xl font-semibold mb-2">Error loading user data!</p> {/* Updated message */}
        <p className="text-lg text-center">{error?.message || 'Something went wrong while fetching user data.'}</p>
        <button
          onClick={() => refetch()} // Only refetch users
          className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
        >
          Retry
        </button>
      </section>
    );
  }

  // No data found state
  if (!processedUserData || processedUserData.length === 0) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-gray-600">
        <FaChartPie className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-xl font-semibold">No user data available.</p> {/* Updated message */}
        <p className="text-lg text-center mt-2">There is no user data to display in the chart.</p> {/* Updated message */}
      </section>
    );
  }

  return (
    <section className="py-0 sm:py-0 bg-gray-50 font-inter antialiased mb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl"> {/* Adjusted max-width for single chart */}
        <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 lg:p-10 border border-gray-100"> {/* Removed grid-cols */}
          {/* User Roles Distribution Chart */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 text-center"> {/* Main title */}
              User Roles Distribution
            </h2>
            <p className="text-lg text-gray-600 text-center mb-0"> {/* Main description */}
              Breakdown of user roles within your system.
            </p>
            <div className="w-full h-80 sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={processedUserData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100} // Reverted to larger size for single chart
                    fill="#8884d8"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {processedUserData.map((entry, index) => (
                      <Cell key={`user-cell-${index}`} fill={USER_ROLE_COLORS[entry.name.toLowerCase()] || '#CCCCCC'} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserRolesChart; // Export the renamed component
