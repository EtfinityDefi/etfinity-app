import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

const ARBITRUM_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL;

// Ensure projectId is defined, provide fallback for wagmi config if not.
// The WalletConnectWrapper.tsx already handles a console.error if it's truly missing.
if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. WalletConnect may not function correctly.");
}

if (!ARBITRUM_SEPOLIA_RPC_URL) {
  console.error("NEXT_PUBLIC_ARBITRUM_SEPOLIA_RPC_URL is not defined. Please set it in your .env.local and Netlify environment variables.");
  // Throw an error or use a public fallback if this is critical
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
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: ARBITRUM_SEPOLIA_RPC_URL ? http(ARBITRUM_SEPOLIA_RPC_URL) : http(),
  },
});
