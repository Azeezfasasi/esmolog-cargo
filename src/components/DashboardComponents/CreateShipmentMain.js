'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaTimesCircle, FaPlus, FaTrash, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa'; 
import { API_BASE_URL } from '@/config/Api';

const generateTrackingNumber = () => {
  const rand = Math.floor(10000000000 + Math.random() * 90000000000);
  return `OSM${rand}`;
};

export default function CreateShipmentForm({ token }) {
  const [form, setForm] = useState({
    trackingNumber: generateTrackingNumber(),
    sender: '', 
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    receiverEmail: '',
    origin: '',
    destination: '',
    status: 'pending',
    items: [], 
    weight: '',
    shipmentDate: '',
    deliveryDate: '',
    notes: '',
    length: '',
    width: '',
    height: '',
    breadth: '',
    volume: '',
    cost: '',
    shipmentPieces: '',
    shipmentType: '',
    shipmentPurpose: '',
    shipmentFacility: '',
  });

  // State for the new item input
  const [newItem, setNewItem] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State for sender selection mode (select vs manual)
  const [senderMode, setSenderMode] = useState('select'); // 'select' or 'manual'
  const [manualSenderId, setManualSenderId] = useState('');

  // Fetch users for the sender dropdown
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
    error: usersError
  } = useQuery({

    queryKey: ['allUsers'], // Use a distinct query key
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/profile/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure the API returns an array. If it returns null/undefined, default to empty array.
      return Array.isArray(res.data) ? res.data : [];
    },

    enabled: !!token, // Only run this query if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const mutation = useMutation({
    mutationFn: async (shipmentData) => {
      // Client-side retry for duplicate tracking numbers
      const maxAttempts = 5;
      let attempt = 0;
      let lastError;
      let payload = { ...shipmentData };
      while (attempt < maxAttempts) {
        try {
          const res = await axios.post(`${API_BASE_URL}/shipments`, payload, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          return res.data;
        } catch (err) {
          lastError = err;
          // If duplicate key on trackingNumber, regenerate and retry
          const isDuplicate = err?.response?.data?.errmsg?.includes('duplicate key') || err?.response?.status === 409 || (err?.code === 11000 || err?.response?.data?.code === 11000);
          if (isDuplicate) {
            attempt += 1;
            payload = { ...shipmentData, trackingNumber: generateTrackingNumber() };
            console.warn(`Duplicate tracking number detected. Retrying with new tracking number (attempt ${attempt})`);
            continue;
          }
          // Non-retryable error: rethrow
          throw err;
        }
      }
      // if we exit loop without success, throw last error
      throw lastError;
    },
    onSuccess: () => {
      setSubmitting(false);
      toast.success('Shipment created successfully');
      setForm((prev) => ({
        ...prev,
        trackingNumber: generateTrackingNumber(), // reset tracking number
        sender: '', // Reset sender selection
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        senderAddress: '',
        recipientName: '',
        recipientPhone: '',
        recipientAddress: '',
        receiverEmail: '',
        origin: '',
        destination: '',
        status: 'pending',
        items: [],
        weight: '',
        shipmentDate: '',
        deliveryDate: '',
        notes: '',
        length: '',
        width: '',
        height: '',
        breadth: '',
        volume: '',
        cost: '',
        shipmentPieces: '',
        shipmentType: '',
        shipmentPurpose: '',
        shipmentFacility: '',
      }));
      // Reset the new item input field
      setNewItem('');
      // Reset sender mode
      setSenderMode('select');
      setManualSenderId('');
    },
    onError: (err) => {
      setSubmitting(false);
      const message = err?.response?.data?.message || err?.message || 'Error creating shipment';
      // Show helpful guidance if duplicate-key exhausted
      if (err?.response?.data?.errmsg?.includes('duplicate key') || err?.code === 11000) {
        toast.error('Duplicate tracking number. Please try again or contact support.');
      } else {
        toast.error(message);
      }
      console.error('Create shipment error (frontend):', err);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      setForm(prevForm => ({
        ...prevForm,
        items: [...prevForm.items, newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    setForm(prevForm => ({
      ...prevForm,
      items: prevForm.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Determine which sender value to use
    let senderId = senderMode === 'select' ? form.sender : manualSenderId;
    let senderEmail = '';
    
    if (!senderId || senderId.trim() === '') {
      return toast.error('Please select a sender or enter a sender email');
    }
    
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // If manual mode
    if (senderMode === 'manual') {
      if (emailPattern.test(senderId.trim())) {
        // It's an email format
        senderEmail = senderId.trim();
        
        // Check if this email exists in the database
        const foundUser = users?.find(user => user.email === senderEmail);
        
        if (foundUser) {
          // Email exists, use user ID
          senderId = foundUser._id;
        } else {
          // Email doesn't exist in database, send as external email
          // Set sender to null and use senderEmail field
          senderId = null;
        }
      } else {
        // Treat it as a MongoDB ID
        senderEmail = '';
      }
    } else {
      // Select mode - get the email of the selected user
      const selectedUser = users?.find(u => u._id === senderId);
      senderEmail = selectedUser?.email || '';
    }
    
    setSubmitting(true);
    const submitData = {
      ...form,
      sender: senderId,
      senderEmail: senderEmail || form.senderEmail // Use manual email if provided
    };
    mutation.mutate(submitData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="bg-green-600 rounded-lg p-2 sm:p-3 flex-shrink-0">
              <FaPlus className="text-white text-lg sm:text-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">Create New Shipment</h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 ml-10 sm:ml-14">Fill in the details to create and track your shipment</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Tracking Number */}
          <div className="bg-white rounded-lg shadow p-3 sm:p-6">
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                <span className="text-green-600">●</span> Tracking Number (Auto-Generated)
              </label>
              <input
                type="text"
                value={form.trackingNumber}
                readOnly
                className="w-full bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
            </div>
          </div>

          {/* Sender Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-green-600 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
              <FaUser className="text-lg sm:text-xl flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl font-bold">Sender Information</h2>
            </div>
            
            <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
              {/* Sender Selection Mode */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold mb-3 sm:mb-4 text-gray-700">
                  How would you like to assign the sender?
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setSenderMode('select');
                      setManualSenderId('');
                    }}
                    className={`py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all border-2 flex items-center justify-center gap-1 sm:gap-2 ${
                      senderMode === 'select'
                        ? 'bg-green-600 text-white border-green-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
                    }`}
                  >
                    <FaUser className="hidden sm:inline" /> <span className="text-xs sm:text-sm">Select User</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSenderMode('manual');
                      setForm(prev => ({ ...prev, sender: '' }));
                    }}
                    className={`py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all border-2 flex items-center justify-center gap-1 sm:gap-2 ${
                      senderMode === 'manual'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    <FaEnvelope className="hidden sm:inline" /> <span className="text-xs sm:text-sm">Email</span>
                  </button>
                </div>

                {/* Select Existing User Option */}
                {senderMode === 'select' && (
                  <div className="bg-green-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    {isLoadingUsers ? (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <FaSpinner className="animate-spin mr-2 flex-shrink-0" /> Loading users...
                      </div>
                    ) : isErrorUsers ? (
                      <div className="flex items-center text-xs sm:text-sm text-red-600">
                        <FaTimesCircle className="mr-2 flex-shrink-0" /> Error loading users: {usersError?.message}
                      </div>
                    ) : (
                      <>
                        <select
                          name="sender"
                          value={form.sender}
                          onChange={handleChange}
                          className="w-full border border-green-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                        >
                          <option value="">Select a user from the system</option>
                          {users && users.map((user) => (
                            <option key={user._id} value={user._id}>
                              {user.fullName} ({user.email})
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                          <span className="flex-shrink-0">✓</span> <span>Choose an existing user to assign as the sender for this shipment.</span>
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Manual Sender Email Option */}
                {senderMode === 'manual' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                    <input
                      type="email"
                      value={manualSenderId}
                      onChange={(e) => setManualSenderId(e.target.value)}
                      placeholder="e.g., user@example.com"
                      className="w-full border border-green-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <p className="text-xs text-gray-600 mt-2 sm:mt-3">The system will automatically:</p>
                    <ul className="text-xs text-gray-600 mt-2 ml-4 list-disc space-y-1">
                      <li>Link to their account if the email exists in the system</li>
                      <li>Send a confirmation email if the address is external or not registered</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* Sender Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-500 flex-shrink-0" /> Sender Name
                  </label>
                  <input
                    type="text"
                    name="senderName"
                    value={form.senderName}
                    placeholder='Full name'
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaPhone className="text-gray-500 flex-shrink-0" /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="senderPhone"
                    value={form.senderPhone}
                    onChange={handleChange}
                    placeholder='+234 XXX XXXX'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-gray-500 flex-shrink-0" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={form.senderEmail}
                    onChange={handleChange}
                    placeholder='email@example.com'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Address</label>
                  <input
                    type="text"
                    name="senderAddress"
                    value={form.senderAddress}
                    onChange={handleChange}
                    placeholder='Street address'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-green-600 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
              <FaUser className="text-lg sm:text-xl flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl font-bold">Receiver Information</h2>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaUser className="text-gray-500 flex-shrink-0" /> Receiver Name
                  </label>
                  <input
                    type="text"
                    name="recipientName"
                    value={form.recipientName}
                    onChange={handleChange}
                    placeholder='Full name'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaPhone className="text-gray-500 flex-shrink-0" /> Phone Number
                  </label>
                  <input
                    type="text"
                    name="recipientPhone"
                    value={form.recipientPhone}
                    onChange={handleChange}
                    placeholder='+234 XXX XXXX'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                    <FaEnvelope className="text-gray-500 flex-shrink-0" /> Email Address
                  </label>
                  <input
                    type="email"
                    name="receiverEmail"
                    value={form.receiverEmail}
                    onChange={handleChange}
                    placeholder='email@example.com'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Address</label>
                  <textarea
                    name="recipientAddress"
                    value={form.recipientAddress}
                    onChange={handleChange}
                    placeholder='Street address'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>


          {/* Route Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-amber-600 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
              <FaPlus className="text-lg sm:text-xl flex-shrink-0" />
              <h2 className="text-lg sm:text-2xl font-bold">Route Information</h2>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Origin</label>
                  <input
                    type="text"
                    name="origin"
                    value={form.origin}
                    onChange={handleChange}
                    placeholder='Country/City'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    placeholder='Country/City'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-purple-600 text-white px-3 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-2xl font-bold">Shipment Details</h2>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Weight (kg)</label>
                  <input
                    type="number"
                    name="weight"
                    value={form.weight}
                    onChange={handleChange}
                    placeholder='Enter weight in kg'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipment Type</label>
                  <select
                    name="shipmentType" 
                    value={form.shipmentType} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose Shipment Type</option>
                    <option value="Boxes">Boxes</option>
                    <option value="Padding">Padding</option>
                    <option value="Package">Package</option>
                    <option value="Document">Document</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipment Purpose</label>
                  <select
                    name="shipmentPurpose" 
                    value={form.shipmentPurpose} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Choose Shipment Purpose</option>
                    <option value="Personal">Personal</option>
                    <option value="Gift">Gift</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Return for Repair">Return for Repair</option>
                    <option value="Sample">Sample</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipment Facility</label>
                  <select
                    name="shipmentFacility" 
                    value={form.shipmentFacility} 
                    onChange={handleChange} 
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" 
                    required
                  >
                    <option value="">Choose Shipment Facility</option>
                    <option value="Lagos">Lagos</option>
                    <option value="Atlanta">Atlanta</option>
                    <option value="Indianapolis">Indianapolis</option>
                    <option value="New York">New York</option>
                    <option value="New Jersey">New Jersey</option>
                    <option value="Maryland">Maryland</option>
                    <option value="Dallas">Dallas</option>
                    <option value="Houston">Houston</option>
                    <option value="United States of America">United States of America</option>
                    <option value="Canada">Canada</option>
                    <option value="Ontario">Ontario</option>
                    <option value="Calgary">Calgary</option>
                    <option value="Edmonton">Edmonton</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipment Date</label>
                  <input
                    type="date"
                    name="shipmentDate"
                    value={form.shipmentDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Delivery Date</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={form.deliveryDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipping Cost (₦)</label>
                  <input
                    type="text"
                    name="cost"
                    value={form.cost}
                    onChange={handleChange}
                    placeholder='Cost (optional)'
                    className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dimensions Section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-indigo-600 text-white px-3 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-2xl font-bold">Dimensions (Optional)</h2>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Length</label>
                  <input
                    type="number"
                    name="length"
                    value={form.length}
                    onChange={handleChange}
                    placeholder='L (cm)'
                    className="w-full border border-gray-300 rounded-lg p-1 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Width</label>
                  <input
                    type="number"
                    name="width"
                    value={form.width}
                    onChange={handleChange}
                    placeholder='W (cm)'
                    className="w-full border border-gray-300 rounded-lg p-1 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Height</label>
                  <input
                    type="number"
                    name="height"
                    value={form.height}
                    onChange={handleChange}
                    placeholder='H (cm)'
                    className="w-full border border-gray-300 rounded-lg p-1 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-1 text-gray-700">Breadth</label>
                  <input
                    type="number"
                    name="breadth"
                    value={form.breadth}
                    onChange={handleChange}
                    placeholder='B (cm)'
                    className="w-full border border-gray-300 rounded-lg p-1 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Volume</label>
                <input
                  type="number"
                  name="volume"
                  value={form.volume}
                  onChange={handleChange}
                  placeholder='Volume (optional)'
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Items in Shipment */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-cyan-600 text-white px-3 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-2xl font-bold">Items in Shipment</h2>
            </div>
            
            <div className="p-3 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="Item name"
                  className="flex-grow border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 sm:px-6 py-2 sm:py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 flex-shrink-0"
                >
                  <FaPlus /> <span className="hidden sm:inline">Add</span>
                </button>
              </div>

              {form.items.length > 0 && (
                <div className="border border-gray-300 rounded-lg p-2 sm:p-4">
                  <ul className="space-y-1 sm:space-y-2">
                    {form.items.map((item, index) => (
                      <li key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100 text-xs sm:text-sm">
                        <span className="text-gray-700 truncate">{item}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 px-2 py-1 rounded transition ml-2 flex-shrink-0"
                        >
                          <FaTrash />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-700 text-white px-3 sm:px-6 py-3 sm:py-4">
              <h2 className="text-lg sm:text-2xl font-bold">Additional Information</h2>
            </div>
            
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Shipment Pieces</label>
                <textarea
                  name="shipmentPieces"
                  value={form.shipmentPieces}
                  onChange={handleChange}
                  placeholder='E.g., boxes, cartons, etc.'
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium mb-2 text-gray-700">Notes & Comments</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-2 sm:p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
                  placeholder='Any special instructions or notes...'
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={mutation.isLoading || submitting}
              className="w-full sm:w-96 bg-gradient-to-r from-blue-600 to-green-600 text-white font-bold py-2 sm:py-3 rounded-lg hover:shadow-lg transition transform hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {(mutation.isLoading || submitting) ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Shipment</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

