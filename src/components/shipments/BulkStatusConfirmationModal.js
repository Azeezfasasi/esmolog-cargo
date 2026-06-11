'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export default function BulkStatusConfirmationModal({ isOpen, shipmentCount, newStatus, onConfirm, onCancel, isLoading }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">Confirm Bulk Status Update</h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            You are about to update the status of <span className="font-semibold text-green-600">{shipmentCount}</span> shipment{shipmentCount !== 1 ? '(s)' : ''} to
          </p>
          <p className="text-lg font-semibold text-green-700 capitalize bg-green-50 p-3 rounded-md">
            {newStatus}
          </p>
          <p className="text-sm text-gray-600 mt-3">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            onClick={onCancel}
            disabled={isLoading}
            variant="outline"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </div>
    </div>
  );
}
