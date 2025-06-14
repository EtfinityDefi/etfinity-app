'use client'; 
import React from 'react';
import { Repeat2 } from 'lucide-react';

interface SwapPageProps {}

const SwapPage: React.FC<SwapPageProps> = () => {
  // Placeholder for your actual sSPY contract address.
  // IMPORTANT: Replace '0xYourActualSspyContractAddressHere' with the real address
  // when deploying or using this application with live data.
  const sSPY_ADDRESS = '0xYourActualSspyContractAddressHere';
  // USDC contract address on Polygon. This is a common testnet address.
  const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9214fbc9507';

  // Constructs the Uniswap URL to directly open the swap interface
  // for swapping USDC to sSPY on the Polygon chain.
  const uniswapUrl = `https://app.uniswap.org/#/swap?inputCurrency=${USDC_ADDRESS}&outputCurrency=${sSPY_ADDRESS}&chain=polygon`;

  // Handler function to open Uniswap in a new tab when the button is clicked.
  const handleGoToUniswap = () => {
    window.open(uniswapUrl, '_blank');
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Page title */}
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Swap sSPY</h2>

      {/* Main content block for swap information and button */}
      <div className="bg-zinc-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-zinc-700 text-center">
        {/* Icon for visual appeal */}
        <Repeat2 size={48} className="text-purple-400 mx-auto mb-6" />

        {/* Descriptive text */}
        <p className="text-zinc-300 text-lg mb-6">
          Trade sSPY for other assets quickly and easily.
          Etfinity leverages the robust liquidity of decentralized exchanges.
        </p>
        <p className="text-zinc-400 text-md mb-8">
          Click the button below to be redirected to Uniswap, where you can swap sSPY with low slippage.
          <br/>
          {/* Important reminder for the user */}
          <span className="font-bold text-red-400">
            Remember to replace the placeholder sSPY address in the code with your actual token address!
          </span>
        </p>

        {/* Button to navigate to Uniswap */}
        <button
          onClick={handleGoToUniswap}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500 focus:ring-opacity-75 flex items-center justify-center mx-auto"
        >
          {/* Uniswap logo for branding */}
          <img src="https://assets.coingecko.com/coins/images/279/small/uniswap.png?1696515865" alt="Uniswap Logo" className="w-6 h-6 mr-3" />
          Go to Uniswap to Swap
        </button>
      </div>
    </main>
  );
};

export default SwapPage;
