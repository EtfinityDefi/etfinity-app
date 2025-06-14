// app/providers/WalletProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

// Define the shape of the context value
interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  isWalletModalOpen: boolean;
  setIsWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  connectWallet: (addressFromModal?: string) => void;
  disconnectWallet: () => void;
  sp500Price: number | null;
  collateralizationRatio: number | null;
  userSspyHoldings: number;
  setUserSspyHoldings: React.Dispatch<React.SetStateAction<number>>;
  userUsdcHoldings: number;
  setUserUsdcHoldings: React.Dispatch<React.SetStateAction<number>>;
  userLpHoldingsValue: number;
  setUserLpHoldingsValue: React.Dispatch<React.SetStateAction<number>>;
  recentActivities: Activity[];
  setRecentActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}

interface Activity {
  description: string;
  time: string;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  // --- State Initialization with LocalStorage Read ---
  const [isConnected, setIsConnected] = useState<boolean>(false); // isConnected always starts as false
  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('walletAddress');
    }
    return null;
  });
  const [isWalletModalOpen, setIsWalletModalOpen] = useState<boolean>(false);

  // Market data
  const [sp500Price, setSp500Price] = useState<number | null>(5000);
  const [collateralizationRatio, setCollateralizationRatio] = useState<number | null>(150);

  // User holdings state, initialized from localStorage or with default values
  const [userSspyHoldings, setUserSspyHoldings] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userSspyHoldings');
      return saved !== null ? parseFloat(saved) : 0;
    }
    return 0;
  });

  const [userUsdcHoldings, setUserUsdcHoldings] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userUsdcHoldings');
      return saved !== null ? parseFloat(saved) : 10000.00;
    }
    return 10000.00;
  });

  const [userLpHoldingsValue, setUserLpHoldingsValue] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLpHoldingsValue');
      return saved !== null ? parseFloat(saved) : 0;
    }
    return 0;
  });

  // recentActivities: Now also loads from localStorage, and will NOT be cleared on disconnect.
  const [recentActivities, setRecentActivities] = useState<Activity[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('recentActivities');
      try {
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error("Failed to parse recentActivities from localStorage", e);
        return [];
      }
    }
    return [];
  });

  // --- useEffect to Save All Persistent State to LocalStorage ---
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      localStorage.setItem('userSspyHoldings', userSspyHoldings.toString());
      localStorage.setItem('userUsdcHoldings', userUsdcHoldings.toString());
      localStorage.setItem('userLpHoldingsValue', userLpHoldingsValue.toString());
      localStorage.setItem('recentActivities', JSON.stringify(recentActivities)); // Recent activities is saved
      localStorage.setItem('isConnected', isConnected.toString()); // isConnected is explicitly NOT saved (it's in the useEffect below now)

      if (walletAddress) {
        localStorage.setItem('walletAddress', walletAddress);
      } else {
        localStorage.removeItem('walletAddress');
      }
    } catch (error) {
      console.error("Failed to save state to localStorage:", error);
    }
  }, [userSspyHoldings, userUsdcHoldings, userLpHoldingsValue, recentActivities, isConnected, walletAddress]);

  // --- Wallet Connection / Disconnection Logic ---
  const connectWallet = (addressFromModal?: string) => {
    setIsConnected(true);
    const finalAddress = typeof addressFromModal === 'string' && addressFromModal.length > 0
                             ? addressFromModal
                             : "0xAbc1234567890defabcDEF1234567890aBcdE";
    setWalletAddress(finalAddress);
    setIsWalletModalOpen(false);
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setWalletAddress(null);
    // IMPORTANT: recentActivities is NO LONGER cleared here.
    // It will persist via localStorage just like the holdings.
  };

  // --- Context Value Provider ---
  const value: WalletContextType = {
    isConnected,
    walletAddress,
    isWalletModalOpen,
    setIsWalletModalOpen,
    connectWallet,
    disconnectWallet,
    sp500Price,
    collateralizationRatio,
    userSspyHoldings,
    setUserSspyHoldings,
    userUsdcHoldings,
    setUserUsdcHoldings,
    userLpHoldingsValue,
    setUserLpHoldingsValue,
    recentActivities,
    setRecentActivities,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to consume the WalletContext
export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === null) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
