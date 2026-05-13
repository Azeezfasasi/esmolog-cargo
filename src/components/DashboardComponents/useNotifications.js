'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useProfile } from '../context-api/ProfileContext';

const useNotifications = () => {
  const { token } = useProfile();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!token) {
          setLoading(false);
          return;
        }

        setLoading(true);

        // Fetch pending registrations
        const registrationsRes = await axios.get('/api/programmes/registrations?status=pending');
        const registrations = registrationsRes.data.registrations || [];

        // Combine notifications (only registrations for now)
        const combinedNotifications = [
          ...registrations.map(reg => ({
            id: `registration-${reg._id}`,
            type: 'registration',
            title: 'Pending Programme Registration',
            message: `Registration from ${(reg.firstName && reg.lastName) ? `${reg.firstName} ${reg.lastName}` : 'Unknown'} for ${reg.programmeName || 'Unknown Programme'}`,
            time: new Date(reg.registeredAt).toLocaleDateString(),
            link: '/dashboard/programme-registration-list',
            icon: '📝',
          })),
        ];

        // Sort by most recent
        combinedNotifications.sort(
          (a, b) => new Date(b.time) - new Date(a.time)
        );

        setNotifications(combinedNotifications.slice(0, 10)); // Show last 10
        setUnreadCount(combinedNotifications.length);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        // Don't set error state - just log it and continue with empty notifications
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
  };
};

export default useNotifications;
