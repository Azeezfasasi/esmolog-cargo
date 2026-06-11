'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function BulkStatusToolbar({ selectedCount, statuses, onStatusSelect, onUpdateClick, onClear }) {
  const [selectedStatus, setSelectedStatus] = useState('');

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    onStatusSelect(e.target.value);
  };

  const handleUpdate = () => {
    if (!selectedStatus) {
      alert('Please select a status to apply');
      return;
    }
    onUpdateClick(selectedStatus);
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 rounded-lg mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold text-sm">
          {selectedCount}
        </div>
        <span className="text-sm sm:text-base font-medium text-gray-800">
          {selectedCount} shipment{selectedCount !== 1 ? '(s)' : ''} selected
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
        <select
          value={selectedStatus}
          onChange={handleStatusChange}
          className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select status to apply...</option>
          {statuses && statuses.map((status) => (
            <option key={status._id || status} value={status.name || status}>
              {status.name || status}
            </option>
          ))}
        </select>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={handleUpdate}
            disabled={!selectedStatus}
            className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-medium"
          >
            Update Status
          </Button>
          <Button
            onClick={onClear}
            variant="outline"
            className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
          >
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
