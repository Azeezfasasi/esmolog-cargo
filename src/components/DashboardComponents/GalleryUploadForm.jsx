'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';
import { useProfile } from '@/components/context-api/ProfileContext';
import Image from 'next/image';

const GalleryUploadForm = () => {
  const { token } = useProfile();
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setErrorMessage('Please select an image to upload.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const payload = {
          image: base64Image,
          caption,
        };

        const response = await axios.post(`${API_BASE_URL}/gallery`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setSuccessMessage('Image uploaded successfully.');
        setCaption('');
        setImageFile(null);
        setPreview(null);
      };

      reader.onerror = () => {
        setErrorMessage('Failed to read image file.');
      };
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Upload failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="p-6 bg-white shadow-md rounded-lg max-w-xl mx-auto mt-10 font-inter">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Upload New Gallery Image</h2>

      {successMessage && (
        <div className="bg-green-100 text-green-800 border border-green-400 p-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 text-red-800 border border-red-400 p-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleUpload} className="space-y-5">
        <div>
          <label className="block mb-1 font-medium text-gray-700">Image File</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        {preview && (
          <div className="mb-4">
            <Image src={preview} alt="Preview" className="h-48 object-contain border rounded" width={300} height={200} />
          </div>
        )}

        <div>
          <label className="block mb-1 font-medium text-gray-700">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter caption (optional)"
            className="w-full border border-gray-300 rounded p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Uploading...' : 'Upload Image'}
        </button>
      </form>
    </section>
  );
};

export default GalleryUploadForm;
