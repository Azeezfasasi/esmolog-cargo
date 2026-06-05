'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FaPlus, FaTrash } from 'react-icons/fa'; // Import the icons

export default function EditShipmentModal({ shipment, onClose, onSave }) {
  const [formData, setFormData] = useState({
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
    weight: '',
    notes: '',
    length: '',
    width: '',
    height: '',
    volume: '',
    cost: '',
    items: [],
    shipmentPieces: '',
    shipmentType: '',
    shipmentPurpose: '',
    shipmentFacility: '',
  });

  // State for the new item input
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    if (shipment) {
      setFormData({
        senderName: shipment.senderName || '',
        senderPhone: shipment.senderPhone || '',
        senderEmail: shipment.senderEmail || '',
        senderAddress: shipment.senderAddress || '',
        recipientName: shipment.recipientName || '',
        recipientPhone: shipment.recipientPhone || '',
        recipientAddress: shipment.recipientAddress || '',
        receiverEmail: shipment.receiverEmail || '',
        weight: shipment.weight || '',
        origin: shipment.origin || '',
        destination: shipment.destination || '',
        status: shipment.status || '',
        notes: shipment.notes || '',
        length: shipment.length || '',
        width: shipment.width || '',
        height: shipment.height || '',
        volume: shipment.volume || '',
        cost: shipment.cost || '',
        items: shipment.items || [],
        shipmentPieces: shipment.shipmentPieces || '',
        shipmentType: shipment.shipmentType || '',
        shipmentPurpose: shipment.shipmentPurpose || '',
        shipmentFacility: shipment.shipmentFacility || '',
      });
      setNewItem('');
    }
  }, [shipment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSave({ ...shipment, ...formData });
    onClose();
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (newItem.trim() !== '') {
      // ✅ Corrected: Update formData state instead of 'form'
      setFormData(prevFormData => ({
        ...prevFormData,
        items: [...prevFormData.items, newItem.trim()]
      }));
      setNewItem('');
    }
  };

  const handleRemoveItem = (index) => {
    // ✅ Corrected: Update formData state instead of 'form'
    setFormData(prevFormData => ({
      ...prevFormData,
      items: prevFormData.items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="h-[500px] overflow-y-auto px-2 sm:px-4">
      <div className="sticky top-0 bg-white/80 backdrop-blur border-b -mx-2 sm:-mx-4 px-2 sm:px-4 py-4 z-10">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Edit Shipment</h2>
            <p className="text-sm text-gray-500">Update shipment details, items and notes.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-50 to-blue-50 border px-3 py-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-xs font-medium text-gray-700">In progress</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sender Name</label>
            <input type="text" name="senderName" placeholder="Sender Name" value={formData.senderName} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sender Phone Number</label>
            <input type="tel" name="senderPhone" placeholder="Sender Phone Number" value={formData.senderPhone} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sender Email Address</label>
            <input type="email" name="senderEmail" placeholder="Sender Email Address" value={formData.senderEmail} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sender Home Address</label>
            <input type="text" name="senderAddress" placeholder="Sender Home Address" value={formData.senderAddress} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Receiver Name</label>
            <input type='text' name="recipientName" placeholder="Receiver Name" value={formData.recipientName} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Receiver Email Address</label>
            <input type="email" name="receiverEmail" placeholder="Receiver Email Address" value={formData.receiverEmail} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Receiver Phone Number</label>
            <input type="tel" name="recipientPhone" placeholder="Receiver Phone Number" value={formData.recipientPhone} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Receiver Address</label>
            <input type="text" name="recipientAddress" placeholder="Receiver Home Address" value={formData.recipientAddress} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          </div>
        </div>

        <input type="text" name="senderName" placeholder="Sender Name" value={formData.senderName} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Sender Phone Number</label>
        <input type="tel" name="senderPhone" placeholder="Sender Phone Number" value={formData.senderPhone} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Sender Email Address</label>
        <input type="email" name="senderEmail" placeholder="Sender Email Address" value={formData.senderEmail} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'/>
        
        <label>Sender Home Address</label>
        <input type="text" name="senderAddress" placeholder="Sender Home Address" value={formData.senderAddress} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />

        <label>Receiver Name</label>
        <input type='text' name="recipientName" placeholder="Receiver Name" value={formData.recipientName} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Receiver Email Address</label>
        <input type="email" name="receiverEmail" placeholder="Receiver Email Address" value={formData.receiverEmail} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Receiver Phone Number</label>
        <input type="tel" name="recipientPhone" placeholder="Receiver Phone Number" value={formData.recipientPhone} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Receiver Address</label>
        <input type="text" name="recipientAddress" placeholder="Receiver Home Address" value={formData.recipientAddress} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'/>
        
        <label>Weight (kg)</label>
        <input type="number" name="weight" placeholder="weight (kg)" value={formData.weight} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Length - (Optional)</label>
        <input type="number" name="length" placeholder="Length" value={formData.length} onChange={handleChange}className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Width - (Optional)</label>
        <input type="number" name="width" placeholder="Width" value={formData.width} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'/>
        
        <label>Height - (Optional)</label>
        <input type="number" name="height" placeholder="Height" value={formData.height} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Volume - (Optional)</label>
        <input type="number" name="volume" placeholder="Volume" value={formData.volume} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
        
        <label>Shipping Cost (₦) - (Optional)</label>
        <input type='text' name="cost" placeholder="Shipping cost" value={formData.cost} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />

        <label>Origin</label>
        <input type="text" name="origin" placeholder="Origin" value={formData.origin} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />

        <label>Destination</label>
        <input type="text" name="destination" placeholder="Destination" value={formData.destination} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />

        <label>Shipment Type</label>
        <select name="shipmentType" value={formData.shipmentType} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'>
          <option value="">Choose Shipment Type</option>
          <option value="Boxes">Boxes</option>
          <option value="Padding">Padding</option>
          <option value="Package">Package</option>
          <option value="Document">Document</option>
          <option value="Other">Other</option>
        </select>

        <label>Shipment Pieces</label>
        <textarea
          name="shipmentPieces"
          value={formData.shipmentPieces}
          onChange={handleChange}
          placeholder='Enter the Pieces of the shipment'
          className="w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600">
        </textarea>

        <label>Shipment Purpose</label>
        <select name="shipmentPurpose" value={formData.shipmentPurpose} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'>
          <option value="">Choose Shipment Purpose</option>
          <option value="Personal">Personal</option>
          <option value="Gift">Gift</option>
          <option value="Commercial">Commercial</option>
          <option value="Return for Repair">Return for Repair</option>
          <option value="Sample">Sample</option>
          <option value="Other">Other</option>
        </select>

        <label>Shipment Facility</label>
        <select name="shipmentFacility" value={formData.shipmentFacility} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'>
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
        
        {/* section for adding items */}
        <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Items in Shipment</label>
            <div className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  placeholder="e.g., 'Food Items, Electronics, Clothing etc.'"
                  className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600'
                />
                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="p-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center"
                >
                  <FaPlus />
                </Button>
            </div>

            {/* Display items from formData state */}
            {formData.items.length > 0 && (
                <ul className="border border-solid border-gray-300 rounded p-2">
                    {formData.items.map((item, index) => (
                        <li key={index} className="flex justify-between items-center py-1">
                            <span>{item}</span>
                            <Button
                                type="button"
                                onClick={() => handleRemoveItem(index)}
                                className="text-red-600 hover:text-red-800 transition"
                                variant="ghost"
                            >
                                <FaTrash />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        <div className='mt-4 flex flex-col'>
          <label>Notes</label>
          <textarea name="notes" placeholder="Additional Details" value={formData.notes} onChange={handleChange} className='w-full border border-solid border-green-600 rounded p-2 focus:outline-none focus:ring focus:ring-green-600' />
          <div className="flex justify-end space-x-2 mt-5">
            <Button variant="outline" onClick={onClose} className="bg-orange-500 text-white hover:bg-orange-600">
              Cancel
            </Button>
            <Button variant="outline" onClick={handleSubmit} className="bg-green-600 text-white hover:bg-green-700">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}