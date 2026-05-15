import ContactInfo from '@/components/HomeComponents/ContactInfo'
import ContactForm from '@/components/HomeComponents/RequestQuoteForm'
import React from 'react'

export default function page() {
  return (
    <>
        <ContactInfo />
        <div className="w-full lg:w-[60%] mx-auto border border-green-100 rounded-lg shadow-md mb-12">
          <ContactForm />
        </div>
    </>
  )
}
