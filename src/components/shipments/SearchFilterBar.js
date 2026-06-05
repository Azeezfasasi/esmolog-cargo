'use client';

import React, { useState } from 'react';

export default function SearchFilterBar({ onSearch, onFilter }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setStatusFilter(value);
    onFilter(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-white shadow rounded-md mb-4">
      <input
        type="text"
        placeholder="Search by tracking ID, sender, recipient..."
        className="p-2 border border-gray-300 rounded-md w-full sm:w-1/2"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="p-2 border border-gray-300 rounded-md w-full sm:w-1/4"
        value={statusFilter}
        onChange={handleFilterChange}
      >
        <option value="">Filter by Status</option>
        <option value="pending">Pending</option>
        <option value="in-transit">In Transit</option>
        <option value="delivered">Delivered</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        onClick={handleSearch}
      >
        Search
      </button>
    </div>
  );
}
