'use client';

import React, { useState, useContext } from 'react';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { LuSearch, LuChevronLeft, LuChevronRight, LuEye, LuX } from 'react-icons/lu';
import { API_BASE_URL } from '@/config/Api';
import { ProfileContext } from '@/components/context-api/ProfileContext';
;
import { FaSpinner } from 'react-icons/fa';
import Image from 'next/image';

// Configure a new QueryClient
const queryClient = new QueryClient();

// The Modal component to display individual shipment details
const ShipmentDetailsModal = ({ shipment, onClose }) => {
  if (!shipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-75 overflow-y-auto p-4">
      <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl transition-all transform scale-100 opacity-100 overflow-y-auto h-[90vh]">
        <div className="p-6 ">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-red-600 hover:text-red-700 transition-colors border border-solid border-red-600 p-1 rounded-md"
          >
            <LuX className="w-6 h-6" />
          </button>

          <div className='flex flex-row justify-center mb-5'>
            <Image
              src="/img/esmologtrans.png"
              alt="Logo"
              className='w-[120px] h-[100px]'
              width={250}
              height={70}
            />
          </div>

          <h3 className="text-[18px] md:text-2xl font-bold text-gray-800 border-b pb-2 mb-4">Shipment Details - <span className='text-green-600'>{shipment.trackingNumber}</span></h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-600">
            {/* Shipment details */}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Tracking Number</span>
              <span className="font-medium text-gray-900">{shipment.trackingNumber}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Sender Name</span>
              <span className="font-medium text-gray-900">{shipment.senderName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Sender Phone</span>
              <span className="font-medium text-gray-900">{shipment.senderPhone}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Sender Email</span>
              <span className="font-medium text-gray-900">{shipment.senderEmail}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Sender Address</span>
              <span className="font-medium text-gray-900">{shipment.senderAddress}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Status</span>
              <span className={`font-medium capitalize w-fit px-2 py-1 rounded-md
                ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                  shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                  shipment.status === 'pickup-scheduled' ? 'bg-amber-100 text-amber-800' :
                  shipment.status === 'out-for-delivery' ? 'bg-pink-100 text-pink-800' :
                  shipment.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                  shipment.status === 'arrived-at-hub' ? 'bg-violet-100 text-violet-800' :
                  shipment.status === 'departed-from-hub' ? 'bg-indigo-100 text-indigo-800' :
                  shipment.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                  shipment.status === 'on-hold' ? 'bg-pink-100 text-pink-800' :
                  shipment.status === 'customs-clearance' ? 'bg-cyan-100 text-cyan-800' :
                  shipment.status === 'Awaiting Pickup' ? 'bg-fuchsia-100 text-fuchsia-800' :
                  shipment.status === 'failed-delivery-attempt' ? 'bg-red-100 text-red-800' :
                  shipment.status === 'Awaiting Delivery' ? 'bg-lime-100 text-lime-800' :
                  shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800' }`}>
                {shipment.status}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Receiver Name</span>
              <span className="font-medium">{shipment.recipientName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Receiver Phone</span>
              <span className="font-medium">{shipment.recipientPhone}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Receiver Email</span>
              <span className="font-medium">{shipment.receiverEmail}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Receiver Address</span>
              <span className="font-medium">{shipment.recipientAddress}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Origin Address</span>
              <span className="font-medium">{shipment.origin}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Destination Address</span>
              <span className="font-medium">{shipment.destination}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Weight</span>
              <span className="font-medium">{shipment.weight}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Length</span>
              <span className="font-medium">{shipment.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Width</span>
              <span className="font-medium">{shipment.width}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Height</span>
              <span className="font-medium">{shipment.height}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Shipment Cost</span>
              <span className="font-medium">{shipment.cost}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-gray-500 uppercase">Shipment Date</span>
              <span className="font-medium">{shipment.shipmentDate}</span>
            </div>
            <div className="flex flex-col col-span-2">
              <span className="text-sm font-semibold text-gray-500 uppercase">Description</span>
              <span className="font-medium">{shipment.notes}</span>
            </div>
          </div>
          {/* Close button */}
          <div className='flex flex-row justify-end mt-3'>
            <button
              onClick={onClose}
              className="flex bg-red-500 text-white transition-colors px-4 py-1 rounded-md mr-2 hover:bg-red-600 hover:text-white text-sm font-semibold cursor-pointer"
            >
              <LuX className="w-6 h-6" /> Close
            </button>
            <button onClick={window.print} className='flex bg-green-500 text-white transition-colors px-4 py-1 rounded-md ml-1 hover:bg-green-600 hover:text-white text-sm font-semibold cursor-pointer'>Print</button>
          </div>
        </div>
      </div>
    </div>
  );
};


// The main component for displaying the list of a user's shipments
function MyShipmentsMain() {
  const {token} = useContext(ProfileContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const shipmentsPerPage = 10;
  
  const fetchMyShipments = async () => {
    if (!token) {
      throw new Error('Authentication token is missing.');
    }

    const response = await fetch(`${API_BASE_URL}/shipments/my-shipments`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch your shipments');
    }

    return response.json();
  };

  // Fetch the user's shipments using useQuery
  const { data: shipments, isLoading, error } = useQuery({
    queryKey: ['my-shipments'],
    queryFn: fetchMyShipments,
    // The query will only run if a token is present, preventing unauthorized calls.
    enabled: !!token,
  });

  // Action button handlers (placeholders for future implementation)
  const handleView = (shipment) => setSelectedShipment(shipment);
  const closeModal = () => setSelectedShipment(null);

  // Filter shipments based on search term
  const filteredShipments = shipments ? shipments.filter((shipment) =>
    shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shipment.destination.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Calculate pagination details
  const totalPages = Math.ceil(filteredShipments.length / shipmentsPerPage);
  const indexOfLastShipment = currentPage * shipmentsPerPage;
  const indexOfFirstShipment = indexOfLastShipment - shipmentsPerPage;
  const currentShipments = filteredShipments.slice(indexOfFirstShipment, indexOfLastShipment);

  // Handle pagination changes
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const renderPaginationButtons = () => {
    return (
      <nav className="flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuChevronLeft className="h-4 w-4" />
        </button>
        <div>
          <span className="text-xs sm:text-sm font-medium text-gray-700">Page {currentPage} of {totalPages}</span>
        </div>
        <button
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LuChevronRight className="h-4 w-4" />
        </button>
      </nav>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6 bg-gray-100 min-h-screen">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading your shipments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-6 bg-gray-100 min-h-screen">
        <div className="text-center text-red-500 font-medium">Error: {error.message}</div>
      </div>
    );
  }
  
  if (!shipments || shipments.length === 0) {
    return (
      <div className="p-3 sm:p-6 bg-gray-100 min-h-screen font-sans">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 sm:mb-8 text-center">My Shipments</h2>
          <div className="text-center text-lg text-gray-500 p-6 sm:p-8 bg-white rounded-xl shadow-xl">
            You have no shipments to display.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 bg-gray-100 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 mb-6 sm:mb-8 text-center">My Shipments</h2>

        {/* Search Bar */}
        <div className="mb-6 flex justify-end">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by Tracking #..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 pl-8 sm:pl-10 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-2 sm:pl-3 pointer-events-none">
              <LuSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Shipment Table - Hidden on mobile, Card view on mobile */}
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-xl">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Tracking Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Recipient Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Shipment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentShipments.map((shipment) => (
                <tr key={shipment._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {shipment.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.recipientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {shipment.destination}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                      ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                        shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'pickup-scheduled' ? 'bg-amber-100 text-amber-800' :
                        shipment.status === 'out-for-delivery' ? 'bg-pink-100 text-pink-800' :
                        shipment.status === 'picked-up' ? 'bg-purple-100 text-purple-800' :
                        shipment.status === 'arrived-at-hub' ? 'bg-violet-100 text-violet-800' :
                        shipment.status === 'departed-from-hub' ? 'bg-indigo-100 text-indigo-800' :
                        shipment.status === 'on-hold' ? 'bg-pink-100 text-pink-800' :
                        shipment.status === 'customs-clearance' ? 'bg-cyan-100 text-cyan-800' :
                        shipment.status === 'Awaiting Pickup' ? 'bg-fuchsia-100 text-fuchsia-800' :
                        shipment.status === 'failed-delivery-attempt' ? 'bg-red-100 text-red-800' :
                        shipment.status === 'Awaiting Delivery' ? 'bg-lime-100 text-lime-800' :
                        shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800' }`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(shipment.shipmentDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                    <button onClick={() => handleView(shipment)} className="bg-green-50 text-green-600 hover:text-green-700 transition-colors flex flex-row items-center justify-start gap-1 border border-solid border-green-600 p-1 cursor-pointer rounded-md">
                      <LuEye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredShipments.length === 0 && (
            <div className="p-6 text-center text-gray-500">No shipments found.</div>
          )}
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {currentShipments.length === 0 ? (
            <div className="p-6 text-center text-gray-500 bg-white rounded-lg">No shipments found.</div>
          ) : (
            currentShipments.map((shipment) => (
              <div key={shipment._id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Tracking Number</p>
                      <p className="text-sm font-bold text-gray-900">{shipment.trackingNumber}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap capitalize
                      ${shipment.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        shipment.status === 'in-transit' ? 'bg-yellow-100 text-yellow-800' :
                        shipment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        shipment.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        shipment.status === 'pending' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800' }`}>
                      {shipment.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Recipient</p>
                      <p className="text-gray-800 font-medium">{shipment.recipientName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Destination</p>
                      <p className="text-gray-800 font-medium">{shipment.destination}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Shipment Date</p>
                    <p className="text-sm text-gray-700">{new Date(shipment.shipmentDate).toLocaleDateString()}</p>
                  </div>

                  <button 
                    onClick={() => handleView(shipment)} 
                    className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-md flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <LuEye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        <div className="mt-6 flex justify-center">
          {renderPaginationButtons()}
        </div>
      </div>

      {/* Render the modal when a shipment is selected */}
      <ShipmentDetailsModal shipment={selectedShipment} onClose={closeModal} />
    </div>
  );
}

// The root component of the application, providing the QueryClientProvider
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyShipmentsMain />
    </QueryClientProvider>
  );
}
