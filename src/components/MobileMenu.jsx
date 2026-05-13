'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/#home', label: 'Home' },
    { href: '/#mission', label: 'Mission' },
    { href: '/#community', label: 'Community' },
    { href: '/#steps', label: 'Steps' },
    { href: '/#people', label: 'People' },
    { href: '/#network', label: 'Network' },
  ];

  const handleClick = (e, href) => {
    setIsOpen(false);
    const id = href.replace('/#', '');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />
          <div className="fixed top-[70px] right-0 w-[70%] max-w-[300px] bg-white shadow-xl z-50 p-6" style={{ maxHeight: 'calc(100vh - 70px)', overflowY: 'auto' }}>
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <nav className="mt-12 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="block text-lg font-medium text-gray-800 hover:text-amber-600 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}

