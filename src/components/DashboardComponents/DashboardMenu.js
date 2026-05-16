"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Briefcase, NotepadText, Contact, TableProperties, Users, Mails, Images } from 'lucide-react';
import { useProfile } from '@/components/context-api/ProfileContext';

function Icon({ name }) {
  switch (name) {
    case 'dashboard':
      return (
        <LayoutDashboard className="w-5 h-5" />
      )
    case 'projects':
      return (
        <Briefcase className="w-5 h-5" />
      )
    case 'blog':
      return (
        <NotepadText className="w-5 h-5" />
      )
    case 'Contact':
      return (
        <Contact  className="w-5 h-5" />
      )
    case 'Quote Requests':
    return (
      <TableProperties className="w-5 h-5" />
    )
    case 'Users':
    return (
      <Users className="w-5 h-5" />
    )
    case 'Newsletter':
    return (
      <Mails className="w-5 h-5" />
    )
    case 'Newsletter':
    return (
      <Mails className="w-5 h-5" />
    )
    case 'Gallery':
    return (
      <Images className="w-5 h-5" />
    )
    default:
      return null
  }
}

export default function DashboardMenu({ collapsed, mobileOpen = false, onClose = () => { } }) {
  const { currentUser, logout } = useProfile()
  const pathname = usePathname() || ''

  const handleLogout = () => {
    logout();
    onClose();
  };
  const items = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard', roles: ['admin', 'employee', 'client', 'agent'] },
    {
      href: '/dashboard/programme',
      label: 'Shipments Management',
      icon: 'Users',
      roles: ['admin', 'employee'],
      children: [
        { href: '/dashboard/allshipments', label: 'All Shipments', roles: ['admin', 'employee', 'agent'] },
        { href: '/dashboard/myshipments', label: 'My Shipments', roles: ['admin', 'employee', 'agent'] },
        { href: '/dashboard/createshipment', label: 'Create Shipment', roles: ['admin', 'employee', 'agent'] },
        { href: '/dashboard/archived-shipments', label: 'Delivered Shipments', roles: ['admin', 'employee', 'agent'] },
        { href: '/dashboard/manage-shipment-status', label: 'Manage Shipment Status', roles: ['admin'] },
        { href: '/dashboard/manage-facility', label: 'Manage Facilities', roles: ['admin'] },
        { href: '/dashboard/trackshipment', label: 'Track Shipment', roles: ['admin', 'employee', 'agent', 'client'] },
      ]
    },
    { href: '/dashboard/contactformresponses', label: 'Quote Request Responses', icon: 'dashboard', roles: ['admin', 'employee'] },
    {
      href: '/dashboard/blogs',
      label: 'Blog Management',
      icon: 'Users',
      roles: ['admin', 'employee'],
      children: [
        { href: '/dashboard/allblogpost', label: 'All Posts', roles: ['admin'] },
        { href: '/dashboard/addnewpost', label: 'Add Post', roles: ['admin'] },
      ]
    },
    {
      href: '/dashboard/events',
      label: 'Event Management',
      icon: 'Users',
      roles: ['admin', 'employee'],
      children: [
        { href: '/dashboard/allevents', label: 'All Events', roles: ['admin'] },
        { href: '/dashboard/addevent', label: 'Add Event', roles: ['admin'] },
      ]
    },
    {
      href: '/dashboard/appointments',
      label: 'Manage Appointment',
      icon: 'Users',
      roles: ['admin', 'employee'],
      children: [
        { href: '/dashboard/allappointments', label: 'All Appointments', roles: ['admin'] },
        { href: '/dashboard/myappointments', label: 'My Appointments', roles: ['admin'] },
        { href: '/dashboard/bookappointment', label: 'Book Appointment', roles: ['admin'] },
      ]
    },

    // Client and Agent specific links
    { href: '/dashboard/myshipments', label: 'My Shipments', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/dashboard/trackshipment', label: 'Track Shipment', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/dashboard/bookappointment', label: 'Book Appointment', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/dashboard/myappointments', label: 'My Appointments', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/gallery', label: 'View Gallery Images', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/blog', label: 'Read Our Blogs', icon: 'Users', roles: ['client', 'agent'] },
    { href: '/request-quote', label: 'Request Quote', icon: 'Users', roles: ['client', 'agent'] },

    {
      href: '/dashboard/all-newsletter',
      label: 'Newsletter Management',
      icon: 'Newsletter',
      roles: ['admin'],
      children: [
        { href: '/dashboard/sendnewsletter', label: 'Send Newsletter', roles: ['admin'] },
        { href: '/dashboard/allnewsletter', label: 'All Newsletters', roles: ['admin'] },
        { href: '/dashboard/newslettersubscribers', label: 'Subscribers', roles: ['admin'] },
      ]
    },
    {
      href: '/dashboard/gallery',
      label: 'Gallery Management',
      icon: 'Newsletter',
      roles: ['admin', 'employee'],
      children: [
        { href: '/dashboard/allgalleryimages', label: 'All Gallery Images', roles: ['admin', 'employee'] },
        { href: '/dashboard/addnewgallery', label: 'Add New Gallery Image', roles: ['admin', 'employee'] },
      ]
    },
    {
      href: '/dashboard/users',
      label: 'Manage Users',
      icon: 'Users',
      roles: ['admin'],
      children: [
        { href: '/dashboard/allusers', label: 'All Users', roles: ['admin'] },
        { href: '/dashboard/addnewuser', label: 'Add User', roles: ['admin'] },
        { href: '/dashboard/changeuserpassword', label: 'Change User Password', roles: ['admin'] }
      ]
    },
    { href: '/dashboard/profile', label: 'Profile', icon: 'dashboard', roles: ['admin', 'employee', 'agent', 'client'] },
    { href: '/dashboard/view-email-logs', label: 'Email Logs', icon: 'dashboard', roles: ['admin'] },
    {
      href: '/dashboard/home',
      label: 'HomePage Content',
      icon: 'Users',
      roles: ['admin'],
      children: [
        { href: '/dashboard/manage-message-slides', label: 'Manage Message Slider', roles: ['admin'] },
        { href: '/dashboard/manage-hero-slides', label: 'Manage Hero Slider', roles: ['admin'] },
        { href: '/dashboard/manage-our-services', label: 'Manage Our Services', roles: ['admin'] }
      ]
    },
  ]

   // Helper function to check if user has access to item
  const hasAccess = (itemRoles) => {
    if (!itemRoles) return true; // No role restriction
    return itemRoles.includes(currentUser?.role);
  }

  const [openKey, setOpenKey] = useState(null)

  function toggleSub(key) {
    setOpenKey(prev => (prev === key ? null : key))
  }

  // Desktop / large screens: persistent sidebar
  const desktopNav = (
    <nav className={`hidden md:flex h-full bg-green-700 border-r border-gray-100 ${collapsed ? 'w-16' : 'w-64'} transition-width duration-200`} aria-label="Dashboard navigation">
      <div className="h-full overflow-y-auto py-6 px-2">
        <ul className="space-y-1">
          {items.map(i => {
            // Check if user has access to this item
            if (!hasAccess(i.roles)) return null;

            const active = pathname === i.href || pathname.startsWith(i.href + '/')
            const hasChildren = Array.isArray(i.children) && i.children.length > 0
            const isOpen = openKey === i.href
            // Filter children based on access
            const visibleChildren = hasChildren ? i.children.filter(c => hasAccess(c.roles)) : [];

            return (
              <li key={i.href}>
                {hasChildren ? (
                  <div>
                    <button
                      onClick={() => toggleSub(i.href)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md ${active ? 'bg-indigo-50 text-green-600' : 'text-white hover:bg-green-800'}`}
                    >
                      <span className="flex justify-start items-center gap-2">
                        <span className="shrink-0"> <Icon name={i.icon} /> </span>
                        {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{i.label}</span>}
                      </span>
                      {!collapsed && (
                        <svg className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l6 4-6 4V6z" />
                        </svg>
                      )}
                    </button>

                    {/* Submenu (desktop) */}
                    {!collapsed && isOpen && (
                      <ul className="mt-1 space-y-1 pl-10">
                        {i.children.map(c => (
                          <li key={c.href}>
                            <Link href={c.href} className={`block px-3 py-2 rounded-md text-sm ${pathname === c.href ? 'bg-indigo-50 text-green-600' : 'text-white hover:bg-green-800'}`}>
                              {c.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link href={i.href} className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? 'bg-indigo-50 text-green-600' : 'text-white hover:bg-green-800'}`}>
                    <span className="shrink-0"> <Icon name={i.icon} /> </span>
                    {!collapsed && <span className="text-sm font-medium">{i.label}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )

  // Mobile overlay nav: only visible when mobileOpen is true
  const mobileNav = mobileOpen ? (
    <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />

      <nav className="relative z-50 h-full w-[80%] bg-green-700 border-r border-gray-100">
        <div className="h-full overflow-y-auto py-6 px-4">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex flex-col items-center gap-3">
              <Image src="/img/esmologtrans.png" alt="Esmolog" width={170} height={50} className="w-16 block rounded-md" />
            </Link>
            <button aria-label="Close menu" onClick={onClose} className="p-2 rounded-md text-red-600 hover:bg-gray-100">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ul className="space-y-1">
              {items.map(i => {
                // Check if user has access to this item
                if (!hasAccess(i.roles)) return null;

                const active = pathname === i.href || pathname.startsWith(i.href + '/')
                const hasChildren = Array.isArray(i.children) && i.children.length > 0
                const isOpen = openKey === i.href
                // Filter children based on access
                const visibleChildren = hasChildren ? i.children.filter(c => hasAccess(c.roles)) : [];

                return (
                  <li key={i.href}>
                    {hasChildren ? (
                      <div>
                        <button onClick={() => toggleSub(i.href)} className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md ${active ? 'bg-white text-green-600' : 'text-white hover:bg-green-800'}`}>
                          <span className="flex items-center gap-3">
                            <span className="shrink-0 text-white"> <Icon name={i.icon} /> </span>
                            <span className="text-sm font-medium">{i.label}</span>
                          </span>
                          <svg className={`w-4 h-4 text-white transition-transform ${isOpen ? 'rotate-90' : ''}`} viewBox="0 0 20 20" fill="none" stroke="currentColor">
                            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 6l6 4-6 4V6z" />
                          </svg>
                        </button>

                        {/* Mobile submenu accordion */}
                        {isOpen && (
                          <ul className="mt-1 space-y-1 pl-6">
                            {i.children.map(c => (
                              <li key={c.href}>
                                <Link href={c.href} onClick={onClose} className={`block px-3 py-2 rounded-md text-sm ${pathname === c.href ? 'bg-indigo-50 text-green-600' : 'text-white hover:bg-green-800'}`}>
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link href={i.href} onClick={onClose} className={`flex items-center gap-3 px-3 py-2 rounded-md ${active ? 'bg-green-50 text-green-600' : 'text-white hover:bg-green-800'}`}>
                        <span className="shrink-0 text-white"> <Icon name={i.icon} /> </span>
                        <span className="text-sm font-medium">{i.label}</span>
                      </Link>
                    )}
                  </li>
                )
              })}
          </ul>
        </div>

        {/* Logout button */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span>Logout</span>
          </button>
        </div> */}
      </nav>
    </div>
  ) : null

  return (
    <>
      {desktopNav}
      {mobileNav}
    </>
  )
}
