'use client';

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function ReplyModal({ shipment, onSendReply, onClose }) {
  const [message, setMessage] = useState('');

  const hasReplies = Boolean(shipment?.replies?.length);


  useEffect(() => {
    setMessage('');
  }, [shipment]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendReply({ shipmentId: shipment._id, message });
    onClose();
  };

  return (
    <div className="space-y-4 max-h-[90vh] overflow-y-auto p-2">
      <h2 className="text-lg font-semibold text-orange-600">Reply to Shipment Message</h2>
      <p className="text-sm text-muted-foreground">
        Add a reply or internal note related to this shipment:
      </p>

      {/* Reply Input */}
      <Textarea
        placeholder="Type your reply here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} className="bg-orange-500 text-white hover:bg-orange-700">
          Cancel
        </Button>
        <Button variant="outline" onClick={handleSend} className="bg-green-600 text-white hover:bg-green-700">
          Send Reply
        </Button>
      </div>

      {/* Replies List */}
      {shipment.replies?.length > 0 && (
        <div className="pt-4">
          <h3 className="text-md text-orange-600 font-medium mb-2">Previous Replies</h3>
          <div className="space-y-3">
            
            {shipment.replies.map((reply, index) => (
              <div
                key={reply._id || index}
                className="border border-orange-200 shadow-sm rounded p-3 bg-muted"
              >
                <div className="text-sm">{reply.message}</div>
                <div className="text-xs text-muted-foreground mt-1">
                    {reply.user?.name && <span>{reply.user.name} • </span>}
                    {reply.timestamp
                        ? formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })
                        : 'Time unknown'}

                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
