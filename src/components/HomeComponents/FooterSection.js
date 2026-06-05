import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Phone, ChevronRight } from 'lucide-react';
import SubscribeNow from './SubscribeNow';
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter } from 'react-icons/fa';

export default function FooterSection() {
  const quickLinks = [
    { name: 'Services', href: '#' },
    { name: 'Terms & Conditions', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'About Us', href: '#' },
    { name: 'Contact Us', href: '#' },
  ];

  const ourServices = [
    'Air Freight',
    'Sea Freight',
    'Road Transport',
    'Warehousing',
    'Customs Brokerage',
    'Express Delivery',
    'Supply Chain Solutions',
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 px-4 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
        {/* Column 1: Logo and Description */}
        <div className="w-full flex flex-col items-start md:items-start">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/img/esmologtrans.png"
              alt="ESMOLOG logo"
              width={220}
              height={60}
              className="w-[170px] h-[120px] object-contain"
              priority
            />
          </div>
          <p className="text-sm leading-relaxed text-gray-300">
            Your reliable partner for global cargo shipments. We provide efficient, secure, and timely logistics solutions
            tailored to your business needs—ensuring your goods reach their destination with care.
          </p>

          <div className="mt-5 flex items-center gap-3 text-gray-400">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-green-400" />
              <span className="text-xs">Lagos • New Jersey</span>
            </span>
          </div>
        </div>

        {/* Column 2: Address */}
        <div className="w-full border border-gray-800 bg-gray-950/20 rounded-xl p-5 md:max-w-[320px]">
          <h4 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
            <MapPin className="h-5 w-5 text-green-400" />
            Address
          </h4>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-gray-300">27, Alimi Bada Str., Oke-ta, Isolo, Lagos</p>
              <a href="tel:+2349092450673" className="text-sm inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
                <Phone className="h-4 w-4" />
                +234 909 245 0673
              </a>
              <a href="tel:+2349130089643" className="text-sm inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition">
                <Phone className="h-4 w-4" />
                +234 913 008 9643
              </a>
            </div>

            <div className="border-t border-gray-800 pt-4 space-y-2">
              <p className="text-sm font-semibold text-white">WAREHOUSE ADDRESS:</p>
              <p className="text-sm text-gray-300">4000 Bordentown Avenue, Sayreville, New Jersey 08872</p>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <p className="text-sm font-semibold text-white mb-3">Follow us</p>
              <div className="flex items-center gap-3">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-800 transition"
                >
                  <FaFacebook className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Twitter"
                  className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-800 transition"
                >
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-800 transition"
                >
                  <FaTiktok className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="p-2 rounded-lg text-gray-400 hover:text-green-400 hover:bg-gray-800 transition"
                >
                  <FaInstagram className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Links */}
        <div className="w-full flex flex-col">
          <h4 className="text-lg font-bold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <a
                  href={link.href}
                  className="group inline-flex items-center gap-2 text-gray-300 hover:text-green-400 transition"
                >
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-green-400 transition" />
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Our Services */}
        <div className="w-full flex flex-col">
          <h4 className="text-lg font-bold text-white mb-4">Our Services</h4>
          <ul className="space-y-2">
            {ourServices.map((service) => (
              <li key={service}>
                <Link href="#" className="group inline-flex items-center gap-2 text-gray-300 hover:text-green-400 transition">
                  <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-green-400 transition" />
                  {service}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Newsletter */}
        <div className="w-full">
          <SubscribeNow />
        </div>
      </div>

      {/* Bottom Section: Copyright */}
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ESMOLOG Worldwide Cargo and Logistics. All rights reserved.
      </div>
    </footer>
  );
}
