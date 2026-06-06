'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';

// Helper function to format date for display
const formatDate = (dateString) => {
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

function ManageEvents() {
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee, isAuthenticated, isLoading: authLoading } = useProfile();

  // State for editing mode
  const [editingEventId, setEditingEventId] = useState(null);
  const [editEventTitle, setEditEventTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editOrganizer, setEditOrganizer] = useState('');
  const [editCoOrganizer, setEditCoOrganizer] = useState('');

  const [actionMessage, setActionMessage] = useState(''); // For success messages
  const [actionError, setActionError] = useState(''); // For specific action errors

  // Clear messages when starting a new action or editing
  useEffect(() => {
    setActionError('');
    setActionMessage('');
  }, [editingEventId]);

  // Determine if the user has permission to manage events
  const hasPermission = isAuthenticated && (isAdmin || isEmployee);

  // Fetch ALL events (upcoming, completed, cancelled) for admin/pastor management
  const {
    data: events, // This will now contain all events
    isLoading: isEventsLoading,
    isError: isEventsError,
    error: eventsError,
  } = useQuery({
    queryKey: ['adminEvents'], // Unique key for admin's view of all events
    queryFn: async () => {
      // Call the admin-specific endpoint to get all events
      // Your backend route GET /api/events/admin/all is protected by authorizeRole(['admin']).
      // If you want pastors to also fetch this, your backend route needs to be updated
      // to authorizeRole(['admin', 'pastor']).
      const response = await axios.get(`${API_BASE_URL}/events/admin/all`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    // Corrected: enabled if authenticated AND (isAdmin OR isEmployee)
    enabled: hasPermission,
  });

  // Mutation for editing an event
  const editEventMutation = useMutation({
    mutationFn: async (updatedEvent) => {
      const response = await axios.put(`${API_BASE_URL}/events/${updatedEvent._id}`, updatedEvent);
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Event updated successfully!');
      setActionError('');
      setEditingEventId(null); // Exit edit mode
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list if status changed
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to update event.');
      setActionMessage('');
    },
  });

  // Mutation for deleting an event
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await axios.delete(`${API_BASE_URL}/events/${eventId}`);
    },
    onSuccess: () => {
      setActionMessage('Event deleted successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to delete event.');
      setActionMessage('');
    },
  });

  // Mutation for changing event status
  const changeStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }) => {
      const response = await axios.patch(`${API_BASE_URL}/events/${eventId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      setActionMessage('Event status updated successfully!');
      setActionError('');
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Refetch admin event list
      queryClient.invalidateQueries({ queryKey: ['upcomingEvents'] }); // Also invalidate public list
      setTimeout(() => setActionMessage(''), 3000);
    },
    onError: (err) => {
      setActionError(err.response?.data?.message || 'Failed to change event status.');
      setActionMessage('');
    },
  });

  // Handle edit button click
  const handleEditClick = (event) => {
    setEditingEventId(event._id);
    setEditEventTitle(event.eventTitle || '');
    setEditCategory(event.category || '');
    setEditDescription(event.description || '');
    setEditLocation(event.location || '');
    setEditDuration(event.duration || '');
    setEditTime(event.time || '');
    // Format date for input type="date" (YYYY-MM-DD)
    setEditDate(event.date ? new Date(event.date).toISOString().split('T')[0] : '');
    setEditAddress(event.address || '');
    setEditOrganizer(event.organizer || '');
    setEditCoOrganizer(event.coOrganizer || '');
    setActionMessage(''); // Clear messages when starting edit
    setActionError('');
  };

  // Handle save edit
  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editEventTitle.trim() || !editCategory.trim() || !editDescription.trim() || !editDate.trim()) {
      setActionError('Title, Category, Description, and Date are required for editing.');
      return;
    }
    editEventMutation.mutate({
      _id: editingEventId,
      eventTitle: editEventTitle,
      category: editCategory,
      description: editDescription,
      location: editLocation,
      duration: editDuration,
      time: editTime,
      date: editDate, // Send as YYYY-MM-DD string, backend will parse
      address: editAddress,
      organizer: editOrganizer,
      coOrganizer: editCoOrganizer,
    });
  };

  // Handle delete
  const handleDeleteClick = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      deleteEventMutation.mutate(eventId);
    }
  };

  // Handle status change
  const handleChangeStatus = (eventId, currentStatus) => {
    // Define all possible statuses in the desired order for cycling
    const statuses = ['upcoming', 'completed', 'cancelled'];
    // Find the current index of the status
    const currentIndex = statuses.indexOf(currentStatus);
    // Determine the next status in a circular manner
    const nextStatusIndex = (currentIndex + 1) % statuses.length;
    const newStatus = statuses[nextStatusIndex];

    if (window.confirm(`Are you sure you want to change this event's status to "${newStatus}"?`)) {
      changeStatusMutation.mutate({ eventId, status: newStatus });
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

  // Corrected: Check if user is authenticated AND (isAdmin OR isEmployee)
  if (!hasPermission) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator or Pastor to manage events.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </div>
        </div>
      </section>
    );
  }

  // Render loading state for events data (only if authorized)
  if (isEventsLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading events for management...
        </div>
      </section>
    );
  }

  // Render error state for events data
  if (isEventsError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center overflow-x-hidden">
        <div className="text-center text-lg text-red-600">
          Error loading events: {eventsError.response?.data?.message || eventsError.message}
          <br/>
Please ensure your backend route `/events/admin/all` is configured to allow &apos;pastor&apos; role access if intended.
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-2 sm:px-3 lg:px-4 bg-gray-100 font-inter overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8">
          Manage Events
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

        {events && events.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-lg p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <React.Fragment key={event._id}>
                    <tr>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {editingEventId === event._id ? (
                          <input
                            type="text"
                            value={editEventTitle}
                            onChange={(e) => setEditEventTitle(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.eventTitle
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <select
                            value={editCategory}
                            onChange={(e) => setEditCategory(e.target.value)}
                            className="w-full p-1 border rounded bg-white"
                          >
                            <option value="General">Choose Category</option>
                            <option value="Shipment">Shipment</option>
                            <option value="Cargo">Cargo</option>
                            <option value="International Travel">International Travel</option>
                          </select>
                        ) : (
                          event.category
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="text"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.location || 'N/A'
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          formatDate(event.date)
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {editingEventId === event._id ? (
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          event.time || 'N/A'
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {editingEventId === event._id ? (
                          <div className="flex justify-end space-x-2 text-xs sm:text-sm">
                            <button
                              onClick={handleSaveEdit}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50"
                              disabled={editEventMutation.isPending}
                            >
                              {editEventMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingEventId(null)}
                              className="text-gray-600 hover:text-gray-900"
                              disabled={editEventMutation.isPending}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end space-x-2 text-xs sm:text-sm flex-wrap gap-1">
                            <button
                              onClick={() => handleEditClick(event)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(event._id)}
                              className="text-red-600 hover:text-red-900 disabled:opacity-50"
                              disabled={deleteEventMutation.isPending}
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => handleChangeStatus(event._id, event.status)}
                              className={`text-sm px-2 py-1 rounded-md ${
                                event.status === 'upcoming'
                                  ? 'bg-green-500 text-white hover:bg-green-600' // Change to Completed
                                  : event.status === 'completed'
                                  ? 'bg-red-500 text-white hover:bg-red-600' // Change to Cancelled
                                  : 'bg-blue-500 text-white hover:bg-blue-600' // Change to Upcoming
                              } disabled:opacity-50`}
                              disabled={changeStatusMutation.isPending}
                            >
                              {event.status === 'upcoming' ? 'Set Completed' :
                                event.status === 'completed' ? 'Set Cancelled' :
                                'Set Upcoming'
                              }
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {editingEventId === event._id && (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-sm text-gray-700 bg-gray-50">
                          <div className="space-y-4">
                            <div>
                              <label htmlFor="editDescription" className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                              </label>
                              <textarea
                                id="editDescription"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                rows="4"
                                className="w-full p-2 border rounded resize-y"
                              ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editDuration" className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration
                                    </label>
                                    <input
                                        type="text"
                                        id="editDuration"
                                        value={editDuration}
                                        onChange={(e) => setEditDuration(e.target.value)}
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
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="editOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Organizer
                                    </label>
                                    <input
                                        type="text"
                                        id="editOrganizer"
                                        value={editOrganizer}
                                        onChange={(e) => setEditOrganizer(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="editCoOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                                        Co-Organizer
                                    </label>
                                    <input
                                        type="text"
                                        id="editCoOrganizer"
                                        value={editCoOrganizer}
                                        onChange={(e) => setEditCoOrganizer(e.target.value)}
                                        className="w-full p-2 border rounded"
                                    />
                                </div>
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
              {events.map((event) => (
                <React.Fragment key={event._id}>
                  <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Title</p>
                        {editingEventId === event._id ? (
                          <input
                            type="text"
                            value={editEventTitle}
                            onChange={(e) => setEditEventTitle(e.target.value)}
                            className="w-full p-2 border rounded text-sm"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900">{event.eventTitle}</p>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                          {editingEventId === event._id ? (
                            <select
                              value={editCategory}
                              onChange={(e) => setEditCategory(e.target.value)}
                              className="w-full p-2 border rounded text-xs bg-white"
                            >
                              <option value="">Choose Category</option>
                              <option value="Shipment">Shipment</option>
                              <option value="Cargo">Cargo</option>
                              <option value="International Travel">International Travel</option>
                            </select>
                          ) : (
                            <p className="text-sm text-gray-700">{event.category}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
                          {editingEventId === event._id ? (
                            <input
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-sm text-gray-700">{event.location || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Date</p>
                          {editingEventId === event._id ? (
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-sm text-gray-700">{formatDate(event.date)}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">Time</p>
                          {editingEventId === event._id ? (
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="w-full p-2 border rounded text-xs"
                            />
                          ) : (
                            <p className="text-sm text-gray-700">{event.time || 'N/A'}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Status</p>
                        <span className={`inline-flex text-xs px-2 py-1 font-semibold rounded-full capitalize ${
                          event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                          event.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                      {editingEventId === event._id && (
                        <div className="space-y-3 pt-2 border-t border-gray-200">
                          <div>
                            <label htmlFor="editDescriptionMobile" className="block text-xs font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              id="editDescriptionMobile"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              rows="3"
                              className="w-full p-2 border rounded text-sm resize-y"
                            ></textarea>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            <div>
                              <label htmlFor="editDurationMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Duration
                              </label>
                              <input
                                type="text"
                                id="editDurationMobile"
                                value={editDuration}
                                onChange={(e) => setEditDuration(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
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
                            <div>
                              <label htmlFor="editOrganizerMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Organizer
                              </label>
                              <input
                                type="text"
                                id="editOrganizerMobile"
                                value={editOrganizer}
                                onChange={(e) => setEditOrganizer(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label htmlFor="editCoOrganizerMobile" className="block text-xs font-medium text-gray-700 mb-1">
                                Co-Organizer
                              </label>
                              <input
                                type="text"
                                id="editCoOrganizerMobile"
                                value={editCoOrganizer}
                                onChange={(e) => setEditCoOrganizer(e.target.value)}
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2 border-t border-gray-200 flex-wrap">
                        {editingEventId === event._id ? (
                          <>
                            <button
                              onClick={handleSaveEdit}
                              className="flex-1 min-w-[70px] bg-green-500 text-white py-2 rounded text-xs font-medium hover:bg-green-600 transition disabled:opacity-50"
                              disabled={editEventMutation.isPending}
                            >
                              {editEventMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingEventId(null)}
                              className="flex-1 min-w-[70px] bg-gray-300 text-gray-800 py-2 rounded text-xs font-medium hover:bg-gray-400 transition disabled:opacity-50"
                              disabled={editEventMutation.isPending}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(event)}
                              className="flex-1 min-w-[70px] bg-indigo-50 text-indigo-600 py-2 rounded text-xs font-medium hover:bg-indigo-100 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteClick(event._id)}
                              className="flex-1 min-w-[70px] bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                              disabled={deleteEventMutation.isPending}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      {!editingEventId && (
                        <button
                          onClick={() => handleChangeStatus(event._id, event.status)}
                          className="w-full bg-blue-600 text-white text-xs py-2 rounded font-medium hover:bg-blue-700 transition disabled:opacity-50"
                          disabled={changeStatusMutation.isPending}
                        >
                          Change Status
                        </button>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-600">No events to manage.</p>
        )}
      </div>
    </section>
  );
}

export default ManageEvents;
