'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { FaSpinner, FaSearch, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { API_BASE_URL } from '@/config/Api';
import Image from 'next/image';

export default function TrackShipmentMain() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearhed] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearhed(true);
      
      const res = await axios.get(`${API_BASE_URL}/shipments/track/${trackingNumber}`);
      setShipment(res.data);
    } catch (err) {
      console.error('Failed to track shipment:', err);
      setShipment(null);
      setError(err.response?.data?.error || 'Shipment not found. Please check the tracking number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const statusLower = status.toLowerCase();
    
    if (statusLower === 'delivered') return 'bg-green-100 text-green-800';
    if (statusLower === 'in-transit') return 'bg-yellow-100 text-yellow-800';
    if (statusLower === 'cancelled') return 'bg-red-100 text-red-800';
    if (statusLower === 'processing') return 'bg-blue-100 text-blue-800';
    if (statusLower === 'pickup-scheduled') return 'bg-amber-100 text-amber-800';
    if (statusLower === 'out-for-delivery') return 'bg-pink-100 text-pink-800';
    if (statusLower === 'picked-up') return 'bg-purple-100 text-purple-800';
    if (statusLower === 'arrived-at-hub') return 'bg-violet-100 text-violet-800';
    if (statusLower === 'pending') return 'bg-red-100 text-red-800';
    
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image
              src="/img/esmologtrans.png"
              alt="Logo"
              className="w-[120px] h-[100px]"
              width={200}
              height={60}
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Track Your Shipment</h1>
          <p className="text-gray-600">Enter your tracking number to view real-time updates</p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK-001)"
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <FaSearch />
                  Track
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && searched && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Shipment Details */}
        {shipment && (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Tracking Number</p>
                  <p className="text-2xl font-bold text-gray-900 mb-6">{shipment.trackingNumber}</p>

                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Current Status</p>
                  <span className={`inline-block px-4 py-2 rounded-full font-semibold capitalize ${getStatusColor(shipment.status)}`}>
                    {shipment.status}
                  </span>
                </div>

                {/* Right Column */}
                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Shipment Date</p>
                  <p className="text-lg text-gray-900 mb-6">
                    {shipment.shipmentDate ? new Date(shipment.shipmentDate).toLocaleDateString() : 'N/A'}
                  </p>

                  {shipment.deliveryDate && (
                    <>
                      <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Delivered Date</p>
                      <p className="text-lg text-gray-900 mb-6">
                        {new Date(shipment.deliveryDate).toLocaleDateString()}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Shipment Details Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">From</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{shipment.senderName}</p>
                    <p className="text-gray-600 text-sm">{shipment.senderPhone}</p>
                    <p className="text-gray-600 text-sm">{shipment.senderEmail}</p>
                    <p className="text-gray-600 text-sm mt-2">{shipment.senderAddress}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">To</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">{shipment.recipientName}</p>
                    <p className="text-gray-600 text-sm">{shipment.recipientPhone}</p>
                    <p className="text-gray-600 text-sm">{shipment.receiverEmail}</p>
                    <p className="text-gray-600 text-sm mt-2">{shipment.recipientAddress}</p>
                  </div>
                </div>

                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Origin</p>
                  <p className="text-lg font-medium text-gray-900">{shipment.origin}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Destination</p>
                  <p className="text-lg font-medium text-gray-900">{shipment.destination}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Weight</p>
                  <p className="text-lg font-medium text-gray-900">{shipment.weight || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Cost</p>
                  <p className="text-lg font-medium text-gray-900">${shipment.cost || 'N/A'}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-gray-600 text-sm uppercase font-semibold mb-2">Description</p>
                  <p className="text-gray-900">{shipment.notes || 'No additional notes'}</p>
                </div>
              </div>
            </div>

            {/* Tracking History */}
            {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tracking History</h2>
                
                <div className="space-y-4">
                  {shipment.trackingHistory.map((entry, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                        {index < shipment.trackingHistory.length - 1 && (
                          <div className="w-1 h-16 bg-gray-200 my-1"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 pb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                            {entry.status}
                          </p>
                          {entry.location && (
                            <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
                              <FaMapMarkerAlt className="text-red-500" />
                              {entry.location}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm flex items-center gap-2 mt-2">
                            <FaCalendarAlt className="text-blue-500" />
                            {new Date(entry.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code */}
            {shipment.qrCodeUrl && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QR Code</h2>
                <div className="flex flex-col items-center gap-4">
                  <Image
                    src={shipment.qrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    className="border border-gray-300 rounded"
                  />
                  <a
                    href={shipment.qrCodeUrl}
                    download={`QR-${shipment.trackingNumber}.png`}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    Download QR Code
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!shipment && !error && searched && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Enter a tracking number to get started</p>
          </div>
        )}

        {!searched && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Enter a tracking number to track your shipment</p>
          </div>
        )}
      </div>
    </div>
  );
}
