"use client";

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '@/config/Api';

export default function SMSSettings() {
  const [formData, setFormData] = useState({
    enabled: true,
    sendOnCreation: true,
    sendOnStatusUpdate: true,
    sendOnDelivery: true,
    sendOnCancellation: true,
    sendOnException: true,
    senderName: 'CargoRealm',
    notifyBothPartiesOnCreation: true,
    notifyRecipientOnStatusChange: true,
    notifySenderOnStatusChange: true,
    maxSMSPerDay: 10000,
    maxSMSPerMonth: 100000,
    logAllSMS: true,
  });

  const token = localStorage.getItem('token');

  // Fetch current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['smsSettings'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}/sms/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
  });

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await axios.put(`${API_BASE_URL}/sms/settings`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('SMS settings updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update settings');
    },
  });

  // Load settings into form
  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) return <div className="text-center py-8 text-xs sm:text-base">Loading settings...</div>;

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold">SMS Configuration</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-3 sm:p-6 space-y-4 sm:space-y-8">
        {/* Global Settings */}
        <section>
          <h4 className="font-semibold mb-3 sm:mb-4 text-green-600 text-sm sm:text-base">Global Settings</h4>
          <div className="space-y-3 sm:space-y-4">
            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">Enable SMS Notifications</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="logAllSMS"
                checked={formData.logAllSMS}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">Log All SMS Activity</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-2">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Sender Name</label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleChange}
                  maxLength="11"
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Max 11 characters"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max SMS per Day</label>
                <input
                  type="number"
                  name="maxSMSPerDay"
                  value={formData.maxSMSPerDay}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Max SMS per Month</label>
                <input
                  type="number"
                  name="maxSMSPerMonth"
                  value={formData.maxSMSPerMonth}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Event-based Settings */}
        <section>
          <h4 className="font-semibold mb-3 sm:mb-4 text-green-600 text-sm sm:text-base">Event-Based Notifications</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendOnCreation"
                checked={formData.sendOnCreation}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">On Shipment Creation</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendOnStatusUpdate"
                checked={formData.sendOnStatusUpdate}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">On Status Update</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendOnDelivery"
                checked={formData.sendOnDelivery}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">On Delivery</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendOnCancellation"
                checked={formData.sendOnCancellation}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">On Cancellation</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="sendOnException"
                checked={formData.sendOnException}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">On Exception/Issue</span>
            </label>
          </div>
        </section>

        {/* Recipient Settings */}
        <section>
          <h4 className="font-semibold mb-3 sm:mb-4 text-green-600 text-sm sm:text-base">Notification Recipients</h4>
          <div className="space-y-2 sm:space-y-3">
            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="notifyBothPartiesOnCreation"
                checked={formData.notifyBothPartiesOnCreation}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">Notify Both Sender & Receiver on Creation</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="notifySenderOnStatusChange"
                checked={formData.notifySenderOnStatusChange}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">Notify Sender on Status Change</span>
            </label>

            <label className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="notifyRecipientOnStatusChange"
                checked={formData.notifyRecipientOnStatusChange}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 rounded"
              />
              <span className="text-xs sm:text-sm text-gray-700">Notify Recipient on Status Change</span>
            </label>
          </div>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-green-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center space-x-2 text-sm sm:text-base transition"
        >
          <Save className="w-4 h-4" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </form>
    </div>
  );
}
