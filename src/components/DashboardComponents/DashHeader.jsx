'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/components/context-api/ProfileContext';
import LogoutButton from './LogoutButton';
import Image from 'next/image';


function DashHeader() {
  const {currentUser, isAdmin, isAgent, isEmployee, isClient} = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (href) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const linkClass = (href) => {
    return `block px-3 py-2 rounded-md text-sm ${
      isActive(href) ? 'bg-blue-100 text-blue-900 font-medium' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="bg-gray-500 text-white px-3 font-inter sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center relative py-2">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center bg-gray-100 p-2 rounded-md">
          <Image
            src="/img/cargorealmlogo.png"
            alt="Cargo Realm Logo"
            className="h-[30px] w-[120px] md:h-[40px] md:w-[220px] mr-0"
            width={120}
            height={30}
          />
        </Link>

        {/* Desktop User Info */}
        <div className="hidden lg:flex items-center space-x-4" ref={menuRef}>
            <div className="hover:text-orange-400 transition-colors flex flex-row justify-start items-center gap-2 duration-300 cursor-pointer">
                <Image
                  src="/img/account.svg"
                  alt="User Account"
                  className='w-7 h-7 text-blue-500'
                  width={28}
                  height={28}
                />
                <div className='mr-4 flex flex-col items-start justify-center'>
                    <div className='text-[14px]'>{currentUser?.name || 'User'}</div>
                    <div className='text-[12px] capitalize'>{currentUser?.role || 'guest'}</div>
                </div>
            </div>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center gap-2" ref={menuRef}>
          <div className="hover:text-orange-400 transition-colors flex flex-row justify-start items-center gap-1 duration-300">
            <Image
              src="/img/account.svg"
              alt="User Account"
              className='w-7 h-7 text-blue-500'
              width={28}
              height={28}
            />
            <div className='flex flex-col items-start justify-center'>
                <div className='text-[11px] md:text-[14px]'>{currentUser?.name || 'User'}</div>
                <div className='text-[11px] capitalize'>{currentUser?.role || 'guest'}</div>
            </div>
          </div>
          
          <button onClick={toggleMenu} className="focus:outline-none ml-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden ${
          isOpen ? 'block' : 'hidden'
        } py-2 px-0 transition-all duration-300 ease-in-out bg-gray-600 mt-2 rounded`}
      >
        <div className="flex flex-col space-y-1 max-h-96 overflow-y-auto">
          {/* Dashboard */}
          {(isAdmin || isEmployee || isClient || isAgent) && (
            <Link href="/dashboard" className={linkClass('/dashboard')}>
              Dashboard
            </Link>
          )}

          {/* Shipments */}
          {(isAdmin || isEmployee || isClient || isAgent) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Shipments</p>
              {(isAdmin || isEmployee) && (
                <Link href="/dashboard/allshipments" className={linkClass('/dashboard/allshipments')}>
                  All Shipments
                </Link>
              )}
              {(isAdmin || isAgent || isClient || isEmployee) && (
                <Link href="/dashboard/myshipments" className={linkClass('/dashboard/myshipments')}>
                  My Shipment
                </Link>
              )}
              {(isAdmin || isAgent || isEmployee) && (
                <Link href="/dashboard/createshipment" className={linkClass('/dashboard/createshipment')}>
                  Create Shipment
                </Link>
              )}
              {(isAdmin || isAgent || isEmployee) && (
                <Link href="/dashboard/archived-shipments" className={linkClass('/dashboard/archived-shipments')}>
                  Delivered Shipment
                </Link>
              )}
              {(isAdmin || isEmployee) && (
                <Link href="/dashboard/manage-shipment-status" className={linkClass('/dashboard/manage-shipment-status')}>
                  Manage Shipment Status
                </Link>
              )}
              {(isAdmin || isEmployee) && (
                <Link href="/dashboard/manage-facility" className={linkClass('/dashboard/manage-facility')}>
                  Manage Facility
                </Link>
              )}
              {(isAdmin || isAgent || isClient || isEmployee) && (
                <Link href="/dashboard/trackshipment" className={linkClass('/dashboard/trackshipment')}>
                  Track Shipment
                </Link>
              )}
            </>
          )}

          {/* Quote Request Responses */}
          {(isAdmin || isEmployee) && (
            <Link href="/dashboard/contactformresponses" className={linkClass('/dashboard/contactformresponses')}>
              Quote Request Responses
            </Link>
          )}

          {/* Blog Post */}
          {(isAdmin || isEmployee || isClient) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Blog Post</p>
              <Link href="/dashboard/allposts" className={linkClass('/dashboard/allposts')}>
                All Posts
              </Link>
              {(isAdmin || isAgent|| isEmployee) && (
                <Link href="/dashboard/allblogpost" className={linkClass('/dashboard/allblogpost')}>
                  Manage Blog Posts
                </Link>
              )}
              {(isAdmin || isAgent || isEmployee) && (
                <Link href="/dashboard/addnewpost" className={linkClass('/dashboard/addnewpost')}>
                  Add New Post
                </Link>
              )}
            </>
          )}

          {/* Events */}
          {(isAdmin || isEmployee) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Events</p>
              <Link href="/dashboard/allevents" className={linkClass('/dashboard/allevents')}>
                Manage All Events
              </Link>
              <Link href="/dashboard/addevent" className={linkClass('/dashboard/addevent')}>
                Add New Event
              </Link>
            </>
          )}

          {/* Appointments */}
          {(isAdmin || isAgent || isEmployee || isClient) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Appointments</p>
              <Link href="/dashboard/myappointments" className={linkClass('/dashboard/myappointments')}>
                My Appointments
              </Link>
              <Link href="/dashboard/bookappointment" className={linkClass('/dashboard/bookappointment')}>
                Book Appointment
              </Link>
              {(isAdmin || isEmployee) && (
                <Link href="/dashboard/allappointments" className={linkClass('/dashboard/allappointments')}>
                  All Appointments
                </Link>
              )}
            </>
          )}

          {/* Newsletter */}
          {(isAdmin || isEmployee) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Newsletter</p>
              <Link href="/dashboard/sendnewsletter" className={linkClass('/dashboard/sendnewsletter')}>
                Send Newsletter
              </Link>
              <Link href="/dashboard/allnewsletter" className={linkClass('/dashboard/allnewsletter')}>
                All Newsletters
              </Link>
              <Link href="/dashboard/Newslettersubscribers" className={linkClass('/dashboard/Newslettersubscribers')}>
                Subscribers
              </Link>
            </>
          )}

          {/* Gallery */}
          {(isAdmin || isEmployee) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Gallery</p>
              <Link href="/dashboard/allgalleryimages" className={linkClass('/dashboard/allgalleryimages')}>
                All Gallery
              </Link>
              <Link href="/dashboard/addnewgallery" className={linkClass('/dashboard/addnewgallery')}>
                Add New Gallery
              </Link>
            </>
          )}

          {/* Manage Users */}
          {(isAdmin || isEmployee) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Manage Users</p>
              <Link href="/dashboard/allusers" className={linkClass('/dashboard/allusers')}>
                All Users
              </Link>
              <Link href="/dashboard/addnewuser" className={linkClass('/dashboard/addnewuser')}>
                Add New User
              </Link>
              <Link href="/dashboard/changeuserpassword" className={linkClass('/dashboard/changeuserpassword')}>
                Change User Password
              </Link>
            </>
          )}

          {/* Profile */}
          {(isAdmin || isAgent || isEmployee || isClient) && (
            <Link href="/dashboard/profile" className={linkClass('/dashboard/profile')}>
              Profile
            </Link>
          )}

          {/* Settings */}
          {(isAdmin || isEmployee) && (
            <>
              <p className='px-3 py-2 text-xs font-semibold text-gray-200 uppercase tracking-wider mt-3'>Settings</p>
              <Link href="/dashboard/manage-message-slides" className={linkClass('/dashboard/manage-message-slides')}>
                Manage Message Slides
              </Link>
              <Link href="/dashboard/manage-hero-slides" className={linkClass('/dashboard/manage-hero-slides')}>
                Manage Hero Slides
              </Link>
              <Link href="/dashboard/manage-our-services" className={linkClass('/dashboard/manage-our-services')}>
                Manage Our Services
              </Link>
            </>
          )}

          {/* Logout */}
          {(isAdmin || isAgent || isEmployee || isClient) && (
            <div className='mt-3 px-3'>
              <LogoutButton />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default DashHeader;
