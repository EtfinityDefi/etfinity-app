import { http, createConfig } from 'wagmi';
import { mainnet, sepolia, arbitrumSepolia } from 'wagmi/chains'; 
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com)
// It's crucial for WalletConnect connector.
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

// Define a fallback projectId or handle its absence
// if (!projectId) throw new Error('WalletConnect project ID is not defined');

export const config = createConfig({
  chains: [mainnet, sepolia, arbitrumSepolia], 
  connectors: [
    injected(), // Injected wallets like MetaMask
    coinbaseWallet({ appName: 'Etfinity App' }),
    walletConnect({ projectId: projectId || '' }), 
    metaMask(), 
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(), 
    // Add transports for other chains as needed
  },
});

// Optional: Export the config directly if you want to use it for Wagmi CLI generation
// export default config;
