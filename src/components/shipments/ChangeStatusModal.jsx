'use client';

import React, { useState, useEffect } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function ChangeStatusModal({ shipment, onClose, onStatusChange, statuses = [] }) {
  const [status, setStatus] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shipment) {
      setStatus(shipment.status || '');
      setLocation('');
      setError('');
    }
  }, [shipment]);

  const handleChangeStatus = async () => {
    if (!status) return;
    setLoading(true);
    setError('');
    
    try {
      await onStatusChange({ 
        shipmentId: shipment._id, 
        newStatus: status,
        location: location.trim() || undefined
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update status. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-orange-600">Change Shipment Status</h2>
      <p className="text-sm text-gray-600">
        Update the status and location for the selected shipment:
      </p>
      
      {/* Status Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">New Status</label>
        <Select value={status} onValueChange={setStatus} disabled={loading}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <div className='bg-blue-50'>
              {statuses.map((status) => {
                const statusName = status.name || status;
                return (
                  <SelectItem key={statusName} value={statusName}>
                    <div className='capitalize'>{statusName}</div>
                  </SelectItem>
                );
              })}
            </div>
          </SelectContent>
        </Select>
      </div>

      {/* Location Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Location (Optional)</label>
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Indianapolis - Indiana - USA"
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <p className="text-xs text-gray-500">
          Enter the current location or hub where the shipment is at.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleChangeStatus} 
          disabled={!status || loading}
          className="bg-green-600 text-white hover:bg-orange-500"
        >
          {loading ? 'Updating...' : 'Update Status & Location'}
        </Button>
      </div>
    </div>
  );
}
