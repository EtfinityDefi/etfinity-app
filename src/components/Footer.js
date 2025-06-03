import React from 'react';

const Footer = () => {
  return (
    <footer className="py-8 text-center text-zinc-500 text-sm border-t border-zinc-800 mt-12">
      &copy; {new Date().getFullYear()} Etfinity. All rights reserved.
    </footer>
  );
};

export default Footer;