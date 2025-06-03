import React, { useState } from 'react';
import { ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
    
    const LiquidityPage = ({
      sp500Price, isConnected,
      userSspyHoldings, setUserSspyHoldings,
      userUsdcHoldings, setUserUsdcHoldings,
      userLpHoldingsValue, setUserLpHoldingsValue,
      setRecentActivities,
      setIsWalletModalOpen
    }) => {
      const [sspyAmountToAdd, setSspyAmountToAdd] = useState('');
      const [usdcAmountToAdd, setUsdcAmountToAdd] = useState('');
      const [removeLpAmount, setRemoveLpAmount] = useState('');
      // New state for error messages
      const [addLpError, setAddLpError] = useState('');
      const [removeLpError, setRemoveLpError] = useState('');
    
    
      // Handlers for input changes to ensure reciprocal calculation
      const handleSspyAddChange = (e) => {
        const value = e.target.value;
        setSspyAmountToAdd(value);
        if (value && !isNaN(parseFloat(value))) {
          setUsdcAmountToAdd((parseFloat(value) * sp500Price).toFixed(2));
        } else {
          setUsdcAmountToAdd('');
        }
      };
    
      const handleUsdcAddChange = (e) => {
        const value = e.target.value;
        setUsdcAmountToAdd(value);
        if (value && !isNaN(parseFloat(value))) {
          setSspyAmountToAdd((parseFloat(value) / sp500Price).toFixed(4));
        } else {
          setSspyAmountToAdd('');
        }
      };
    
      const handleAddLiquidity = () => {
        setAddLpError(''); // Clear previous error
        if (!isConnected) {
          setIsWalletModalOpen(true);
          return;
        }
        const sspy = parseFloat(sspyAmountToAdd || '0');
        const usdc = parseFloat(usdcAmountToAdd || '0');
    
        if (isNaN(sspy) || sspy <= 0) {
          setAddLpError("Please enter a valid sSPY amount to add to liquidity.");
          return;
        }
        if (isNaN(usdc) || usdc <= 0) {
          setAddLpError("Please enter a valid USDC amount to add to liquidity.");
          return;
        }
        if (sspy > userSspyHoldings) {
          setAddLpError("You do not have enough sSPY.");
          return;
        }
        if (usdc > userUsdcHoldings) {
            setAddLpError("You do not have enough USDC.");
            return;
        }
    
        const valueAddedToLP = (sspy * sp500Price) + usdc;
    
        setUserSspyHoldings(prev => prev - sspy);
        setUserUsdcHoldings(prev => prev - usdc);
        setUserLpHoldingsValue(prev => prev + valueAddedToLP);
    
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setRecentActivities(prevActivities => [
          { description: `Added ${sspy.toFixed(4)} sSPY and $${usdc.toFixed(2)} USDC to LP`, time: timeString },
          ...prevActivities
        ]);
    
        setSspyAmountToAdd('');
        setUsdcAmountToAdd('');
      };
    
      const handleRemoveLiquidity = () => {
        setRemoveLpError(''); // Clear previous error
        if (!isConnected) {
          setIsWalletModalOpen(true);
          return;
        }
        const amount = parseFloat(removeLpAmount || '0');
        if (isNaN(amount) || amount <= 0) {
          setRemoveLpError("Please enter a valid amount to remove from LP.");
          return;
        }
        if (amount > userLpHoldingsValue) {
          setRemoveLpError("Amount to remove exceeds your current LP value.");
          return;
        }
    
        const sspyValueReturned = amount / 2;
        const usdcValueReturned = amount / 2;
        const sspyAmountReturned = sspyValueReturned / sp500Price;
    
        setUserLpHoldingsValue(prevValue => prevValue - amount);
        setUserSspyHoldings(prevHoldings => prevHoldings + sspyAmountReturned);
        setUserUsdcHoldings(prevHoldings => prevHoldings + usdcValueReturned);
    
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setRecentActivities(prevActivities => [
          { description: `Removed $${amount.toFixed(2)} from LP (received ${sspyAmountReturned.toFixed(4)} sSPY + $${usdcValueReturned.toFixed(2)} USDC)`, time: timeString },
          ...prevActivities
        ]);
    
        setRemoveLpAmount('');
      };
    
      return (
        <main className="container mx-auto px-4 py-8 max-w-4xl"> {/* Increased max-width for better layout */}
          <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Liquidity Pool</h2>
    
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8"> {/* Two-column layout for desktop */}
            {/* Add Liquidity Section */}
            <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center justify-center">
                <ArrowUpCircle size={28} className="mr-3 text-purple-400" /> Add Liquidity {/* Changed icon and color */}
              </h3>
              <p className="text-zinc-300 text-sm mb-6 text-center">Provide sSPY and USDC to the liquidity pool to earn trading fees (APR: 12.3%).</p>
    
              <div className="space-y-5 flex-grow"> {/* flex-grow to push button to bottom */}
                <div className="relative">
                  <label htmlFor="sspy-add-lp" className="block text-zinc-300 text-sm font-medium mb-2">
                    sSPY Amount
                  </label>
                  <input
                    type="number"
                    id="sspy-add-lp"
                    placeholder="0.00"
                    value={sspyAmountToAdd}
                    onChange={handleSspyAddChange}
                    className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">sSPY</span>
                </div>
    
                <div className="relative">
                  <label htmlFor="usdc-add-lp" className="block text-zinc-300 text-sm font-medium mb-2">
                    USDC Amount
                  </label>
                  <input
                    type="number"
                    id="usdc-add-lp"
                    placeholder="0.00"
                    value={usdcAmountToAdd}
                    onChange={handleUsdcAddChange}
                    className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">USDC</span>
                </div>
                <p className="text-zinc-400 text-sm mt-2 font-semibold text-center">
                  Your sSPY: <span className="text-white">{userSspyHoldings.toFixed(4)}</span> | Your USDC: <span className="text-white">${userUsdcHoldings.toFixed(2)}</span>
                </p>
              </div>
    
              <button
                onClick={handleAddLiquidity}
                disabled={!isConnected || parseFloat(sspyAmountToAdd || '0') <= 0 || parseFloat(usdcAmountToAdd || '0') <= 0 || parseFloat(sspyAmountToAdd || '0') > userSspyHoldings || parseFloat(usdcAmountToAdd || '0') > userUsdcHoldings}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                Add Liquidity
              </button>
              {addLpError && (
                <p className="text-red-400 text-sm mt-2 text-center">{addLpError}</p>
              )}
            </div>
    
            {/* Remove Liquidity Section */}
            <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 flex flex-col">
              <h3 className="2xl font-bold text-white mb-4 flex items-center justify-center">
                <ArrowDownCircle size={28} className="mr-3 text-purple-400" /> Remove Liquidity {/* Changed icon and color */}
              </h3>
              <p className="text-zinc-300 text-sm mb-6 text-center">Withdraw your assets from the sSPY/USDC liquidity pool.</p>
    
              <div className="space-y-5 flex-grow">
                <div className="relative">
                  <label htmlFor="remove-lp-amount" className="block text-zinc-300 text-sm font-medium mb-2">
                    Amount to remove (USD Value)
                  </label>
                  <input
                    type="number"
                    id="remove-lp-amount"
                    placeholder="0.00"
                    value={removeLpAmount}
                    onChange={(e) => setRemoveLpAmount(e.target.value)}
                    className="w-full p-3 pr-12 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-sm top-8">$</span>
                </div>
                {userLpHoldingsValue > 0 && (
                  <p className="text-zinc-400 text-sm mt-2 font-semibold text-center">Current LP Value: <span className="text-white">${userLpHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                )}
              </div>
    
              <button
                onClick={handleRemoveLiquidity}
                disabled={userLpHoldingsValue <= 0 || parseFloat(removeLpAmount || '0') <= 0 || parseFloat(removeLpAmount || '0') > userLpHoldingsValue}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg shadow-lg transform transition-all duration-200 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
              >
                Remove Liquidity
              </button>
              {removeLpError && (
                <p className="text-red-400 text-sm mt-2 text-center">{removeLpError}</p>
              )}
            </div>
          </div>
        </main>
      );
    };
    
export default LiquidityPage;