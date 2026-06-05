'use client';

import { useState, useEffect } from 'react';
import { fetchContent, updateContent } from '@/lib/api';
import toast from 'react-hot-toast';
import ImageUploader from './ImageUploader';

export default function ContentEditor({ section, title, defaultData, renderForm }) {
  const [content, setContent] = useState(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContent(section)
      .then((data) => {
        if (data) setContent({ ...defaultData, ...data });
      })
      .catch(() => {
        // Use defaults
      })
      .finally(() => setLoading(false));
  }, [section, defaultData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateContent(section, content);
      toast.success('Content saved successfully!');
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-md transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        {renderForm({ content, setContent, ImageUploader })}
      </div>
    </div>
  );
}
