'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/Api';

function ViewEvents() {
  // Function to fetch all upcoming events from the backend
  const fetchEvents = async () => {
    // This calls the backend endpoint that now only returns 'upcoming' events
    const response = await axios.get(`${API_BASE_URL}/events`);
    return response.data;
  };

  // Use useQuery to manage fetching state
  const {
    data: events, // Rename data to events for clarity
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['upcomingEvents'], // Unique key for this query
    queryFn: fetchEvents, // The function that fetches the data
    staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
  });

  // Helper function to format date for display (day and month)
  const formatEventDate = (dateString) => {
    if (!dateString) return { day: 'N/A', month: 'N/A' };
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return { day: 'Invalid', month: 'Date' };
      }
      const day = date.getDate();
      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      return { day, month };
    } catch (e) {
      console.error("Error parsing date:", dateString, e);
      return { day: 'Error', month: 'Date' };
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-gray-700 flex items-center">
          <svg className="animate-spin h-6 w-6 text-orange-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading events...
        </div>
      </section>
    );
  }

  // Render error state
  if (isError) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 font-inter min-h-screen flex items-center justify-center">
        <div className="text-center text-lg text-red-600">
          Error loading events: {error.message}
        </div>
      </section>
    );
  }

  return (
    <section className="py-0 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Top Section: Main Headline */}
        <h2 className="text-[18px] sm:text-[24px] lg:text-[35px] font-extrabold text-gray-900 mb-9">
          JOIN US AND BECOME PART OF SOMETHING GREAT
        </h2>

        {/* Events Grid */}
        {events && events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {events.map((event, index) => {
              const { day, month } = formatEventDate(event.date);
              return (
                <Link 
                  key={event._id}
                  href={`/events/${event._id}`}
                  className="relative bg-orange-50 p-6 rounded-lg shadow-md flex flex-col text-left group overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                >
                  {/* Date Badge */}
                  <div className="absolute top-0 right-0 bg-gray-900 text-white text-center p-3 rounded-bl-lg">
                    <span className="block text-xl font-bold leading-none">{day}</span>
                    <span className="block text-sm uppercase leading-none">{month}</span>
                  </div>

                  {/* Event Content */}
                  {/* Using event.status for type, capitalizing it */}
                  <p className="text-sm uppercase tracking-widest text-gray-600 mb-2 mt-8">
                    {event.status ? event.status.toUpperCase() + ' EVENT' : 'EVENT'}
                  </p>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 leading-tight">
                    {event.eventTitle} {/* Use eventTitle from backend */}
                  </h3>
                  <p className="text-gray-700 leading-relaxed mb-6 flex-grow">
                    {event.description}
                  </p>

                  {/* Event Time */}
                  <div className="flex items-start mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-800 whitespace-pre-line">{event.time || 'N/A'}</p>
                  </div>

                  {/* Event Location */}
                  <div className="flex items-start mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 mr-3 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 016.727 6.727a8 8 0 0110.93 10.93z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                    <p className="text-gray-800 whitespace-pre-line">{event.location || 'N/A'}</p>
                  </div>

                  {/* Bottom Accent Bar - Apply to first card or based on a new schema field */}
                  {index === 0 && ( // Apply accent only to the first card
                    <div className="w-2/3 h-2 bg-orange-300 rounded-full mt-auto self-start"></div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-600">No upcoming events found.</p>
        )}
      </div>
    </section>
  );
}

export default ViewEvents;
