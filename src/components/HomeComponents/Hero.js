'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config/Api';
import Image from 'next/image';

const slides = [
  {
    headline: 'Your Trusted Global Shipment Partner',
    description:
      'Our dedicated team ensures seamless and secure transportation of your cargo across the globe. We are committed to providing efficient, reliable, and stress-free logistics solutions for all your shipping needs.',
    image: 'https://via.placeholder.com/800x600?text=Global+Shipment',
    alt: 'Cargo Tracking Hero Image',
    cta: '/app/requestquote',
    buttonText: 'Request Quote',
  },
  {
    headline: 'Fast & Reliable Delivery',
    description:
      'Experience quick and safe delivery with our advanced tracking and logistics network. Your cargo is always in good hands.',
    image: 'https://via.placeholder.com/800x600?text=Fast+Delivery',
    alt: 'Fast Delivery Image',
    cta: '/app/trackshipment',
    buttonText: 'Request Quote',
  },
  {
    headline: 'Global Coverage, Local Expertise',
    description:
      'We connect continents and cities, offering tailored solutions for every shipment. Trust us for your international logistics needs.',
    image: 'https://via.placeholder.com/800x600?text=Global+Coverage',
    alt: 'Global Coverage Image',
    cta: '/',
    buttonText: 'Book Appointment',
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [slides_data, setSlides] = useState(slides);
  const [loading, setLoading] = useState(true);
  const total = slides_data.length;

  useEffect(() => {
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/hero`);
      const data = await response.json();
      if (data.length > 0) {
        setSlides(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch hero slides:', error);
      setLoading(false);
    }
  };

  const goToPrev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goToNext = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  if (loading) {
    return (
      <section className="relative bg-green-600 font-sans overflow-hidden">
        <div className="container mx-auto flex items-center justify-center py-20">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-green-600 font-sans overflow-hidden">
      {/* Left Arrow Button */}
      <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white text-green-600 rounded-full p-2 shadow hover:bg-gray-100 z-20" onClick={goToPrev} aria-label="Previous Slide">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
      </button>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-12 lg:py-20 px-4">
        {/* Left Section: Text Content */}
        <div className="lg:w-1/2 w-full bg-green-600 text-white p-8 lg:p-6 rounded-lg flex flex-col justify-center relative z-10">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
            {slides_data[current].headline}
          </h1>
          <p className="text-lg lg:text-xl mb-8 opacity-90">
            {slides_data[current].description}
          </p>
          <Link href={slides_data[current].cta} className="flex items-center justify-center px-8 py-4 bg-white text-green-600 font-bold rounded-full shadow-md hover:bg-gray-100 transition duration-300 ease-in-out self-start">
            {slides_data[current].buttonText}
            <svg
              className="ml-3 w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              ></path>
            </svg>
          </Link>
        </div>

        {/* Right Section: Image */}
        <div className="hidden md:block lg:w-1/2 w-full mt-8 lg:mt-0 lg:ml-12 relative">
          <Image
            src={slides_data[current].image}
            alt={slides_data[current].alt}
            width={800}
            height={600}
            className="rounded-lg shadow-lg w-full h-auto object-cover transition-all duration-700"
          />
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-green-600 opacity-10 rounded-lg pointer-events-none"></div>
        </div>
      </div>
      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-2 z-30">
        {slides_data.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${current === idx ? 'bg-green-600 scale-125' : 'bg-gray-300'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
      {/* Right Arrow Button */}
      <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white text-green-600 rounded-full p-2 shadow hover:bg-gray-100 z-20"
        onClick={goToNext} aria-label="Next Slide">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
      </button>
    </section>
  );
}
