'use client';

import EtfinityGeometricLogo from './icons/EtfinityGeometricLogo';
import React, { useState } from 'react';
import Link from 'next/link';
import { Wallet, Menu, X } from 'lucide-react'; 
import { ConnectButton } from '@rainbow-me/rainbowkit'; 

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleMobileMenuLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-zinc-800 p-4 shadow-md sticky top-0 z-10 border-b border-zinc-700">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and Etfinity text */}
        <Link
          href="/"
          className="flex items-center text-white text-2xl font-bold cursor-pointer"
          onClick={handleMobileMenuLinkClick}
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
          {/* Custom styled ConnectButton */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openAccountModal,
              openChainModal,
              mounted,
            }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    'style': {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-2 xs:px-4 rounded-lg flex items-center space-x-0 xs:space-x-2 transition-colors duration-200 text-sm"
                        >
                          <Wallet size={18} />
                          <span className="hidden xs:inline-block">Connect Wallet</span>
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={openChainModal}
                          style={{ display: 'flex', alignItems: 'center' }}
                          type="button"
                          className="bg-zinc-700 hover:bg-zinc-600 text-white font-semibold py-2 px-3 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: 'hidden',
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors duration-200 text-sm"
                        >
                          <Wallet size={18} />
                          <span className="hidden xs:inline-block">{account.displayName}</span>
                          {account.displayBalance && (
                            <span className="hidden sm:inline-block ml-2 text-zinc-200">
                              ({account.displayBalance})
                            </span>
                          )}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>

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
            onClick={handleMobileMenuLinkClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Dashboard
          </Link>
          <Link
            href="/liquidity"
            onClick={handleMobileMenuLinkClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Liquidity
          </Link>
          <Link
            href="/swap"
            onClick={handleMobileMenuLinkClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            Swap
          </Link>
          <Link
            href="/faq"
            onClick={handleMobileMenuLinkClick}
            className="block text-zinc-300 hover:text-white transition-colors duration-200 py-1"
          >
            FAQ
          </Link>
          <Link
            href="/about"
            onClick={handleMobileMenuLinkClick}
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
