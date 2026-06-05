import { MapIcon, MapPin, PhoneCall } from 'lucide-react';
import React from 'react';

function ContactInfo() {
  return (
    <>
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
            Contact Us
          </p>

          <h2 className="text-3xl text-white md:text-4xl font-extrabold">
            We&apos;d love to hear from you
          </h2>

          <div className="h-1 w-20 rounded-full bg-white/60" />
          <p className="text-white/85 max-w-2xl">
            Tell us what you&apos;re shipping and we&apos;ll get back to you with the best options for your route and timeline.
          </p>
        </div>
      </div>
    </div>
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          Contact us
        </h2>
        {/* Descriptive Paragraph */}
        <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed mb-12">
          Have a question or just want to say hi? Don&apos;t bother, we&apos;d love to hear from you.
        </p>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Option 1: Email */}
          <div className="flex flex-col items-center text-center p-6">
            {/* Icon Circle */}
            <div className="mb-6 p-5 rounded-full bg-blue-50 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Email
            </h3>
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-4">
              Email us for help with a current shipping or service
            </p>
            {/* Link */}
            <a href="mailto:info@esmologworldwide.com" className="text-green-600 hover:underline font-semibold">
              info@esmologworldwide.com
            </a>
          </div>

          {/* Option 2: Call */}
          <div className="flex flex-col items-center text-center p-6">
            {/* Icon Circle */}
            <div className="mb-6 p-5 rounded-full bg-blue-50 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Call
            </h3>
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-4">
              Call us to speak to our team.
            </p>
            {/* Link */}
            <a href="tel:+2349092450673" className="text-green-600 hover:underline font-semibold">
              +234 909 245 0673, +234 913 008 9643
            </a>
          </div>

          {/* Option 3: Help & Support */}
          <div className="flex flex-col items-center text-center p-6">
            {/* Icon Circle */}
            <div className="mb-6 p-5 rounded-full bg-blue-50 text-green-600">
              <MapPin className='w-9 h-9' />
            </div>
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Office Address
            </h3>
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-4 flex items-center gap-2">
              27, Alimi Bada Str., Oke-ta, Isolo, Lagos
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Warehouse Address
            </h3>
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-4 flex items-start gap-2">
              4000 Bordentown Avenue, Sayreville, New Jersey 08872
            </p>
            {/* Button */}
            {/* <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
              Support Center
            </button> */}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}

export default ContactInfo;
