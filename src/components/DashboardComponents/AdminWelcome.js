'use client';

import React from 'react';
import { useProfile } from '@/components/context-api/ProfileContext';

function AdminWelcome() {
  const { currentUser } = useProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <section className="pt-5 px-5 md:px-6 md:pt-3 mt-4 bg-gray-50 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-0">
          <h1 className="text-3xl font-bold text-gray-800">
            {getGreeting()}, <span className='text-green-600'>{currentUser?.name}</span> 👋
          </h1>
          <p className="text-gray-600 mt-1">Welcome to your dashboard</p>
          {currentUser?.role && (
            <p className="mt-1 text-sm text-green-700 font-bold">
              Role: <span className="font-semibold capitalize text-gray-800">{currentUser?.role}</span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminWelcome;
