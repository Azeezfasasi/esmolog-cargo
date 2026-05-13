'use client';

import React, { useState, useEffect } from 'react'
import Marquee from 'react-fast-marquee'
import { API_BASE_URL } from '@/config/Api'

export default function MessageSlides() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/message-slides`)
        if (!response.ok) throw new Error(`Failed to fetch messages: ${response.status}`)
        const data = await response.json()
        setMessages(data.data || [])
      } catch (err) {
        setError(err.message)
        console.error('Error fetching messages:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
    const interval = setInterval(fetchMessages, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="animate-pulse text-gray-400">Loading messages...</div>
      </div>
    )
  }

  if (error || messages.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-gradient-to-r from-green-600 via-green-600 to-red-600 py-0 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
          <span className="text-white text-sm font-semibold uppercase tracking-wide">Live Updates</span>
        </div>
        
        <Marquee
          gradient={true}
          gradientColor={[25, 118, 210]}
          speed={50}
          pauseOnHover={true}
          className="py-2 overflow-y-hidden"
        >
          {messages.map((message, index) => (
            <div
              key={message._id || index}
              className="flex items-center gap-6 px-8"
            >
              <div className="flex items-center gap-3 whitespace-nowrap">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-bold text-sm md:text-base leading-tight">
                    {message.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  )
}
