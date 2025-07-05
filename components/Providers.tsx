'use client'; 
import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
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
  const bannerRef = useRef<HTMLDivElement>(null);
  const headerWrapperRef = useRef<HTMLDivElement>(null); 
  const [totalFixedHeaderHeight, setTotalFixedHeaderHeight] = useState(0);

  useEffect(() => {
    const calculateHeaderHeights = () => {
      const bannerHeight = bannerRef.current ? bannerRef.current.offsetHeight : 0;
      const headerHeight = headerWrapperRef.current ? headerWrapperRef.current.offsetHeight : 0;
      // Add a small buffer if needed, e.g., 4px or 8px for visual separation
      setTotalFixedHeaderHeight(bannerHeight + headerHeight);
    };

    // Calculate on mount and on window resize
    calculateHeaderHeights();
    window.addEventListener('resize', calculateHeaderHeights);

    // Clean up event listener
    return () => {
      window.removeEventListener('resize', calculateHeaderHeights);
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <DynamicWalletConnectWrapper>
      <div className="relative min-h-screen">
        {/* Red Demo Banner - Fixed at the very top */}
        {/* Changed z-index from z-50 to z-30 so it sits below the main header */}
        <div ref={bannerRef} className="fixed top-0 left-0 w-full bg-red-700 text-white text-center py-2 z-30 text-sm">
          This is a DEMO application connected to Ethereum testnet (Sepolia and Arbitrum Sepolia)
        </div>

        <div
          ref={headerWrapperRef}
          className="fixed left-0 w-full z-40" // z-40 ensures it's above the z-30 banner
          style={{ top: `${bannerRef.current ? bannerRef.current.offsetHeight : 0}px` }}
        >
          <Header />
        </div>

        {/* Main content area - Padding to account for fixed banner and header */}
        {/* The paddingTop is dynamically set based on totalFixedHeaderHeight */}
        <div style={{ paddingTop: `${totalFixedHeaderHeight}px` }}>
          {children}
        </div>
      </div>
    </DynamicWalletConnectWrapper>
  );
}
