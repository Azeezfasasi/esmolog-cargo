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

        // Fetch all notifications (registrations, prayer requests, shipments, subscribers)
        let allNotifications = [];

        try {
          const registrationsRes = await axios.get('/api/programmes/registrations?status=pending');
          const registrations = registrationsRes.data.registrations || [];

          allNotifications.push(...registrations.map(reg => ({
            id: `registration-${reg._id}`,
            type: 'registration',
            title: 'Pending Programme Registration',
            message: `Registration from ${(reg.firstName && reg.lastName) ? `${reg.firstName} ${reg.lastName}` : 'Unknown'} for ${reg.programmeName || 'Unknown Programme'}`,
            time: new Date(reg.registeredAt).toLocaleDateString(),
            link: '/dashboard/programme-registration-list',
            icon: '📝',
          })));
        } catch (err) {
          console.warn('Error fetching programme registrations:', err);
        }

        try {
          const notificationsRes = await axios.get('/api/notifications');
          const data = notificationsRes.data.data || {};

          // Add prayer requests
          if (data.prayerRequests && Array.isArray(data.prayerRequests)) {
            allNotifications.push(...data.prayerRequests.map(prayer => ({
              id: `prayer-${prayer._id}`,
              type: 'prayer-request',
              title: 'New Prayer Request',
              message: `${prayer.user?.name || 'Unknown'} submitted a prayer request: "${prayer.request.substring(0, 50)}${prayer.request.length > 50 ? '...' : ''}"`,
              time: new Date(prayer.createdAt).toLocaleDateString(),
              link: '/dashboard/allposts', // Adjust link as needed
              icon: '🙏',
            })));
          }

          // Add shipment status updates
          if (data.shipments && Array.isArray(data.shipments)) {
            allNotifications.push(...data.shipments.flatMap(shipment => {
              return (shipment.trackingHistory || []).map(history => ({
                id: `shipment-${shipment._id}-${history.timestamp}`,
                type: 'shipment-update',
                title: 'Shipment Status Updated',
                message: `Tracking #${shipment.trackingNumber}: Status changed to "${history.status}"${history.location ? ` - ${history.location}` : ''}`,
                time: new Date(history.timestamp).toLocaleDateString(),
                link: '/dashboard/myshipments',
                icon: '📦',
              }));
            }).slice(0, 5)); // Limit to 5 most recent
          }

          // Add subscriber changes
          if (data.subscribers && Array.isArray(data.subscribers)) {
            allNotifications.push(...data.subscribers.map(subscriber => ({
              id: `subscriber-${subscriber._id}`,
              type: 'subscription-change',
              title: subscriber.isSubscribed ? 'New Newsletter Subscriber' : 'Newsletter Unsubscribe',
              message: `${subscriber.email} ${subscriber.isSubscribed ? 'subscribed to' : 'unsubscribed from'} the newsletter${subscriber.name ? ` (${subscriber.name})` : ''}`,
              time: new Date(subscriber.updatedAt).toLocaleDateString(),
              link: '/dashboard/allnewsletter',
              icon: subscriber.isSubscribed ? '📧' : '❌',
            })));
          }
        } catch (err) {
          console.warn('Error fetching API notifications:', err);
        }

        // Sort by most recent (using time as proxy)
        allNotifications.sort((a, b) => {
          const timeA = new Date(a.time || 0).getTime();
          const timeB = new Date(b.time || 0).getTime();
          return timeB - timeA;
        });

        setNotifications(allNotifications.slice(0, 10)); // Show last 10
        setUnreadCount(allNotifications.length);
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
