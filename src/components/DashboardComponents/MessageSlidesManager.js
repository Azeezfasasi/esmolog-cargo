'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Edit2, Trash2, Plus, Eye, EyeOff, Save, X } from 'lucide-react';
import { API_BASE_URL } from '@/config/Api';

export default function MessageSlidesManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    message: '',
  });

  const API_URL = `${API_BASE_URL}/message-slides`;

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch slides: ${response.status}`);
      }

      const data = await response.json();
      setSlides(Array.isArray(data.data) ? data.data : (Array.isArray(data) ? data : []));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch slides');
      console.error('Error fetching slides:', err);
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.message.trim()) {
      setError('Message cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to save slide');
      }

      setSuccess(editingId ? 'Slide updated successfully!' : 'Slide created successfully!');
      resetForm();
      fetchSlides();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide._id);
    setFormData({
      message: slide.message,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this slide?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete slide');
      }

      setSuccess('Slide deleted successfully!');
      fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to toggle status');
      }

      setSuccess('Slide status updated successfully!');
      fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      message: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading message slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Message Slides Manager</h1>
          <p className="text-gray-600">Create, edit, and manage your live update messages</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-600 hover:text-red-800">
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-600 hover:text-green-800">
              <X size={20} />
            </button>
          </div>
        )}

        {/* Add Slide Button */}
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus size={20} className="mr-2" />
          Add New Message
        </button>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Message' : 'Create New Message'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Enter your message to display..."
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                    maxLength="500"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.message.length}/500 characters</p>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:bg-green-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        {editingId ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {editingId ? 'Update Message' : 'Create Message'}
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Messages Grid */}
        {slides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No message slides created yet. Create your first message to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slides.map((slide) => (
              <div
                key={slide._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border-l-4 border-green-600"
              >
                <div className="p-6">
                  <p className="text-gray-700 text-sm mb-6 line-clamp-4 font-medium">{slide.message}</p>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleToggleStatus(slide._id, slide.isActive)}
                      className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                        slide.isActive
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                      {slide.isActive ? 'Active' : 'Inactive'}
                    </button>

                    <button
                      onClick={() => handleEdit(slide)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(slide._id)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-semibold text-sm transition-colors"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
