'use client';

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/Api';
import Link from 'next/link';

const defaultServices = [
  {
    title: 'AIR FREIGHT',
    description: 'Expedite your shipments globally with our reliable air freight solutions. We ensure fast and secure delivery for time-sensitive cargo, connecting major hubs worldwide.',
  },
  {
    title: 'SEA FREIGHT',
    description: 'Cost-effective and efficient sea freight services for large volume shipments. We handle full container loads (FCL) and less than container loads (LCL) with comprehensive logistics support.',
  },
  {
    title: 'ROAD TRANSPORT',
    description: 'Flexible and dependable road transport services for domestic and cross-border deliveries. Our fleet ensures timely and safe ground transportation of your goods.',
  },
  {
    title: 'WAREHOUSING',
    description: 'Secure and strategically located warehousing solutions for all your storage needs. We offer inventory management, distribution, and value-added services to optimize your supply chain.',
  },
  {
    title: 'CUSTOMS BROKERAGE',
    description: 'Navigate complex customs regulations with ease. Our expert customs brokerage services ensure smooth clearance and compliance for international shipments, minimizing delays.',
  },
  {
    title: 'PROJECT CARGO',
    description: 'Specialized handling for oversized, heavy-lift, and complex project cargo. We provide end-to-end solutions for challenging logistics projects, ensuring safe and efficient delivery.',
  },
];

export default function OurServicesSection() {
  const [services, setServices] = useState(defaultServices);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(`${API_BASE_URL}/services`);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        setServices(data);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setHasError(false); // Don't show error, just use defaults
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-900 text-white py-16 px-4 font-sans">
      <div className="container mx-auto text-center">
        <h3 className="text-sm uppercase tracking-widest text-gray-400 mb-2">WHAT WE DO</h3>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-12 relative inline-block">
          FEATURED SERVICES
          <span className="block w-24 h-1 bg-green-600 mx-auto mt-2 rounded-full"></span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-start text-left transform hover:scale-105 transition duration-300 ease-in-out"
            >
              <h4 className="text-xl font-bold mb-4 text-green-600">{service.title}</h4>
              <p className="text-gray-300 mb-6 flex-grow">{service.description}</p>
              <Link href="/request-quote" className="text-green-600 font-semibold hover:underline flex items-center">
                REQUEST QUOTE
                <svg
                  className="ml-2 w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  ></path>
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
