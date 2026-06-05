import React from 'react';
import Image from 'next/image';

function UpComingEvents() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Top Section: Sub-headline and Main Headline */}
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-2">
          UPCOMING SERMONS
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-16">
          JOIN US AND BECOME PART <br className="hidden sm:inline" /> OF SOMETHING GREAT
        </h2>

        {/* Event Card and Image Section */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 mb-16">
          {/* Event Card */}
          <div className="relative bg-gray-100 p-8 rounded-lg shadow-lg flex flex-col lg:w-1/2 xl:w-2/5">
            {/* Date Badge */}
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-center p-3 rounded-bl-lg">
              <span className="block text-xl font-bold">20</span>
              <span className="block text-sm uppercase">JULY</span>
            </div>

            <p className="text-sm uppercase tracking-widest text-gray-600 mb-4 text-left">
              UPCOMING EVENT
            </p>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-left">
              WATCH AND LISTEN <br /> TO OUR SERMONS
            </h3>
            <p className="text-gray-700 leading-relaxed mb-6 text-left">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna.
            </p>

            {/* Event Details */}
            <div className="space-y-4 text-left mb-8">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-800">Friday 23:39 IST <br /> Saturday 11:20 ISD</p>
              </div>
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 016.727 6.727a8 8 0 0110.93 10.93z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <p className="text-gray-800">No 233 Main St. New York, <br /> United States</p>
              </div>
            </div>

            {/* Register Button */}
            <button className="w-fit px-8 py-3 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-300 ease-in-out transform hover:-translate-y-1 self-start">
              REGISTER
            </button>
          </div>

          {/* Image */}
          <div className="relative rounded-lg overflow-hidden shadow-lg lg:w-1/2 xl:w-3/5">
            <Image
              src="https://placehold.co/800x500/333333/FFFFFF/png?text=Church+Event"
              alt="People at church event"
              width={800}
              height={500}
              className="w-full h-auto object-cover object-center rounded-lg"
            />
          </div>
        </div>

        {/* View All Sermons Link */}
        <a href="#" className="inline-flex items-center text-orange-500 font-semibold hover:text-orange-600 transition duration-300">
          View all Sermons
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}

export default UpComingEvents;
