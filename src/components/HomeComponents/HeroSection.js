'use client';

import React, { useEffect, useRef, useState } from 'react';

// Note: This component is client-side and uses Tailwind classes.

import Link from 'next/link';
import { API_BASE_URL } from '@/config/Api';
import Image from 'next/image';

const fallbackSlides = [
  {
    headline: 'Your Trusted Global Shipment Partner',
    description:
      'Our dedicated team ensures seamless and secure transportation of your cargo across the globe. We are committed to providing efficient, reliable, and stress-free logistics solutions for all your shipping needs.',
    image: '/img/esmologhero1.jpeg',
    alt: 'Cargo Tracking Hero Image',
    cta: '/request-quote',
    buttonText: 'Request Quote',
  },
  {
    headline: 'Fast & Reliable Delivery',
    description:
      'Experience quick and safe delivery with our advanced tracking and logistics network. Your cargo is always in good hands.',
    image: '/img/esmologhero2.jpeg',
    alt: 'Fast Delivery Image',
    cta: '/request-quote',
    buttonText: 'Request Quote',
  },
  {
    headline: 'Global Coverage, Local Expertise',
    description:
      'We connect continents and cities, offering tailored solutions for every shipment. Trust us for your international logistics needs.',
    image: '/img/esmologhero3.jpeg',
    alt: 'Global Coverage Image',
    cta: '/request-quote',
    buttonText: 'Request Quote',
  },
];

const AUTOPLAY_MS = 6500;

export default function HeroSection() {
  const [slides, setSlides] = useState(fallbackSlides);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = slides.length;
  const active = total > 0 ? slides[current] : null;

  const intervalRef = useRef(null);

  const canAutoplay = total > 1;

  const clampCurrent = (idx) => {
    if (!total) return 0;
    return Math.max(0, Math.min(idx, total - 1));
  };

  useEffect(() => {
    let mounted = true;

    const fetchHeroSlides = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/hero`);
        const data = await response.json();

        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setSlides(data);
          setCurrent((prev) => clampCurrent(prev));
        }
      } catch (error) {
        // If API fails, keep fallback slides.
        console.error('Failed to fetch hero slides:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHeroSlides();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!canAutoplay) return;

    // Respect reduced motion.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) return;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));
    }, AUTOPLAY_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [canAutoplay, isPaused, total]);

  // Keep index valid if slides change.
  useEffect(() => {
    if (!total) return;
    setCurrent((prev) => clampCurrent(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  const goToPrev = () => setCurrent((prev) => (prev === 0 ? total - 1 : prev - 1));
  const goToNext = () => setCurrent((prev) => (prev === total - 1 ? 0 : prev + 1));

  const indicators = slides.map((_, idx) => idx);

  if (loading && (!active || total === 0)) {
    return (
      <section className="relative bg-green-600 font-sans overflow-hidden">
        <div className="container mx-auto flex items-center justify-center py-20 px-4">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative bg-green-600 font-sans overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
    >
      {/* background ornaments */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute top-16 -right-28 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/10 to-transparent" />
      </div>

      {/* Left/Right buttons */}
      <button
        type="button"
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 rounded-full p-2 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 z-20 transition"
        onClick={goToPrev}
        aria-label="Previous Slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 rounded-full p-2 shadow-md hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 z-20 transition"
        onClick={goToNext}
        aria-label="Next Slide"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between py-12 lg:py-20 px-4 relative z-10">
        {/* Text */}
        <div className="lg:w-1/2 w-full">
          <div className="bg-green-700/25 backdrop-blur-sm border border-white/15 text-white p-8 lg:p-8 rounded-2xl shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)]">
            <div
              className="transition-opacity duration-500"
              key={active?.headline}
            >
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6">
                {active?.headline}
              </h1>
              <p className="text-lg lg:text-xl mb-8 opacity-95">
                {active?.description}
              </p>

              <Link
                href={active?.cta || '/request-quote'}
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 font-bold rounded-full shadow-md hover:bg-gray-100 transition duration-300 ease-in-out self-start focus:outline-none focus:ring-2 focus:ring-white/70"
                aria-label={active?.buttonText || 'Request Quote'}
              >
                {active?.buttonText || 'Request Quote'}
                <svg
                  className="ml-3 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="hidden md:block lg:w-1/2 w-full mt-8 lg:mt-0 lg:ml-12 relative">
          <div className="relative rounded-2xl overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent z-10" />
            {active?.image ? (
              <Image
                src={active.image}
                alt={active?.alt || 'Hero slide'}
                width={900}
                height={700}
                priority={current === 0}
                className="w-full h-auto object-cover transition-transform duration-700 ease-out hover:scale-[1.02]"
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Indicators */}
      {total > 1 ? (
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-2 z-30">
          {indicators.map((idx) => {
            const activeDot = idx === current;
            return (
              <button
                key={idx}
                type="button"
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/70 ${
                  activeDot ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'
                }`}
                onClick={() => {
                  setCurrent(idx);
                  setIsPaused(true);
                }}
                onMouseDown={() => setIsPaused(true)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={activeDot ? 'true' : 'false'}
              />
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

