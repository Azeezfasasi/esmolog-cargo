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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
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
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-3xl sm:text-4xl" />
        <p className="mt-3 text-sm sm:text-base text-gray-700">Loading shipment statuses...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <p className="text-red-600 mb-4 text-center text-sm sm:text-base">Error: {error}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded text-sm sm:text-base hover:bg-green-700 transition"
          onClick={() => fetchStatuses()}
        >
          Retry
        </button>
      </section>
    );
  }

  // Pagination logic
  const totalPages = Math.ceil(statuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStatuses = statuses.slice(startIndex, endIndex);

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-bold text-[18px] sm:text-[20px] lg:text-[28px]">Manage Shipment Statuses</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
        >
          <FaPlus /> Add Status
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Color
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedStatuses.map((status) => (
              <tr key={status._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {status.name}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {status.code}
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {status.description}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {status.category}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border border-gray-300"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-sm text-gray-500">{status.color}</span>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal('edit', status)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(status._id)}
                      className="text-red-600 hover:text-red-900 flex items-center gap-1 text-xs sm:text-sm"
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {statuses.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg">No shipment statuses found.</div>
        ) : (
          paginatedStatuses.map((status) => (
            <div key={status._id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                  <p className="text-sm font-bold text-gray-900">{status.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Code</p>
                    <p className="text-sm text-gray-700">{status.code}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Category</p>
                    <p className="text-sm text-gray-700 capitalize">{status.category}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Description</p>
                  <p className="text-sm text-gray-700">{status.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Color</p>
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-xs text-gray-500">{status.color}</span>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal('edit', status)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded text-xs font-medium hover:bg-blue-100 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(status._id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 py-2 rounded text-xs font-medium hover:bg-red-100 transition"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {statuses.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mt-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {startIndex + 1} to {Math.min(endIndex, statuses.length)} of {statuses.length} statuses
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2 py-1 text-sm rounded transition ${
                    currentPage === page
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Modal for Create/Edit */}
      <BasicModal isOpen={!!modalType} onClose={handleCloseModal}>
        <div className="space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold">
            {modalType === 'create' ? 'Create New Status' : 'Edit Status'}
          </h2>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Delivered"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., DELIVERED"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Optional description"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-3 sm:pt-4 border-t border-gray-200">
            <button
              onClick={handleCloseModal}
              className="px-3 sm:px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 sm:px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </BasicModal>
    </div>
  );
}
