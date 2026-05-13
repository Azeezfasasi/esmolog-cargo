'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString(); 
};

function ManagePrayers() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingPrayerId, setEditingPrayerId] = useState(null);
  const [editRequestText, setEditRequestText] = useState('');
  const [editCategory, setEditCategory] = useState(''); // State for editing category

  const [actionMessage, setActionMessage] = useState(''); // For success messages
  const [actionError, setActionError] = useState(''); // For specific action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
  }, [editingPrayerId]);

  // Fetch all prayer requests for admin management
  // This query is enabled only if the user is authenticated and is an admin
  const {
    data: prayers,
    isLoading: prayersLoading,
    isError: prayersError,
    error: fetchError,
  } = useQuery({
    queryKey: ['adminPrayerRequests'], // Unique key for admin's view
    queryFn: async () => {
      // Your backend route GET /api/prayer-requests already populates user and replies.user
      // and is protected by authorize('admin').
      const response = await axios.get(`${API_BASE_URL}/prayer-requests`);
      return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && (isAdmin || isEmployee),
  });

  // Mutation for editing a prayer request
  const editPrayerMutation = useMutation({
    mutationFn: async (updatedPrayer) => {
      const response = await axios.put(`${API_BASE_URL}/prayer-requests/${updatedPrayer._id}`, {
        request: updatedPrayer.request,
        category: updatedPrayer.category // Include category in update
      });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Prayer request updated successfully!');
      setActionError('');
      setEditingPrayerId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['adminPrayerRequests'] }); // Refetch admin list
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] }); // Also invalidate public list if it exists and needs update
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update prayer request.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a prayer request
  const deletePrayerMutation = useMutation({
    mutationFn: async (prayerId) => {
      await axios.delete(`${API_BASE_URL}/prayer-requests/${prayerId}`);
    },
    onSuccess: () => {
      setActionMessage('Prayer request deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminPrayerRequests'] }); // Refetch admin list
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete prayer request.');
      setActionMessage('');
    },
  });

  // Mutation for changing prayer status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ prayerId, status }) => {
      const response = await axios.patch(`${API_BASE_URL}/prayer-requests/${prayerId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Prayer status updated successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminPrayerRequests'] }); // Refetch admin list
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change prayer status.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (prayer) => {
    setEditingPrayerId(prayer._id);
    setEditRequestText(prayer.request || '');
    setEditCategory(prayer.category || 'General'); // Set current category for editing
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editRequestText.trim()) {
      setActionError('Prayer request cannot be empty.');
      return;
    }
    editPrayerMutation.mutate({
      _id: editingPrayerId,
      request: editRequestText,
      category: editCategory // Send category with update
    });
  };

  // Handle delete
  const handleDeleteClick = (prayerId) => {
    if (window.confirm('Are you sure you want to delete this prayer request? This action cannot be undone.')) {
      deletePrayerMutation.mutate(prayerId);
    }
  };

  // Handle status change
  const handleChangeStatus = (prayerId, currentStatus) => {
    const statuses = ['pending', 'answered', 'archived'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatusIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextStatusIndex];

    if (window.confirm(`Are you sure you want to change this prayer request's status to "${newStatus}"?`)) {
      changeStatusMutation.mutate({ prayerId, status: newStatus });
    }
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking permissions...
        </div>
      </section>
    );
  }

  // Check if user is authenticated and is an admin
  if (!isAuthenticated && !isEmployee && !isAdmin) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to manage prayer requests.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for prayers data (only if authorized)
  if (prayersLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading prayer requests for management...
        </div>
      </section>
    );
  }

  // Render error state for prayers data
  if (prayersError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading prayer requests: {fetchError.message}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-2 lg:px-2 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Prayer Requests
        </h2>

        {actionMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md mb-4" role="alert">
            <span className="block sm:inline">{actionMessage}</span>
          </div>
        )}
        {actionError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4" role="alert">
            <span className="block sm:inline">{actionError}</span>
          </div>
        )}

        {prayers && prayers.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg py-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested By
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Likes
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prays
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prayers.map((prayer) => (
                  <React.Fragment key={prayer._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingPrayerId === prayer._id ? (
                          <textarea
                            value={editRequestText}
                            onChange={(e) => setEditRequestText(e.target.value)}
                            rows="3"
                            className="w-full p-1 border rounded resize-y"
                          />
                        ) : (
                          <span className="block max-w-xs truncate">{prayer.request}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingPrayerId === prayer._id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full p-1 border rounded bg-white"
                          >
                            <option value="General">General</option>
                            <option value="Healing">Healing</option>
                            <option value="Guidance">Guidance</option>
                            <option value="Finances">Finances</option>
                            <option value="Family">Family</option>
                            <option value="Job Opportunity">Job Opportunity</option>
                            <option value="Protection">Protection</option>
                            <option value="Favour">Favour</option>
                            <option value="Thanksgiving">Thanksgiving</option>
                          </select>
                        ) : (
                          prayer.category || 'General'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {prayer.user?.name || 'Anonymous'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {prayer.likes}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {prayer.prayCounter}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          prayer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          prayer.status === 'answered' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {prayer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingPrayerId === prayer._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              disabled={editPrayerMutation.isPending}
                            >
                              {editPrayerMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingPrayerId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editPrayerMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(prayer)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(prayer._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deletePrayerMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleChangeStatus(prayer._id, prayer.status)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                prayer.status === 'pending'
                                  ? 'bg-green-500 text-white hover:bg-green-600' // Change to Answered
                                  : prayer.status === 'answered'
                                  ? 'bg-gray-500 text-white hover:bg-gray-600' // Change to Archived
                                  : 'bg-yellow-500 text-white hover:bg-yellow-600' // Change to Pending
                              } disabled:opacity-50`}
                              disabled={changeStatusMutation.isPending}
                            >
                              {prayer.status === 'pending' ? 'Set Answered' :
                                prayer.status === 'answered' ? 'Set Archived' :
                                'Set Pending'
                              }
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {/* Display Replies for the prayer */}
                    {prayer.replies && prayer.replies.length > 0 && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 bg-gray-50 border-t border-gray-200">
                          <h4 className="text-md font-semibold text-gray-800 mb-3">Replies:</h4>
                          <div className="space-y-3">
                            {prayer.replies
                              .sort((a, b) => new Date(a.date) - new Date(b.date)) // Sort replies by date
                              .map((reply) => (
                                <div key={reply._id} className="bg-gray-100 p-3 rounded-lg text-sm border border-gray-200">
                                  <p className="text-gray-700">{reply.message}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Replied by <span className="font-medium">{reply.user?.name || 'Anonymous'}</span> on {formatTimestamp(reply.date)}
                                  </p>
                                </div>
                              ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600">No prayer requests to manage.</p>
        )}
      </div>
    </section>
  );
}

export default ManagePrayers;
