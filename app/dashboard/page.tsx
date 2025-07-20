'use client';

import React from 'react';
import { DollarSign, TrendingUp, Scale, Wallet, Coins, Banknote } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

import { useAccount, useReadContract, useChainId } from 'wagmi';
import { formatUnits } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import { erc20Abi } from '../../contracts/abi/Erc20Abi';
import { chainlinkAggregatorV3Abi } from '../../contracts/abi/ChainlinkAggregatorV3Abi';
import { etfinityProtocolAbi } from '../../contracts/abi/EtfinityProtocolAbi';

/**
 * @dev Defines deployed contract addresses for supported networks.
 * These values are loaded from environment variables.
 */
const CONTRACT_ADDRESSES: Record<number, {
  USDC: `0x${string}`;
  SSPY: `0x${string}`;
  CHAINLINK_SP500_PRICE_FEED: `0x${string}`;
  CHAINLINK_USDC_PRICE_FEED: `0x${string}`;
  ETFINITY_PROTOCOL: `0x${string}`;
}> = {
  421614: { // Arbitrum Sepolia
    USDC: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    CHAINLINK_USDC_PRICE_FEED: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_CHAINLINK_USDC_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_ARBITRUM_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
  11155111: { // Sepolia
    USDC: process.env.NEXT_PUBLIC_SEPOLIA_USDC_CONTRACT_ADDRESS as `0x${string}`,
    SSPY: process.env.NEXT_PUBLIC_SEPOLIA_SSPY_CONTRACT_ADDRESS as `0x${string}`,
    CHAINLINK_SP500_PRICE_FEED: process.env.NEXT_PUBLIC_SEPOLIA_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`,
    CHAINLINK_USDC_PRICE_FEED: process.env.NEXT_PUBLIC_SEPOLIA_CHAINLINK_USDC_PRICE_FEED_ADDRESS as `0x${string}`,
    ETFINITY_PROTOCOL: process.env.NEXT_PUBLIC_SEPOLIA_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`,
  },
};

/**
 * @dev Helper function to retrieve contract addresses for the given chain ID.
 * @param chainId The ID of the currently connected blockchain network.
 * @returns An object containing contract addresses for the chain, or null if not supported.
 */
const getContractAddresses = (chainId: number | undefined) => {
  if (!chainId) return null;
  return CONTRACT_ADDRESSES[chainId] || null;
};

// Decimal places for token amounts and Chainlink price feeds.
const USDC_DECIMALS = 6;
const SSPY_DECIMALS = 18;
const CHAINLINK_PRICE_FEED_DECIMALS = 8;

// Represents the maximum possible value for a uint256 in Solidity.
const MAX_UINT256_BIGINT = BigInt('115792089237316195423570985008687907853269984665640564039457584007913129639935');

// Static data for the S&P 500 price chart.
const sp500ChartData: { name: string; price: number }[] = [
  { name: 'Jan', price: 4700 }, { name: 'Feb', price: 4850 }, { name: 'Mar', price: 4900 },
  { name: 'Apr', price: 5050 }, { name: 'May', price: 5150 }, { name: 'Jun', price: 5200 },
  { name: 'Jul', price: 5180 }, { name: 'Aug', price: 5300 }, { name: 'Sep', price: 5250 },
  { name: 'Oct', price: 5350 }, { name: 'Nov', price: 5400 }, { name: 'Dec', price: 5500 },
];

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const currentContracts = getContractAddresses(chainId);

  // Determine if contracts are loaded and wallet is connected for data fetching.
  const contractsLoaded = isConnected && !!address && !!currentContracts;

  // --- READ CONTRACT DATA ---

  // Fetches the connected user's sSPY token balance.
  const { data: userSspyBalanceRaw, isLoading: isLoadingSspyBalance } = useReadContract({
    address: currentContracts?.SSPY,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: contractsLoaded, refetchInterval: 5000 },
  });
  const userSspyHoldings = userSspyBalanceRaw ? parseFloat(formatUnits(userSspyBalanceRaw, SSPY_DECIMALS)) : 0;

  // Fetches the user's USDC collateral deposited in the Etfinity Protocol.
  const { data: userCollateralRaw, isLoading: isLoadingUserCollateral } = useReadContract({
    address: currentContracts?.ETFINITY_PROTOCOL,
    abi: etfinityProtocolAbi,
    functionName: 'userCollateral',
    args: [address as `0x${string}`],
    query: { enabled: contractsLoaded, refetchInterval: 5000 },
  });
  const userCollateralHoldings = userCollateralRaw ? parseFloat(formatUnits(userCollateralRaw, USDC_DECIMALS)) : 0;

  // Fetches the user's sSPY debt from the Etfinity Protocol.
  const { data: userDebtRaw, isLoading: isLoadingUserDebt } = useReadContract({
    address: currentContracts?.ETFINITY_PROTOCOL,
    abi: etfinityProtocolAbi,
    functionName: 'userDebt',
    args: [address as `0x${string}`],
    query: { enabled: contractsLoaded, refetchInterval: 5000 },
  });
  const userDebtHoldings = userDebtRaw ? parseFloat(formatUnits(userDebtRaw, SSPY_DECIMALS)) : 0;

  // Fetches the user's current collateralization ratio from the Etfinity Protocol.
  const { data: currentCollateralRatioRaw, isLoading: isLoadingCurrentCR } = useReadContract({
    address: currentContracts?.ETFINITY_PROTOCOL,
    abi: etfinityProtocolAbi,
    functionName: '_getCurrentCollateralRatio',
    args: [address as `0x${string}`],
    query: { enabled: contractsLoaded, refetchInterval: 5000 },
  });
  // Determines if the collateral ratio is effectively infinite (no debt).
  const isInfiniteCollateralRatio = currentCollateralRatioRaw === MAX_UINT256_BIGINT;
  const currentCollateralRatio = isInfiniteCollateralRatio ? 0 : (currentCollateralRatioRaw ? Number(currentCollateralRatioRaw) / 100 : 0);

  // Fetches the current USDC price from Chainlink.
  const { data: usdcPriceData, isLoading: isLoadingUsdcPrice } = useReadContract({
    address: currentContracts?.CHAINLINK_USDC_PRICE_FEED,
    abi: chainlinkAggregatorV3Abi,
    functionName: 'latestRoundData',
    args: [],
    query: { enabled: contractsLoaded, refetchInterval: 10000 },
  });
  const usdcPriceRaw = usdcPriceData ? (usdcPriceData[1] as bigint) : BigInt(0);
  const usdcPrice = usdcPriceRaw ? parseFloat(formatUnits(usdcPriceRaw, CHAINLINK_PRICE_FEED_DECIMALS)) : 0;

  // Fetches the current S&P 500 price from Chainlink.
  const { data: sp500PriceData, isLoading: isLoadingSp500Price } = useReadContract({
    address: currentContracts?.CHAINLINK_SP500_PRICE_FEED,
    abi: chainlinkAggregatorV3Abi,
    functionName: 'latestRoundData',
    args: [],
    query: { enabled: contractsLoaded, refetchInterval: 10000 },
  });
  const sp500PriceRaw = sp500PriceData ? (sp500PriceData[1] as bigint) : BigInt(0);
  const sp500Price = sp500PriceRaw ? parseFloat(formatUnits(sp500PriceRaw, CHAINLINK_PRICE_FEED_DECIMALS)) : 0;

  // --- CALCULATED VALUES ---
  const totalCollateralValueUSD = userCollateralHoldings * usdcPrice;
  const totalDebtValueUSD = userDebtHoldings * sp500Price;
  const netPositionValueUSD = totalCollateralValueUSD - totalDebtValueUSD;

  /**
   * @dev Helper function to format and render numerical values with loading states.
   * @param value The number or string value to render.
   * @param isLoading Boolean indicating if data is still loading.
   * @param prefix Optional string prefix (e.g., '$').
   * @param suffix Optional string suffix (e.g., '%').
   * @returns Formatted string for display.
   */
  const renderValue = (value: number | string, isLoading: boolean, prefix: string = '', suffix: string = '') => {
    if (!contractsLoaded) return 'Connect Wallet';
    if (isLoading) return 'Loading...';
    if (typeof value === 'number') {
      return `${prefix}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}${suffix}`;
    }
    return `${prefix}${value}${suffix}`;
  };

  /**
   * @dev Determines the CSS class for the collateral ratio display based on its value.
   * @param ratio The current collateralization ratio.
   * @returns Tailwind CSS class for text color.
   */
  const getRatioColorClass = (ratio: number) => {
    const MIN_CR = 130; // Minimum acceptable collateralization ratio.
    const TARGET_CR = 150; // Target collateralization ratio.

    if (ratio >= TARGET_CR) {
      return 'text-green-400';
    } else if (ratio >= MIN_CR) {
      return 'text-yellow-400';
    } else if (ratio > 0) {
      return 'text-red-400';
    }
    return 'text-zinc-400';
  };

  // Displays a message prompting wallet connection if not connected.
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
          <h1 className="text-3xl font-bold text-purple-400 mb-4">Connect Wallet</h1>
          <p className="text-zinc-300 mb-6">Please connect your wallet to view your dashboard.</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  // Displays an error message if the connected network is not supported.
  if (!currentContracts) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100 flex items-center justify-center p-4">
        <div className="bg-zinc-800 p-8 rounded-lg shadow-xl text-center max-w-sm w-full">
          <h1 className="text-3xl font-bold text-red-400 mb-4">Unsupported Network</h1>
          <p className="text-zinc-300 mb-6">
            Please connect to a supported network (Sepolia or Arbitrum Sepolia) to view the dashboard.
          </p>
          <p className="text-zinc-400 text-sm">
            Current Chain ID: {chainId || 'N/A'}
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Your Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card: Your sSPY Holdings */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="The total amount of sSPY tokens currently held in your connected wallet."
        >
          <TrendingUp size={36} className="text-purple-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your sSPY Holdings</p>
          <p className="text-3xl font-bold text-white">
            {renderValue(userSspyHoldings, isLoadingSspyBalance, '', ' sSPY')}
          </p>
        </div>

        {/* Card: Total Collateral Value */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="The current USD value of the USDC collateral you have deposited into the protocol."
        >
          <Wallet size={36} className="text-green-400 mb-3" />
          <p className="text-zinc-300 text-sm">Total Collateral Value</p>
          <p className="text-3xl font-bold text-white mt-1">
            {renderValue(totalCollateralValueUSD, isLoadingUserCollateral || isLoadingUsdcPrice, '$')}
          </p>
        </div>

        {/* Card: Your sSPY Debt */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="The total USD value of the sSPY tokens you have minted and currently owe to the protocol."
        >
          <Coins size={36} className="text-red-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your sSPY Debt</p>
          <p className="text-3xl font-bold text-white">
            {renderValue(totalDebtValueUSD, isLoadingUserDebt || isLoadingSp500Price, '$')}
          </p>
        </div>

        {/* Card: Your Net Equity */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="Your net worth in this position: Total Collateral Value minus Your sSPY Debt. Represents your equity."
        >
          <DollarSign size={36} className="text-teal-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your Net Equity</p>
          <p className="text-3xl font-bold text-white">
            {renderValue(netPositionValueUSD, isLoadingUserCollateral || isLoadingUsdcPrice || isLoadingUserDebt || isLoadingSp500Price, '$')}
          </p>
        </div>

        {/* Card: Your Current Collateral Ratio */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="Your real-time collateralization ratio: (Your Collateral Value / Your sSPY Debt) * 100%. Indicates your position's health. This ratio changes with sSPY minting/redemption and S&P 500 price fluctuations."
        >
          <Scale size={36} className={getRatioColorClass(currentCollateralRatio) + " mb-3"} />
          <p className="text-zinc-300 text-sm">Your Current Collateral Ratio</p>
          <p className={`text-3xl font-bold ${getRatioColorClass(currentCollateralRatio)}`}>
            {isInfiniteCollateralRatio ? 'N/A (No Debt)' : renderValue(currentCollateralRatio, isLoadingCurrentCR, '', '%')}
          </p>
        </div>

        {/* Card: Your LP Value */}
        <div
          className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center"
          title="The value of your Liquidity Pool (LP) tokens. This feature is coming soon."
        >
          <Banknote size={36} className="text-yellow-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your LP Value</p>
          <p className="text-3xl font-bold text-white">
            $0.00
          </p>
        </div>
      </div>

      {/* S&P 500 Price Chart Section */}
      <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">S&P 500 Price Chart</h3>
        <p className="text-zinc-400 text-sm mb-4">Data from Chainlink Oracle (simulated)</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={sp500ChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#a78bfa' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => `$${value.toLocaleString()}`} />
            <Area type="monotone" dataKey="price" stroke="#8B5CF6" fill="url(#colorPrice)" strokeWidth={2} />
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </main>
  );
};

export default DashboardPage;
