import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

function Worship() {
  return (
    <section className="py-0 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Top Section: Sub-headline, Headline, Description, Button */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-2">
          WORSHIP WITH US
        </h2>
        <p className="text-sm uppercase tracking-widest text-gray-500 italic mb-4">
          &apos;...Arise, shine; for thy light is come, and the glory of the LORD is risen upon thee.&apos; – Isaiah 60:1
        </p>
        <p className="max-w-3xl mx-auto text-gray-700 leading-relaxed mb-10">
          We are a Spirit-filled assembly committed to raising Christ-centered disciples, walking in divine light, and revealing God’s glory to the nations. At CAC Lightway Assembly, every service is an encounter, every soul is valued, and every life is transformed by the Word and the Spirit.
        </p>
        <Link href="" className="px-8 py-3 bg-orange-300 text-gray-900 font-semibold rounded-lg shadow-md hover:bg-orange-400 transition duration-300 ease-in-out transform hover:-translate-y-1 mb-26">
          JOIN US
        </Link>

        {/* Image Gallery Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mt-16">
          {/* Image 1 */}
          <div className="relative rounded-lg overflow-hidden shadow-lg group">
            <Image
              src="https://placehold.co/600x800/333333/FFFFFF/png?text=Image+1" // Placeholder for your first image
              alt="Person in prayer"
              width={600}
              height={800}
              className="w-full h-96 object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            {/* Optional: Overlay for text or effect on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>

          {/* Image 2 (Center, slightly taller) */}
          <div className="relative rounded-lg overflow-hidden shadow-lg group md:-mt-8"> {/* Adjusted margin-top for slight overlap */}
            <Image
              src="https://placehold.co/600x900/333333/FFFFFF/png?text=Image+2" // Placeholder for your second image
              alt="People reading bible"
              width={600}
              height={900}
              className="w-full h-[400px] object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            {/* Optional: Overlay for text or effect on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>

          {/* Image 3 */}
          <div className="relative rounded-lg overflow-hidden shadow-lg group">
            <Image
              src="https://placehold.co/600x800/333333/FFFFFF/png?text=Image+3" // Placeholder for your third image
              alt="Pastor speaking"
              width={600}
              height={800}
              className="w-full h-96 object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
            />
            {/* Optional: Overlay for text or effect on hover */}
            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Worship;
