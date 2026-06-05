import React from 'react';

function WelcomeCards() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h2 className="text-[18px] sm:text-[24px] lg:text-[35px] font-extrabold text-gray-900 mb-2">
          A CHURCH THAT&apos;S RELEVANT
        </h2>
        {/* Sub-headline */}
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-4">
          Living the Word. Loving the People. Impacting the World.
        </p>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: About Us */}
          <div className="bg-orange-50 p-8 rounded-lg shadow-md flex flex-col items-center text-center group">
            {/* Icon */}
            <div className="mb-6 p-4 rounded-full bg-orange-200 text-orange-700 group-hover:bg-orange-300 transition-colors duration-300">
              {/* Placeholder for About Us icon (e.g., people icon) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H2v-2a3 3 0 015.356-1.857M17 20v-2c0-.653-.192-1.267-.522-1.785A3.001 3.001 0 0015 14a3.001 3.001 0 00-2.478.965C12.192 15.733 12 16.347 12 17v2m-4.5 0h9M12 10a3 3 0 11-6 0 3 3 0 016 0zm0 0a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              ABOUT US
            </h3>
            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">
              At CAC Lightway Assembly, we are a Christ-centered family committed to building lives through the undiluted Word of God, prayer, and spiritual growth. Our doors are open to all seeking a deeper relationship with Christ.
            </p>
            {/* Bottom Border/Accent */}
            <div className="w-full h-2 bg-orange-300 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Card 2: Get Involved */}
          <div className="bg-orange-50 p-8 rounded-lg shadow-md flex flex-col items-center text-center group">
            {/* Icon */}
            <div className="mb-6 p-4 rounded-full bg-orange-200 text-orange-700 group-hover:bg-orange-300 transition-colors duration-300">
              {/* Placeholder for Get Involved icon (e.g., wifi/signal icon) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9.879 14.121a3 3 0 010-4.242m4.242 0a3 3 0 010 4.242M12 12h.01" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              GET INVOLVED
            </h3>
            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">
              There’s a place for you here. Whether it’s joining a ministry, serving in outreach, or attending a Bible study group — we welcome you to be part of what God is doing through us.
            </p>
            {/* Bottom Border/Accent */}
            <div className="w-full h-2 bg-orange-300 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Card 3: Giving Back */}
          <div className="bg-orange-50 p-8 rounded-lg shadow-md flex flex-col items-center text-center group">
            {/* Icon */}
            <div className="mb-6 p-4 rounded-full bg-orange-200 text-orange-700 group-hover:bg-orange-300 transition-colors duration-300">
              {/* Placeholder for Giving Back icon (e.g., heart with hands) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 15l-3-3m0 0l-3 3m3-3V2m9 13V2m3 3l-3 3m0 0l-3-3m3 3l3-3m-3 3l3 3M12 21a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              GIVING BACK
            </h3>
            {/* Description */}
            <p className="text-gray-700 leading-relaxed mb-6">
              We believe in living generously. Through community outreach, missions, and support initiatives, we strive to reflect Christ’s love and make a lasting difference in the lives of others.
            </p>
            {/* Bottom Border/Accent */}
            <div className="w-full h-2 bg-orange-300 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WelcomeCards;
