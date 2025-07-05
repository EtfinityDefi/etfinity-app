// NO 'use client' directive here - this is a Server Component
import './globals.css';
import { Inter } from 'next/font/google';
import Providers from '../components/Providers'; 
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Etfinity Protocol',
  description: 'Decentralized Synthetic ETFs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-900 text-white min-h-screen flex flex-col`}>
        <Providers>
          {/* GlobalHeader is rendered inside Providers, and handles its own fixed positioning */}
          {/* The children prop passed to Providers will be the main content of each page */}
          {children}
        </Providers>
        <Footer /> {/* Render Footer component here at the bottom */}
      </body>
    </html>
  );
}
