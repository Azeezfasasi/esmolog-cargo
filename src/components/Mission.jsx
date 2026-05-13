'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';

export default function Mission() {
  const [content, setContent] = useState({
    title: 'MISSION',
    heading: 'LASU MBA COMMUNITY',
    description: `We're thrilled to have you join us on this exciting journey and as you embark on this transformative and exciting experience, we want you to know that you're not alone. You're part of a vibrant community of like-minded individuals who are passionate about learning, growth, making positive impact and ready to support and inspire each other.`,
    image: '/images/mission.svg',
  });

  useEffect(() => {
    fetchContent('mission')
      .then((data) => data && setContent((prev) => ({ ...prev, ...data })))
      .catch(() => {});
  }, []);

  return (
    <div id="mission" className="flex flex-row items-center justify-center mx-auto shadow-md px-2 bg-[#f7f8fa] pt-5 md:pt-10 pb-10">
      <div className="flex flex-col lg:flex-row items-center justify-center bg-[#f7f8fa] mx-auto px-3">
        <div className="w-[95%] lg:w-[50%] static">
          <div className="w-full lg:w-[409px] h-[98px] flex flex-col items-center lg:items-start justify-center">
            <div className="text-yellow-500 text-center font-['Poppins-Regular',_sans-serif] text-[25px] font-normal">
              {content.title}
            </div>
            <div className="text-[#303a42] text-center font-['Poppins-Bold',_sans-serif] text-[25px] lg:text-[25px] font-bold">
              {content.heading}
            </div>
          </div>
          <div className="text-[#303a42] font-['Inter-Regular',_sans-serif] text-[15px] leading-[35px] font-normal text-justify">
            {content.description}
          </div>
        </div>
        <div className="flex flex-row items-center justify-center mb-[-70px] h-fit">
          <Image src={content.image} alt="Mission" width={500} height={400} className="w-full" />
        </div>
      </div>
    </div>
  );
}

