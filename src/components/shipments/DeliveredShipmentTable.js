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
    <div className="rounded-lg sm:rounded-xl border bg-white shadow-md overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
          <tr>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">#</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Tracking No</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Sender</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Receiver</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Status</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Destination</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Facility</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Date</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((shipment, idx) => (
            <tr key={shipment._id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
              <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{shipment.trackingNumber}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.senderName}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.recipientName}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                <span className="font-medium capitalize w-fit px-2 py-1 rounded-md bg-green-100 text-green-800">
                  {shipment.status}
                </span>
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.destination}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.shipmentFacility || 'N/A'}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td className="p-2 sm:p-3 flex flex-wrap gap-1">
                <Button size="sm" variant="ghost" onClick={() => onActionClick(shipment, 'edit')} className='cursor-pointer hover:bg-blue-100 h-8 w-8 p-0'>
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onActionClick(shipment, 'reply')} className='cursor-pointer hover:bg-green-100 h-8 w-8 p-0'>
                  <Mail size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onActionClick(shipment, 'status')} className='cursor-pointer hover:bg-yellow-100 h-8 w-8 p-0'>
                  <RefreshCcw size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onActionClick(shipment, 'print')} className='cursor-pointer hover:bg-green-100 h-8 w-8 p-0'>
                  <Eye size={14} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onActionClick(shipment, 'delete')} className='cursor-pointer hover:bg-red-100 h-8 w-8 p-0'>
                  <Trash2 size={14} className="text-red-500" />
                </Button>
              </td>
            </tr>
          ))}

          {paginated.length === 0 && (
            <tr>
              <td colSpan={9} className="p-4 text-center text-gray-500 text-sm">
                No delivered shipments.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3 p-3 sm:p-4">
        {paginated.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No delivered shipments.
          </div>
        ) : (
          paginated.map((shipment, idx) => (
            <div key={shipment._id} className="border rounded-lg p-3 sm:p-4 space-y-3 hover:shadow-md transition-shadow">
              {/* Header with tracking number */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</p>
                  <p className="font-bold text-sm text-green-600">{shipment.trackingNumber}</p>
                </div>
                <span className="font-medium capitalize text-xs px-2 py-1 rounded-md flex-shrink-0 bg-green-100 text-green-800">
                  {shipment.status}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-gray-500 font-semibold">Sender</p>
                  <p className="text-gray-800">{shipment.senderName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Receiver</p>
                  <p className="text-gray-800">{shipment.recipientName}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Destination</p>
                  <p className="text-gray-800">{shipment.destination}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-semibold">Date</p>
                  <p className="text-gray-800">{new Date(shipment.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-wrap pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'edit')} className='text-xs h-8'>
                  <Pencil size={14} className="mr-1" />Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'print')} className='text-xs h-8'>
                  <Eye size={14} className="mr-1" />View
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'status')} className='text-xs h-8'>
                  <RefreshCcw size={14} className="mr-1" />Status
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 border-t">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="text-xs sm:text-sm"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="text-xs sm:text-sm"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
