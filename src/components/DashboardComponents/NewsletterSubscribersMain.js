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

function NewsletterSubscribersMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingSubscriberId, setEditingSubscriberId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editIsSubscribed, setEditIsSubscribed] = useState(true);

  // State for sending email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentSubscriberEmail, setCurrentSubscriberEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailContent, setEmailContent] = useState('');
  const [emailSendError, setEmailSendError] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For general success messages
  const [actionError, setActionError] = useState(''); // For general action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
    setEmailSendError(''); // Clear email send error too
  }, [editingSubscriberId, showEmailModal]);

  // Determine if the user has permission to manage subscribers
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all subscribers for admin/pastor management
  const {
    data: subscribers,
    isLoading: subscribersLoading,
    isError: subscribersError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allSubscribers'], // Unique key for fetching all subscribers
    queryFn: async () => {
      // This endpoint is now accessible by admin and pastor on the backend
      const response = await axios.get(`${API_BASE_URL}/newsletter/subscribers`);
      return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission, // Only run if authenticated AND (isAdmin OR isEmployee)
  });

  // Mutation for editing a subscriber
  const editSubscriberMutation = useMutation({
    mutationFn: async (updatedSubscriber) => {
      const response = await axios.put(`${API_BASE_URL}/newsletter/subscriber/${updatedSubscriber._id}`, {
        name: updatedSubscriber.name,
        email: updatedSubscriber.email,
        isSubscribed: updatedSubscriber.isSubscribed,
      });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Subscriber updated successfully!');
      setActionError('');
      setEditingSubscriberId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allSubscribers'] }); // Refetch subscriber list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update subscriber.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a subscriber
  const deleteSubscriberMutation = useMutation({
    mutationFn: async (subscriberId) => {
      await axios.delete(`${API_BASE_URL}/newsletter/subscriber/${subscriberId}`);
    },
    onSuccess: () => {
      setActionMessage('Subscriber deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allSubscribers'] }); // Refetch subscriber list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete subscriber.');
      setActionMessage('');
    },
  });

  // Mutation for sending an email to a single subscriber
  const sendEmailMutation = useMutation({
    mutationFn: async ({ subscriberId, subject, content }) => {
      const response = await axios.post(`${API_BASE_URL}/newsletter/send-to-subscriber/${subscriberId}`, { subject, content });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Email sent successfully!');
      setEmailSendError('');
      setShowEmailModal(false); // Close modal
      setEmailSubject('');
      setEmailContent('');
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setEmailSendError(err.response?.data?.message || 'Failed to send email.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (subscriber) => {
    setEditingSubscriberId(subscriber._id);
    setEditName(subscriber.name || '');
    setEditEmail(subscriber.email || '');
    setEditIsSubscribed(subscriber.isSubscribed);
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim()) {
      setActionError('Name and Email cannot be empty.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      setActionError('Please enter a valid email address.');
      return;
    }
    editSubscriberMutation.mutate({
      _id: editingSubscriberId,
      name: editName,
      email: editEmail,
      isSubscribed: editIsSubscribed,
    });
  };

  // Handle delete
  const handleDeleteClick = (subscriberId) => {
    if (window.confirm('Are you sure you want to delete this subscriber? This action cannot be undone.')) {
      deleteSubscriberMutation.mutate(subscriberId);
    }
  };

  // Handle opening email modal
  const handleSendEmailClick = (subscriberEmail, subscriberId) => {
    setCurrentSubscriberEmail(subscriberEmail);
    setEditingSubscriberId(subscriberId); // Use this to pass ID to mutation
    setShowEmailModal(true);
    setEmailSubject(''); // Clear previous email content
    setEmailContent('');
    setEmailSendError('');
  };

  // Handle sending email from modal
  const handleSendEmailSubmit = (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailContent.trim()) {
      setEmailSendError('Subject and Content cannot be empty.');
      return;
    }
    sendEmailMutation.mutate({
      subscriberId: editingSubscriberId, // Use the ID from the state
      subject: emailSubject,
      content: emailContent,
    });
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
          Access Denied. You must be logged in as an Administrator or Pastor to manage subscribers.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for subscribers data (only if authorized)
  if (subscribersLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading subscribers for management...
        </div>
      </section>
    );
  }

  // Render error state for subscribers data
  if (subscribersError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading subscribers: {fetchError.response?.data?.message || fetchError.message}
          <br/>
Please ensure your backend route `/newsletter/subscribers` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Subscribers
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

        {subscribers && subscribers.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subscribed
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscribers.map((subscriber) => (
                    <React.Fragment key={subscriber._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingSubscriberId === subscriber._id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            subscriber.name || 'N/A'
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {editingSubscriberId === subscriber._id ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            subscriber.email
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingSubscriberId === subscriber._id ? (
                            <input
                              type="checkbox"
                              checked={editIsSubscribed}
                              onChange={(e) => setEditIsSubscribed(e.target.checked)}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              subscriber.isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriber.isSubscribed ? 'Yes' : 'No'}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatTimestamp(subscriber.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingSubscriberId === subscriber._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                disabled={editSubscriberMutation.isPending}
                              >
                                {editSubscriberMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingSubscriberId(null)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={editSubscriberMutation.isPending}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditClick(subscriber)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(subscriber._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={deleteSubscriberMutation.isPending}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleSendEmailClick(subscriber.email, subscriber._id)}
                                className="text-green-600 hover:text-green-700 disabled:opacity-50"
                                disabled={!subscriber.isSubscribed}
                              >
                                Send Email
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {subscribers.map((subscriber) => (
                <React.Fragment key={subscriber._id}>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                        {editingSubscriberId === subscriber._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900">{subscriber.name || 'N/A'}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                        {editingSubscriberId === subscriber._id ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-700">{subscriber.email}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Subscribed</p>
                          {editingSubscriberId === subscriber._id ? (
                            <input
                              type="checkbox"
                              checked={editIsSubscribed}
                              onChange={(e) => setEditIsSubscribed(e.target.checked)}
                              className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                            />
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              subscriber.isSubscribed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subscriber.isSubscribed ? 'Yes' : 'No'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Joined</p>
                          <p className="text-xs text-gray-700">{formatTimestamp(subscriber.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                        {editingSubscriberId === subscriber._id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 min-w-[70px] bg-blue-500 text-white py-2 rounded text-xs font-medium hover:bg-blue-600 transition disabled:opacity-50"
                              disabled={editSubscriberMutation.isPending}
                            >
                              {editSubscriberMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingSubscriberId(null)}
                              className="flex-1 min-w-[70px] bg-gray-300 text-gray-800 py-2 rounded text-xs font-medium hover:bg-gray-400 transition disabled:opacity-50"
                              disabled={editSubscriberMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(subscriber)}
                              className="flex-1 min-w-[70px] bg-indigo-50 text-indigo-600 py-2 rounded text-xs font-medium hover:bg-indigo-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(subscriber._id)}
                              className="flex-1 min-w-[70px] bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                              disabled={deleteSubscriberMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleSendEmailClick(subscriber.email, subscriber._id)}
                              className="flex-1 min-w-[70px] bg-green-50 text-green-600 py-2 rounded text-xs font-medium hover:bg-green-100 transition disabled:opacity-50"
                              disabled={!subscriber.isSubscribed}
                            >
                              Email
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
          <p className="text-center text-gray-600">No subscribers to manage.</p>
        )}
      </div>

      {/* Email Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Send Email to {currentSubscriberEmail}
            </h3>
            <form onSubmit={handleSendEmailSubmit} className="space-y-4">
              {emailSendError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                  <span className="block sm:inline">{emailSendError}</span>
                </div>
              )}
              <div>
                <label htmlFor="emailSubject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="emailSubject"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="emailContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="emailContent"
                  value={emailContent}
                  onChange={(e) => setEmailContent(e.target.value)}
                  rows="8"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                  disabled={sendEmailMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={sendEmailMutation.isPending}
                >
                  {sendEmailMutation.isPending ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Send Email'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default NewsletterSubscribersMain;
