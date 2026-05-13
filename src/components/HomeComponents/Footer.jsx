import React from 'react';
import SubscribeNow from './SubscribeNow';
import Link from 'next/link';

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 font-inter overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Column 1: Logo, Copyright, Contact Info */}
        <div className="flex flex-col items-start text-left">
          <div className="text-[17px] font-bold text-white mb-4">
            CAC Ligtway Assembly
          </div>
          {/* <p className="text-sm mb-2">© COPYRIGHT FINSWEEET 2022</p> */}
          <p className="text-sm">(+234) 08069374005</p>
          <p className="text-sm">23 Kajola Olayinka Street, Off Ogunlewe Road Igbogbo, Ikorodu, Lagos.</p>
        </div>

        {/* Column 2: Quicklinks */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Quicklinks</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-orange-400 transition-colors duration-200">Home</Link></li>
            <li><Link href="/app/about" className="hover:text-orange-400 transition-colors duration-200">ABOUT US</Link></li>
            <li><Link href="/app/prayerrequest" className="hover:text-orange-400 transition-colors duration-200">PRAYER REQUEST</Link></li>
            <li><Link href="/app/blog" className="hover:text-orange-400 transition-colors duration-200">BLOG</Link></li>
            <li><Link href="/app/contactus" className="hover:text-orange-400 transition-colors duration-200">CONTACT US</Link></li>
          </ul>
        </div>

        {/* Column 3: Connect (Social Media) */}
        <div className="text-left">
          <h3 className="text-lg font-semibold text-white mb-4">Connect</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
              {/* Facebook Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.812c-3.274 0-4.188 1.549-4.188 4.035v2.965z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
              {/* Twitter Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.594 0-6.495 2.902-6.495 6.495 0 .509.058 1.007.163 1.489-5.405-.271-10.183-2.868-13.383-6.848-.562.96-.884 2.07-.884 3.259 0 2.254 1.14 4.24 2.873 5.417-.84-.026-1.621-.26-2.31-.641v.08c0 3.154 2.239 5.786 5.207 6.39-.544.148-1.114.225-1.702.225-.418 0-.823-.041-1.22-.116.829 2.572 3.224 4.463 6.077 4.567-2.226 1.748-5.034 2.793-8.09 2.793-1.056 0-2.09-.061-3.105-.18.859.92 1.867 1.745 2.994 2.406 3.429 2.31 7.502 3.665 11.908 3.665 14.269 0 22.07-11.16 22.07-20.834 0-.335-.01-.67-.026-1z"/>
              </svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors duration-200">
              {/* LinkedIn Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 4: Newsletter Subscription */}
        <SubscribeNow />

      </div>
    </footer>
  );
}

export default Footer;
