'use client';

import EtfinityGeometricLogo from './icons/EtfinityGeometricLogo';
import React, { useState, useEffect } from 'react';
import { Wallet, Menu, X } from 'lucide-react';
import { useWallet } from '../app/providers/WalletProvider';
import Link from 'next/link'; 

const Header: React.FC = () => {
  const {
    isConnected,
    walletAddress,
    setIsWalletModalOpen,
    disconnectWallet,
  } = useWallet();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
  }, [isConnected, walletAddress]);


  const handleDisconnect = () => {
    disconnectWallet();
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  const truncateAddress = (address: string | null): string => {
    if (typeof address !== 'string' || !address) {
      console.log("Header.tsx: truncateAddress returning empty string due to invalid address type or value.");
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
        {/* Use Link component for proper navigation to the home page */}
        <Link
          href="/" // Navigate to the root path
          className="flex items-center text-white text-2xl font-bold cursor-pointer"
          onClick={handleMobileMenuClick} // Close mobile menu if clicked
        >
          <EtfinityGeometricLogo className="h-8 mr-2 fill-purple-400" />
          <span className="text-purple-400">etfinity</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          <Link
            href="/dashboard"
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            href="/liquidity"
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Liquidity
          </Link>
          <Link
            href="/swap"
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            Swap
          </Link>
          <Link
            href="/faq"
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            className="text-zinc-300 hover:text-white transition-colors duration-200"
          >
            About
          </Link>
        </nav>

        {/* Wallet Connect Button & Mobile Menu Button */}
        <div className="flex items-center space-x-4">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
            >
              <Wallet size={18} />
              <span className="hidden xs:inline-block">{truncateAddress(walletAddress)}</span>
            </button>
          ) : (
            <button
              onClick={() => { setIsWalletModalOpen(true); setIsMobileMenuOpen(false); }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-2 xs:px-4 rounded-lg flex items-center space-x-0 xs:space-x-2 transition-colors duration-200 text-sm"
            >
              <Wallet size={18} />
              <span className="hidden xs:inline-block">Connect Wallet</span>
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
          <Link
            href="/dashboard"
            onClick={handleMobileMenuClick} // Close mobile menu after clicking
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Dashboard
          </Link>
          <Link
            href="/liquidity"
            onClick={handleMobileMenuClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Liquidity
          </Link>
          <Link
            href="/swap"
            onClick={handleMobileMenuClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Swap
          </Link>
          <Link
            href="/faq"
            onClick={handleMobileMenuClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            onClick={handleMobileMenuClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            About
          </Link>
        </nav>
      )}
    </header>
  );
};

export default Header;
