import React from 'react';
import { X, Wallet } from 'lucide-react';

const WalletConnectModal = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-800 rounded-xl p-8 shadow-2xl border border-zinc-700 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X size={24} />
        </button>
        <h3 className="text-2xl font-bold text-white mb-6 text-center">Connect Your Wallet</h3>
        <p className="text-zinc-300 text-center mb-8">
          Choose your preferred wallet to connect to Etfinity.
        </p>
        <button
          onClick={onConnect}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 flex items-center justify-center space-x-2"
        >
          <Wallet size={20} />
          <span>Connect MetaMask</span>
        </button>
        {/* Add more wallet options here */}
        <p className="text-zinc-500 text-sm mt-4 text-center">
          By connecting a wallet, you agree to the Etfinity Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default WalletConnectModal;