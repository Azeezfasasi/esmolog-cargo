'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/#home', label: 'Home' },
    { href: '/#mission', label: 'Mission' },
    { href: '/#community', label: 'Community' },
    { href: '/#steps', label: 'Steps' },
    { href: '/#people', label: 'People' },
    { href: '/#network', label: 'Network' },
  ];

  const scrollToSection = (e, href) => {
    if (pathname !== '/') return;
    e.preventDefault();
    const id = href.replace('/#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Mobile header */}
      <div className={`lg:hidden h-[70px] flex flex-row items-center justify-between px-10 shadow-md sticky top-0 z-50 transition-colors ${scrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'}`}>
        <Link href="/">
          <Image src="/images/alameen.jpeg" alt="Logo" width={130} height={50} className="w-[130px] h-[50px]" />
        </Link>
        <MobileMenu />
      </div>

      {/* Desktop header */}
      <div className={`hidden h-[70px] lg:flex flex-row items-center justify-between overflow-hidden px-10 shadow-md sticky top-0 z-50 transition-colors ${scrolled ? 'bg-white/95 backdrop-blur-sm' : 'bg-white'}`}>
        <Link href="/">
          <Image src="/images/alameen.jpeg" alt="Logo" width={130} height={50} className="w-[160px] h-[70px]" />
        </Link>

        <div className="flex flex-row items-center justify-start gap-5 relative z-50">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={(e) => scrollToSection(e, link.href)}
              className="cursor-pointer text-left text-[15px] uppercase font-normal text-amber-600 hover:text-amber-700 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

