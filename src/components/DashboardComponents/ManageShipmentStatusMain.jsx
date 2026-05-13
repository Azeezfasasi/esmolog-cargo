'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { API_BASE_URL } from '@/config/Api';
import BasicModal from '@/components/ui/BasicModal';

export default function ManageShipmentStatusMain() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#6B7280',
    category: 'other',
  });

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/shipment-statuses`);
      setStatuses(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch statuses:', err);
      setError(err.message || 'Failed to fetch statuses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleOpenModal = (type, status = null) => {
    setModalType(type);
    if (type === 'edit' && status) {
      setSelectedStatus(status);
      setFormData({
        name: status.name || '',
        code: status.code || '',
        description: status.description || '',
        color: status.color || '#6B7280',
        category: status.category || 'other',
      });
    } else if (type === 'create') {
      setSelectedStatus(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        color: '#6B7280',
        category: 'other',
      });
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedStatus(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '#6B7280',
      category: 'other',
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      if (modalType === 'create') {
        await axios.post(`${API_BASE_URL}/shipment-statuses`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalType === 'edit' && selectedStatus) {
        await axios.put(`${API_BASE_URL}/shipment-statuses/${selectedStatus._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseModal();
      fetchStatuses();
    } catch (err) {
      console.error('Failed to save status:', err);
      alert('Failed to save status. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this status?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/shipment-statuses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchStatuses();
    } catch (err) {
      console.error('Failed to delete status:', err);
      alert('Failed to delete status. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading shipment statuses...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => fetchStatuses()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-[20px] lg:text-[28px]">Manage Shipment Statuses</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          <FaPlus /> Add Status
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statuses.map((status) => (
              <tr key={status._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {status.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {status.code}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {status.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {status.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-gray-500">{status.color}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal('edit', status)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(status._id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {statuses.length === 0 && (
          <div className="p-6 text-center text-gray-500">No shipment statuses found.</div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <BasicModal isOpen={!!modalType} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            {modalType === 'create' ? 'Create New Status' : 'Edit Status'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Delivered"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., DELIVERED"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleCloseModal}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
}
