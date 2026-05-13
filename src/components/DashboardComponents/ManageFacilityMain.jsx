'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { API_BASE_URL } from '@/config/Api';
import BasicModal from '@/components/ui/BasicModal';

export default function ManageFacilityMain() {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    country: '',
    state: '',
    city: '',
    address: '',
    phone: '',
    email: '',
  });

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/facilities`);
      setFacilities(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
      setError(err.message || 'Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenModal = (type, facility = null) => {
    setModalType(type);
    if (type === 'edit' && facility) {
      setSelectedFacility(facility);
      setFormData({
        name: facility.name || '',
        code: facility.code || '',
        country: facility.country || '',
        state: facility.state || '',
        city: facility.city || '',
        address: facility.address || '',
        phone: facility.phone || '',
        email: facility.email || '',
      });
    } else if (type === 'create') {
      setSelectedFacility(null);
      setFormData({
        name: '',
        code: '',
        country: '',
        state: '',
        city: '',
        address: '',
        phone: '',
        email: '',
      });
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedFacility(null);
    setFormData({
      name: '',
      code: '',
      country: '',
      state: '',
      city: '',
      address: '',
      phone: '',
      email: '',
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
        await axios.post(`${API_BASE_URL}/facilities`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalType === 'edit' && selectedFacility) {
        await axios.put(`${API_BASE_URL}/facilities/${selectedFacility._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseModal();
      fetchFacilities();
    } catch (err) {
      console.error('Failed to save facility:', err);
      alert('Failed to save facility. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this facility?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/facilities/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchFacilities();
    } catch (err) {
      console.error('Failed to delete facility:', err);
      alert('Failed to delete facility. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading facilities...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => fetchFacilities()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-[20px] lg:text-[28px]">Manage Facilities</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          <FaPlus /> Add Facility
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
                Country
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities.map((facility) => (
              <tr key={facility._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {facility.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.code}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.phone}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal('edit', facility)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(facility._id)}
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
        {facilities.length === 0 && (
          <div className="p-6 text-center text-gray-500">No facilities found.</div>
        )}
      </div>

      {/* Modal for Create/Edit */}
      <BasicModal isOpen={!!modalType} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            {modalType === 'create' ? 'Create New Facility' : 'Edit Facility'}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos Hub"
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
                placeholder="e.g., LG-HUB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Nigeria"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +234-xxx-xxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., facility@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Full facility address"
              rows="2"
            />
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
