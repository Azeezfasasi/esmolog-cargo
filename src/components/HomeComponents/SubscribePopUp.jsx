'use client';

import React, { useState, useEffect } from 'react';
import SubscribeNowPopup from './SubscribeNowPopup';
import Image from 'next/image';

export const SubscribePopUp = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show for first time visitors
    const hasSeenPopup = localStorage.getItem('adesolaNewsletterPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setOpen(true);
        localStorage.setItem('adesolaNewsletterPopup', 'true');
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => setOpen(false);
  return (
    <>
      {open && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg shadow-lg p-8 max-w-md w-full'>
            <div className='flex flex-col items-center'>
                <Image src="/img/esmologtrans.png" alt="Newsletter image" width={120} height={120} />
                <div className='text-center font-semibold text-[26px] mb-3'>Subscribe to newsletter</div>
                <div className='text-center text-sm text-gray-600'>Enter your email to get the update on ESMOLOG Cargo and Logistics&apos;s hottest deals, exclusive offers, early access to shipments and more.<br />Don&apos;t miss out</div>
                <div className='w-full mt-2 mb-3'>
                    <SubscribeNowPopup />
                </div>
                <button 
                  onClick={handleClose}
                  className='bg-orange-700 text-white py-2 px-6 rounded-md hover:bg-orange-800 transition'
                >
                  Close
                </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
