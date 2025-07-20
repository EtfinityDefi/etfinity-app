import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

/**
 * @dev WalletConnect Project ID.
 * Obtain this from WalletConnect Cloud (https://cloud.walletconnect.com).
 * Required for WalletConnect functionality.
 */
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

/**
 * @dev Sepolia RPC URL.
 * Obtain this from a reliable RPC provider like Alchemy or Infura.
 * Required for interacting with the Sepolia testnet.
 */
const SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL; 

// Warn if WalletConnect Project ID is not defined.
if (!projectId) {
  console.warn("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not defined. WalletConnect may not function correctly.");
}

// Warn if Sepolia RPC URL is not defined.
if (!SEPOLIA_RPC_URL) { 
  console.error("NEXT_PUBLIC_SEPOLIA_RPC_URL is not defined. Please set it in your .env.local and Netlify environment variables.");
}

/**
 * @dev Wagmi configuration for the application.
 * Defines supported chains, connectors, and RPC transports.
 */
export const config = createConfig({
  // Configure supported chains for the application.
  chains: [mainnet, sepolia],
  // Configure wallet connectors.
  connectors: [
    injected(), // Auto-detects browser wallets (e.g., MetaMask, Brave Wallet)
    coinbaseWallet({ appName: 'Etfinity App' }), 
    walletConnect({ projectId: projectId || '' }), 
    metaMask(), 
  ],
  // Configure RPC transports for each chain.
  transports: {
    [mainnet.id]: http(), // Default HTTP transport for Mainnet
    // Use the provided RPC URL for Sepolia, falling back to default HTTP if not set.
    [sepolia.id]: SEPOLIA_RPC_URL ? http(SEPOLIA_RPC_URL) : http(),
  },
});
