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

function MyAppointmentMain() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, user } = useProfile(); // Get user info to filter appointments

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
  }, [showRescheduleModal]);

  // Fetch appointments for the logged-in user
  const {
    data: appointments,
    isLoading: appointmentsLoading,
    isError: appointmentsError,
    error: fetchError,
  } = useQuery({
    queryKey: ['myAppointments'], // Unique key for fetching user's appointments
    queryFn: async () => {
      // Fetch only the current user's appointments from the dedicated endpoint
      const response = await axios.get(`${API_BASE_URL}/appointments/my`);
      const userAppointments = Array.isArray(response.data) ? response.data : [];
      
      return userAppointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)); // Sort by date
    },
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated, // Only run if authenticated
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
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] }); // Refetch user's appointment list
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
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] }); // Refetch user's appointment list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to cancel appointment.');
      setActionMessage('');
    },
  });

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

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Checking authentication...
        </div>
      </section>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. Please log in to view your appointments.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for appointments data
  if (appointmentsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading your appointments...
        </div>
      </section>
    );
  }

  // Render error state for appointments data
  if (appointmentsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading your appointments: {fetchError.response?.data?.message || fetchError.message}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          My Appointments
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
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
                {appointments.map((appointment) => (
                  <React.Fragment key={appointment._id}>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {appointment.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appointment.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {formatDateForDisplay(appointment.appointmentDate)}
                        {appointment.rescheduledFrom && (
                          <span className="block text-xs text-gray-500">
                            (Was: {formatDateForDisplay(appointment.rescheduledFrom.date)} {appointment.rescheduledFrom.time})
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {appointment.appointmentTime}
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
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {/* Only allow reschedule/cancel if not already cancelled or completed */}
                          {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                            <>
                              <button
                                onClick={() => handleRescheduleClick(appointment)}
                                className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                disabled={rescheduleAppointmentMutation.isPending}
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => handleCancelClick(appointment._id)}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                disabled={cancelAppointmentMutation.isPending}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600">You have no appointments booked.</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
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

export default MyAppointmentMain;
