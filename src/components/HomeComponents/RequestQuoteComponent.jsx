import React from 'react';
import ContactForm from './ContactForm';

export default function RequestQuoteComponent() {
  return (
    <section className="bg-white font-sans pb-16 px-4">
      <div className="container bg-green-600 py-10 flex justify-center items-center mx-auto text-center">
        <h2 className="text-3xl text-white md:text-4xl font-extrabold relative inline-block">
          REQUEST A QUOTE
          <span className="block w-24 h-1 bg-green-600 mx-auto mt-2 rounded-full"></span>
        </h2>
      </div>
      <ContactForm />
    </section>
  );
}
