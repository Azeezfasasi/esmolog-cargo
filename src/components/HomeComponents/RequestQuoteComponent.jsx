import React from 'react';
import ContactForm from './RequestQuoteForm';

export default function RequestQuoteComponent() {
  return (
    <section className="bg-white font-sans pb-16 px-0">
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-green-700 to-green-600 py-14 md:py-16">
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top,white_0%,transparent_55%)]" />
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-start gap-3">
            <p className="inline-flex items-center gap-2 text-white/90 text-sm uppercase tracking-widest">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                {/* mail icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16v16H4z" opacity="0" />
                  <path d="M4 4h16v16H4z" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </span>
              Get a free quote
            </p>

            <h2 className="text-3xl text-white md:text-4xl font-extrabold">
              REQUEST A QUOTE
            </h2>

            <div className="h-1 w-20 rounded-full bg-white/60" />
            <p className="text-white/85 max-w-2xl">
              Tell us what you’re shipping and we’ll get back to you with the best options for your route and timeline.
            </p>
          </div>
        </div>
      </div>

      <div className="container w-full lg:w-[60%] mx-auto px-4 mt-10">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_25px_70px_-40px_rgba(16,185,129,0.35)] overflow-hidden">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

