import EtfinityGeometricLogo from './icons/EtfinityGeometricLogo';
import React, { useState, useEffect } from 'react'; // Import useEffect for logging
import { Wallet, Menu, X } from 'lucide-react';

const Header = ({
  isConnected,
  walletAddress,
  setCurrentPage,
  setIsWalletModalOpen,
  setIsConnected,
  setWalletAddress,
  setUserUsdcHoldings
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Debugging: Log props received by Header whenever they change
  useEffect(() => {
    console.log("Header.js: Props updated - isConnected:", isConnected, "walletAddress:", walletAddress);
  }, [isConnected, walletAddress]);


  const handleDisconnect = () => {
    setIsConnected(false);
    setWalletAddress(null);
    setUserUsdcHoldings(0);
    setIsMobileMenuOpen(false);
  };

  const handleNavLinkClick = (page) => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  const truncateAddress = (address) => {
    // Debugging: Log the address inside truncateAddress
    console.log("Header.js: truncateAddress called with:", address, "type:", typeof address);

    if (typeof address !== 'string' || !address) {
      console.log("Header.js: truncateAddress returning empty string due to invalid address type or value.");
      return '';
    }
    if (address.length < 10) {
        return address;
    }
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <header className="bg-zinc-800 p-4 shadow-md sticky top-0 z-10 border-b border-zinc-700">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Etfinity text */}
        <div
          className="flex items-center text-white text-2xl font-bold cursor-pointer"
          onClick={() => handleNavLinkClick('home')}
        >
          <EtfinityGeometricLogo className="h-8 mr-2 fill-purple-400" />
          <span className="text-purple-400">etfinity</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <a
            href="#dashboard"
            onClick={() => handleNavLinkClick('dashboard')}
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </a>
          <a
            href="#liquidity"
            onClick={() => handleNavLinkClick('liquidity')}
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Liquidity
          </a>
          <a
            href="#swap"
            onClick={() => handleNavLinkClick('swap')}
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Swap
          </a>
          <a
            href="#faq"
            onClick={() => handleNavLinkClick('faq')}
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            FAQ
          </a>
          <a
            href="#about"
            onClick={() => handleNavLinkClick('about')}
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            About
          </a>
        </nav>

        {/* Wallet Connect Button & Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <Wallet size={18} />
              <span>{truncateAddress(walletAddress)}</span>
            </button>
          ) : (
            <button
              onClick={() => { setIsWalletModalOpen(true); setIsMobileMenuOpen(false); }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <Wallet size={18} />
              <span>Connect Wallet</span>
            </button>
          )}

          <button
            className="md:hidden text-zinc-300 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-zinc-800 px-4 pt-2 pb-4 space-y-2 flex flex-col items-end border-t border-zinc-700">
          <a
            href="#dashboard"
            onClick={() => handleNavLinkClick('dashboard')}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Dashboard
          </a>
          <a
            href="#liquidity"
            onClick={() => handleNavLinkClick('liquidity')}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Liquidity
          </a>
          <a
            href="#swap"
            onClick={() => handleNavLinkClick('swap')}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Swap
          </a>
          <a
            href="#faq"
            onClick={() => handleNavLinkClick('faq')}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            FAQ
          </a>
          <a
            href="#about"
            onClick={() => handleNavLinkClick('about')}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            About
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;