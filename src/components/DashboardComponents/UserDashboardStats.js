'use client';

import React from 'react';
import { useProfile } from '@/components/context-api/ProfileContext';
import Link from 'next/link';

function UserDashboardStats() {
  const { user } = useProfile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <section className="p-6 md:p-10 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            {getGreeting()}, {user?.name} 👋
          </h1>
          <p className="text-gray-600 mt-1">Welcome to your dashboard</p>
          {user?.role && (
            <p className="mt-1 text-sm text-gray-500">
              Role: <span className="font-semibold capitalize">{user?.role}</span>
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/dashboard/trackshipment"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-xl shadow text-center"
          >
            📦 Track a Shipment
          </Link>
          <Link href="/dashboard/myshipments"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl shadow text-center"
          >
            🚚 View My Shipments
          </Link>
          <Link href="/dashboard/profile"
            className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-4 rounded-xl shadow text-center"
          >
            👤 Manage Profile
          </Link>
        </div>
      </div>
    </section>
  );
}

export default UserDashboardStats;
