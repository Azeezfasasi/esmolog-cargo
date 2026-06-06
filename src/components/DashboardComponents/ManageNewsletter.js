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

function ManageNewsletter() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingNewsletterId, setEditingNewsletterId] = useState(null);
  const [editSubject, setEditSubject] = useState('');
  const [editContent, setEditContent] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For success messages
  const [actionError, setActionError] = useState(''); // For specific action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
  }, [editingNewsletterId]);

  // Determine if the user has permission to manage newsletters
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all newsletters for admin/pastor management
  const {
    data: newsletters,
    isLoading: newslettersLoading,
    isError: newslettersError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allNewsletters'], // Unique key for fetching all newsletters
    queryFn: async () => {
      // This endpoint is now accessible by admin and pastor on the backend
      const response = await axios.get(`${API_BASE_URL}/newsletter`); // Using the new GET / route
      return response.data.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission, // Only run if authenticated AND (isAdmin OR isEmployee)
  });

  // Mutation for editing a newsletter
  const editNewsletterMutation = useMutation({
    mutationFn: async (updatedNewsletter) => {
      const response = await axios.put(`${API_BASE_URL}/newsletter/${updatedNewsletter._id}`, {
        subject: updatedNewsletter.subject,
        content: updatedNewsletter.content,
      });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Newsletter updated successfully!');
      setActionError('');
      setEditingNewsletterId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allNewsletters'] }); // Refetch newsletter list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update newsletter.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a newsletter
  const deleteNewsletterMutation = useMutation({
    mutationFn: async (newsletterId) => {
      await axios.delete(`${API_BASE_URL}/newsletter/${newsletterId}`);
    },
    onSuccess: () => {
      setActionMessage('Newsletter deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allNewsletters'] }); // Refetch newsletter list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete newsletter.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (newsletter) => {
    setEditingNewsletterId(newsletter._id);
    setEditSubject(newsletter.subject || '');
    setEditContent(newsletter.content || '');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editSubject.trim() || !editContent.trim()) {
      setActionError('Subject and Content cannot be empty.');
      return;
    }
    editNewsletterMutation.mutate({
      _id: editingNewsletterId,
      subject: editSubject,
      content: editContent,
    });
  };

  // Handle delete
  const handleDeleteClick = (newsletterId) => {
    if (window.confirm('Are you sure you want to delete this newsletter? This action cannot be undone.')) {
      deleteNewsletterMutation.mutate(newsletterId);
    }
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
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

  // Check if user is authenticated AND (isAdmin OR isEmployee)
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator or Pastor to manage newsletters.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for newsletters data (only if authorized)
  if (newslettersLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-600 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading newsletters for management...
        </div>
      </section>
    );
  }

  // Render error state for newsletters data
  if (newslettersError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading newsletters: {fetchError.response?.data?.message || fetchError.message}
          <br/>
Please ensure your backend route `/newsletter` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Newsletters
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

        {newsletters && newsletters.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent By
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Sent
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {newsletters.map((newsletter) => (
                    <React.Fragment key={newsletter._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingNewsletterId === newsletter._id ? (
                            <input
                              type="text"
                              value={editSubject}
                              onChange={(e) => setEditSubject(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            <span className="block max-w-xs truncate">{newsletter.subject}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {newsletter.sentBy?.name || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatTimestamp(newsletter.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingNewsletterId === newsletter._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                disabled={editNewsletterMutation.isPending}
                              >
                                {editNewsletterMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingNewsletterId(null)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={editNewsletterMutation.isPending}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditClick(newsletter)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(newsletter._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={deleteNewsletterMutation.isPending}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* Expanded row for editing content */}
                      {editingNewsletterId === newsletter._id && (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-sm text-gray-700 bg-gray-50 border-t border-gray-200">
                            <div>
                              <label htmlFor="editContent" className="block text-sm font-medium text-gray-700 mb-1">
                                Content
                              </label>
                              <textarea
                                id="editContent"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows="6"
                                className="w-full p-2 border rounded resize-y"
                              ></textarea>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {newsletters.map((newsletter) => (
                <React.Fragment key={newsletter._id}>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Subject</p>
                        {editingNewsletterId === newsletter._id ? (
                          <input
                            type="text"
                            value={editSubject}
                            onChange={(e) => setEditSubject(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900">{newsletter.subject}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Sent By</p>
                          <p className="text-xs text-gray-700">{newsletter.sentBy?.name || 'Unknown User'}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Date Sent</p>
                          <p className="text-xs text-gray-700">{formatTimestamp(newsletter.date)}</p>
                        </div>
                      </div>
                      {editingNewsletterId === newsletter._id && (
                        <div className="pt-2 border-t border-gray-200">
                          <label htmlFor="editContentMobile" className="block text-xs font-medium text-gray-700 mb-2">
                            Content
                          </label>
                          <textarea
                            id="editContentMobile"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="4"
                            className="w-full p-2 border rounded text-sm resize-y"
                          ></textarea>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                        {editingNewsletterId === newsletter._id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 min-w-[70px] bg-blue-500 text-white py-2 rounded text-xs font-medium hover:bg-blue-600 transition disabled:opacity-50"
                              disabled={editNewsletterMutation.isPending}
                            >
                              {editNewsletterMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingNewsletterId(null)}
                              className="flex-1 min-w-[70px] bg-gray-300 text-gray-800 py-2 rounded text-xs font-medium hover:bg-gray-400 transition disabled:opacity-50"
                              disabled={editNewsletterMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(newsletter)}
                              className="flex-1 min-w-[70px] bg-indigo-50 text-indigo-600 py-2 rounded text-xs font-medium hover:bg-indigo-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(newsletter._id)}
                              className="flex-1 min-w-[70px] bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                              disabled={deleteNewsletterMutation.isPending}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No newsletters to manage.</p>
        )}
      </div>
    </section>
  );
}

export default ManageNewsletter;
