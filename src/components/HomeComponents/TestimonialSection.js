import React from 'react';
;
import Image from 'next/image';

export default function TestimonialSection() {
  const reviews = [
    {
      id: 1,
      text: 'ESMOLOG Worldwide Cargo and Logistics delivered my urgent shipment ahead of schedule! Their tracking system was incredibly accurate, and the customer service was exceptional. Highly recommended for all your logistics needs.',
      author: 'Sarah M.',
      avatar: '/img/avatar.svg',
    },
    {
      id: 2,
      text: 'We rely on ESMOLOG Worldwide Cargo and Logistics for all our international freight. Their team handles customs and complex routes with expertise, making the entire process seamless and worry-free. A true partner!',
      author: 'David R.',
      avatar: '/img/avatar.svg',
    },
    {
      id: 3,
      text: 'Outstanding service from start to finish. My delicate cargo arrived in perfect condition, thanks to their meticulous handling and secure packaging. ESMOLOG Worldwide Cargo and Logistics truly lives up to its name!',
      author: 'Emily L.',
      avatar: '/img/avatar.svg',
    },
    {
      id: 4,
      text: 'The best logistics experience I\'ve had. From booking to delivery, everything was transparent and efficient. Their personalized approach made a huge difference for our unique shipment.',
      author: 'Michael P.',
      avatar: '/img/avatar.svg',
    },
    {
      id: 5,
      text: 'Reliable, professional, and always on time. ESMOLOG Worldwide Cargo and Logistics has become our go-to for all our cargo needs. Their team is responsive and always goes the extra mile to ensure satisfaction.',
      author: 'Jessica T.',
      avatar: '/img/avatar.svg',
    },
  ];

  return (
    <section className="bg-gray-50 py-16 px-4 font-sans">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-12 relative inline-block">
          Our <span className="text-green-600">Reviews</span>
          <span className="block w-24 h-1 bg-green-600 mx-auto mt-2 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center relative pt-12" // Added pt-12 for space for the 'G' icon
            >
              {/* Google 'G' Icon */}
              <div className="absolute -top-6 bg-gray-200 rounded-full p-3 shadow-md">
                <svg
                  className="w-8 h-8 text-gray-700"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
                </svg>
              </div>

              <p className="text-gray-700 text-lg mb-6">{review.text}</p>
              <div className="flex items-center justify-center space-x-3">
                <Image
                  src={review.avatar}
                  alt={review.author}
                  className="w-12 h-12 rounded-full object-cover border-2 border-green-600"
                    width={48}
                    height={48}
                />
                <span className="font-semibold text-gray-800">{review.author}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
