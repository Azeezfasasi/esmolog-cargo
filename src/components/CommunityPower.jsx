'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';

export default function CommunityPower() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('community')
      .then(data => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-[400px] bg-gray-50 animate-pulse" />;
  }

  const data = content || {
    title: 'The Power of Community and Collaboration',
    description: 'At LASU MBA, we believe that community and collaboration are the keys to success. By working together, sharing ideas, and supporting one another, we can achieve great things. Our community is built on the principles of mutual respect, trust and a shared passion for excellence.\n\nAs AL-AMEEN always says, "Leadership starts with service." We\'re committed to creating an environment where you can grow, learn, and thrive. Whether you\'re looking for academic support, career guidance, or simply a friendly ear, we\'re here for you.',
    image: '/images/lasu.jpg',
  };

  const imageSrc = data.image?.startsWith('http') ? data.image : data.image || '/images/lasu.jpg';

  return (
    <div id="community" className="mt-[0px] border border-solid border-gray-200 pt-10">
      <h2 className="playwrite-text text-[#303a42] text-center text-[20px] lg:text-[25px] font-bold px-4">
        {data.title}
      </h2>
      <div className="w-[95%] flex flex-col lg:flex-row items-center justify-start gap-8 mx-auto mt-[20px] mb-[50px]">
        <div className="w-full lg:w-[50%]">
          <Image
            className="w-full rounded-md"
            src={imageSrc}
            alt="Community"
            width={600}
            height={400}
          />
        </div>
        <div>
          <div className="w-full lg:w-[647px]">
            <p className="text-[#303a42] text-justify text-[15px] leading-[35px] font-normal w-full lg:w-[647px] whitespace-pre-line">
              {data.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

