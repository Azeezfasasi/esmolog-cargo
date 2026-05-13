import React from 'react';

function ContactInfo() {
  return (
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
            <a href="mailto:info@cargorealmandlogistics.com" className="text-green-600 hover:underline font-semibold">
              info@cargorealmandlogistics.com
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
            <a href="tel:+2349074151326" className="text-green-600 hover:underline font-semibold">
              (+234) 09074151326
            </a>
          </div>

          {/* Option 3: Help & Support */}
          <div className="flex flex-col items-center text-center p-6">
            {/* Icon Circle */}
            <div className="mb-6 p-5 rounded-full bg-blue-50 text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Help & Support
            </h3>
            {/* Description */}
            <p className="text-gray-600 leading-relaxed mb-4">
              Check out helpful resources, FAQs and developer tools.
            </p>
            {/* Button */}
            <button className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
              Support Center
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ContactInfo;
