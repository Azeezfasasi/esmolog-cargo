'use client';

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation';
import { useProfile } from '@/components/context-api/ProfileContext';
import DashHeader from '@/components/DashboardComponents/DashHeader'
import DashMenu from '@/components/DashboardComponents/DashMenu'
import DashboardMenu from '@/components/DashboardComponents/DashboardMenu';
import DashboardHeader from '@/components/DashboardComponents/DashboardHeader';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useProfile();

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  function toggleSidebar() {
    setCollapsed(c => !c)
  }

  function toggleMobileMenu() {
    setMobileOpen(v => !v)
  }
  // Add a body-level class while the dashboard is mounted so we can hide
  // the site header that is rendered by the root layout.
  useEffect(() => {
    document.body.classList.add("hide-site-header")
    return () => document.body.classList.remove("hide-site-header")
  }, [])

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 font-semibold">Verifying your authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render dashboard
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 overflow-x-hidden">
        <DashboardHeader onToggleSidebar={toggleSidebar} onToggleMobileMenu={toggleMobileMenu} />
        <div className="flex">
          <DashboardMenu collapsed={collapsed} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
    </>
  )
}
