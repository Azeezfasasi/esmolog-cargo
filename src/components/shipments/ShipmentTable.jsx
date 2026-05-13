'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Download, Mail, Eye, Trash2, FileText, Printer, Truck, RefreshCcw, QrCode } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

export default function ShipmentTable({ shipments, onActionClick }) {
  const [currentPage, setCurrentPage] = useState(1);

  // filter out shipments with delivered status (case-insensitive)
  const visibleShipments = shipments.filter(s => String(s.status).toLowerCase() !== 'delivered');

  const totalPages = Math.ceil(visibleShipments.length / ITEMS_PER_PAGE) || 1;
  const paginated = visibleShipments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="rounded-xl border bg-white shadow-md overflow-x-auto">
      {/* dark:bg-gray-200 */}
      <table className="w-full text-sm text-left">
        <thead className="bg-blue-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase">
          <tr>
            <th className="p-3">#</th>
            <th className="p-3">Tracking No</th>
            <th className="p-3">Sender</th>
            <th className="p-3">Receiver</th>
            <th className="p-3">Status</th>
            <th className="p-3">Destination</th>
            <th className="p-3">Shipment Facility</th>
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
                    shipment.status === 'Departed CARGO realm facility (Nig)' ? 'bg-orange-100 text-orange-800' :
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
              <td className="p-3">{shipment.destination}</td>
              <td className="p-3">{shipment.shipmentFacility}</td>
              <td className="p-3">{new Date(shipment.createdAt).toLocaleDateString()}</td>
              <td className="p-3 space-x-1">
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
          ))}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={8} className="p-3 text-center text-gray-500">
                No shipments found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
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

