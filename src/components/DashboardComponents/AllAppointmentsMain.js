'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';

// Helper function to format date for display
const formatDateForDisplay = (dateString) => {
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

function AllAppointmentsMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isAdmin, isEmployee, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingAppointmentId, setEditingAppointmentId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhoneNumber, setEditPhoneNumber] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editState, setEditState] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [editAppointmentDate, setEditAppointmentDate] = useState('');
  const [editAppointmentTime, setEditAppointmentTime] = useState('');
  const [editStatus, setEditStatus] = useState(''); // For inline status edit if needed, though we have a separate status change

  // State for reschedule modal
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleAppointmentId, setRescheduleAppointmentId] = useState(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('');
  const [rescheduleError, setRescheduleError] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For general success messages
  const [actionError, setActionError] = useState(''); // For general action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
    setRescheduleError(''); // Clear reschedule specific error
  }, [editingAppointmentId, showRescheduleModal]);

  // Determine if the user has permission to manage appointments
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch all appointments for admin/pastor management
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    error: fetchError,
  } = useQuery({
    queryKey: ['allAppointments'], // Unique key for fetching all appointments
    queryFn: async () => {
      // This endpoint is accessible by admin and pastor on the backend
      const response = await axios.get(`${API_BASE_URL}/appointments`);
      return response.data.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)); // Sort by date
    },
    staleTime: 5 * 60 * 1000,
    enabled: hasPermission, // Only run if authenticated AND (isAdmin OR isEmployee)
  });

  // Mutation for updating appointment details
  const updateAppointmentMutation = useMutation({
    mutationFn: async (updatedAppointment) => {
      const response = await axios.put(`${API_BASE_URL}/appointments/${updatedAppointment._id}`, updatedAppointment);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Appointment updated successfully!');
      setActionError('');
      setEditingAppointmentId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] }); // Refetch appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update appointment.');
      setActionMessage('');
    },
  });

  // Mutation for deleting an appointment
  const deleteAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await axios.delete(`${API_BASE_URL}/appointments/${appointmentId}`);
    },
    onSuccess: () => {
      setActionMessage('Appointment deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] }); // Refetch appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete appointment.');
      setActionMessage('');
    },
  });

  // Mutation for rescheduling an appointment
  const rescheduleAppointmentMutation = useMutation({
    mutationFn: async ({ id, newAppointmentDate, newAppointmentTime }) => {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${id}/reschedule`, { newAppointmentDate, newAppointmentTime });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Appointment rescheduled successfully!');
      setRescheduleError('');
      setShowRescheduleModal(false); // Close modal
      setNewRescheduleDate('');
      setNewRescheduleTime('');
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] }); // Refetch appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setRescheduleError(err.response?.data?.message || 'Failed to reschedule appointment.');
      setActionMessage('');
    },
  });

  // Mutation for cancelling an appointment
  const cancelAppointmentMutation = useMutation({
    mutationFn: async (appointmentId) => {
      await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/cancel`);
    },
    onSuccess: () => {
      setActionMessage('Appointment cancelled successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] }); // Refetch appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to cancel appointment.');
      setActionMessage('');
    },
  });

  // Mutation for changing appointment status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ appointmentId, status }) => {
      const response = await axios.patch(`${API_BASE_URL}/appointments/${appointmentId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Appointment status updated successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['allAppointments'] }); // Refetch appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change appointment status.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (appointment) => {
    setEditingAppointmentId(appointment._id);
    setEditName(appointment.name || '');
    setEditEmail(appointment.email || '');
    setEditPhoneNumber(appointment.phoneNumber || '');
    setEditAddress(appointment.address || '');
    setEditCountry(appointment.country || '');
    setEditState(appointment.state || '');
    setEditMessage(appointment.message || '');
    setEditAppointmentDate(appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '');
    setEditAppointmentTime(appointment.appointmentTime || '');
    setEditStatus(appointment.status || 'pending');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim() || !editEmail.trim() || !editAppointmentDate.trim() || !editAppointmentTime.trim()) {
      setActionError('Name, Email, Date, and Time are required.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(editEmail)) {
      setActionError('Please enter a valid email address.');
      return;
    }

    updateAppointmentMutation.mutate({
      _id: editingAppointmentId,
      name: editName,
      email: editEmail,
      phoneNumber: editPhoneNumber || undefined,
      address: editAddress || undefined,
      country: editCountry || undefined,
      state: editState || undefined,
      message: editMessage || undefined,
      appointmentDate: editAppointmentDate,
      appointmentTime: editAppointmentTime,
      status: editStatus,
    });
  };

  // Handle delete
  const handleDeleteClick = (appointmentId) => {
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      deleteAppointmentMutation.mutate(appointmentId);
    }
  };

  // Handle opening reschedule modal
  const handleRescheduleClick = (appointment) => {
    setRescheduleAppointmentId(appointment._id);
    setNewRescheduleDate(appointment.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '');
    setNewRescheduleTime(appointment.appointmentTime || '');
    setShowRescheduleModal(true);
    setRescheduleError('');
  };

  // Handle submitting reschedule
  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    if (!newRescheduleDate.trim() || !newRescheduleTime.trim()) {
      setRescheduleError('New date and time are required.');
      return;
    }
    const selectedDateTime = new Date(`${newRescheduleDate}T${newRescheduleTime}`);
    if (isNaN(selectedDateTime.getTime())) {
      setRescheduleError('Invalid new date or time selected.');
      return;
    }
    if (selectedDateTime < new Date()) {
      setRescheduleError('New appointment date and time cannot be in the past.');
      return;
    }

    rescheduleAppointmentMutation.mutate({
      id: rescheduleAppointmentId,
      newAppointmentDate: newRescheduleDate,
      newAppointmentTime: newRescheduleTime,
    });
  };

  // Handle cancel appointment
  const handleCancelClick = (appointmentId) => {
    if (window.confirm('Are you sure you want to cancel this appointment? This cannot be undone.')) {
      cancelAppointmentMutation.mutate(appointmentId);
    }
  };

  // Handle change status
  const handleChangeStatus = (appointmentId, currentStatus) => {
    const statuses = ['pending', 'confirmed', 'cancelled', 'rescheduled', 'completed'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatusIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextStatusIndex];

    if (window.confirm(`Are you sure you want to change this appointment's status to "${newStatus}"?`)) {
      changeStatusMutation.mutate({ appointmentId, status: newStatus });
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
          Access Denied. You must be logged in as an Administrator or Pastor to manage appointments.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for appointments data (only if authorized)
  if (appointmentsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading appointments for management...
        </div>
      </section>
    );
  }

  // Render error state for appointments data
  if (appointmentsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading appointments: {fetchError.response?.data?.message || fetchError.message}
          <br/>
Please ensure your backend route `/appointments` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Appointments
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

        {appointments && appointments.length > 0 ? (
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
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked By
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {appointments.map((appointment) => (
                    <React.Fragment key={appointment._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            appointment.name
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            appointment.email
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="date"
                              value={editAppointmentDate}
                              onChange={(e) => setEditAppointmentDate(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            formatDateForDisplay(appointment.appointmentDate)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="time"
                              value={editAppointmentTime}
                              onChange={(e) => setEditAppointmentTime(e.target.value)}
                              className="w-full p-1 border rounded"
                            />
                          ) : (
                            appointment.appointmentTime
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                            appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            appointment.status === 'rescheduled' ? 'bg-purple-100 text-purple-800' :
                            appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {appointment.bookedBy ? appointment.bookedBy.name : 'Visitor'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingAppointmentId === appointment._id ? (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                disabled={updateAppointmentMutation.isPending}
                              >
                                {updateAppointmentMutation.isPending ? 'Saving...' : 'Save'}
                              </button>
                              <button
                                onClick={() => setEditingAppointmentId(null)}
                                className="text-gray-600 hover:text-gray-900"
                                disabled={updateAppointmentMutation.isPending}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditClick(appointment)}
                                className="text-indigo-600 hover:text-indigo-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteClick(appointment._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={deleteAppointmentMutation.isPending}
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => handleRescheduleClick(appointment)}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                disabled={rescheduleAppointmentMutation.isPending}
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelClick(appointment._id)}
                                className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                                disabled={cancelAppointmentMutation.isPending || appointment.status === 'cancelled'}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleChangeStatus(appointment._id, appointment.status)}
                                className={`text-sm px-2 py-1 rounded-md ${
                                  appointment.status === 'pending' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                  appointment.status === 'confirmed' ? 'bg-green-500 text-white hover:bg-green-600' :
                                  appointment.status === 'completed' ? 'bg-red-500 text-white hover:bg-red-600' :
                                  appointment.status === 'rescheduled' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                                  'bg-gray-500 text-white hover:bg-gray-600'
                                } disabled:opacity-50`}
                                disabled={changeStatusMutation.isPending}
                              >
                                {
                                  appointment.status === 'pending' ? 'Set Confirmed' :
                                  appointment.status === 'confirmed' ? 'Set Completed' :
                                  appointment.status === 'completed' ? 'Set Cancelled' :
                                  appointment.status === 'rescheduled' ? 'Set Confirmed' :
                                  'Change Status'
                                }
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                      {editingAppointmentId === appointment._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
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
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                              <div>
                                <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 mb-1">
                                  Status
                                </label>
                                <select
                                  id="editStatus"
                                  value={editStatus}
                                  onChange={(e) => setEditStatus(e.target.value)}
                                  className="w-full p-2 border rounded bg-white"
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="cancelled">Cancelled</option>
                                  <option value="rescheduled">Rescheduled</option>
                                  <option value="completed">Completed</option>
                                </select>
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {appointments.map((appointment) => (
                <React.Fragment key={appointment._id}>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                        {editingAppointmentId === appointment._id ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900">{appointment.name}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="email"
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-xs text-gray-700 truncate">{appointment.email}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="text"
                              value={editPhoneNumber}
                              onChange={(e) => setEditPhoneNumber(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-xs text-gray-700">{appointment.phoneNumber || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="date"
                              value={editAppointmentDate}
                              onChange={(e) => setEditAppointmentDate(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-xs text-gray-700">{formatDateForDisplay(appointment.appointmentDate)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Time</p>
                          {editingAppointmentId === appointment._id ? (
                            <input
                              type="time"
                              value={editAppointmentTime}
                              onChange={(e) => setEditAppointmentTime(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-xs text-gray-700">{appointment.appointmentTime}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                        <span className={`inline-flex text-xs px-2 py-1 font-semibold rounded-full capitalize ${
                          appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          appointment.status === 'rescheduled' ? 'bg-purple-100 text-purple-800' :
                          appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {appointment.status}
                        </span>
                      </div>
                      {editingAppointmentId === appointment._id && (
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                          <div>
                            <label htmlFor="editAddressMobile" className="block text-xs font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <input
                              type="text"
                              id="editAddressMobile"
                              value={editAddress}
                              onChange={(e) => setEditAddress(e.target.value)}
                              className="w-full p-2 border rounded text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label htmlFor="editCountryMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Country
                              </label>
                              <input
                                type="text"
                                id="editCountryMobile"
                                value={editCountry}
                                onChange={(e) => setEditCountry(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="editStateMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                State
                              </label>
                              <input
                                type="text"
                                id="editStateMobile"
                                value={editState}
                                onChange={(e) => setEditState(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="editMessageMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Message
                              </label>
                              <textarea
                                id="editMessageMobile"
                                value={editMessage}
                                onChange={(e) => setEditMessage(e.target.value)}
                                rows="2"
                                className="w-full p-2 border rounded text-sm resize-y"
                              ></textarea>
                            </div>
                            <div>
                              <label htmlFor="editStatusMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Status
                              </label>
                              <select
                                id="editStatusMobile"
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="w-full p-2 border rounded text-xs bg-white"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rescheduled">Rescheduled</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                        {editingAppointmentId === appointment._id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 min-w-[70px] bg-blue-500 text-white py-2 rounded text-xs font-medium hover:bg-blue-600 transition disabled:opacity-50"
                              disabled={updateAppointmentMutation.isPending}
                            >
                              {updateAppointmentMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingAppointmentId(null)}
                              className="flex-1 min-w-[70px] bg-gray-300 text-gray-800 py-2 rounded text-xs font-medium hover:bg-gray-400 transition disabled:opacity-50"
                              disabled={updateAppointmentMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(appointment)}
                              className="flex-1 min-w-[70px] bg-indigo-50 text-indigo-600 py-2 rounded text-xs font-medium hover:bg-indigo-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(appointment._id)}
                              className="flex-1 min-w-[70px] bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                              disabled={deleteAppointmentMutation.isPending}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      {!editingAppointmentId && (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleRescheduleClick(appointment)}
                            className="flex-1 text-xs py-2 px-2 rounded font-medium transition disabled:opacity-50 whitespace-nowrap bg-green-500 text-white hover:bg-green-600"
                            disabled={rescheduleAppointmentMutation.isPending}
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelClick(appointment._id)}
                            className="flex-1 text-xs py-2 px-2 rounded font-medium transition disabled:opacity-50 whitespace-nowrap bg-gray-500 text-white hover:bg-gray-600"
                            disabled={cancelAppointmentMutation.isPending || appointment.status === 'cancelled'}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleChangeStatus(appointment._id, appointment.status)}
                            className={`flex-1 text-xs py-2 px-2 rounded font-medium transition disabled:opacity-50 whitespace-nowrap ${
                              appointment.status === 'pending' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                              appointment.status === 'confirmed' ? 'bg-green-500 text-white hover:bg-green-600' :
                              appointment.status === 'completed' ? 'bg-red-500 text-white hover:bg-red-600' :
                              appointment.status === 'rescheduled' ? 'bg-blue-500 text-white hover:bg-blue-600' :
                              'bg-gray-500 text-white hover:bg-gray-600'
                            }`}
                            disabled={changeStatusMutation.isPending}
                          >
                            {
                              appointment.status === 'pending' ? 'Set Confirmed' :
                              appointment.status === 'confirmed' ? 'Set Completed' :
                              appointment.status === 'completed' ? 'Set Cancelled' :
                              appointment.status === 'rescheduled' ? 'Set Confirmed' :
                              'Change Status'
                            }
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No appointments to manage.</p>
        )}
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="relative p-8 bg-white w-full max-w-md mx-auto rounded-xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Reschedule Appointment
            </h3>
            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              {rescheduleError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
                  <span className="block sm:inline">{rescheduleError}</span>
                </div>
              )}
              <div>
                <label htmlFor="newRescheduleDate" className="block text-sm font-medium text-gray-700 mb-1">
                  New Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="newRescheduleDate"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="newRescheduleTime" className="block text-sm font-medium text-gray-700 mb-1">
                  New Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="newRescheduleTime"
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRescheduleModal(false)}
                  className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition duration-200"
                  disabled={rescheduleAppointmentMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  disabled={rescheduleAppointmentMutation.isPending}
                >
                  {rescheduleAppointmentMutation.isPending ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    'Reschedule'
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

export default AllAppointmentsMain;
