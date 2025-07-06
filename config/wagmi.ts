import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia } from 'wagmi/chains'; // Import sepolia and arbitrumSepolia
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Get your dedicated RPC URLs from Alchemy or Infura
const ARBITRUM_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL; 

// Warn if project ID is missing (handled by WalletConnectWrapper.tsx as well)
if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. WalletConnect may not function correctly.");
}

// Warn if RPC URLs are missing
if (!ARBITRUM_SEPOLIA_RPC_URL) {
  console.error("NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL is not defined. Please set it in your .env.local and Netlify environment variables.");
}
if (!SEPOLIA_RPC_URL) { 
  console.error("NEXT_PUBLIC_SEPOLIA_RPC_URL is not defined. Please set it in your .env.local and Netlify environment variables.");
}

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrumSepolia], 
  connectors: [
    injected(),
    coinbaseWallet({ appName: 'Etfinity App' }),
    walletConnect({ projectId: projectId || '' }),
    metaMask(),
  ],
  transports: {
    [mainnet.id]: http(),
    // Use the dedicated RPC URL for Sepolia if available, otherwise fallback to default http()
    [sepolia.id]: SEPOLIA_RPC_URL ? http(SEPOLIA_RPC_URL) : http(),
    // Use the dedicated RPC URL for Arbitrum Sepolia if available, otherwise fallback to default http()
    [arbitrumSepolia.id]: ARBITRUM_SEPOLIA_RPC_URL ? http(ARBITRUM_SEPOLIA_RPC_URL) : http(),
  },
});
