'use client';

import { usePathname } from 'next/navigation';
import HeaderSection from '@/components/HomeComponents/HeaderSection';
import FooterSection from '@/components/HomeComponents/FooterSection';
import MessageSlides from './HomeComponents/MessageSlides';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Don't show header and footer on dashboard pages
  const isDashboard = pathname.startsWith('/dashboard');
  
  return (
    <>
      {!isDashboard && <MessageSlides />}
      {!isDashboard && <HeaderSection />}
      {children}
      {!isDashboard && <FooterSection />}
    </>
  );
}
