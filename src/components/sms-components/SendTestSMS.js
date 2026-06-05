"use client";

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/config/Api';

export default function SendTestSMS() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    message: '',
  });
  const [result, setResult] = useState(null);
  const token = localStorage.getItem('token');

  const sendTestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post(`${API_BASE_URL}/sms/test-sms`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setResult({ success: true, data });
      toast.success('Test SMS sent successfully');
      setFormData({ phoneNumber: '', message: '' });
    },
    onError: (error) => {
      setResult({ success: false, error: error.response?.data });
      toast.error(error.response?.data?.message || 'Failed to send test SMS');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.phoneNumber || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }
    sendTestMutation.mutate(formData);
  };

  const charCount = formData.message.length;
  const smsCount = Math.ceil(charCount / 160);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-6">Send Test SMS</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="+2348012345678"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
            maxLength="20"
          />
          <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +234)</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Enter your test message"
            rows="4"
            maxLength="480"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>{charCount}/480 characters</span>
            <span>{smsCount} SMS segment{smsCount > 1 ? 's' : ''}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={sendTestMutation.isPending}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span>{sendTestMutation.isPending ? 'Sending...' : 'Send Test SMS'}</span>
        </button>
      </form>

      {/* Result */}
      {result && (
        <div
          className={`mt-6 p-4 rounded-md ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-start space-x-3">
            {result.success ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <h4
                className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}
              >
                {result.success ? 'SMS Sent Successfully' : 'Failed to Send SMS'}
              </h4>
              <pre className="text-xs mt-2 overflow-auto max-h-40">
                {JSON.stringify(result.data || result.error, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
