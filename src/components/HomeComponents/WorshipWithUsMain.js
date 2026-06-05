import React from 'react';

function WorshipWithUsMain() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
          Worship With Us
        </h2>
        {/* Descriptive Paragraph */}
        <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed mb-12">
          Join us for a time of inspiring worship, powerful messages, and heartfelt community. All are welcome!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
          {/* Service Times Card */}
          <div className="bg-blue-50 p-8 rounded-xl shadow-md flex flex-col items-center text-center">
            <div className="mb-6 p-4 rounded-full bg-blue-100 text-blue-700">
              {/* Clock Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Service Times
            </h3>
            <ul className="text-gray-700 text-lg space-y-2">
              <li>Sunday Worship: <span className="font-semibold">10:00 AM - 11:30 AM</span></li>
              <li>Wednesday Bible Study: <span className="font-semibold">7:00 PM - 8:00 PM</span></li>
              <li>Youth Group: <span className="font-semibold">Fridays 6:00 PM</span></li>
            </ul>
          </div>

          {/* Location & Directions Card */}
          <div className="bg-orange-50 p-8 rounded-xl shadow-md flex flex-col items-center text-center">
            <div className="mb-6 p-4 rounded-full bg-orange-100 text-orange-700">
              {/* Location Pin Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.727A8 8 0 016.727 6.727a8 8 0 0110.93 10.93z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Location
            </h3>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              123 Church Avenue, <br />
              Faithful City, FC 12345, USA
            </p>
            <a
              href="https://maps.google.com/?q=123+Church+Avenue,+Faithful+City"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Get Directions
            </a>
          </div>
        </div>

        {/* Optional: Additional Call to Action or Message */}
        <div className="mt-16 text-center">
          <p className="text-lg text-gray-700 mb-4">
            We look forward to welcoming you to our family!
          </p>
          <a
            href="#" // Link to a "New Visitors" or "About Us" page
            className="inline-flex items-center px-8 py-4 bg-orange-600 text-white font-semibold rounded-lg shadow-lg hover:bg-orange-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Learn More About Us
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}

export default WorshipWithUsMain;
