'use client';

import React, { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from '@/config/wagmi'; 

// Optional: If you use RainbowKit, import its styles and component here.
// import '@rainbow-me/rainbowkit/styles.css';
// import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Optional: If using RainbowKit, wrap here */}
        {/* <RainbowKitProvider chains={config.chains}> */}
          {children}
        {/* </RainbowKitProvider> */}
      </QueryClientProvider>
    </WagmiProvider>
  );
}