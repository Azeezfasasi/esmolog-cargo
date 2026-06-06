"use client";

import React, { useState } from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';

export default function SMSStatistics() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['smsStatistics', dateRange],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/sms/statistics`, {
        params: {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    },
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className={`bg-white rounded-lg shadow p-3 sm:p-6 border-l-4 ${color}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-xl sm:text-3xl font-bold mt-1 break-words">{value}</p>
        </div>
        {Icon && <Icon className={`w-5 h-5 sm:w-8 sm:h-8 flex-shrink-0 ${color.replace('border-', 'text-')}`} />}
      </div>
    </div>
  );

  if (isLoading) return <div className="text-center py-8 text-xs sm:text-base">Loading statistics...</div>;
  if (error) return <div className="text-red-600 py-8 text-xs sm:text-base">Error loading statistics</div>;

  const summary = stats?.summary || {};

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-base sm:text-lg font-semibold mb-4">SMS Statistics</h3>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">From</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">To</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        <StatCard
          title="Total SMS"
          value={summary.total || 0}
          icon={AlertCircle}
          color="border-blue-500"
        />
        <StatCard
          title="Sent"
          value={summary.sent || 0}
          icon={CheckCircle}
          color="border-green-500"
        />
        <StatCard
          title="Pending"
          value={summary.pending || 0}
          icon={Clock}
          color="border-yellow-500"
        />
        <StatCard
          title="Failed"
          value={summary.failed || 0}
          icon={XCircle}
          color="border-red-500"
        />
        <StatCard
          title="Success Rate"
          value={summary.successRate || '0%'}
          icon={CheckCircle}
          color="border-green-600"
        />
      </div>

      {stats?.byEventType && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h4 className="font-semibold mb-4 text-sm sm:text-base">SMS by Event Type</h4>
          <div className="space-y-2">
            {stats.byEventType.map((item) => (
              <div key={item._id} className="flex justify-between items-center pb-2 border-b text-xs sm:text-sm">
                <span className="text-gray-700">{item._id}</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
