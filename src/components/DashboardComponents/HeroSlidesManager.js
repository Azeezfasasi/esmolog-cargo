'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Edit2, Trash2, Plus, Eye, EyeOff, Save, X } from 'lucide-react';
import { API_BASE_URL } from '@/config/Api';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

export default function HeroSlidesManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    headline: '',
    description: '',
    image: '',
    alt: '',
    cta: '',
    buttonText: '',
    order: 0,
  });

  const API_URL = `${API_BASE_URL}/hero`;

  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/admin/all`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch slides');
      }
      
      setSlides(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch slides');
      setSlides([]);
      console.error(err);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.headline || !formData.description || !formData.image || !formData.alt || !formData.cta || !formData.buttonText) {
      setError('All fields are required');
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('headline', formData.headline);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('alt', formData.alt);
      formDataToSend.append('cta', formData.cta);
      formDataToSend.append('buttonText', formData.buttonText);
      formDataToSend.append('order', formData.order);
      
      // Only append image if it's a File object (new upload), not a URL string
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
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
      headline: slide.headline,
      description: slide.description,
      image: slide.image,
      alt: slide.alt,
      cta: slide.cta,
      buttonText: slide.buttonText,
      order: slide.order,
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

  const handleToggleStatus = async (id) => {
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

      fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReorder = async (id, direction) => {
    const currentIndex = slides.findIndex(s => s._id === id);
    if ((direction === 'up' && currentIndex === 0) || (direction === 'down' && currentIndex === slides.length - 1)) {
      return;
    }

    const newSlides = [...slides];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSlides[currentIndex].order, newSlides[newIndex].order] = [newSlides[newIndex].order, newSlides[currentIndex].order];

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          slides: newSlides.map((s, idx) => ({ id: s._id, order: idx }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder slides');
      }

      fetchSlides();
    } catch (err) {
      setError(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      headline: '',
      description: '',
      image: '',
      alt: '',
      cta: '',
      buttonText: '',
      order: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading slides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Hero Slides Manager</h1>
          <p className="text-gray-600">Create, edit, and manage your hero section slides</p>
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
          Add New Slide
        </button>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingId ? 'Edit Slide' : 'Create New Slide'}
                </h2>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Headline */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Headline *</label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline}
                    onChange={handleInputChange}
                    placeholder="Enter slide headline"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    maxLength="100"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter slide description"
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
                    maxLength="500"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image *</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    />
                  </div>
                  {formData.image && (
                    <div className="mt-4">
                      <Image
                        src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
                        alt="Preview"
                        className="max-h-48 rounded-lg object-cover"
                        width={300}
                        height={200}
                      />
                    </div>
                  )}
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Alt Text *</label>
                  <input
                    type="text"
                    name="alt"
                    value={formData.alt}
                    onChange={handleInputChange}
                    placeholder="Describe the image for accessibility"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* CTA URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Call-to-Action URL *</label>
                  <input
                    type="text"
                    name="cta"
                    value={formData.cta}
                    onChange={handleInputChange}
                    placeholder="e.g., /app/requestquote"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Button Text *</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={formData.buttonText}
                    onChange={handleInputChange}
                    placeholder="e.g., Request Quote"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                    maxLength="30"
                  />
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
                        {editingId ? 'Update Slide' : 'Create Slide'}
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

        {/* Slides Grid */}
        {slides.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-gray-500 text-lg">No slides created yet. Create your first slide to get started!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <div
                key={slide._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Image */}
                    <div className="md:col-span-1">
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        className="w-full h-32 object-cover rounded-lg"
                        width={128}
                        height={96}
                      />
                    </div>

                    {/* Content */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{slide.headline}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">{slide.description}</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">Button: {slide.buttonText}</span>
                        <span className="bg-green-50 text-green-600 px-2 py-1 rounded">URL: {slide.cta}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex flex-col gap-2">
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

                      <div className="flex gap-1">
                        <button
                          onClick={() => handleReorder(slide._id, 'up')}
                          disabled={index === 0}
                          className="flex-1 px-2 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          <ChevronUp size={16} className="mx-auto" />
                        </button>
                        <button
                          onClick={() => handleReorder(slide._id, 'down')}
                          disabled={index === slides.length - 1}
                          className="flex-1 px-2 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          <ChevronDown size={16} className="mx-auto" />
                        </button>
                      </div>
                    </div>
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
