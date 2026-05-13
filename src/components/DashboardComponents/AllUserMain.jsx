'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';

function AllUserMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingUserId, setEditingUserId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editHomeAddress, setEditHomeAddress] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editState, setEditState] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For success messages
  const [actionError, setActionError] = useState(''); // For specific action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
  }, [editingUserId]);

   // Determine if the user has permission to manage events
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all users for admin management
  const {
    data: users,
    isLoading: usersLoading,
    isError: usersError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allUsers'], // Unique key for fetching all users
    queryFn: async () => {
      // This endpoint is protected by authorize('admin') on the backend
      const response = await axios.get(`${API_BASE_URL}/profile/all`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Data considered fresh for 5 minutes
    enabled: hasPermission,
  });

  // Mutation for editing a user
  const editUserMutation = useMutation({
    mutationFn: async (updatedUser) => {
      const response = await axios.put(`${API_BASE_URL}/profile/edit/${updatedUser._id}`, updatedUser);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('User updated successfully!');
      setActionError('');
      setEditingUserId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Refetch user list
      queryClient.invalidateQueries({ queryKey: ['profileData'] }); // Invalidate current user's profile if it was edited
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update user.');
      setActionMessage('');
    },
  });

  // Mutation for deleting a user
  const deleteUserMutation = useMutation({
    mutationFn: async (userIdToDelete) => {
      await axios.delete(`${API_BASE_URL}/profile/delete/${userIdToDelete}`);
    },
    onSuccess: () => {
      setActionMessage('User deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Refetch user list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete user.');
      setActionMessage('');
    },
  });

  // Mutation for toggling user disabled status
  const toggleDisableUserMutation = useMutation({
    mutationFn: async ({ userIdToToggle, isDisabled }) => {
      const endpoint = isDisabled ? 'disable' : 'enable';
      const response = await axios.put(`${API_BASE_URL}/profile/edit/${userIdToToggle}`, { isDisabled: !isDisabled });
      return response.data;
    },
    onSuccess: (data) => {
      setActionMessage(`User ${data.isDisabled ? 'disabled' : 'enabled'} successfully!`);
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change user status.');
      setActionMessage('');
    },
  });

  // Mutation for toggling user suspended status
  const toggleSuspendUserMutation = useMutation({
    mutationFn: async ({ userIdToToggle, isSuspended }) => {
      // Similar to disable, using PUT to editUser to set isSuspended.
      const response = await axios.put(`${API_BASE_URL}/profile/edit/${userIdToToggle}`, { isSuspended: !isSuspended });
      return response.data;
    },
    onSuccess: (data) => {
      setActionMessage(`User ${data.isSuspended ? 'suspended' : 'unsuspended'} successfully!`);
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allUsers'] });
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change user suspension status.');
      setActionMessage('');
    },
  });


  // Handle edit button click
  const handleEditClick = (user) => {
    setEditingUserId(user._id);
    setEditName(user.name || '');
    setEditEmail(user.email || '');
    setEditRole(user.role || 'member');
    setEditGender(user.gender || '');
    setEditPhoneNumber(user.phoneNumber || '');
    setEditHomeAddress(user.homeAddress || '');
    setEditCountry(user.country || '');
    setEditState(user.state || '');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editRole.trim()) {
      setActionError('Name, Email, and Role are required.');
      return;
    }
    editUserMutation.mutate({
      _id: editingUserId,
      name: editName,
      email: editEmail,
      role: editRole,
      gender: editGender,
      phoneNumber: editPhoneNumber,
      homeAddress: editHomeAddress,
      country: editCountry,
      state: editState,
    });
  };

  // Handle delete
  const handleDeleteClick = (userIdToDelete) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUserMutation.mutate(userIdToDelete);
    }
  };

  // Handle toggle disable
  const handleToggleDisable = (userIdToToggle, isDisabled) => {
    if (window.confirm(`Are you sure you want to ${isDisabled ? 'enable' : 'disable'} this user?`)) {
      toggleDisableUserMutation.mutate({ userIdToToggle, isDisabled });
    }
  };

  // Handle toggle suspend
  const handleToggleSuspend = (userIdToToggle, isSuspended) => {
    if (window.confirm(`Are you sure you want to ${isSuspended ? 'unsuspend' : 'suspend'} this user?`)) {
      toggleSuspendUserMutation.mutate({ userIdToToggle, isSuspended });
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

  // Check if user is authenticated and is an admin
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to manage users.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for users data (only if authorized)
  if (usersLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading users for management...
        </div>
      </section>
    );
  }

  // Render error state for users data
  if (usersError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading users: {fetchError.response?.data?.message || fetchError.message}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Users
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

        {users && users.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
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
                    Role
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
                {users.map((user) => (
                  <React.Fragment key={user._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingUserId === user._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingUserId === user._id ? (
                          <input
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          user.email
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingUserId === user._id ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="w-full p-1 border rounded bg-white"
                          >
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                            <option value="agent">Agent</option>
                            <option value="employee">Employee</option>
                          </select>
                        ) : (
                          user.role
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          user.isDisabled ? 'bg-red-100 text-red-800' :
                          user.isSuspended ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.isDisabled ? 'Disabled' : user.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingUserId === user._id ? (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveEdit}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                              disabled={editUserMutation.isPending}
                            >
                              {editUserMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingUserId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editUserMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(user._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deleteUserMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleToggleDisable(user._id, user.isDisabled)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                user.isDisabled ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-red-500 text-white hover:bg-red-600'
                              } disabled:opacity-50`}
                              disabled={toggleDisableUserMutation.isPending}
                            >
                              {user.isDisabled ? 'Enable' : 'Disable'}
                            </button>
                            <button
                              onClick={() => handleToggleSuspend(user._id, user.isSuspended)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                user.isSuspended ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-orange-500 text-white hover:bg-orange-600'
                              } disabled:opacity-50`}
                              disabled={toggleSuspendUserMutation.isPending}
                            >
                              {user.isSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingUserId === user._id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="editGender" className="block text-sm font-medium text-gray-700 mb-1">
                                Gender
                              </label>
                              <input
                                type="text"
                                id="editGender"
                                value={editGender}
                                onChange={(e) => setEditGender(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
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
                              <label htmlFor="editHomeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                                Home Address
                              </label>
                              <input
                                type="text"
                                id="editHomeAddress"
                                value={editHomeAddress}
                                onChange={(e) => setEditHomeAddress(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label htmlFor="editCountry" className="block text-sm font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                id="editCountry"
                                value={editCountry}
                                onChange={(e) => setEditCountry(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div>
                              <label htmlFor="editState" className="block text-sm font-medium text-gray-700 mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                id="editState"
                                value={editState}
                                onChange={(e) => setEditState(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
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
          <p className="text-center text-gray-600">No users to manage.</p>
        )}
      </div>
    </section>
  );
}

export default AllUserMain;
