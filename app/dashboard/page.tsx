// app/dashboard/page.tsx
'use client';

import React from 'react';
import { DollarSign, TrendingUp, Landmark, PiggyBank } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useWallet } from '../providers/WalletProvider';

interface Activity {
  description: string;
  time: string;
}

interface DashboardPageProps {}

const DashboardPage: React.FC<DashboardPageProps> = () => {
  const {
    sp500Price,
    collateralizationRatio,
    userSspyHoldings,
    userUsdcHoldings, // Still available, but not directly used in 'userCollateralValue'
    recentActivities,
    userLpHoldingsValue,
    isConnected
  } = useWallet();

  const currentSp500Price = sp500Price ?? 0;
  const currentCollateralizationRatio = collateralizationRatio ?? 0;

  // REDEFINITION: userCollateralValue now represents ONLY the USDC value of sSPY holdings.
  // It no longer includes the liquid userUsdcHoldings.
  const userCollateralValue = (userSspyHoldings * currentSp500Price * (currentCollateralizationRatio / 100));

  const sp500ChartData: { name: string; price: number }[] = [
    { name: 'Jan', price: 4700 }, { name: 'Feb', price: 4850 }, { name: 'Mar', price: 4900 },
    { name: 'Apr', price: 5050 }, { name: 'May', price: 5150 }, { name: 'Jun', price: 5200 },
    { name: 'Jul', price: 5180 }, { name: 'Aug', price: 5300 }, { name: 'Sep', price: 5250 },
    { name: 'Oct', price: 5350 }, { name: 'Nov', price: 5400 }, { name: 'Dec', price: 5500 },
  ];

  // The condition for showing 0 on initial connect no longer needs 'userUsdcHoldings'
  // because userCollateralValue itself will be 0 if userSspyHoldings is 0.
  const isInitialConnectedState = isConnected && userSspyHoldings === 0;


  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Your Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <TrendingUp size={36} className="text-purple-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your sSPY Holdings</p>
          <p className="text-3xl font-bold text-white">{isConnected ? (userSspyHoldings ?? 0).toFixed(4) : (0).toFixed(4)} sSPY</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <DollarSign size={36} className="text-green-400 mb-3" />
          <p className="text-zinc-300 text-sm">Total Collateral Value</p>
          <p className="text-3xl font-bold text-white">
            {/* Conditional display for Total Collateral Value */}
            ${(!isConnected || isInitialConnectedState)
              ? (0).toFixed(2) // Show 0 if disconnected OR in the initial connected state
              : (userCollateralValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <Landmark size={36} className="text-blue-400 mb-3" />
          <p className="text-zinc-300 text-sm">Target Collateral Ratio</p>
          <p className="text-3xl font-bold text-white">{currentCollateralizationRatio}%</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <PiggyBank size={36} className="text-yellow-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your LP Value</p>
          <p className="text-3xl font-bold text-white">
            ${isConnected ? (userLpHoldingsValue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (0).toFixed(2)}
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

      {isConnected && (
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
          <h3 className="text-2xl font-bold text-white mb-4">Recent Activity</h3>
          {recentActivities.length > 0 ? (
            <ul className="space-y-3 text-zinc-300">
              {recentActivities.map((activity: Activity, index: number) => (
                <li key={index} className="flex justify-between items-center bg-zinc-700 p-3 rounded-lg">
                  <span>{activity.description}</span>
                  <span className="text-zinc-400 text-sm">{activity.time}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-400 text-center">No recent activity yet.</p>
          )}
        </div>
      )}
    </main>
  );
};

export default DashboardPage;
