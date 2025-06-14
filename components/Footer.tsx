'use client';

import React from 'react';
import Link from 'next/link'; 

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-6 text-center border-t border-zinc-800">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} Etfinity. All rights reserved.</p>
        <nav className="flex space-x-4">
          {/* Use Link component for proper navigation */}
          <Link
            href="/terms" 
            className="hover:text-purple-400 transition-colors duration-200 focus:outline-none"
          >
            Terms and Conditions
          </Link>
          <Link
            href="/privacy-policy" 
            className="hover:text-purple-400 transition-colors duration-200 focus:outline-none"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
