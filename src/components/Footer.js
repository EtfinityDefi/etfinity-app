import React from 'react';

const Footer = ({ onNavigate }) => { 
  return (
    <footer className="bg-zinc-900 text-zinc-400 py-6 text-center border-t border-zinc-800">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm">
        <p className="mb-2 sm:mb-0">&copy; {new Date().getFullYear()} Etfinity. All rights reserved.</p>
        <nav className="flex space-x-4">
          <button
            onClick={() => onNavigate('termsAndConditions')}
            className="hover:text-purple-400 transition-colors duration-200 focus:outline-none"
          >
            Terms and Conditions
          </button>
          <button
            onClick={() => onNavigate('privacyPolicy')} 
            className="hover:text-purple-400 transition-colors duration-200 focus:outline-none"
          >
            Privacy Policy
          </button>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;