'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api'; // Adjust path as needed
import { useProfile } from '@/components/context-api/ProfileContext'; // Corrected path
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AddEventMain() { // Renamed from CreateEvent to AddEventMain as per user's component name
  const queryClient = useQueryClient();
  const { isAdmin, isEmployee, isAuthenticated, isLoading: authLoading } = useProfile();
  const router = useRouter();

  // State for form fields
  const [eventTitle, setEventTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [duration, setDuration] = useState('');
  const [time, setTime] = useState('');
  const [date, setDate] = useState(''); // Start date of the event/recurrence
  const [address, setAddress] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [coOrganizer, setCoOrganizer] = useState('');

  // --- New states for recurrence ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('daily');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');
  const [monthlyRecurrenceDayOfWeek, setMonthlyRecurrenceDayOfWeek] = useState('monday');
  const [monthlyRecurrenceOrdinal, setMonthlyRecurrenceOrdinal] = useState('first');

  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Clear messages when form fields change
  useEffect(() => {
    setLocalError('');
    setSuccessMessage('');
  }, [eventTitle, category, description, location, duration, time, date, address, organizer, coOrganizer,
      isRecurring, recurrenceType, recurrenceEndDate, monthlyRecurrenceDayOfWeek, monthlyRecurrenceOrdinal]);

  // Function to create a new event (now handles recurrence data)
  const createEvent = async (newEventData) => {
    const response = await axios.post(`${API_BASE_URL}/events`, newEventData);
    return response.data;
  };

  // useMutation hook for creating an event
  const createEventMutation = useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      setSuccessMessage('Event created successfully!');
      setLocalError('');
      queryClient.invalidateQueries({ queryKey: ['events'] }); // Invalidate public events list
      queryClient.invalidateQueries({ queryKey: ['adminEvents'] }); // Invalidate admin events list if you have one

      // Clear form fields
      setEventTitle('');
      setCategory('General');
      setDescription('');
      setLocation('');
      setDuration('');
      setTime('');
      setDate('');
      setAddress('');
      setOrganizer('');
      setCoOrganizer('');
      setIsRecurring(false); // Reset recurrence
      setRecurrenceType('daily');
      setRecurrenceEndDate('');
      setMonthlyRecurrenceDayOfWeek('monday');
      setMonthlyRecurrenceOrdinal('first');

      setTimeout(() => {
        router.push('/dashboard/addevents'); // Navigate to manage events page
      }, 2000);
    },
    onError: (err) => {
      const errorMessage = err.response?.data?.message || 'Failed to create event. Please try again.';
      setLocalError(errorMessage);
      setSuccessMessage('');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccessMessage('');

    // Client-side validation
    if (!eventTitle.trim() || !category.trim() || !description.trim() || !date.trim()) {
      setLocalError('Please fill in all required fields (Title, Category, Description, Date).');
      return;
    }

    // Additional validation for recurring events
    if (isRecurring) {
      if (!recurrenceEndDate.trim()) {
        setLocalError('Please set an end date for recurring events.');
        return;
      }
      if (new Date(recurrenceEndDate) < new Date(date)) {
        setLocalError('Recurrence end date cannot be before the event start date.');
        return;
      }
      if (recurrenceType === 'monthly_day' && (!monthlyRecurrenceDayOfWeek || !monthlyRecurrenceOrdinal)) {
        setLocalError('Please select both day of week and ordinal for monthly recurrence by day.');
        return;
      }
    }

    const eventData = {
      eventTitle,
      category,
      description,
      location,
      duration,
      time,
      date, // This is the START date for the event or recurrence series
      address,
      organizer,
      coOrganizer,
      isRecurring,
      recurrenceType: isRecurring ? recurrenceType : null,
      recurrenceEndDate: isRecurring ? recurrenceEndDate : null,
      recurrenceDetails: (isRecurring && recurrenceType === 'monthly_day') ? {
        dayOfWeek: monthlyRecurrenceDayOfWeek,
        ordinal: monthlyRecurrenceOrdinal,
      } : null,
    };

    createEventMutation.mutate(eventData);
  };

  // Render loading state for authentication check
  if (authLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
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
  if (!isAuthenticated && !isAdmin && isEmployee) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Access Denied. You must be logged in as an Administrator to create events.
          <div className="mt-4">
            <Link href="/login" className="text-blue-600 hover:underline">
              Go to Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 font-inter min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Create New Event
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {localError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{localError}</span>
            </div>
          )}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative" role="alert">
              <span className="block sm:inline">{successMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="eventTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventTitle"
              value={eventTitle}
              onChange={(e) => setEventTitle(e.target.value)}
              placeholder="e.g., Annual Youth Conference"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              required
            >
              <option value="">Choose Category</option>
              <option value="Shipment">Shipment</option>
              <option value="Cargo">Cargo</option>
              <option value="International Travel">International Travel</option>
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a detailed description of the event..."
              rows="6"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-y"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location Name (e.g., Church Auditorium)
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Main Auditorium"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Full Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Church St, City, State, Country"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duration (e.g., 2 hours, 3 days)
            </label>
            <input
              type="text"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g., 2 hours, 3 days"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                Organizer
              </label>
              <input
                type="text"
                id="organizer"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                placeholder="e.g., Pastor John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label htmlFor="coOrganizer" className="block text-sm font-medium text-gray-700 mb-1">
                Co-Organizer (Optional)
              </label>
              <input
                type="text"
                id="coOrganizer"
                value={coOrganizer}
                onChange={(e) => setCoOrganizer(e.target.value)}
                placeholder="e.g., Sister Jane Smith"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* --- Recurrence Section --- */}
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="isRecurring" className="ml-2 block text-sm font-medium text-gray-900">
                This is a recurring event
              </label>
            </div>

            {isRecurring && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence Type <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="daily"
                        name="recurrenceType"
                        type="radio"
                        value="daily"
                        checked={recurrenceType === 'daily'}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="daily" className="ml-3 block text-sm font-medium text-gray-700">
                        Daily
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="weekly"
                        name="recurrenceType"
                        type="radio"
                        value="weekly"
                        checked={recurrenceType === 'weekly'}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="weekly" className="ml-3 block text-sm font-medium text-gray-700">
                        Weekly
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="monthly_date"
                        name="recurrenceType"
                        type="radio"
                        value="monthly_date"
                        checked={recurrenceType === 'monthly_date'}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="monthly_date" className="ml-3 block text-sm font-medium text-gray-700">
                        Monthly (by date, e.g., 15th of every month)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="monthly_day"
                        name="recurrenceType"
                        type="radio"
                        value="monthly_day"
                        checked={recurrenceType === 'monthly_day'}
                        onChange={(e) => setRecurrenceType(e.target.value)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                      />
                      <label htmlFor="monthly_day" className="ml-3 block text-sm font-medium text-gray-700">
                        Monthly (by day of week, e.g., First Monday, Last Friday)
                      </label>
                    </div>
                  </div>
                </div>

                {recurrenceType === 'monthly_day' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="monthlyRecurrenceOrdinal" className="block text-sm font-medium text-gray-700 mb-1">
                        Ordinal <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="monthlyRecurrenceOrdinal"
                        value={monthlyRecurrenceOrdinal}
                        onChange={(e) => setMonthlyRecurrenceOrdinal(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="first">First</option>
                        <option value="second">Second</option>
                        <option value="third">Third</option>
                        <option value="fourth">Fourth</option>
                        <option value="last">Last</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="monthlyRecurrenceDayOfWeek" className="block text-sm font-medium text-gray-700 mb-1">
                        Day of Week <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="monthlyRecurrenceDayOfWeek"
                        value={monthlyRecurrenceDayOfWeek}
                        onChange={(e) => setMonthlyRecurrenceDayOfWeek(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                      >
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="recurrenceEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Recurrence End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="recurrenceEndDate"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    min={date} // Ensure end date is not before start date
                    required
                  />
                </div>
              </>
            )}
          </div>
          {/* --- End Recurrence Section --- */}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={createEventMutation.isPending}
          >
            {createEventMutation.isPending ? (
              <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Create Event'
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

export default AddEventMain;
