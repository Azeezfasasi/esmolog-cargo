'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSpinner, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { API_BASE_URL } from '@/config/Api';
import BasicModal from '@/components/ui/BasicModal';

export default function AllPostsMain() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    category: '',
    tags: '',
    status: 'draft',
  });

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/blogs`);
      setPosts(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError(err.message || 'Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleOpenModal = (type, post = null) => {
    setModalType(type);
    if (type === 'view' && post) {
      setSelectedPost(post);
    } else if (type === 'edit' && post) {
      setSelectedPost(post);
      setFormData({
        title: post.title || '',
        author: post.author || '',
        content: post.content || '',
        category: post.category || '',
        tags: (post.tags && post.tags.join(', ')) || '',
        status: post.status || 'draft',
      });
    } else if (type === 'create') {
      setSelectedPost(null);
      setFormData({
        title: '',
        author: '',
        content: '',
        category: '',
        tags: '',
        status: 'draft',
      });
    }
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedPost(null);
    setFormData({
      title: '',
      author: '',
      content: '',
      category: '',
      tags: '',
      status: 'draft',
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
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      const payload = {
        ...formData,
        tags: tagsArray,
      };

      if (modalType === 'create') {
        await axios.post(`${API_BASE_URL}/blogs`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalType === 'edit' && selectedPost) {
        await axios.put(`${API_BASE_URL}/blogs/${selectedPost._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      handleCloseModal();
      fetchPosts();
    } catch (err) {
      console.error('Failed to save post:', err);
      alert('Failed to save post. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert('Failed to delete post. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex items-center justify-center min-h-[calc(100vh-120px)]">
        <FaSpinner className="animate-spin text-green-600 text-4xl" />
        <p className="ml-3 text-lg text-gray-700">Loading posts...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 bg-gray-50 font-inter antialiased flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded"
          onClick={() => fetchPosts()}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-[20px] lg:text-[28px]">All Posts</h1>
        <button
          onClick={() => handleOpenModal('create')}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          <FaPlus /> Create Post
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                  {post.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.author}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                    post.status === 'published' ? 'bg-green-100 text-green-800' :
                    post.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenModal('view', post)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <FaEye /> View
                    </button>
                    <button
                      onClick={() => handleOpenModal('edit', post)}
                      className="text-yellow-600 hover:text-yellow-900 flex items-center gap-1"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
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
        {posts.length === 0 && (
          <div className="p-6 text-center text-gray-500">No posts found.</div>
        )}
      </div>

      {/* View Modal */}
      <BasicModal isOpen={modalType === 'view'} onClose={handleCloseModal}>
        {selectedPost && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h2>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 font-semibold">Author</p>
                <p className="text-gray-900">{selectedPost.author}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Category</p>
                <p className="text-gray-900">{selectedPost.category}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Status</p>
                <p className="text-gray-900 capitalize">{selectedPost.status}</p>
              </div>
              <div>
                <p className="text-gray-600 font-semibold">Created</p>
                <p className="text-gray-900">
                  {selectedPost.createdAt ? new Date(selectedPost.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            {selectedPost.tags && selectedPost.tags.length > 0 && (
              <div>
                <p className="text-gray-600 font-semibold mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedPost.tags.map((tag, idx) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-gray-600 font-semibold mb-2">Content</p>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedPost.content}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </BasicModal>

      {/* Create/Edit Modal */}
      <BasicModal isOpen={modalType === 'create' || modalType === 'edit'} onClose={handleCloseModal}>
        <div className="space-y-4">
          <h2 className="text-lg font-bold">
            {modalType === 'create' ? 'Create New Post' : 'Edit Post'}
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Post title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Author name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Technology"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="e.g., tag1, tag2, tag3"
              />
              <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Post content"
              rows="8"
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
