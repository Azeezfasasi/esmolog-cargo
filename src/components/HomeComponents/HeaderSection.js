'use client';

import Link from 'next/link';
import { useState, useEffect } from "react";
import { FaChevronDown } from 'react-icons/fa';
import MessageSlides from "./MessageSlides";
import Image from 'next/image';

export default function HeaderSection() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Check if user is logged in by checking localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setIsLoggedIn(true);
      try {
        setUserData(JSON.parse(user));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  // NavLinks to include sub-menus
  const navLinks = [
    { href: "/", label: "Home" },
    {
      label: "About Us",
      submenus: [
        { href: "/about-us", label: "About Us" },
        { href: "/services", label: "Our Services" },
        { href: "/blog", label: "Our Blog" },
        { href: "/gallery", label: "Gallery" }, 
        { href: "/events", label: "Events" }, 
      ]
    },
    { href: "/track-shipment", label: "Track Shipment" },
    { href: "/request-quote", label: "Request Quote" },
    { href: "/contact-us", label: "Contact Us" },
  ];

  return (
    <header className="bg-white p-0 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo Section */}
        <Link href="/" className="flex items-center space-x-2">
            <Image
                src="/img/esmologtrans.png"
                width={130}
                height={40}
                alt="ESMOLOG Cargo Logo"
                className="h-[70px] w-[70px] md:h-[70px] md:w-[100px] mr-0"
            />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-row items-center space-x-4">
          {navLinks.map((link, index) => {
            // Check if the link has sub-menus
            if (link.submenus) {
              return (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setAboutDropdownOpen(true)}
                onMouseLeave={() => setAboutDropdownOpen(false)}
              >
                <span className="flex items-center gap-1 text-gray-700 hover:text-green-600 font-medium cursor-pointer transition-colors">
                  {link.label} <FaChevronDown />
                </span>
                {aboutDropdownOpen && (
                    <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                      {link.submenus.map((submenu) => (
                        <Link
                          key={submenu.href}
                          href={submenu.href}
                          className="block px-4 py-2 text-gray-700 hover:bg-green-100 font-semibold transition-colors"
                          onClick={() => setAboutDropdownOpen(false)}
                        >
                          {submenu.label}
                        </Link>
                      ))}
                    </div>
                )}
              </div>
            );
              } else {
              // Render normal links without sub-menus
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  {link.label}
                </Link>
              );
            }
          })}
        </nav>

        {/* Account Icons and Button Section (Desktop) */}
        <div className="hidden lg:flex items-center space-x-4">
          {isLoggedIn && userData ? (
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{userData.name || 'User'}</p>
                  <p className="text-xs text-orange-500 font-medium capitalize">{userData.role || 'User'}</p>
                </div>
                <FaChevronDown className="text-gray-600" />
              </button>
              
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{userData.name || 'User'}</p>
                    <p className="text-xs text-gray-600">{userData.email || ''}</p>
                    <p className="text-xs text-orange-500 font-medium capitalize mt-1">{userData.role || 'User'}</p>
                  </div>
                  <div className="py-2">
                    <Link href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link href="/dashboard/allshipments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Manage Shipments
                    </Link>
                    <Link href="https://mail.zoho.com"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Access Zohomail
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                        setUserData(null);
                        setAccountDropdownOpen(false);
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href="/dashboard" className="flex items-center p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
              <Image
                src="/img/user.svg"
                alt="Login Icon"
                width={32}
                height={32}
              />
            </a>
          )}
          <Link href="/request-quote" className="px-6 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 z-50">
            Get A Quote
          </Link>
        </div>

        {/* Mobile Account Icon and Hamburger Menu */}
        <div className="flex flex-row lg:hidden gap-2">
          {isLoggedIn && userData ? (
            <div className="relative">
              <button
                onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
                className="flex items-center p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-700">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>
              
              {accountDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">{userData.name || 'User'}</p>
                    <p className="text-xs text-gray-600">{userData.email || ''}</p>
                    <p className="text-xs text-orange-500 font-medium capitalize mt-1">{userData.role || 'User'}</p>
                  </div>
                  <div className="py-2">
                    <Link href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link href="/dashboard/allshipments"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                    >
                      Manage Shipments
                    </Link>
                    <Link href="https://mail.zoho.com"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setAccountDropdownOpen(false)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Access Zohomail
                    </Link>
                    <button
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        setIsLoggedIn(false);
                        setUserData(null);
                        setAccountDropdownOpen(false);
                        window.location.href = '/';
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <a href="/dashboard" className="flex items-center p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300">
              <Image
                src="/img/user.svg"
                alt="Login Icon"
                width={30}
                height={30}
              />
            </a>
          )}
          <button
            className="lg:hidden flex items-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
          <span className="sr-only">Open main menu</span>
            <div className="relative w-7 h-7 flex flex-col justify-center items-center">
              <span
                  className={`block h-1 w-7 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}
              ></span>
              <span
                  className={`block h-1 w-7 bg-gray-800 rounded my-1 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}
              ></span>
              <span
                  className={`block h-1 w-7 bg-gray-800 rounded transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}
              ></span>
            </div>
          </button>
        </div>
      </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <nav className="lg:hidden bg-white shadow-lg rounded-b-lg py-4 px-6 absolute left-0 right-0 top-full z-40 animate-slideDown">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link, index) => {
                if (link.submenus) {
                  return (
                    <div key={index}>
                      <button
                        onClick={() => setAboutDropdownOpen(!aboutDropdownOpen)}
                        className="flex items-center gap-2 w-full text-left text-gray-700 hover:text-green-600 font-medium text-lg transition-colors focus:outline-none"
                      >
                        {link.label} <FaChevronDown />
                      </button>
                      {aboutDropdownOpen && (
                        <div className="flex flex-col space-y-2 pl-4 mt-2">
                          {link.submenus.map((submenu) => (
                            <Link
                              key={submenu.href}
                              href={submenu.href}
                              className="text-gray-600 hover:text-green-600 font-semibold text-base transition-colors"
                              onClick={() => {
                                  setMenuOpen(false);
                                  setAboutDropdownOpen(false);
                              }}
                            >
                              {submenu.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                  } else {
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="text-gray-700 hover:text-green-600 font-medium text-lg transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                );
              }
            })}
            <Link href="/request-quote" className="px-6 py-2 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center" onClick={() => setMenuOpen(false)}>
                Get A Quote
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}