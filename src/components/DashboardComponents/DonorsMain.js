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

function DonorsMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingDonationId, setEditingDonationId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editIsAnonymous, setEditIsAnonymous] = useState(false);

  // State for sending email modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [currentDonorEmail, setCurrentDonorEmail] = useState('');
  const [currentDonorIdForEmail, setCurrentDonorIdForEmail] = useState(null); // To pass to mutation
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
  }, [editingDonationId, showEmailModal]);

  // Determine if the user has permission to manage donations/donors
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all donations (which represent donors and their contributions)
  const {
    data: donations,
    isLoading: donationsLoading,
    isError: donationsError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allDonations'], // Re-using the same key as ManageDonations for consistency
    queryFn: async () => {
      // This endpoint is already accessible by admin and pastor on the backend
      const response = await axios.get(`${API_BASE_URL}/donations`);
      return response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by creation date
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission, // Only run if authenticated AND (isAdmin OR isEmployee)
  });

  // Mutation for editing a donation record (which updates donor info)
  const editDonationMutation = useMutation({
    mutationFn: async (updatedDonation) => {
      const response = await axios.put(`${API_BASE_URL}/donations/${updatedDonation._id}`, updatedDonation);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Donor information updated successfully!');
      setActionError('');
      setEditingDonationId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allDonations'] }); // Refetch donation list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update donor information.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a donation record (effectively removing a donor's contribution)
  const deleteDonationMutation = useMutation({
    mutationFn: async (donationId) => {
      await axios.delete(`${API_BASE_URL}/donations/${donationId}`);
    },
    onSuccess: () => {
      setActionMessage('Donation record deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allDonations'] }); // Refetch donation list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete donation record.');
      setActionMessage('');
    },
  });

  // Mutation for sending an email to a single donor
  const sendEmailMutation = useMutation({
    mutationFn: async ({ donationId, subject, content }) => {
      const response = await axios.post(`${API_BASE_URL}/donations/send-email/${donationId}`, { subject, content });
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
  const handleEditClick = (donation) => {
    setEditingDonationId(donation._id);
    setEditName(donation.name || '');
    setEditEmail(donation.email || '');
    setEditAmount(donation.amount.toString()); // Convert number to string for input
    setEditPhoneNumber(donation.phoneNumber || '');
    setEditAddress(donation.address || '');
    setEditMessage(donation.message || '');
    setEditIsAnonymous(donation.isAnonymous);
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editAmount.trim() || parseFloat(editAmount) <= 0) {
      setActionError('Amount must be a positive number.');
      return;
    }
    if (!editIsAnonymous && (!editName.trim() || !editEmail.trim())) {
      setActionError('Name and Email are required if not anonymous.');
      return;
    }
    if (!editIsAnonymous && !/\S+@\S+\.\S+/.test(editEmail)) {
      setActionError('Please enter a valid email address.');
      return;
    }

    editDonationMutation.mutate({
      _id: editingDonationId,
      name: editIsAnonymous ? undefined : editName.trim(), // Send undefined if anonymous
      email: editIsAnonymous ? undefined : editEmail.trim(), // Send undefined if anonymous
      amount: parseFloat(editAmount),
      phoneNumber: editIsAnonymous ? undefined : editPhoneNumber.trim() || undefined,
      address: editIsAnonymous ? undefined : editAddress.trim() || undefined,
      message: editMessage.trim() || undefined,
      isAnonymous: editIsAnonymous,
    });
  };

  // Handle delete
  const handleDeleteClick = (donationId) => {
    if (window.confirm('Are you sure you want to delete this donation record? This action cannot be undone.')) {
      deleteDonationMutation.mutate(donationId);
    }
  };

  // Handle opening email modal
  const handleSendEmailClick = (donorEmail, donationId) => {
    setCurrentDonorEmail(donorEmail);
    setCurrentDonorIdForEmail(donationId); // Store the donation ID for the mutation
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
      donationId: currentDonorIdForEmail, // Use the stored donation ID
      subject: emailSubject,
      content: emailContent,
    });
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

  // Check if user is authenticated AND (isAdmin OR isEmployee)
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator or Pastor to manage donors.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for donations data (only if authorized)
  if (donationsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading donor records for management...
        </div>
      </section>
    );
  }

  // Render error state for donations data
  if (donationsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading donor records: {fetchError.response?.data?.message || fetchError.message}
          <br/>
Please ensure your backend route `/donations` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Donors
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

        {donations && donations.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (₦)
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anonymous
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donations.map((donation) => (
                  <React.Fragment key={donation._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingDonationId === donation._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-1 border rounded"
                            disabled={editIsAnonymous} // Disable if anonymous
                          />
                        ) : (
                          donation.isAnonymous ? 'Anonymous' : (donation.name || 'N/A')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingDonationId === donation._id ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full p-1 border rounded"
                            disabled={editIsAnonymous} // Disable if anonymous
                          />
                        ) : (
                          donation.isAnonymous ? 'N/A' : (donation.email || 'N/A')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingDonationId === donation._id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            min="0.01"
                            step="0.01"
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          `₦${donation.amount.toFixed(2)}`
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {editingDonationId === donation._id ? (
                          <input
                            type="checkbox"
                            checked={editIsAnonymous}
                            onChange={(e) => {
                              setEditIsAnonymous(e.target.checked);
                              // Clear name/email/phone/address if becoming anonymous
                              if (e.target.checked) {
                                setEditName('');
                                setEditEmail('');
                                setEditPhoneNumber('');
                                setEditAddress('');
                              }
                            }}
                            className="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                        ) : (
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            donation.isAnonymous ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {donation.isAnonymous ? 'Yes' : 'No'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          donation.status === 'pending' ? 'bg-gray-100 text-gray-800' :
                          donation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {donation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatTimestamp(donation.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingDonationId === donation._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              disabled={editDonationMutation.isPending}
                            >
                              {editDonationMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingDonationId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editDonationMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(donation)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(donation._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deleteDonationMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleSendEmailClick(donation.email, donation._id)}
                              className="text-green-600 hover:text-green-700 disabled:opacity-50"
                              disabled={!donation.email || donation.isAnonymous} // Disable if no email or is anonymous
                            >
                              Send Email
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingDonationId === donation._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
                          <div className="space-y-4">
                            {!editIsAnonymous && (
                              <>
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
                                <div>
                                  <label htmlFor="editAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                  </label>
                                  <input
                                    type="text"
                                    id="editAddress"
                                    value={editAddress}
                                    onChange={(e) => setEditAddress(e.target.value)}
                                    className="w-full p-2 border rounded"
                                  />
                                </div>
                              </>
                            )}
                            <div>
                              <label htmlFor="editMessage" className="block text-sm font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <textarea
                                id="editMessage"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                rows="3"
                                className="w-full p-2 border rounded resize-y"
                              ></textarea>
                            </div>
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
          <p className="text-center text-gray-600">No donor records to manage.</p>
        )}
      </div>

      {/* Email Send Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Send Email to {currentDonorEmail}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
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

export default DonorsMain;
