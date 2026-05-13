'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Image from 'next/image';

function GalleryManager() {
  const { token } = useProfile();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newCaption, setNewCaption] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(6);

  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/gallery`);
      setImages(res.data);
    } catch (err) {
      console.log(err)
      setError('Failed to load gallery images.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Image deleted successfully.');
      fetchImages();
    } catch (err) {
      console.log(err)
      setError('Failed to delete image.');
    }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/gallery/${id}`, { caption: newCaption }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Caption updated successfully.');
      setEditingId(null);
      fetchImages();
    } catch (err) {
      console.log(err)
      setError('Failed to update caption.');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_BASE_URL}/gallery/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Image status updated.');
      fetchImages();
    } catch (err) {
      console.log(err)
      setError('Failed to change status.');
    }
  };

  const filteredImages = images.filter(img =>
    img.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    img.uploadedBy?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredImages.length / limit);
  const displayedImages = filteredImages.slice((page - 1) * limit, page * limit);

  return (
    <section className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Gallery Management</h1>

      <input
        type="text"
        placeholder="Search by caption or uploader..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 p-2 border rounded"
      />

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {loading ? (
        <p>Loading images...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedImages.map((img) => (
              <div key={img._id} className="bg-white shadow-md rounded-md overflow-hidden">
                <Image
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-48 object-cover"
                  width={300}
                  height={200}
                />
                <div className="p-4">
                  {editingId === img._id ? (
                    <>
                      <input
                        type="text"
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        className="w-full border p-2 mb-2 rounded"
                      />
                      <button
                        onClick={() => handleEdit(img._id)}
                        className="bg-green-600 text-white px-4 py-1 mr-2 rounded"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-gray-800 mb-2">{img.caption || 'No caption'}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setEditingId(img._id);
                            setNewCaption(img.caption || '');
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit Caption
                        </button>
                        <button
                          onClick={() => handleDelete(img._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(img._id, img.status === 'active' ? 'archived' : 'active')
                          }
                          className="text-yellow-600 hover:underline text-sm"
                        >
                          {img.status === 'active' ? 'Archive' : 'Activate'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Status: <span className="capitalize">{img.status}</span>
                      </p>
                      <p className="text-xs text-gray-500">
                        Uploaded by: {img.uploadedBy?.name || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-400">Created: {new Date(img.createdAt).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Updated: {new Date(img.updatedAt).toLocaleString()}</p>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-6 flex justify-center items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              disabled={page === 1}
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}

export default GalleryManager;
