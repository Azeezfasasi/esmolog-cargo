'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchContent } from '@/lib/api';

export default function Hero() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent('hero')
      .then(data => setContent(data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div className="h-[580px] bg-gray-800 animate-pulse" />;
  }

  const data = content || {
    title: 'LASU MBA ONBOARDING TOOLKIT',
    subtitle: 'Dear Managers, welcome to the LASU MBA community!',
    description: "It's Not Just About Academics\nYou'll get far more from networking, collaborations, side projects, and informal meetups than from textbooks. Your classmates are CEOs, Consultants, and policymakers, connect wisely.",
    button1Text: 'Important Steps',
    button1Target: 'steps',
    button2Text: 'People To Know',
    button2Target: 'people',
    backgroundImage: '/images/hero3.jpg',
  };

  const bgImage = data.backgroundImage?.startsWith('http') 
    ? data.backgroundImage 
    : data.backgroundImage || '/images/hero3.jpg';

  return (
    <div id="home" className="flex flex-row items-center relative h-fit lg:h-[580px] w-full overflow-hidden py-5">
      <div className="absolute inset-0 z-0">
        <Image
          src={bgImage}
          alt="Hero background"
          fill
          className="object-cover object-top"
          priority
        />
      </div>
      
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      <div className="flex flex-col items-center justify-center mx-auto h-fit p-2 relative z-10">
        <div className="w-full lg:w-[1120px] flex flex-col items-center justify-start gap-5 mx-auto pt-5 lg:pt-0">
          <h1 className="text-yellow-400 text-center font-bold text-3xl lg:text-5xl">
            {data.title}
          </h1>
          <p className="text-white text-center text-base lg:text-xl font-normal">
            {data.subtitle}
          </p>
          <p className="text-white text-center text-base lg:text-xl font-normal whitespace-pre-line">
            {data.description}
          </p>
        </div>

        <div className="w-full flex flex-col lg:flex-row items-center justify-center gap-6 mt-10">
          <button
            onClick={() => scrollTo(data.button1Target || 'steps')}
            className="rounded-xl pt-2.5 md:pt-5 px-10 pb-2.5 md:pb-5 flex flex-row gap-2.5 items-start justify-start cursor-pointer bg-amber-500 hover:bg-amber-600 transition-colors"
          >
            <span className="text-white text-left text-lg font-bold">
              {data.button1Text || 'Important Steps'}
            </span>
          </button>

          <button
            onClick={() => scrollTo(data.button2Target || 'people')}
            className="rounded-xl border-2 border-solid border-yellow-500 pt-2.5 md:pt-5 px-10 pb-2.5 md:pb-5 flex flex-row gap-2.5 items-start justify-start cursor-pointer hover:bg-yellow-500/10 transition-colors"
          >
            <span className="text-white text-left text-lg font-bold">
              {data.button2Text || 'People To Know'}
            </span>
          </button>
        </div>
        </div>
    </div>
  );
}
