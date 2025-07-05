'use client';

import React, { useEffect } from 'react';
import { DollarSign, TrendingUp, Landmark, PiggyBank } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Import Wagmi hooks
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits } from 'viem';

// Import ABIs
import { erc20Abi } from '../../contracts/abi/Erc20Abi';
import { chainlinkAggregatorV3Abi } from '../../contracts/abi/ChainlinkAggregatorV3Abi';
import { etfinityProtocolAbi } from '../../contracts/abi/EtfinityProtocolAbi';

// Use Environment Variables for Contract Addresses ---
const SSPY_CONTRACT_ADDRESS: `0x${string}` = process.env.NEXT_PUBLIC_SSPY_CONTRACT_ADDRESS as `0x${string}`;
const CHAINLINK_SP500_PRICE_FEED_ADDRESS: `0x${string}` = process.env.NEXT_PUBLIC_CHAINLINK_SP500_PRICE_FEED_ADDRESS as `0x${string}`;
const ETFINITY_PROTOCOL_CONTRACT_ADDRESS: `0x${string}` = process.env.NEXT_PUBLIC_ETFINITY_PROTOCOL_CONTRACT_ADDRESS as `0x${string}`;

const SSPY_DECIMALS = 18;
const CHAINLINK_PRICE_FEED_DECIMALS = 8;

const sp500ChartData: { name: string; price: number }[] = [
  { name: 'Jan', price: 4700 }, { name: 'Feb', price: 4850 }, { name: 'Mar', price: 4900 },
  { name: 'Apr', price: 5050 }, { name: 'May', price: 5150 }, { name: 'Jun', price: 5200 },
  { name: 'Jul', price: 5180 }, { name: 'Aug', price: 5300 }, { name: 'Sep', price: 5250 },
  { name: 'Oct', price: 5350 }, { name: 'Nov', price: 5400 }, { name: 'Dec', price: 5500 },
];

const DashboardPage: React.FC = () => {
  const { address, isConnected } = useAccount();

  // --- Fetch S&P 500 Price from Chainlink ---
  const { data: sp500PriceData, isLoading: isLoadingSp500Price, error: sp500PriceError } = useReadContract({
    address: CHAINLINK_SP500_PRICE_FEED_ADDRESS,
    abi: chainlinkAggregatorV3Abi,
    functionName: 'latestRoundData',
    args: [],
    query: {
      refetchInterval: 10000,
    },
  });
  const sp500PriceRaw = sp500PriceData ? (sp500PriceData[1] as bigint) : BigInt(0);
  const currentSp500Price = sp500PriceRaw ? parseFloat(formatUnits(sp500PriceRaw, CHAINLINK_PRICE_FEED_DECIMALS)) : 0;

  useEffect(() => {
    console.log("--- Dashboard S&P 500 Price Debug ---");
    console.log("CHAINLINK_SP500_PRICE_FEED_ADDRESS:", CHAINLINK_SP500_PRICE_FEED_ADDRESS);
    console.log("sp500PriceData (raw):", sp500PriceData);
    console.log("sp500PriceRaw (BigInt):", sp500PriceRaw);
    console.log("currentSp500Price (formatted):", currentSp500Price);
    console.log("isLoadingSp500Price:", isLoadingSp500Price);
    console.log("sp500PriceError:", sp500PriceError);
    console.log("-----------------------------------");
  }, [sp500PriceData, sp500PriceRaw, currentSp500Price, isLoadingSp500Price, sp500PriceError]);


  // --- Fetch Collateralization Ratio from Protocol Contract ---
  const { data: collateralizationRatioRaw, isLoading: isLoadingCollateralRatio, error: collateralRatioError } = useReadContract({
    address: ETFINITY_PROTOCOL_CONTRACT_ADDRESS,
    abi: etfinityProtocolAbi,
    functionName: 'TARGET_COLLATERALIZATION_RATIO',
    args: [],
    query: {
      refetchInterval: 10000,
    },
  });
  
  const currentCollateralizationRatio = collateralizationRatioRaw ? Number(collateralizationRatioRaw) / 100 : 0;

  useEffect(() => {
    console.log("--- Dashboard Collateral Ratio Debug ---");
    console.log("ETFINITY_PROTOCOL_CONTRACT_ADDRESS:", ETFINITY_PROTOCOL_CONTRACT_ADDRESS);
    console.log("collateralizationRatioRaw (raw):", collateralizationRatioRaw);
    console.log("currentCollateralizationRatio (formatted):", currentCollateralizationRatio);
    console.log("isLoadingCollateralRatio:", isLoadingCollateralRatio);
    console.log("collateralRatioError:", collateralRatioError);
    console.log("-----------------------------------");
  }, [collateralizationRatioRaw, currentCollateralizationRatio, isLoadingCollateralRatio, collateralRatioError]);


  // --- Fetch User sSPY Holdings ---
  const { data: userSspyBalanceRaw, isLoading: isLoadingSspyBalance } = useReadContract({
    address: SSPY_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 5000,
    },
  });
  const userSspyHoldings = userSspyBalanceRaw ? parseFloat(formatUnits(userSspyBalanceRaw, SSPY_DECIMALS)) : 0;

  const userCollateralValue = (userSspyHoldings * currentSp500Price * (currentCollateralizationRatio / 100)); // Still divide by 100 here for calculation
  const userLpHoldingsValue = 0; 

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Your Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <TrendingUp size={36} className="text-purple-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your sSPY Holdings</p>
          <p className="text-3xl font-bold text-white">
            {isConnected && !isLoadingSspyBalance ? `${userSspyHoldings.toFixed(4)} sSPY` : 'Connect Wallet'}
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <DollarSign size={36} className="text-green-400 mb-3" />
          <p className="text-zinc-300 text-sm">Total Collateral Value</p>
          <p className="text-3xl font-bold text-white">
            {isConnected && !isLoadingSspyBalance && !isLoadingSp500Price && !isLoadingCollateralRatio
              ? `$${userCollateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Connect Wallet'}
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <Landmark size={36} className="text-blue-400 mb-3" />
          <p className="text-zinc-300 text-sm">Target Collateral Ratio</p>
          <p className="text-3xl font-bold text-white">
            {isLoadingCollateralRatio ? 'Loading...' : `${currentCollateralizationRatio}%`}
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <PiggyBank size={36} className="text-yellow-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your LP Value</p>
          <p className="text-3xl font-bold text-white">
            ${userLpHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

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
