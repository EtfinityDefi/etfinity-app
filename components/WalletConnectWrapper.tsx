'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  arbitrumSepolia,
  sepolia,
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Initialize QueryClient for react-query
const queryClient = new QueryClient();

// Get WalletConnect Project ID from environment variables
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Ensure WalletConnect Project ID is defined
if (!walletConnectProjectId) {
  console.error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. Please set it in your .env.local file.");
}

// Configure chains and transports
const config = getDefaultConfig({
  appName: 'Etfinity Protocol',
  projectId: walletConnectProjectId || 'YOUR_FALLBACK_PROJECT_ID', 
  chains: [
    arbitrumSepolia,
    sepolia,
  ],
  ssr: true, // This is important for RainbowKit's internal SSR handling
});

interface WalletConnectWrapperProps {
  children: React.ReactNode;
}

export default function WalletConnectWrapper({ children }: WalletConnectWrapperProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children} {/* This will render the content passed from Providers.tsx */}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
