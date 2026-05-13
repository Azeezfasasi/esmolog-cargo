'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Mail, Eye, Trash2, RefreshCcw } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function DeliveredShipmentTable({ shipments = [], onActionClick = () => {} }) {
  const [currentPage, setCurrentPage] = useState(1);

  // make filter defensive: ensure shipments is an array and match delivered robustly
  const safeShipments = Array.isArray(shipments) ? shipments : [];
  const delivered = safeShipments.filter(s =>
    String(s?.status ?? '').trim().toLowerCase() === 'delivered'
  );

  const totalPages = Math.ceil(delivered.length / ITEMS_PER_PAGE) || 1;
  const paginated = delivered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-xl border bg-white shadow-md overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3">Tracking No</th>
            <th className="p-3">Sender</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Status</th>
            <th className="p-3">Destination</th>
            <th className="p-3">Facility</th>
            <th className="p-3">Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((shipment, idx) => (
            <tr key={shipment._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-3">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
              <td className="p-3 font-medium">{shipment.trackingNumber}</td>
              <td className="p-3">{shipment.senderName}</td>
              <td className="p-3">{shipment.recipientName}</td>
              <td className="p-3">
                <span className="font-medium capitalize w-fit px-2 py-1 rounded-md bg-green-100 text-green-800">
                  {shipment.status}
                </span>
              </td>
              <td className="p-3">{shipment.destination}</td>
              <td className="p-3">{shipment.shipmentFacility || 'N/A'}</td>
              <td className="p-3">{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td className="p-3 space-x-1">
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'edit')}>
                  <Pencil size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'reply')}>
                  <Mail size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'status')}>
                  <RefreshCcw size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'print')}>
                  <Eye size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'delete')}>
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </td>
            </tr>
          ))}

          {paginated.length === 0 && (
            <tr>
              <td colSpan={8} className="p-3 text-center text-gray-500">
                No delivered shipments.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
