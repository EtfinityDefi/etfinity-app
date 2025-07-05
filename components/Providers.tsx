'use client'; 
import dynamic from 'next/dynamic';
import React from 'react';
import Header from './Header';

// Dynamically import the WalletConnectWrapper component, disabling SSR
const DynamicWalletConnectWrapper = dynamic(
  () => import('./WalletConnectWrapper'),
  { ssr: false }
);

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const FIXED_HEADER_HEIGHT_TAILWIND_CLASS = 'pt-24'; 

  return (
    <DynamicWalletConnectWrapper>
      <div className="relative min-h-screen">
        {/* Red Demo Banner - Fixed at the very top */}
        <div className="fixed top-0 left-0 w-full bg-red-700 text-white text-center py-2 z-50 text-sm">
          This is a DEMO application connected to Ethereum testnet (Sepolia and Arbitrum Sepolia).
        </div>

        <div className="fixed top-8 left-0 w-full z-40"> 
          <Header />
        </div>

        <div className={FIXED_HEADER_HEIGHT_TAILWIND_CLASS}>
          {children}
        </div>
      </div>
    </DynamicWalletConnectWrapper>
  );
}
