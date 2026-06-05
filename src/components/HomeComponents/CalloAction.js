import React from 'react';
;
import Link from 'next/link';
import Image from 'next/image';

export default function CallToAction() {
  return (
    <section className="relative bg-white font-sans py-12 md:py-20">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center bg-gray-100 rounded-lg shadow-xl overflow-hidden">
        {/* Left Section: Image */}
        <div className="lg:w-1/2 w-full relative">
          <Image
            width={600}
            height={400}
            src="/img/cta1.png"
            alt="Warehouse worker checking inventory"
            className="w-full h-64 md:h-96 lg:h-full object-cover rounded-l-lg lg:rounded-r-none"
          />
          {/* Optional: Add an overlay or shape to mimic the circular cut if desired, though a full image is simpler with Tailwind */}
        </div>

        {/* Right Section: Text Content */}
        <div className="lg:w-1/2 w-full p-8 md:p-12 lg:p-16 flex flex-col justify-center text-center lg:text-left">
          <h3 className="text-sm uppercase tracking-widest text-gray-600 mb-2">GET A QUOTE</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {`WHAT'S`} YOUR SHIPPING NEED?
          </h2>
          <div className="w-20 h-1 bg-green-600 mx-auto lg:mx-0 mb-6 rounded-full"></div>
          <p className="text-gray-700 text-lg mb-8">
            Need a custom solution to make your supply chain faster, leaner, and more efficient? Drop us a line and {`we'll`} provide you with a custom quote tailored to your cargo shipment requirements!
          </p>
          <Link href="/app/requestquote" className="px-8 py-4 bg-green-600 text-white font-bold rounded-full shadow-md hover:bg-green-700 transition duration-300 ease-in-out self-center lg:self-start cursor-pointer">
            REQUEST A QUOTE
          </Link>
        </div>
      </div>
    </section>
  );
}
