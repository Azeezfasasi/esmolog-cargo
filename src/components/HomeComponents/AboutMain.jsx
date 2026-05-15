import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

function AboutMain() {
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
            About Us
          </p>

          <h2 className="text-3xl text-white md:text-4xl font-extrabold">
            Your Trusted Partner in Global Logistics
          </h2>

          <div className="h-1 w-20 rounded-full bg-white/60" />
          <p className="text-white/85">
            At ESMOLOG Cargo and Logistics, we are dedicated to providing efficient, reliable, and customer-focused logistics solutions that connect businesses and markets across the globe. With a commitment to excellence and a passion for innovation, we strive to revolutionize the logistics industry and deliver unparalleled service to our clients worldwide.
          </p>
        </div>
      </div>
    </div>
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white font-inter">
      <div className="max-w-7xl mx-auto text-center">
        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
          About ESMOLOG Cargo and Logistics
        </h2>
        {/* Sub-headline */}
        <p className="max-w-2xl mx-auto text-gray-600 leading-relaxed mb-12">
          Discover our journey, our mission, and the drive behind everything we do.
        </p>

        {/* Introduction Section */}
        <div className="bg-gray-50 rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row items-stretch mb-16">
          {/* Image */}
          <div className="lg:w-1/2 flex-shrink-0">
            <Image
              src="/img/about1.jpeg" // Placeholder for your church community image
              alt="Church community gathering"
              width={800}
              height={600}
              className="w-full h-64 sm:h-80 lg:h-full object-cover object-center"
            />
          </div>
          {/* Text Content */}
          <div className="lg:w-1/2 p-8 flex flex-col justify-center text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Story and Purpose
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Founded in 2016, ESMOLOG Cargo and Logistics has grown into a trusted force in the logistics and supply chain industry. Our mission is rooted in reliability, transparency, and delivering excellence across every shipment and service we provide.      
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              We are committed to moving goods efficiently and securely while building long-lasting partnerships with our clients. At ESMOLOG Cargo and Logistics, we believe in going beyond transportation, we deliver confidence, speed, and tailored logistics solutions that drive global trade forward.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Through innovation, integrity, and a customer-first mindset, we continuously strive to exceed expectations and make a meaningful impact in the lives of businesses and the communities we serve.
            </p>
          </div>
        </div>

        {/* Mission & Vision Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Our Mission */}
          <div className="bg-blue-50 p-8 rounded-xl shadow-md flex flex-col items-center text-center">
            <div className="mb-6 p-4 rounded-full bg-blue-100 text-blue-700">
              {/* Mission Icon (e.g., Target/Goal) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l-7 7-7-7M19 10v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To revolutionize the logistics industry by providing efficient, reliable, and customer-focused cargo and freight solutions that connect businesses and markets across the globe.
            </p>
          </div>

          {/* Our Vision */}
          <div className="bg-orange-50 p-8 rounded-xl shadow-md flex flex-col items-center text-center">
            <div className="mb-6 p-4 rounded-full bg-orange-100 text-orange-700">
              {/* Vision Icon (e.g., Lightbulb/Idea) */}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 17v5m6.447-16.632a8 8 0 11-12.894 0M12 2v2m-5.447 10.632a8 8 0 1110.894 0M12 10V6" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Our Vision
            </h3>
            <p className="text-gray-700 leading-relaxed">
              To be a leading force in global logistics — known for excellence, innovation, and integrity — transforming the way goods move and making a positive impact on businesses and communities worldwide.
            </p>
          </div>
        </div>

        {/* Core Values Section */}
        <h3 className="text-3xl font-bold text-gray-900 mb-4">
          Our Core Values
        </h3>
        <p className="w-[80%] mx-auto text-center font-semibold text-gray-700 leading-relaxed mb-7">At ESMOLOG Cargo and Logistics, our values are the foundation of our business. They guide every decision we make and every interaction we have, ensuring we provide exceptional service while fostering a culture of integrity and responsibility.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Value 1 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Commitment to Action
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              We believe in proactive service and delivering on our promises. We take decisive steps to ensure your cargo is handled efficiently and delivered on schedule, turning our commitment into tangible results.
            </p>
          </div>
          {/* Value 2 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Customer-Centric Approach
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              We build an inclusive and respectful environment for our clients and partners. Our priority is to provide a seamless, supportive, and transparent experience where every customer feels valued and understood.
            </p>
          </div>
          {/* Value 3 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Operational Excellence
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              We are dedicated to continuous improvement and industry-leading knowledge. We stay ahead of logistics trends and best practices to provide smart, reliable, and innovative solutions for all your shipping needs.
            </p>
          </div>
          {/* Value 4 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Ethical and Responsible Operations
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              Extending care and integrity beyond our transactions, we ensure every shipment is handled with the utmost responsibility. We are committed to ethical practices and the security of your goods throughout their journey.
            </p>
          </div>
          {/* Value 5 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Empowerment and Growth
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              We encourage and equip our team members to grow both professionally and personally. By fostering a culture of learning, we ensure our experts are always ready to provide you with the best possible service.
            </p>
          </div>
          {/* Value 6 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-left">
            <h4 className="text-xl font-semibold text-gray-900 mb-3">
              <span className="text-green-600 mr-2">&bull;</span> Generous Value
            </h4>
            <p className="text-gray-700 text-sm leading-relaxed">
              We inspire a spirit of generosity by providing clear communication, fair pricing, and exceptional service that goes above and beyond expectations. Our goal is to provide maximum value in every partnership.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-700 mb-6">
            Ready to experience a new standard in logistics? Let&apos;s get your cargo moving.
          </p>
          <Link href="/request-quote" className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-lg hover:bg-green-700 transition duration-300 ease-in-out transform hover:-translate-y-1" >
            Request Quote
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
    </>
  );
}

export default AboutMain;
