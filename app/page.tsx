'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, ArrowRightLeft, BarChart3 } from 'lucide-react';
import { useWallet } from '../app/providers/WalletProvider';
import { useRouter } from 'next/navigation';

const HomePage: React.FC = () => {
  const router = useRouter();

  const {
    isConnected,
    userUsdcHoldings, 
    setUserUsdcHoldings,
    userSspyHoldings,
    setUserSspyHoldings,
    setRecentActivities,
    sp500Price,
    collateralizationRatio,
    setIsWalletModalOpen,
  } = useWallet();

  const [activeTab, setActiveTab] = useState('mint');
  const [collateralAmount, setCollateralAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('USDC');
  const [sspyAmount, setSspyAmount] = useState('');
  const [mintError, setMintError] = useState('');
  const [redeemError, setRedeemError] = useState('');

  const currentSp500Price = sp500Price ?? 0;
  const currentCollateralizationRatio = collateralizationRatio ?? 0;

  const calculateSspy = useCallback((amount: string): string => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return '';
    }
    const denominator = currentSp500Price * (currentCollateralizationRatio / 100);
    if (isNaN(denominator) || denominator === 0) { return '0.0000'; }
    return (parsedAmount / denominator).toFixed(4);
  }, [currentSp500Price, currentCollateralizationRatio]);

  const calculateCollateral = useCallback((amount: string): string => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return '';
    }
    const product = parsedAmount * currentSp500Price * (currentCollateralizationRatio / 100);
    if (isNaN(product)) { return '0.00'; }
    return product.toFixed(2);
  }, [currentSp500Price, currentCollateralizationRatio]);

  useEffect(() => {
    if (activeTab === 'mint') {
      setSspyAmount(calculateSspy(collateralAmount));
    }
  }, [collateralAmount, activeTab, calculateSspy]);

  useEffect(() => {
    if (activeTab === 'redeem') {
      setCollateralAmount(calculateCollateral(sspyAmount));
    }
  }, [sspyAmount, activeTab, calculateCollateral]);

  const handleMint = () => {
    setMintError('');
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    const collateralInput = parseFloat(collateralAmount || '0');
    if (!collateralInput || collateralInput <= 0) {
      setMintError("Please enter a valid collateral amount to mint.");
      return;
    }
    if (collateralInput > userUsdcHoldings) { // Use actual userUsdcHoldings
      setMintError("You do not have enough USDC collateral.");
      return;
    }

    const totalMintedAmount = parseFloat(calculateSspy(collateralInput.toString()));
    if (isNaN(totalMintedAmount) || totalMintedAmount <= 0) {
        setMintError("Could not calculate sSPY amount. Check inputs and market data.");
        return;
    }

    const collateralUsed = collateralInput;

    setUserUsdcHoldings(prev => prev - collateralUsed);
    setUserSspyHoldings(prevHoldings => prevHoldings + totalMintedAmount);

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRecentActivities(prevActivities => [
      { description: `Minted ${totalMintedAmount.toFixed(4)} sSPY with ${collateralUsed.toFixed(2)} ${selectedCollateral}`, time: timeString },
      ...prevActivities
    ]);

    setCollateralAmount('');
    setSspyAmount('');
    router.push('/dashboard');
  };

  const handleRedeem = () => {
    setRedeemError('');
    if (!isConnected) {
      setIsWalletModalOpen(true);
      return;
    }
    const sspyInput = parseFloat(sspyAmount || '0');
    if (!sspyInput || sspyInput <= 0) {
      setRedeemError("Please enter a valid amount of sSPY to redeem.");
      return;
    }
    if (sspyInput > userSspyHoldings) {
      setRedeemError("You do not have enough sSPY to redeem.");
      return;
    }

    const redeemedAmount = sspyInput;
    const receivedCollateral = parseFloat(calculateCollateral(sspyInput.toString()));
    if (isNaN(receivedCollateral) || receivedCollateral <= 0) {
        setRedeemError("Could not calculate collateral amount. Check inputs and market data.");
        return;
    }

    setUserSspyHoldings(prevHoldings => prevHoldings - redeemedAmount);
    setUserUsdcHoldings(prevHoldings => prevHoldings + receivedCollateral); // Use actual userUsdcHoldings

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setRecentActivities(prevActivities => [
      { description: `Redeemed ${redeemedAmount.toFixed(4)} sSPY for ${receivedCollateral.toFixed(2)} ${selectedCollateral}`, time: timeString },
      ...prevActivities
    ]);

    setCollateralAmount('');
    setSspyAmount('');
  };

  return (
    <main>
      <section className="text-center py-16 px-6 md:py-24">
        <h2 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 drop-shadow-md">
          Synthetic ETFs in Your wallet
          <span className="text-purple-400 block mt-2">No brokers, No banks.</span>
        </h2>
        <p className="text-lg md:text-xl text-zinc-300 max-w-3xl mx-auto mb-8">
          Access a growing range of synthetic assets, starting with sSPY, directly from your crypto wallet.
          Experience true ownership and decentralized finance.
        </p>
        {!isConnected && (
          <button
            onClick={() => setIsWalletModalOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75"
          >
            Get Started
          </button>
        )}
      </section>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700">
          <div className="flex justify-center mb-6">
            <button
              onClick={() => { setActiveTab('mint'); setMintError(''); }}
              className={`px-6 py-3 rounded-l-xl text-lg font-semibold transition-all duration-300 ${
                activeTab === 'mint'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Mint sSPY
            </button>
            <button
              onClick={() => { setActiveTab('redeem'); setRedeemError(''); }}
              className={`px-6 py-3 rounded-r-xl text-lg font-semibold transition-all duration-300 ${
                activeTab === 'redeem'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              Redeem sSPY
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-center">
            <div className="bg-zinc-700 p-4 rounded-xl shadow-inner flex flex-col items-center justify-center">
              <BarChart3 size={24} className="text-purple-400 mb-2" />
              <p className="text-zinc-300 text-sm">S&P 500 Price (Chainlink)</p>
              <p className="text-xl font-bold text-white">
                ${sp500Price !== undefined && sp500Price !== null ? sp500Price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
              </p>
            </div>
            <div className="bg-zinc-700 p-4 rounded-xl shadow-inner flex flex-col items-center justify-center">
              <DollarSign size={24} className="text-green-400 mb-2" />
              <p className="text-zinc-300 text-sm">Target Collateralization</p>
              <p className="text-xl font-bold text-white">
                {collateralizationRatio !== undefined && collateralizationRatio !== null ? `${collateralizationRatio}%` : '0%'}
              </p>
            </div>
          </div>

          {activeTab === 'mint' && (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="collateral-input" className="block text-zinc-300 text-sm font-medium mb-2">
                  Collateral Amount ({selectedCollateral})
                </label>
                <input
                  type="number"
                  id="collateral-input"
                  placeholder="0.00"
                  value={collateralAmount}
                  onChange={(e) => setCollateralAmount(e.target.value)}
                  className="w-full p-3 pr-24 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center top-8">
                  <select
                    value={selectedCollateral}
                    onChange={(e) => setSelectedCollateral(e.target.value)}
                    className="bg-zinc-600 text-white rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="USDC">USDC</option>
                    <option value="DAI">DAI</option>
                  </select>
                </div>
              </div>

              <div className="text-center text-zinc-400 font-semibold text-lg">
                <ArrowRightLeft size={24} className="inline-block text-purple-400" />
              </div>

              <div className="relative">
                <label htmlFor="sspy-output" className="block text-zinc-300 text-sm font-medium mb-2">
                  You will mint (sSPY)
                </label>
                <input
                  type="text"
                  id="sspy-output"
                  value={sspyAmount}
                  readOnly
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
              </div>

              <button
                onClick={handleMint}
                disabled={!isConnected || !collateralAmount || parseFloat(collateralAmount || '0') <= 0 || parseFloat(collateralAmount || '0') > userUsdcHoldings}
                title={!isConnected ? "Connect wallet" : ""}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mint sSPY
              </button>
              {mintError && (
                <p className="text-red-400 text-sm mt-2 text-center">{mintError}</p>
              )}
              <p className="text-zinc-400 text-sm text-center">
                Your USDC: ${isConnected ? (userUsdcHoldings ?? 0).toFixed(2) : (0).toFixed(2)}
              </p>
            </div>
          )}

          {activeTab === 'redeem' && (
            <div className="space-y-6">
              <div className="relative">
                <label htmlFor="sspy-input-redeem" className="block text-zinc-300 text-sm font-medium mb-2">
                  sSPY to Redeem
                </label>
                <input
                  type="number"
                  id="sspy-input-redeem"
                  placeholder="0.00"
                  value={sspyAmount}
                  onChange={(e) => {
                    setSspyAmount(e.target.value);
                    setCollateralAmount(calculateCollateral(e.target.value));
                  }}
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
              </div>

              <div className="text-center text-zinc-400 font-semibold text-lg">
                <ArrowRightLeft size={24} className="inline-block text-purple-400" />
              </div>

              <div className="relative">
                <label htmlFor="collateral-output-redeem" className="block text-zinc-300 text-sm font-medium mb-2">
                  You will receive ({selectedCollateral})
                </label>
                <input
                  type="text"
                  id="collateral-output-redeem"
                  value={collateralAmount}
                  readOnly
                  className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">{selectedCollateral}</span>
              </div>

              <button
                onClick={handleRedeem}
                disabled={!isConnected || !sspyAmount || parseFloat(sspyAmount || '0') <= 0 || parseFloat(sspyAmount || '0') > userSspyHoldings}
                title={!isConnected ? "Connect wallet" : ""}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Redeem sSPY
              </button>
              {redeemError && (
                <p className="text-red-400 text-sm mt-2 text-center">{redeemError}</p>
              )}
              <p className="text-zinc-400 text-sm text-center">
                Your sSPY: {userSspyHoldings !== undefined && userSspyHoldings !== null ? userSspyHoldings.toFixed(4) : '0.0000'}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomePage;
