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
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-3xl sm:text-4xl" />
        <p className="mt-3 text-sm sm:text-base text-gray-700">Loading facilities...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4">
        <p className="text-red-600 mb-4 text-center text-sm sm:text-base">Error: {error}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded text-sm sm:text-base hover:bg-green-700 transition"
          onClick={() => fetchFacilities()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="p-2 sm:p-4 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="font-bold text-[18px] sm:text-[20px] lg:text-[28px]">Manage Facilities</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 transition text-sm sm:text-base"
        >
          <FaPlus /> Add Facility
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
                Country
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                City
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {facilities.map((facility) => (
              <tr key={facility._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {facility.name}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.code}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.country}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.city}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.phone}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {facility.email}
                </td>
                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal('edit', facility)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-xs sm:text-sm"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(facility._id)}
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
        {facilities.length === 0 && (
          <div className="p-6 text-center text-gray-500">No facilities found.</div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {facilities.length === 0 ? (
          <div className="p-6 text-center text-gray-500 bg-white rounded-lg">No facilities found.</div>
        ) : (
          facilities.map((facility) => (
            <div key={facility._id} className="bg-white rounded-lg shadow p-4 border-l-4 border-green-600">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                  <p className="text-sm font-bold text-gray-900">{facility.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Code</p>
                    <p className="text-sm text-gray-700">{facility.code}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Country</p>
                    <p className="text-sm text-gray-700">{facility.country}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">City</p>
                    <p className="text-sm text-gray-700">{facility.city}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">State</p>
                    <p className="text-sm text-gray-700">{facility.state}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Phone</p>
                    <p className="text-sm text-gray-700">{facility.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                    <p className="text-sm text-gray-700 truncate">{facility.email}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Address</p>
                  <p className="text-sm text-gray-700">{facility.address}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleOpenModal('edit', facility)}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-50 text-blue-600 py-2 rounded text-xs font-medium hover:bg-blue-100 transition"
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(facility._id)}
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

      {/* Modal for Create/Edit */}
      <BasicModal isOpen={!!modalType} onClose={handleCloseModal}>
        <div className="space-y-3 sm:space-y-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg sm:text-xl font-bold">
            {modalType === 'create' ? 'Create New Facility' : 'Edit Facility'}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos Hub"
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
                placeholder="e.g., LG-HUB"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Nigeria"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Lagos"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., +234-xxx-xxxx"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., facility@example.com"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Full facility address"
              rows="2"
            />
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
