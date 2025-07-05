'use client';

import dynamic from 'next/dynamic';
import React, { useRef, useState, useEffect } from 'react';
import Header from './Header'; 

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
  
  const INITIAL_BANNER_HEIGHT_PX = 32; 
  const INITIAL_HEADER_HEIGHT_PX = 64; 
  const INITIAL_TOTAL_HEADER_HEIGHT_PX = INITIAL_BANNER_HEIGHT_PX + INITIAL_HEADER_HEIGHT_PX;

  // State to store dynamically calculated heights
  const [bannerHeight, setBannerHeight] = useState(INITIAL_BANNER_HEIGHT_PX);
  const [totalFixedHeaderHeight, setTotalFixedHeaderHeight] = useState(INITIAL_TOTAL_HEADER_HEIGHT_PX);

  useEffect(() => {
    const calculateHeights = () => {
      const currentBannerHeight = bannerRef.current ? bannerRef.current.offsetHeight : INITIAL_BANNER_HEIGHT_PX;
      setBannerHeight(currentBannerHeight);

      const currentHeaderHeight = headerWrapperRef.current ? headerWrapperRef.current.offsetHeight : INITIAL_HEADER_HEIGHT_PX;
      
      setTotalFixedHeaderHeight(currentBannerHeight + currentHeaderHeight);
    };

    // Initial calculation on mount
    calculateHeights();

    // Recalculate heights on window resize events
    window.addEventListener('resize', calculateHeights);

    // Use a MutationObserver for robustness: watch for content changes that affect height
    const observer = new MutationObserver(calculateHeights);
    if (bannerRef.current) {
      observer.observe(bannerRef.current, { childList: true, subtree: true, attributes: true });
    }
    if (headerWrapperRef.current) {
      observer.observe(headerWrapperRef.current, { childList: true, subtree: true, attributes: true });
    }

    // Clean up event listeners and observer
    return () => {
      window.removeEventListener('resize', calculateHeights);
      observer.disconnect();
    };
  }, []); // Empty dependency array: runs once on mount, updates via event listeners/observer

  return (
    <DynamicWalletConnectWrapper>
      <div className="relative min-h-screen">
        <div ref={bannerRef} className="fixed top-0 left-0 w-full bg-red-700 text-white text-center py-2 z-50 text-sm">
          This is a DEMO application connected to Ethereum testnet.
        </div>

        <div
          ref={headerWrapperRef}
          className="fixed left-0 w-full z-40" 
          style={{ top: `${bannerHeight}px` }} // Dynamically set top based on actual banner height
        >
          <Header />
        </div>

        {/* Main content area - Padding to account for fixed elements */}
        {/* Initial padding will use the estimate, then dynamically update. */}
        <div style={{ paddingTop: `${totalFixedHeaderHeight}px` }}>
          {children}
        </div>
      </div>
    </DynamicWalletConnectWrapper>
  );
}
