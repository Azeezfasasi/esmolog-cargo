import React from 'react';
import ContactForm from './ContactForm';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: 'Request a Quote & Plan',
      description: 'Easily submit your shipment details through our online form or contact us directly. Our experts will provide a tailored quote and help you plan the most efficient logistics solution for your cargo.',
    },
    {
      number: 2,
      title: 'Secure Pickup & Transit',
      description: 'Once confirmed, our team will arrange for secure pickup of your cargo. We utilize advanced tracking systems to monitor your shipment throughout its journey, ensuring safety and transparency.',
    },
    {
      number: 3,
      title: 'Timely Delivery & Support',
      description: 'Your cargo will be delivered to its destination on schedule. Our dedicated support team is available 24/7 to provide updates and assist with any queries, ensuring a smooth delivery process.',
    },
  ];

  return (
    <section className="bg-white font-sans py-16 px-4">
      <div className="container mx-auto flex flex-col lg:flex-row gap-12">
        {/* Left Section: How It Works */}
        <div className="lg:w-1/2 w-full">
          <h3 className="text-green-600 text-sm uppercase tracking-widest mb-2">How It Work?</h3>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-10">
            The Amazing Steps Of Our Services
          </h2>

          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-lg mr-4">
                  {step.number}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Section: Get In Touch Form */}
        <div className="lg:w-1/2 w-full bg-green-600 p-8 md:p-12 rounded-lg shadow-xl">
          <ContactForm />
        </div>
          
      </div>
    </section>
  );
}
