'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';

export default function PeopleToKnow() {
  const [content, setContent] = useState({
    title: 'PEOPLE TO KNOW',
    subtitle: 'Building connections is vital to your MBA experience. Get to know the key people who will support you throughout your studies',
    people: [
      'Coordinator of MBA Program',
      'Dean of Post Graduate School',
      'Program Secretary',
      'LASUMBA Executives',
      'GBENUSI Community',
    ],
  });

  useEffect(() => {
    fetchContent('people')
      .then((data) => data && setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  return (
    <div id="people" className="flex flex-col items-start justify-center relative overflow-hidden pt-[40px] pb-[10px] md:pb-[40px] bg-gray-100">
      <div className="w-full lg:w-[50%] flex flex-col items-center justify-start mx-auto">
        <div className="static">
          <div className="playwrite-text text-[#303a42] text-center font-['Poppins-Bold',_sans-serif] text-[20px] lg:text-[25px] font-bold">
            {content.title}
          </div>
        </div>
        <div
          className="lg:w-[70%] text-[rgba(48,58,66,0.80)] text-center font-['Inter-Regular',_sans-serif] text-[15px] leading-[30px] font-normal"
          style={{ letterSpacing: '0.02em' }}
        >
          {content.subtitle}
        </div>
      </div>

      <div className="w-[97%] lg:w-[40%] shadow-md pl-3 mx-auto mt-[20px] mb-[20px] rounded-md border border-solid border-gray-200">
        {content.people?.map((person, index) => (
          <div key={index} className="w-[100%] flex flex-row items-center justify-center gap-1 mx-auto my-3">
            <Image src="/images/check.svg" alt="check" width={32} height={32} className="w-8 h-8" />
            <div className="w-full text-[#000000] text-left font-['Inter-Regular',_sans-serif] text-lg leading-[30px] font-normal">
              {person}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

