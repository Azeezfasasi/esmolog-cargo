'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE_URL } from '@/config/Api';

function PrayerCard({ prayer, isAuthenticated, formatTimestamp }) {
  const queryClient = useQueryClient();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const replyInputRef = useRef(null);

  // Focus on reply input when it appears
  useEffect(() => {
    if (showReplyInput && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [showReplyInput]);

  // --- React Query Mutations for PrayerCard actions ---

  // Like/Unlike Mutation
  const likePrayerMutation = useMutation({
    mutationFn: async (prayerId) => {
      const response = await axios.post(`${API_BASE_URL}/prayer-requests/${prayerId}/like`);
      return response.data;
    },
    onMutate: async (prayerId) => {
      await queryClient.cancelQueries({ queryKey: ['allPrayerRequests'] });
      const previousPrayers = queryClient.getQueryData(['allPrayerRequests']);
      queryClient.setQueryData(['allPrayerRequests'], (old) =>
        old ? old.map(p => {
          if (p._id === prayerId) {
            const newLikesCount = p.likes + 1;
            return { ...p, likes: newLikesCount };
          }
          return p;
        }) : []
      );
      return { previousPrayers };
    },
    onError: (err, newPrayerId, context) => {
      console.error('Error liking prayer:', err);
      queryClient.setQueryData(['allPrayerRequests'], context.previousPrayers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] });
    },
  });

  // Pray For Mutation
  const prayForPrayerMutation = useMutation({
    mutationFn: async (prayerId) => {
      const response = await axios.post(`${API_BASE_URL}/prayer-requests/${prayerId}/pray`);
      return response.data;
    },
    onMutate: async (prayerId) => {
      await queryClient.cancelQueries({ queryKey: ['allPrayerRequests'] });
      const previousPrayers = queryClient.getQueryData(['allPrayerRequests']);
      queryClient.setQueryData(['allPrayerRequests'], (old) =>
        old ? old.map(p => {
          if (p._id === prayerId) {
            const newPrayCount = p.prayCounter + 1;
            return { ...p, prayCounter: newPrayCount };
          }
          return p;
        }) : []
      );
      return { previousPrayers };
    },
    onError: (err, newPrayerId, context) => {
      console.error('Error praying for request:', err);
      queryClient.setQueryData(['allPrayerRequests'], context.previousPrayers);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] });
    },
  });

  // Reply Mutation
  const replyToPrayerMutation = useMutation({
    mutationFn: async ({ prayerId, message }) => {
      const response = await axios.post(`${API_BASE_URL}/prayer-requests/${prayerId}/reply`, { message });
      return response.data;
    },
    onSuccess: () => {
      setReplyText('');
      setShowReplyInput(false);
      queryClient.invalidateQueries({ queryKey: ['allPrayerRequests'] }); // Refetch to show new reply
    },
    onError: (err) => {
      console.error('Error replying to prayer:', err);
    },
  });

  const authorName = prayer.user?.name || 'Anonymous';
  const hasLiked = false; 
  const hasPrayed = false;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Display the category here */}
          <p className="text-sm font-semibold text-orange-600 uppercase">{prayer.category || 'General'}</p>
          <h3 className="text-xl font-bold text-gray-900 mt-1">{authorName}</h3>
        </div>
        <p className="text-xs text-gray-500">
          {formatTimestamp(prayer.createdAt)}
        </p>
      </div>
      <p className="text-gray-700 leading-relaxed mb-4">
        {prayer.request}
      </p>

      {isAuthenticated && (
        <div className="flex items-center space-x-4 border-t border-gray-200 pt-4">
          {/* Like Button */}
          <button
            onClick={() => likePrayerMutation.mutate(prayer._id)}
            className={`flex items-center text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
              hasLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${likePrayerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={likePrayerMutation.isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${hasLiked ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Like ({prayer.likes})
          </button>

          {/* Pray Button */}
          <button
            onClick={() => prayForPrayerMutation.mutate(prayer._id)}
            className={`flex items-center text-sm font-medium px-3 py-1 rounded-full transition-colors duration-200 ${
              hasPrayed ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            } ${prayForPrayerMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={prayForPrayerMutation.isPending}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-1 ${hasPrayed ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M12 20.5V10.75M4.257 14.16a8 8 0 1015.486 0M12 13a3 3 0 100-6 3 3 0 000 6z" />
            </svg>
            Pray ({prayer.prayCounter})
          </button>

          {/* Reply Button */}
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center text-sm font-medium px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Reply
          </button>
        </div>
      )}

      {/* Reply Input Form */}
      {showReplyInput && isAuthenticated && (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (!replyText.trim()) {
            replyToPrayerMutation.reset();
            replyToPrayerMutation.error = { response: { data: { message: "Reply cannot be empty." } } };
            return;
          }
          replyToPrayerMutation.mutate({ prayerId: prayer._id, message: replyText });
        }} className="mt-4 pt-4 border-t border-gray-200">
          {replyToPrayerMutation.isError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md mb-3 text-sm" role="alert">
              {replyToPrayerMutation.error.response?.data?.message || 'Failed to post reply.'}
            </div>
          )}
          <textarea
            ref={replyInputRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply here..."
            rows="2"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y mb-3 text-sm"
          ></textarea>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg text-sm hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={replyToPrayerMutation.isPending}
          >
            {replyToPrayerMutation.isPending ? 'Sending...' : 'Post Reply'}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowReplyInput(false);
              setReplyText('');
              replyToPrayerMutation.reset();
            }}
            className="ml-2 px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg text-sm hover:bg-gray-300 transition duration-200"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Display Replies */}
      {prayer.replies && prayer.replies.length > 0 && (
        <div className="mt-4 border-t border-gray-200 pt-4">
          <h4 className="text-md font-semibold text-gray-800 mb-3">Replies:</h4>
          <div className="space-y-3">
            {prayer.replies
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map((reply) => (
                <div key={reply._id} className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                  <p className="text-gray-700">{reply.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Replied by <span className="font-medium">{reply.user?.name || 'Anonymous'}</span> on {formatTimestamp(reply.date)}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PrayerCard;
