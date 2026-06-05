'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/components/context-api/ProfileContext';
import LogoutButton from './LogoutButton';

function DashMenu() {
    const {isAdmin, isAgent, isEmployee, isClient} = useProfile()
    const pathname = usePathname();

  // Map route paths to eventKeys
  const menuKeyByPath = {
    '/app/dashboard': { key: '1', parent: null },
    '/app/account/allshipments': { key: '2-1', parent: '2' },
    '/app/account/myshipments': { key: '2-2', parent: '2' },
    '/app/account/createshipment': { key: '2-3', parent: '2' },
    '/app/account/archived-shipments': { key: '2-4', parent: '2' },
    '/app/account/manage-shipment-status': { key: '2-5', parent: '2' },
    '/app/account/manage-facility': { key: '2-6', parent: '2' },
    '/app/trackshipment': { key: '2-7', parent: '2' },
    '/app/account/contactformresponses': { key: '3', parent: null },
    '/app/account/allposts': { key: '4-1', parent: '4' },
    '/app/account/allblogpost': { key: '4-2', parent: '4' },
    '/app/account/addnewpost': { key: '4-3', parent: '4' },
    '/app/account/allevents': { key: '5-1', parent: '5' },
    '/app/account/addevent': { key: '5-2', parent: '5' },
    '/app/account/myappointments': { key: '6-1', parent: '6' },
    '/app/account/bookappointment': { key: '6-2', parent: '6' },
    '/app/account/allappointments': { key: '6-3', parent: '6' },
    '/app/account/sendnewsletter': { key: '7-1', parent: '7' },
    '/app/account/allnewsletter': { key: '7-2', parent: '7' },
    '/app/account/Newslettersubscribers': { key: '7-3', parent: '7' },
    '/app/account/allgalleryimages': { key: '8-1', parent: '8' },
    '/app/account/addnewgallery': { key: '8-2', parent: '8' },
    '/app/account/allusers': { key: '9-1', parent: '9' },
    '/app/account/addnewuser': { key: '9-2', parent: '9' },
    '/app/account/changeuserpassword': { key: '9-3', parent: '9' },
    '/app/account/profile': { key: '10', parent: null },
    '/app/account/manage-message-slides': { key: '11-1', parent: '11' },
    '/app/account/manage-hero-slides': { key: '11-2', parent: '11' },
    '/app/account/manage-our-services': { key: '11-3', parent: '11' },
  };

    // Normalize pathname to handle trailing slashes and query params
    const cleanPath = pathname.replace(/\/$/, '').split('?')[0];
    const routeInfo = menuKeyByPath[pathname] || menuKeyByPath[cleanPath];

  return (
    <>
    <div className='hidden lg:block w-60 bg-white border-r'>
        <nav className='p-4'>
                    {(isAdmin || isEmployee || isClient || isAgent) && (
                    <Link href="/dashboard" className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      cleanPath === '/dashboard' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                        Dashboard
                    </Link>
                    )}
                    {(isAdmin || isEmployee || isClient || isAgent) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Shipments</p>
                      <div className='space-y-1'>
                        {(isAdmin || isEmployee) && (
                        <Link href="/dashboard/allshipments" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allshipments' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Shipments</Link>
                        )}
                        {(isAdmin || isAgent || isClient || isEmployee) && (
                        <Link href="/dashboard/myshipments" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/myshipments' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>My Shipment</Link>
                        )}
                        {(isAdmin || isAgent || isEmployee) && (
                        <Link href="/dashboard/createshipment" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/createshipment' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Create Shipment</Link>
                        )}
                        {(isAdmin || isAgent || isEmployee) && (
                        <Link href="/dashboard/archived-shipments" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/archived-shipments' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Delivered Shipment</Link>
                        )}
                        {(isAdmin || isEmployee) && (
                        <Link href="/dashboard/manage-shipment-status" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/manage-shipment-status' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Shipment Status</Link>
                        )}
                        {(isAdmin || isEmployee) && (
                        <Link href="/dashboard/manage-facility" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/manage-facility' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Facility</Link>
                        )}
                        {(isAdmin || isAgent || isClient || isEmployee) && (
                        <Link href="/dashboard/trackshipment" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/trackshipment' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Track Shipment</Link>
                        )}
                      </div>
                    </div>
                    )}
                    {(isAdmin || isEmployee) && (
                    <Link href="/dashboard/contactformresponses" className={`block px-3 py-2 rounded-md text-sm font-medium mt-4 ${
                      cleanPath === '/dashboard/contactformresponses' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                        Quote Request Responses
                    </Link>
                    )}
                    {(isAdmin || isEmployee || isClient) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Blog Post</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/allposts" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allposts' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Posts</Link>
                        {(isAdmin || isAgent|| isEmployee) && (
                        <Link href="/dashboard/allblogpost" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allblogpost' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Blog Posts</Link>
                        )}
                        {(isAdmin || isAgent || isEmployee) && (
                        <Link href="/dashboard/addnewpost" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/addnewpost' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Add New Post</Link>
                        )}
                      </div>
                    </div>
                    )}
                    {(isAdmin || isEmployee) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Events</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/allevents" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allevents' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage All Events</Link>
                        <Link href="/dashboard/addevent" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/addevent' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Add New Event</Link>
                      </div>
                    </div>
                    )}
                    {(isAdmin || isAgent || isEmployee || isClient) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Appointments</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/myappointments" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/myappointments' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>My Appointments</Link>
                        <Link href="/dashboard/bookappointment" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/bookappointment' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Book Appointment</Link>
                        {(isAdmin || isEmployee) && (
                        <Link href="/dashboard/allappointments" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allappointments' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Appointments</Link>
                        )}
                      </div>
                    </div>
                    )}
                    {(isAdmin || isEmployee) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Newsletter</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/sendnewsletter" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/sendnewsletter' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Send Newsletter</Link>
                        <Link href="/dashboard/allnewsletter" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allnewsletter' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Newsletters</Link>
                        <Link href="/dashboard/Newslettersubscribers" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/Newslettersubscribers' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Subscribers</Link>
                      </div>
                    </div>
                    )}
                    {(isAdmin || isEmployee) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Gallery</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/allgalleryimages" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allgalleryimages' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Gallery</Link>
                        <Link href="/dashboard/addnewgallery" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/addnewgallery' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Add New Gallery</Link>
                      </div>
                    </div>
                    )}
                    {(isAdmin || isEmployee) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Manage Users</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/allusers" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/allusers' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>All Users</Link>
                        <Link href="/dashboard/addnewuser" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/addnewuser' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Add New User</Link>
                        <Link href="/dashboard/changeuserpassword" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/changeuserpassword' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Change User Password</Link>
                      </div>
                    </div>
                    )}
                    {(isAdmin || isAgent || isEmployee || isClient) && (
                    <Link href="/dashboard/profile" className={`block px-3 py-2 rounded-md text-sm font-medium mt-4 ${
                      cleanPath === '/dashboard/profile' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                    }`}>
                        Profile
                    </Link>
                    )}
                    {(isAdmin || isEmployee) && (
                    <div className='mt-4'>
                      <p className='px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider'>Settings</p>
                      <div className='space-y-1'>
                        <Link href="/dashboard/manage-message-slides" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/manage-message-slides' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Message Slides</Link>
                        <Link href="/dashboard/manage-hero-slides" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/manage-hero-slides' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Hero Slides</Link>
                        <Link href="/dashboard/manage-our-services" className={`block px-3 py-2 rounded-md text-sm ${
                          cleanPath === '/dashboard/manage-our-services' ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}>Manage Our Services</Link>
                      </div>
                    </div>
                    )}
                    {(isAdmin || isAgent || isEmployee || isClient) && (
                    <div className='mt-4'>
                      <LogoutButton />
                    </div>
                    )}
        </nav>
    </div>
    </>
  )
}

export default DashMenu