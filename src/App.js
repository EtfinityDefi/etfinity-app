import React, { useState } from 'react';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';
import LiquidityPage from './pages/LiquidityPage';
import SwapPage from './pages/SwapPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import HomePage from './pages/HomePage';

import WalletConnectModal from './components/WalletConnectModal';
import Footer from './components/Footer';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  // Core market data states
  // eslint-disable-next-line no-unused-vars
  const [sp500Price, setSp500Price] = useState(5000);
  // eslint-disable-next-line no-unused-vars
  const [collateralizationRatio, setCollateralizationRatio] = useState(150);

  // User holdings & activities
  const [userSspyHoldings, setUserSspyHoldings] = useState(0);
  const [userUsdcHoldings, setUserUsdcHoldings] = useState(0);
  const [userLpHoldingsValue, setUserLpHoldingsValue] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);

  const connectWallet = (addressFromModal) => {
    // Debugging: Log what's received from the modal
    console.log("App.js: connectWallet received addressFromModal:", addressFromModal);

    setIsConnected(true);
    // Ensure that walletAddress is always a string with a default if not provided
    const finalAddress = typeof addressFromModal === 'string' && addressFromModal.length > 0
                         ? addressFromModal
                         : "0xAbc1234567890defabcDEF1234567890aBcdE"; // Fallback to mock address

    setWalletAddress(finalAddress);
    setUserUsdcHoldings(10000.00);
    setIsWalletModalOpen(false);

    // Debugging: Log the final address being set in state
    console.log("App.js: Final walletAddress being set:", finalAddress);
    console.log("App.js: isConnected being set to true");
  };

  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col">
      {/* Demo Mode Banner - ADDED THIS SECTION */}
      <div className="w-full bg-red-600 text-white text-center py-2 text-sm font-semibold">
        This is a DEMO application. No real funds are used.
      </div>
      {/* End Demo Mode Banner */}

      <Header
        isConnected={isConnected}
        walletAddress={walletAddress}
        setCurrentPage={setCurrentPage}
        setIsWalletModalOpen={setIsWalletModalOpen}
        setIsConnected={setIsConnected}
        setWalletAddress={setWalletAddress}
        setUserUsdcHoldings={setUserUsdcHoldings}
      />
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage
            sp500Price={sp500Price}
            isConnected={isConnected}
            userSspyHoldings={userSspyHoldings}
            setUserSspyHoldings={setUserSspyHoldings}
            userUsdcHoldings={userUsdcHoldings}
            setUserUsdcHoldings={setUserUsdcHoldings}
            setRecentActivities={setRecentActivities}
            collateralizationRatio={collateralizationRatio}
            setIsWalletModalOpen={setIsWalletModalOpen}
            setCurrentPage={setCurrentPage}
          />
        )}
        {currentPage === 'dashboard' &&
          <DashboardPage
            sp500Price={sp500Price}
            collateralizationRatio={collateralizationRatio}
            userSspyHoldings={userSspyHoldings}
            recentActivities={recentActivities}
            userLpHoldingsValue={userLpHoldingsValue}
            isConnected={isConnected}
          />
        }
        {currentPage === 'liquidity' &&
          <LiquidityPage
            sp500Price={sp500Price}
            isConnected={isConnected}
            userSspyHoldings={userSspyHoldings}
            setUserSspyHoldings={setUserSspyHoldings}
            userUsdcHoldings={userUsdcHoldings}
            setUserUsdcHoldings={setUserUsdcHoldings}
            userLpHoldingsValue={userLpHoldingsValue}
            setUserLpHoldingsValue={setUserLpHoldingsValue}
            setRecentActivities={setRecentActivities}
            setIsWalletModalOpen={setIsWalletModalOpen}
          />
        }
        {currentPage === 'swap' && <SwapPage />}
        {currentPage === 'faq' && <FAQPage />}
        {currentPage === 'about' && <AboutPage />}
      </main>
      <Footer />

      <WalletConnectModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={connectWallet}
      />
    </div>
  );
}

export default App;