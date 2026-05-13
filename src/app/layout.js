import { Inter, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QuerClientProvider from './QueryClientProvider';
import LayoutWrapper from '@/components/LayoutWrapper';
import { SubscribePopUp } from '@/components/HomeComponents/SubscribePopUp';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  weight: ['400', '700'], 
  subsets: ['latin'], 
  variable: '--font-poppins' 
});

export const metadata = {
  title: 'ESMOLOG - Your Ultimate Logistics Management Solution',
  description: 'Welcome to the ESMOLOG community! We are here to assist in providing necessary academic and social supports to all the incoming Managers',
  keywords: 'ESMOLOG, Logistics, Management, Solution',
  icons: {
    icon: '/esmologfav.png',
    apple: '/esmologfav.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="apple-touch-icon" href="/esmologfav.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playwrite+AU+SA:wght@100..400&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <QuerClientProvider>
          <SubscribePopUp />
          {/* <MessageSlides /> */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster position="top-right" />
        </QuerClientProvider>
      </body>
    </html>
  );
}
