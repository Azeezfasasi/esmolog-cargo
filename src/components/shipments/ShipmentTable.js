
'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Mail, Eye, Trash2, RefreshCcw, QrCode, Check } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ShipmentTable({ shipments, onActionClick, selectedShipments = [], onSelectShipment, onSelectAll }) {
  const [currentPage, setCurrentPage] = useState(1);

  // filter out shipments with delivered status (case-insensitive)
  const visibleShipments = Array.isArray(shipments)
    ? shipments.filter((s) => String(s?.status ?? '').trim().toLowerCase() !== 'delivered')
    : [];


  const totalPages = Math.ceil(visibleShipments.length / ITEMS_PER_PAGE) || 1;
  const paginated = visibleShipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isAllSelectedOnPage = paginated.length > 0 && paginated.every(s => selectedShipments.includes(s._id));

  const handlePageSelectAll = () => {
    if (isAllSelectedOnPage) {
      // Deselect all on current page
      const pageIds = paginated.map(s => s._id);
      pageIds.forEach(id => onSelectShipment(id, false));
    } else {
      // Select all on current page
      paginated.forEach(s => onSelectShipment(s._id, true));
    }
  };

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      {/* Header glow */}
      <div className="h-1 w-full bg-gradient-to-r from-green-600 via-green-400 to-green-800" />
      
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-[900px] w-full text-sm text-left">
        <thead className="bg-green-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
          <tr>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">
              <input
                type="checkbox"
                checked={isAllSelectedOnPage}
                onChange={handlePageSelectAll}
                className="w-4 h-4 cursor-pointer"
              />
            </th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">#</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Tracking No</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Sender</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Receiver</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Status</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Destination</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Shipment Facility</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Date</th>
            <th className="p-2 sm:p-3 text-xs sm:text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((shipment, idx) => {
            const isSelected = selectedShipments.includes(shipment._id);
            return (
            <tr key={shipment._id} className={`border-t hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-green-50' : ''}`}>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectShipment(shipment._id, e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
              <td className="p-2 sm:p-3 font-medium text-xs sm:text-sm">{shipment.trackingNumber}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.senderName}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.recipientName}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">
                <span
                  className={`font-medium capitalize w-fit px-2 py-1 rounded-md
                    ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                    shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'pickup-scheduled' ? 'bg-amber-100 text-amber-800' :
                    shipment.status === 'out-for-delivery' ? 'bg-pink-100 text-pink-800' :
                    shipment.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                    shipment.status === 'arrived-at-hub' ? 'bg-violet-100 text-violet-800' :
                    shipment.status === 'departed-from-hub' ? 'bg-indigo-100 text-indigo-800' :
                    shipment.status === 'on-hold' ? 'bg-rose-100 text-rose-800' :
                    shipment.status === 'customs-clearance' ? 'bg-cyan-100 text-cyan-800' :
                    shipment.status === 'Awaiting Pickup' ? 'bg-fuchsia-100 text-fuchsia-800' :
                    shipment.status === 'failed-delivery-attempt' ? 'bg-rose-100 text-rose-800' :
                    shipment.status === 'Awaiting Delivery' ? 'bg-lime-100 text-lime-800' :
                    shipment.status === 'Arrived Carrier Connecting facility' ? 'bg-teal-100 text-teal-800' :
                    shipment.status === 'Departed ESMOLOG Cargo facility (Nig)' ? 'bg-orange-100 text-orange-800' :
                    shipment.status === 'Arrived nearest airport' ? 'bg-sky-100 text-sky-800' :
                    shipment.status === 'Shipment is Delayed' ? 'bg-red-200 text-red-900' :
                    shipment.status === 'Delivery date not available' ? 'bg-gray-200 text-gray-800' :
                    shipment.status === 'Available for pick up,check phone for instructions' ? 'bg-emerald-100 text-emerald-800' :
                    shipment.status === 'Processed in Lagos Nigeria' ? 'bg-amber-200 text-amber-900' :
                    shipment.status === 'Pending Carrier lift' ? 'bg-indigo-200 text-indigo-900' :
                    shipment.status === 'Scheduled to depart on the next movement' ? 'bg-pink-200 text-pink-900' :
                    shipment.status === 'Received from flight' ? 'bg-cyan-200 text-cyan-900' :
                    shipment.status === 'Package is received and accepted by airline' ? 'bg-green-200 text-green-900' :
                    shipment.status === 'Customs clearance completed' ? 'bg-emerald-200 text-emerald-900' :
                    shipment.status === 'Delivery is booked' ? 'bg-indigo-100 text-indigo-800' :
                    shipment.status === 'Arrived at an international sorting facility and will be ready for delivery soon' ? 'bg-purple-200 text-purple-900' :
                    shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'}`
                  }
                >
                  {shipment.status}
                </span>

              </td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.destination}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{shipment.shipmentFacility}</td>
              <td className="p-2 sm:p-3 text-xs sm:text-sm">{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td className="p-2 sm:p-3">
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'qr')} className='cursor-pointer hover:bg-indigo-100'>
                  <QrCode size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'print')} className='cursor-pointer hover:bg-green-100'>
                  <Eye size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'edit')} className='cursor-pointer hover:bg-blue-100'>
                  <Pencil size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'reply')} className='cursor-pointer hover:bg-green-100'>
                  <Mail size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'status')} className='cursor-pointer hover:bg-yellow-100'>
                  <RefreshCcw size={16} />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onActionClick(shipment, 'delete')} className='cursor-pointer hover:bg-red-100'>
                  <Trash2 size={16} className="text-red-500" />
                </Button>
              </td>
            </tr>
            );
          })}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={10} className="p-4 text-center text-gray-500 text-sm">
                No shipments found.
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
            No shipments found.
          </div>
        ) : (
          paginated.map((shipment, idx) => {
            const isSelected = selectedShipments.includes(shipment._id);
            return (
            <div key={shipment._id} className={`border rounded-lg p-3 sm:p-4 space-y-3 hover:shadow-md transition-shadow ${isSelected ? 'bg-blue-50 border-blue-300' : ''}`}>
              {/* Header with tracking number and checkbox */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectShipment(shipment._id, e.target.checked)}
                    className="w-4 h-4 cursor-pointer mt-1"
                  />
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">#{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</p>
                    <p className="font-bold text-sm text-green-600">{shipment.trackingNumber}</p>
                  </div>
                </div>
                <span
                  className={`font-medium capitalize text-xs px-2 py-1 rounded-md flex-shrink-0
                    ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                    shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    shipment.status === 'pickup-scheduled' ? 'bg-amber-100 text-amber-800' :
                    shipment.status === 'out-for-delivery' ? 'bg-pink-100 text-pink-800' :
                    'bg-gray-100 text-gray-800'}`
                  }
                >
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
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'qr')} className='text-xs h-8'>
                  <QrCode size={14} className="mr-1" />QR
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'print')} className='text-xs h-8'>
                  <Eye size={14} className="mr-1" />View
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'edit')} className='text-xs h-8'>
                  <Pencil size={14} className="mr-1" />Edit
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'status')} className='text-xs h-8'>
                  <RefreshCcw size={14} className="mr-1" />Status
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'reply')} className='cursor-pointer hover:bg-green-100'>
                  <Mail size={16} /> Reply
                </Button>
                <Button size="sm" variant="outline" onClick={() => onActionClick(shipment, 'delete')} className='cursor-pointer hover:bg-red-100'>
                  <Trash2 size={16} className="text-red-500" /> Delete
                </Button>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-t">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </div>
        <div className="space-x-2">
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

