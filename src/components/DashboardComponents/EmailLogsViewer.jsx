// Email Logs Dashboard Component Example
// Location: src/components/DashboardComponents/EmailLogsViewer.jsx

'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

const EmailLogsViewer = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('recent');
  const [emailType, setEmailType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLogs();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, [filter, emailType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsRes = await fetch('/api/email-logs?filter=stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      // Fetch logs based on filters
      let url = '/api/email-logs';
      if (filter === 'stats') {
        url += '?filter=stats';
      } else if (filter === 'failed') {
        url += '?filter=failed';
      } else if (filter === 'recent') {
        url += '?filter=recent&hours=24';
      } else if (emailType !== 'all') {
        url += `?type=${emailType}`;
      }

      const logsRes = await fetch(url);
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setLogs(logsData.logs || []);
      }

      setError(null);
      setCurrentPage(1); // Reset to first page when fetching new logs
    } catch (err) {
      console.error('Error fetching email logs:', err);
      setError('Failed to fetch email logs');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/email-logs?limit=1000&format=csv');
      if (res.ok) {
        const csv = await res.text();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Error exporting logs:', err);
    }
  };

  const handleClearOldLogs = async () => {
    if (confirm('Clear email logs older than 30 days?')) {
      try {
        const res = await fetch('/api/email-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'clear-old', days: 30 })
        });
        if (res.ok) {
          const data = await res.json();
          alert(data.message);
          fetchLogs();
        }
      } catch (err) {
        console.error('Error clearing old logs:', err);
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold">📧 Email Logs</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 text-white rounded hover:bg-green-700 transition w-full sm:w-auto"
          >
            📥 Export as CSV
          </button>
          <button
            onClick={handleClearOldLogs}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-red-600 text-white rounded hover:bg-red-700 transition w-full sm:w-auto"
          >
            🗑️ Clear Old Logs
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-green-50 p-2 sm:p-4 rounded-lg border border-green-200">
            <p className="text-green-600 text-xs sm:text-sm font-semibold truncate">SUCCESSFUL</p>
            <p className="text-xl sm:text-3xl font-bold text-green-700 mt-1">{stats.totalSent}</p>
          </div>
          <div className="bg-red-50 p-2 sm:p-4 rounded-lg border border-red-200">
            <p className="text-red-600 text-xs sm:text-sm font-semibold truncate">FAILED</p>
            <p className="text-xl sm:text-3xl font-bold text-red-700 mt-1">{stats.totalFailed}</p>
          </div>
          <div className="bg-green-50 p-2 sm:p-4 rounded-lg border border-green-200">
            <p className="text-green-600 text-xs sm:text-sm font-semibold truncate">SUCCESS RATE</p>
            <p className="text-xl sm:text-3xl font-bold text-green-700 mt-1">
              {stats.totalSent + stats.totalFailed > 0
                ? (
                    (stats.totalSent / (stats.totalSent + stats.totalFailed)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="bg-purple-50 p-2 sm:p-4 rounded-lg border border-purple-200">
            <p className="text-purple-600 text-xs sm:text-sm font-semibold truncate">TOTAL</p>
            <p className="text-xl sm:text-3xl font-bold text-purple-700 mt-1">
              {stats.totalSent + stats.totalFailed}
            </p>
          </div>
        </div>
      )}

      {/* Email Type Breakdown */}
      {stats?.byType && (
        <div className="bg-white p-3 sm:p-4 rounded-lg border">
          <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Email Types</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {Object.entries(stats.byType).map(([type, data]) => (
              <div
                key={type}
                className="p-2 sm:p-3 bg-gray-50 rounded border border-gray-200"
              >
                <p className="font-semibold text-sm sm:text-base text-gray-700 capitalize">{type}</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  ✅ Sent: {data.sent} | ❌ Failed: {data.failed}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg flex-1 sm:flex-initial"
        >
          <option value="recent">Recent (24h)</option>
          <option value="failed">Failed Emails</option>
          <option value="all">All Emails</option>
        </select>

        <select
          value={emailType}
          onChange={(e) => setEmailType(e.target.value)}
          className="px-2 sm:px-3 py-2 text-sm sm:text-base border rounded-lg flex-1 sm:flex-initial"
        >
          <option value="all">All Types</option>
          <option value="contact-form">Contact Form</option>
          <option value="contact-reply">Contact Reply</option>
          <option value="shipment-status">Shipment Status</option>
          <option value="shipment-reply">Shipment Reply</option>
          <option value="newsletter">Newsletter</option>
        </select>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Logs Table - Desktop View */}
      <div className="hidden md:block bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Time</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Recipient</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Subject</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold">Type</th>
              <th className="px-3 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  Loading logs...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                  No logs found
                </td>
              </tr>
            ) : (() => {
              const totalPages = Math.ceil(logs.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedLogs = logs.slice(startIndex, endIndex);
              return paginatedLogs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-gray-600 text-xs sm:text-sm">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true
                    })}
                  </td>
                  <td className="px-3 sm:px-4 py-3 font-mono text-gray-700 text-xs sm:text-sm truncate">
                    {log.to}
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-gray-700 max-w-xs truncate text-xs sm:text-sm">
                    {log.subject}
                  </td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize">
                      {log.emailType}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-center">
                    {log.success ? (
                      <span className="text-green-600 font-bold text-xs sm:text-sm">✅ SUCCESS</span>
                    ) : (
                      <span className="text-red-600 font-bold text-xs sm:text-sm">❌ FAILED</span>
                    )}
                    {log.error && (
                      <div className="text-xs text-red-500 mt-1">
                        {log.error.substring(0, 20)}...
                      </div>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Logs Card View - Mobile */}
      <div className="md:hidden space-y-2">
        {loading ? (
          <div className="text-center py-8 text-gray-500">
            Loading logs...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No logs found
          </div>
        ) : (() => {
          const totalPages = Math.ceil(logs.length / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedLogs = logs.slice(startIndex, endIndex);
          return paginatedLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-lg border p-3 space-y-2">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Recipient</p>
                  <p className="font-mono text-sm text-gray-700 break-all">{log.to}</p>
                </div>
                <div>
                  {log.success ? (
                    <span className="text-green-600 font-bold text-xs">✅</span>
                  ) : (
                    <span className="text-red-600 font-bold text-xs">❌</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Subject</p>
                <p className="text-sm text-gray-700 line-clamp-2">{log.subject}</p>
              </div>
              <div className="flex gap-2 items-center justify-between">
                <div>
                  <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize">
                    {log.emailType}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true
                  })}
                </p>
              </div>
              {log.error && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                  Error: {log.error.substring(0, 40)}...
                </div>
              )}
            </div>
          ));
        })()}
      </div>

      {/* Pagination Controls */}
      {logs.length > 0 && (() => {
        const totalPages = Math.ceil(logs.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, logs.length);
        return (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-3 p-2 sm:p-4 bg-white rounded-lg border border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left w-full sm:w-auto">
              Showing {startIndex + 1} to {endIndex} of {logs.length} logs
            </p>
            <div className="flex items-center gap-1 overflow-x-auto pb-2 sm:pb-0 max-w-full">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                Prev
              </button>
              <div className="flex items-center gap-1 flex-shrink-0">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-1.5 sm:px-2 py-1 text-xs sm:text-sm rounded transition ${
                      currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                Next
              </button>
            </div>
          </div>
        );
      })()}

      <p className="text-xs text-gray-500 text-center pb-2">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default EmailLogsViewer;
