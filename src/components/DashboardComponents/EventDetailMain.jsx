'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';

function EventDetailMain() {
  const { id } = useParams();

  const fetchEventById = async (eventId) => {
    const response = await axios.get(`${API_BASE_URL}/events/${eventId}`);
    return response.data;
  };

  const {
    data: event,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => fetchEventById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

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

  const getRecurrenceDescription = (event) => {
    if (!event.isRecurring) return 'No recurrence';
    
    let description = `Repeats ${event.recurrenceType}`;
    
    if (event.recurrenceType === 'monthly_day' && event.recurrenceDetails) {
      const { dayOfWeek, ordinal } = event.recurrenceDetails;
      if (dayOfWeek && ordinal) {
        description += ` on the ${ordinal} ${dayOfWeek}`;
      }
    }
    
    if (event.recurrenceEndDate) {
      description += ` until ${formatDate(event.recurrenceEndDate)}`;
    }
    
    return description;
  };

  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading event details...
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading event: {error.message}
          <div className="mt-4">
            <Link href="/events" className="text-blue-600 hover:underline">Back to Events</Link>
          </div>
        </div>
      </section>
    );
  }

  if (!event) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700">
          Event not found.
          <div className="mt-4">
            <Link href="/events" className="text-blue-600 hover:underline">Back to Events</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/events" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Events
          </Link>
        </div>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-extrabold text-gray-900">
              {event.eventTitle}
            </h1>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${
              event.status === 'upcoming' ? 'bg-green-100 text-green-800' :
              event.status === 'completed' ? 'bg-gray-100 text-gray-800' :
              'bg-red-100 text-red-800'
            }`}>
              {event.status}
            </span>
          </div>
          <p className="text-sm uppercase tracking-widest text-orange-500 mb-2">
            {event.category}
          </p>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Date</h3>
            <p className="text-lg text-gray-900">{formatDate(event.date)}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Time</h3>
            <p className="text-lg text-gray-900">{event.time || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Duration</h3>
            <p className="text-lg text-gray-900">{event.duration || 'Not specified'}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Recurrence</h3>
            <p className="text-lg text-gray-900">{getRecurrenceDescription(event)}</p>
          </div>
        </div>

        {/* Location Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Location</h2>
          <div className="space-y-3">
            {event.location && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727l-1.414-1.414m2.121-2.121a4 4 0 00-5.656-5.656l-2.121 2.121m0 0l-1.414 1.414a4 4 0 005.656 5.656l2.121-2.121m-2.121-2.121a4 4 0 00-5.656 5.656" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Location</p>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              </div>
            )}
            {event.address && (
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21l-7-5m0 0l-7 5m7-5v-6a1 1 0 00-1-1H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-9a2 2 0 00-2-2h-1a1 1 0 00-1 1v6m-9-13l2.5 2.5m0 0L12 3m-2.5 2.5L7 3" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Address</p>
                  <p className="text-gray-900">{event.address}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">About This Event</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">{event.description}</p>
        </div>

        {/* Organizers */}
        {(event.organizer || event.coOrganizer) && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizers</h2>
            <div className="space-y-2">
              {event.organizer && (
                <p className="text-gray-900">
                  <span className="font-semibold">Primary Organizer:</span> {event.organizer}
                </p>
              )}
              {event.coOrganizer && (
                <p className="text-gray-900">
                  <span className="font-semibold">Co-Organizer:</span> {event.coOrganizer}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default EventDetailMain;
