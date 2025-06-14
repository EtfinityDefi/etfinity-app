import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains'; // Add other chains you use
import { injected, metaMask, walletConnect, coinbaseWallet } from 'wagmi/connectors';

// Get project ID from WalletConnect Cloud (https://cloud.walletconnect.com)
// It's crucial for WalletConnect connector.
export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID;

// You might also need to define a fallback projectId or handle its absence
// if (!projectId) throw new Error('WalletConnect project ID is not defined');

export const config = createConfig({
  chains: [mainnet, sepolia], // Add/remove chains as per your dApp
  connectors: [
    injected(), // Injected wallets like MetaMask
    coinbaseWallet({ appName: 'Etfinity App' }),
    walletConnect({ projectId: projectId || '' }), // WalletConnect (replace with your projectId)
    metaMask(), // MetaMask (can be included specifically)
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    // Add transports for other chains as needed
  },
});

// Optional: Export the config directly if you want to use it for Wagmi CLI generation
// export default config;