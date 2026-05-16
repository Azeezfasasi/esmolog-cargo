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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📧 Email Logs</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            📥 Export as CSV
          </button>
          <button
            onClick={handleClearOldLogs}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            🗑️ Clear Old Logs
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-green-600 text-sm font-semibold">SUCCESSFUL</p>
            <p className="text-3xl font-bold text-green-700">{stats.totalSent}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-red-600 text-sm font-semibold">FAILED</p>
            <p className="text-3xl font-bold text-red-700">{stats.totalFailed}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-600 text-sm font-semibold">SUCCESS RATE</p>
            <p className="text-3xl font-bold text-blue-700">
              {stats.totalSent + stats.totalFailed > 0
                ? (
                    (stats.totalSent / (stats.totalSent + stats.totalFailed)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-purple-600 text-sm font-semibold">TOTAL</p>
            <p className="text-3xl font-bold text-purple-700">
              {stats.totalSent + stats.totalFailed}
            </p>
          </div>
        </div>
      )}

      {/* Email Type Breakdown */}
      {stats?.byType && (
        <div className="bg-white p-4 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Email Types</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.byType).map(([type, data]) => (
              <div
                key={type}
                className="p-3 bg-gray-50 rounded border border-gray-200"
              >
                <p className="font-semibold text-gray-700 capitalize">{type}</p>
                <p className="text-sm text-gray-600">
                  ✅ Sent: {data.sent} | ❌ Failed: {data.failed}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="recent">Recent (24h)</option>
          <option value="failed">Failed Emails</option>
          <option value="all">All Emails</option>
        </select>

        <select
          value={emailType}
          onChange={(e) => setEmailType(e.target.value)}
          className="px-3 py-2 border rounded-lg"
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
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Time</th>
              <th className="px-4 py-3 text-left font-semibold">Recipient</th>
              <th className="px-4 py-3 text-left font-semibold">Subject</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
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
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-600">
                    {formatDistanceToNow(new Date(log.timestamp), {
                      addSuffix: true
                    })}
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">
                    {log.to}
                  </td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold capitalize">
                      {log.emailType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.success ? (
                      <span className="text-green-600 font-bold">✅ SUCCESS</span>
                    ) : (
                      <span className="text-red-600 font-bold">❌ FAILED</span>
                    )}
                    {log.error && (
                      <div className="text-xs text-red-500 mt-1">
                        {log.error.substring(0, 30)}...
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">
        Last updated: {new Date().toLocaleTimeString()}
      </p>
    </div>
  );
};

export default EmailLogsViewer;
