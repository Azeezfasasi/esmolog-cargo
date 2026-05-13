'use client';

import AdminWelcome from '@/components/DashboardComponents/AdminWelcome'
import AppointmentStatusChart from '@/components/DashboardComponents/AppointmentChart'
import DashboardStats from '@/components/DashboardComponents/DashboardStats'
import QuoteChart from '@/components/DashboardComponents/QuoteChart'
import ShipmentChart from '@/components/DashboardComponents/ShipmentChart'
import UserRolesChart from '@/components/DashboardComponents/UserChart'
import UserDashboardStats from '@/components/DashboardComponents/UserDashboardStats'
import React from 'react'
import { useProfile } from '@/components/context-api/ProfileContext'

export default function page() {
  const { isAdmin, isEmployee, isClient } = useProfile();

  return (
    <>
      {(isAdmin || isEmployee) && <AdminWelcome />}
      <DashboardStats />
      <UserRolesChart />
      <ShipmentChart />
      <QuoteChart />
      <AppointmentStatusChart />
      {isClient && <UserDashboardStats />}
    </>
  )
}
