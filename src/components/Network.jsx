'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';

export default function Network() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('network')
      .then(data => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[400px] bg-white animate-pulse" />;
  }

  const data = content || {
    title: 'Your MBA network starts now, engage with your community from the start.',
    subtitle: 'Below are upcoming important events:',
    events: [
      'LASUMBA Election: Participate in the voting process to choose the right team for your needs. AL-AMEEN has the capacity to show!',
      'MBA Orientation Program: Participate in this event that is organized and designed to welcome and integrate new students into the LASU MBA program.',
      'Get involved and expand your network by joining LASUMBA and GBENUSI Community.',
    ],
    quote: 'As you begin this journey, remember to "enjoy the journey, not just the destination." The future is in our hands and AL-AMEEN is committed to making this MBA experience smoother for everyone.',
  };

  const events = data.events || [];

  return (
    <>
      <div id="network" className="flex flex-col items-start justify-center relative overflow-hidden pt-12">
        <div className="w-[95%] lg:w-[70%] flex flex-col items-center justify-start mx-auto">
          <h2 className="playwrite-text text-[#303a42] text-center font-bold text-xl lg:text-2xl">
            {data.title}
          </h2>
          <p className="text-[rgba(48,58,66,0.80)] text-center text-[15px] leading-[30px] font-normal tracking-wide">
            {data.subtitle}
          </p>
        </div>
        
        <div className="w-[95%] lg:w-[50%] shadow-md px-3 py-6 mx-auto mt-5 mb-5 rounded-md border border-solid border-gray-200 flex flex-col items-start justify-start gap-0 bg-white">
          {events.map((event, index) => (
            <div key={index} className="w-full flex flex-row items-start justify-center gap-4 mx-auto my-3">
              <Image src="/images/event.svg" alt="event" width={32} height={32} className="w-8 h-8 flex-shrink-0 mt-1" />
              <div className="w-full text-black text-left text-[15px] lg:text-lg leading-[30px] font-normal">
                {typeof event === 'string' ? event : event.text || event.title || JSON.stringify(event)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7.5 mb-7.5">
        <blockquote className="text-[#303a42] text-center text-xl lg:text-2xl font-bold relative w-[90%] italic mx-auto">
          {data.quote}
        </blockquote>
      </div>
    </>
  );
}

