import React from 'react';

export default function ContactFormDetailModal({ contact, onClose }) {
  if (!contact) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Quote Request Details</h3>
          <button onClick={onClose} className="text-red-600 font-bold hover:text-gray-900 cursor-pointer">Close</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-800">
          <div><strong>Name:</strong> {contact.name || 'N/A'}</div>
          <div><strong>Email:</strong> {contact.email || 'N/A'}</div>
          <div><strong>Phone:</strong> {contact.phoneNumber || 'N/A'}</div>
          <div><strong>Status:</strong> {contact.status || 'N/A'}</div>
          <div><strong>Shipping Type:</strong> {contact.shippingType || 'N/A'}</div>
          <div><strong>Origin Country:</strong> {contact.originCountry || 'N/A'}</div>
          <div><strong>Destination Country:</strong> {contact.destinationCountry || 'N/A'}</div>
          <div><strong>Weight:</strong> {contact.weight || 'N/A'}</div>
          <div><strong>Length:</strong> {contact.length || 'N/A'}</div>
          <div><strong>Width:</strong> {contact.width || 'N/A'}</div>
          <div><strong>Height:</strong> {contact.height || 'N/A'}</div>
          
          {contact.replies && contact.replies.length > 0 && (
            <div>
              <h4 className="font-semibold">Replies</h4>
              <ul className="list-disc list-inside mt-2 space-y-1 text-xs text-gray-700">
                {contact.replies.map((r, i) => (
                  <li key={i}>
                    <div><strong>{r.userName || r.user || 'User'}</strong> <span className="text-gray-500 text-xs">({new Date(r.timestamp).toLocaleString()})</span></div>
                    <div className="text-gray-700">{r.message}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div><strong>Received At:</strong> {new Date(contact.createdAt).toLocaleString()}</div>
          <div><strong>Updated At:</strong> {contact.updatedAt ? new Date(contact.updatedAt).toLocaleString() : 'N/A'}</div>
        </div>
        <div className='mt-3'>
            <div className='text-green-700'><strong>Message:</strong></div>
            <div className="p-3 bg-gray-50 rounded border">{contact.message || 'N/A'}</div>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">Close</button>
        </div>
      </div>
    </div>
  );
}
