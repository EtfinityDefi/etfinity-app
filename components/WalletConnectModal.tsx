'use client'; 

import React from 'react';
import { X, Wallet } from 'lucide-react';
import { useWallet } from '../app/providers/WalletProvider'; 

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface WalletConnectModalProps {}

const WalletConnectModal: React.FC<WalletConnectModalProps> = () => {
  const { isWalletModalOpen, setIsWalletModalOpen, connectWallet } = useWallet();

  // If the modal is not open, return null to render nothing
  if (!isWalletModalOpen) { 
    return null;
  }

  // Map onClose prop to setIsWalletModalOpen(false)
  const handleClose = () => {
    setIsWalletModalOpen(false);
  };

  // Map onConnect prop to the connectWallet function from context
  const handleConnect = () => {
    connectWallet(); 
  };

  return (
    // Overlay for the modal, covers the entire viewport
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal content container */}
      <div className="bg-zinc-800 rounded-xl p-8 shadow-2xl border border-zinc-700 w-full max-w-md relative">
        {/* Close button for the modal */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
          aria-label="Close wallet connect modal"
        >
          <X size={24} />
        </button>

        {/* Modal title */}
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Connect Your Wallet</h3>
        
        {/* Modal description */}
        <p className="text-zinc-300 text-center mb-8">
          Choose your preferred wallet to connect to Etfinity.
        </p>

        {/* Connect MetaMask button */}
        <button
          onClick={handleConnect}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 flex items-center justify-center space-x-2"
        >
          <Wallet size={20} />
          <span>Connect MetaMask</span>
        </button>

        {/* Terms of Service disclaimer */}
        <p className="text-zinc-500 text-sm mt-4 text-center">
          By connecting a wallet, you agree to the Etfinity Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default WalletConnectModal;
