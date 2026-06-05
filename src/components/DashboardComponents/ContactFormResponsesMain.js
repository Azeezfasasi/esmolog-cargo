'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api'; 
import { useProfile } from '@/components/context-api/ProfileContext'; 
import Link from 'next/link';
import ContactFormDetailModal from './ContactFormDetailModal';

// Helper function to format timestamp
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp);
  return date.toLocaleString();
};

function ContactFormResponsesMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingContactId, setEditingContactId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // State for reply modal
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [currentContactForReply, setCurrentContactForReply] = useState(null); // Stores the full contact object
  const [replySubject, setReplySubject] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For general success messages
  const [actionError, setActionError] = useState(''); // For general action errors
  // Modal state for viewing details
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailContact, setDetailContact] = useState(null);

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
    setReplyError(''); // Clear reply specific error
  }, [editingContactId, showReplyModal]);

  // Determine if the user has permission to manage contact forms
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all contact forms for admin/pastor management
  const {
    data: contacts,
    isLoading: contactsLoading,
    isError: contactsError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allContactForms'], // Unique key for fetching all contact forms
    queryFn: async () => {
      // This endpoint is now accessible by admin and pastor on the backend
      const response = await axios.get(`${API_BASE_URL}/contact`);
      return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission, // Only run if authenticated AND (isAdmin OR isEmployee)
  });

  // Mutation for editing a contact form
  const editContactFormMutation = useMutation({
    mutationFn: async (updatedContact) => {
      const response = await axios.put(`${API_BASE_URL}/contact/${updatedContact._id}`, updatedContact);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Contact form updated successfully!');
      setActionError('');
      setEditingContactId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allContactForms'] }); // Refetch list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update contact form.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a contact form
  const deleteContactFormMutation = useMutation({
    mutationFn: async (contactId) => {
      await axios.delete(`${API_BASE_URL}/contact/${contactId}`);
    },
    onSuccess: () => {
      setActionMessage('Contact form deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allContactForms'] }); // Refetch list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete contact form.');
      setActionMessage('');
    },
  });

  // Mutation for replying to a contact form
  const replyToContactFormMutation = useMutation({
    mutationFn: async ({ contactId, subject, replyContent }) => {
      const response = await axios.post(`${API_BASE_URL}/contact/${contactId}/reply`, { subject, replyContent });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Reply sent successfully!');
      setReplyError('');
      setShowReplyModal(false); // Close modal
      setReplySubject('');
      setReplyContent('');
      queryClient.invalidateQueries({ queryKey: ['allContactForms'] }); // Refetch list to show updated status
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (contact) => {
    setEditingContactId(contact._id);
    setEditName(contact.name || '');
    setEditEmail(contact.email || '');
    setEditPhoneNumber(contact.phoneNumber || '');
    setEditMessage(contact.message || '');
    setEditStatus(contact.status || 'new');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editMessage.trim()) {
      setActionError('Name, Email, and Message are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      setActionError('Please enter a valid email address.');
      return;
    }

    editContactFormMutation.mutate({
      _id: editingContactId,
      name: editName,
      email: editEmail,
      phoneNumber: editPhoneNumber || undefined,
      message: editMessage,
      status: editStatus,
    });
  };

  // Handle delete
  const handleDeleteClick = (contactId) => {
    if (window.confirm('Are you sure you want to delete this contact form submission? This action cannot be undone.')) {
      deleteContactFormMutation.mutate(contactId);
    }
  };

  // Handle opening reply modal
  const handleReplyClick = (contact) => {
    setCurrentContactForReply(contact);
    setReplySubject(`Re: Quote Request for Shipment`); // Pre-fill subject
    setReplyContent(''); // Clear previous content
    setShowReplyModal(true);
    setReplyError('');
  };

  // Handle submitting reply from modal
  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replySubject.trim() || !replyContent.trim()) {
      setReplyError('Subject and Reply Content cannot be empty.');
      return;
    }
    if (!currentContactForReply || !currentContactForReply.email) {
      setReplyError('Cannot send reply: Sender email is missing.');
      return;
    }

    replyToContactFormMutation.mutate({
      contactId: currentContactForReply._id,
      subject: replySubject,
      replyContent: replyContent,
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
          Access Denied. You must be logged in as an Administrator or Pastor to manage contact forms.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for contact forms data (only if authorized)
  if (contactsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading contact forms for management...
        </div>
      </section>
    );
  }

  // Render error state for contact forms data
  if (contactsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading contact forms: {fetchError.response?.data?.message || fetchError.message}
          <br/>
Please ensure your backend route `/contact-forms` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Quote Requests
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

        {contacts && contacts.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message Snippet
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Received At
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contacts.map((contact) => (
                    <React.Fragment key={contact._id}>
                      <tr>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingContactId === contact._id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            contact.name
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {editingContactId === contact._id ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            contact.email
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 max-w-xs truncate text-sm text-gray-700">
                          {editingContactId === contact._id ? (
                            <textarea
                              value={editMessage}
                              onChange={(e) => setEditMessage(e.target.value)}
                              rows="2"
                              className="w-full p-1 border rounded resize-y"
                            ></textarea>
                          ) : (
                            contact.message
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                          {editingContactId === contact._id ? (
                            <select
                              value={editStatus}
                              onChange={(e) => setEditStatus(e.target.value)}
                              className="w-full p-1 border rounded bg-white"
                            >
                              <option value="new">New</option>
                              <option value="read">Read</option>
                              <option value="replied">Replied</option>
                              <option value="archived">Archived</option>
                            </select>
                          ) : (
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                              contact.status === 'new' ? 'bg-orange-100 text-orange-800' :
                              contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                              contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800' // archived
                            }`}>
                              {contact.status}
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {formatTimestamp(contact.createdAt)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingContactId === contact._id ? (
                            <div className="flex justify-end space-x-2 text-xs sm:text-sm">
                              <button
                                onClick={handleSaveEdit}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                disabled={editContactFormMutation.isPending}
                              >
                                {editContactFormMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingContactId(null)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={editContactFormMutation.isPending}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2 text-xs sm:text-sm flex-wrap gap-1">
                              <button
                                onClick={() => { setDetailContact(contact); setShowDetailModal(true); }}
                                className="text-green-600 hover:text-green-900 cursor-pointer"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleEditClick(contact)}
                                className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(contact._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 cursor-pointer"
                                disabled={deleteContactFormMutation.isPending}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleReplyClick(contact)}
                                className="text-green-600 hover:text-green-700 disabled:opacity-50 cursor-pointer"
                                disabled={!contact.email} // Disable if no email to reply to
                              >
                                Reply
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {/* Expanded row for additional details and reply info */}
                      {editingContactId === contact._id && (
                        <tr>
                          <td colSpan="7" className="px-4 lg:px-6 py-4 text-sm text-gray-700 bg-gray-50">
                            <div className="space-y-4">
                              <div>
                                <label htmlFor="editPhoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                  Phone Number
                                </label>
                                <input
                                  type="text"
                                  id="editPhoneNumber"
                                  value={editPhoneNumber}
                                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                                  className="w-full p-2 border rounded"
                                />
                              </div>
                              {contact.repliedBy && (
                                <div>
                                  <p className="text-sm font-medium text-gray-700">
                                    Replied By: <span className="font-normal">{contact.repliedBy.name} ({contact.repliedBy.email})</span>
                                  </p>
                                  <p className="text-sm font-medium text-gray-700">
                                    Replied At: <span className="font-normal">{formatTimestamp(contact.repliedAt)}</span>
                                  </p>
                                </div>
                              )}
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
              {contacts.map((contact) => (
                <div key={contact._id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                      <p className="text-sm font-bold text-gray-900">{contact.name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                      <p className="text-sm text-gray-700 truncate">{contact.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Message</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{contact.message}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                      <span className={`inline-flex text-xs px-2 py-1 font-semibold rounded-full capitalize ${
                        contact.status === 'new' ? 'bg-orange-100 text-orange-800' :
                        contact.status === 'read' ? 'bg-blue-100 text-blue-800' :
                        contact.status === 'replied' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {contact.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Received At</p>
                      <p className="text-sm text-gray-700">{formatTimestamp(contact.createdAt)}</p>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                      <button
                        onClick={() => { setDetailContact(contact); setShowDetailModal(true); }}
                        className="flex-1 min-w-[80px] bg-green-50 text-green-600 py-2 rounded text-xs font-medium hover:bg-green-100 transition"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEditClick(contact)}
                        className="flex-1 min-w-[80px] bg-indigo-50 text-indigo-600 py-2 rounded text-xs font-medium hover:bg-indigo-100 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(contact._id)}
                        className="flex-1 min-w-[80px] bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                        disabled={deleteContactFormMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                    <button
                      onClick={() => handleReplyClick(contact)}
                      className="w-full bg-green-600 text-white py-2 rounded text-xs font-medium hover:bg-green-700 transition disabled:opacity-50"
                      disabled={!contact.email}
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No contact form submissions to manage.</p>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && currentContactForReply && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4">
          <div className="relative p-6 sm:p-8 bg-white w-full max-w-md mx-auto rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
              Reply to {currentContactForReply.name}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
Original Message: <span className="italic">&apos;{currentContactForReply.message.substring(0, 100)}...&apos;</span>
            </p>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              {replyError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                  <span className="block sm:inline text-xs sm:text-sm">{replyError}</span>
                </div>
              )}
              <div>
                <label htmlFor="replySubject" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Subject <span className="text-red-500">*</span>
                  <span className='ml-2 text-[10px] sm:text-[11px]'>(You can rephrase the subject)</span>
                </label>
                <input
                  type="text"
                  id="replySubject"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="replyContent" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Reply Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="replyContent"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows="6"
                  placeholder='Enter your reply here...'
                  className="w-full px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                  required
                ></textarea>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(false)}
                  className="px-4 sm:px-5 py-2 text-sm bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-200 disabled:opacity-50"
                  disabled={replyToContactFormMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2 text-sm bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={replyToContactFormMutation.isPending}
                >
                  {replyToContactFormMutation.isPending ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Send Reply'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && detailContact && (
        <ContactFormDetailModal contact={detailContact} onClose={() => { setShowDetailModal(false); setDetailContact(null); }} />
      )}
    </section>
  );
}

export default ContactFormResponsesMain;
