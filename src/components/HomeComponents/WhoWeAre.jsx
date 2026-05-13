import React from 'react';
;
import Image from 'next/image';

export default function WhoWeAre() {
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      ),
      title: 'TRUSTED PARTNER',
      description: 'We are committed to building long-term relationships based on trust and transparency. Our proven track record ensures your cargo is in safe and reliable hands, every step of the way.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          ></path>
        </svg>
      ),
      title: 'PERSONALIZED SERVICE',
      description: 'We understand that every shipment is unique. Our team provides tailored logistics solutions, adapting to your specific needs and challenges to ensure optimal efficiency and satisfaction.',
    },
    {
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          ></path>
        </svg>
      ),
      title: 'FLEXIBLE SOLUTIONS',
      description: 'Our agile approach allows us to offer flexible shipping options and adapt quickly to changing market demands. We provide scalable services that grow with your business, ensuring seamless operations.',
    },
  ];

  return (
    <section className="relative bg-green-100 font-sans overflow-hidden">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between">
        {/* Left Section: Content */}
        <div className="lg:w-1/2 w-full bg-green-600 text-white p-8 md:p-16 lg:p-20 relative z-10 lg:rounded-r-full lg:mr-[-100px] lg:pr-32">
          {/* Diagonal cut effect using pseudo-elements or transform is complex with Tailwind for exact match,
              so we'll use a large rounded corner and negative margin to simulate the overlap.
              For a perfect diagonal, custom CSS with clip-path or SVG shape would be needed. */}
          <h3 className="text-sm uppercase tracking-widest text-gray-200 mb-2">WHO WE ARE?</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight mb-10">
            WHY CHOOSE US?
          </h2>

          <div className="space-y-10">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">{feature.title}</h4>
                  <p className="text-gray-200 opacity-90">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Image */}
        <div className="lg:w-1/2 w-full mt-8 lg:mt-0 flex justify-center items-center lg:pl-16">
          <Image
            src="/img/cta2.jpeg"
            alt="Professional team member"
            width={600}
            height={600}
            className="w-full max-w-md lg:max-w-none h-auto object-cover  lg:rounded-lg shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}
