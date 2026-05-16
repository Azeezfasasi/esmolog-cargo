'use client';

import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa'; 
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
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-md rounded-2xl border border-solid border-green-600">
      <h2 className="text-2xl font-semibold mb-6 text-green-700">Create New Shipment</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ... (all other form fields) ... */}
        <div>
          <label className="block text-sm font-medium mb-1">Tracking Number</label>
          <input
            type="text"
            value={form.trackingNumber}
            readOnly
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
          <span className='text-green-800'>Auto generated</span>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-3 text-gray-800">Assign Sender</label>
          
          {/* Professional Tab Toggle */}
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <button
              type="button"
              onClick={() => {
                setSenderMode('select');
                setManualSenderId('');
              }}
              className={`flex-1 py-2 px-4 font-medium rounded transition-all border-2 ${
                senderMode === 'select'
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              Select Existing User
            </button>
            <button
              type="button"
              onClick={() => {
                setSenderMode('manual');
                setForm(prev => ({ ...prev, sender: '' }));
              }}
              className={`flex-1 py-2 px-4 font-medium rounded transition-all border-2 ${
                senderMode === 'manual'
                  ? 'bg-green-600 text-white border-green-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-400'
              }`}
            >
              Enter Manual ID
            </button>
          </div>

          {/* Select Existing User Option */}
          {senderMode === 'select' && (
            <div className="border border-green-600 rounded-lg p-4 bg-green-50">
              {isLoadingUsers ? (
                <div className="flex items-center text-gray-600">
                  <FaSpinner className="animate-spin mr-2" /> Loading users...
                </div>
              ) : isErrorUsers ? (
                <div className="flex items-center text-red-600">
                  <FaTimesCircle className="mr-2" /> Error loading users: {usersError?.message}
                </div>
              ) : (
                <select
                  name="sender"
                  value={form.sender}
                  onChange={handleChange}
                  className="w-full border border-green-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="">Select a user from the system</option>
                  {users && users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.fullName} ({user.email})
                    </option>
                  ))}
                </select>
              )}
              <p className="text-xs text-gray-600 mt-2">
                Choose an existing user to assign as the sender for this shipment.
              </p>
            </div>
          )}

          {/* Manual Sender Email Option */}
          {senderMode === 'manual' && (
            <div className="border border-green-600 rounded-lg p-4 bg-green-50">
              <input
                type="text"
                value={manualSenderId}
                onChange={(e) => setManualSenderId(e.target.value)}
                placeholder="Enter sender email address (e.g., user@example.com)"
                className="w-full border border-green-600 rounded p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-600 mt-2">
                Enter the sender&apos;s email address. The system will automatically:
              </p>
              <ul className="text-xs text-gray-600 mt-1 ml-2 list-disc">
                <li>Link to their account if the email exists in the system</li>
                <li>Send a confirmation email if the address is external or not registered</li>
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sender Name</label>
          <input
            type="text"
            name="senderName"
            value={form.senderName}
            placeholder='Enter the sender name'
            onChange={handleChange}
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sender Phone Number</label>
          <input
            type="text"
            name="senderPhone"
            value={form.senderPhone}
            onChange={handleChange}
            placeholder='Enter the sender Phone Number'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sender Email Address</label>
          <input
            type="email"
            name="senderEmail"
            value={form.senderEmail}
            onChange={handleChange}
            placeholder='Enter the sender Email Address'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sender Address</label>
          <input
            type="text"
            name="senderAddress"
            value={form.senderAddress}
            onChange={handleChange}
            placeholder='Enter the sender Home Address'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Receiver Name</label>
          <input
            type="text"
            name="recipientName"
            value={form.recipientName}
            onChange={handleChange}
            placeholder='Enter the receiver name'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Receiver Email</label>
          <input
            type="email"
            name="receiverEmail"
            value={form.receiverEmail}
            onChange={handleChange}
            placeholder='Enter the receiver email'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Receiver Phone</label>
          <input
            type="text"
            name="recipientPhone"
            value={form.recipientPhone}
            onChange={handleChange}
            placeholder='Enter the receiverphone number'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Receiver Address</label>
          <textarea
            name="recipientAddress"
            value={form.recipientAddress}
            onChange={handleChange}
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
            placeholder='Enter the receiver home address'
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Origin</label>
          <input
            type="text"
            name="origin"
            value={form.origin}
            onChange={handleChange}
            placeholder='Enter the country/city of origin'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Destination</label>
          <input
            type="text"
            name="destination"
            value={form.destination}
            onChange={handleChange}
            placeholder='Enter the country/city of destination'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        {/* section for adding items */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Items in Shipment <span className='text-[13px] text-blue-700'>Enter an item and click the plus button to add</span></label>
            <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., 'Food Items, Electronics, Clothing etc.'"
                  className="flex-grow border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"

                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center"
                >
                  <FaPlus />
                </button>
            </div>

            {form.items.length > 0 && (
                <ul className="border border-solid border-gray-300 rounded p-2">
                    {form.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center py-1">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-red-600 hover:text-red-800 transition"
                            >
                              <FaTrash />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={form.weight}
            onChange={handleChange}
            placeholder='Enter the weight of the shipment in kg'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Length (cm) - (Optional)</label>
          <input
            type="number"
            name="length"
            value={form.length}
            onChange={handleChange}
            placeholder='Optional:Enter the Length of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Width (cm) - (Optional)</label>
          <input
            type="number"
            name="width"
            value={form.width}
            onChange={handleChange}
            placeholder='Optional:Enter the width of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Breadth (cm) - (Optional)</label>
          <input
            type="number"
            name="breadth"
            value={form.breadth}
            onChange={handleChange}
            placeholder='Optional:Enter the breadth of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Height (cm) - (Optional)</label>
          <input
            type="number"
            name="height"
            value={form.height}
            onChange={handleChange}
            placeholder='Optional:Enter the height of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Volume (Optional)</label>
          <input
            type="number"
            name="volume"
            value={form.volume}
            onChange={handleChange}
            placeholder='Optional: Enter the volume of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipment Type</label>
          <select
            name="shipmentType" value={form.shipmentType} onChange={handleChange} className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600">
            <option value="">Choose Shipment Type</option>
            <option value="Boxes">Boxes</option>
            <option value="Padding">Padding</option>
            <option value="Package">Package</option>
            <option value="Document">Document</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipment Pieces</label>
          <textarea
            name="shipmentPieces"
            value={form.shipmentPieces}
            onChange={handleChange}
            placeholder='Enter the Pieces of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipment Purpose</label>
          <select
            name="shipmentPurpose" value={form.shipmentPurpose} onChange={handleChange} className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600">
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
          <label className="block text-sm font-medium mb-1">Shipping Cost (₦) - (Optional)</label>
          <input
            type="text"
            name="cost"
            value={form.cost}
            onChange={handleChange}
            placeholder='Optional: Enter the total cost of the shipment'
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipment Date</label>
          <input
            type="date"
            name="shipmentDate"
            value={form.shipmentDate}
            onChange={handleChange}
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Delivery Date</label>
          <input
            type="date"
            name="deliveryDate"
            value={form.deliveryDate}
            onChange={handleChange}
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Shipment Facility</label>
          <select
            name="shipmentFacility" value={form.shipmentFacility} onChange={handleChange} className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600" required>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600"
            placeholder='Enter any notes or comments about the shipment here. You can also include all the items here.'
            rows={3}
          />
        </div>

        <div className="w-full md:w-[40%] md:col-span-2 mt-4 mx-auto">
          <button
            type="submit"
            disabled={mutation.isLoading || submitting}
            className="w-full bg-green-600 text-white font-semibold py-2 rounded hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            {(mutation.isLoading || submitting) ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Creating Shipment...</span>
              </>
            ) : (
              <span>Create Shipment</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

