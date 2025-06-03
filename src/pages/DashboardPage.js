import React from 'react';
import { DollarSign, BarChart3, TrendingUp, Landmark, PiggyBank } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const DashboardPage = ({ sp500Price, collateralizationRatio, userSspyHoldings, recentActivities, userLpHoldingsValue }) => {
  const userCollateralValue = userSspyHoldings * sp500Price * (collateralizationRatio / 100);

  // Static data for S&P 500 price chart
  const sp500ChartData = [
    { name: 'Jan', price: 4700 },
    { name: 'Feb', price: 4850 },
    { name: 'Mar', price: 4900 },
    { name: 'Apr', price: 5050 },
    { name: 'May', price: 5150 },
    { name: 'Jun', price: 5200 },
    { name: 'Jul', price: 5180 },
    { name: 'Aug', price: 5300 },
    { name: 'Sep', price: 5250 },
    { name: 'Oct', price: 5350 },
    { name: 'Nov', price: 5400 },
    { name: 'Dec', price: 5500 },
  ];

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <h2 className="text-4xl font-bold text-white mb-8 text-center drop-shadow-md">Your Dashboard</h2>

      {/* Holdings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <TrendingUp size={36} className="text-purple-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your sSPY Holdings</p>
          <p className="text-3xl font-bold text-white">{userSspyHoldings.toFixed(4)} sSPY</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <DollarSign size={36} className="text-green-400 mb-3" />
          <p className="text-zinc-300 text-sm">Total Collateral Value</p>
          <p className="text-3xl font-bold text-white">${userCollateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <Landmark size={36} className="text-blue-400 mb-3" />
          <p className="text-zinc-300 text-sm">Target Collateral Ratio</p>
          <p className="text-3xl font-bold text-white">{collateralizationRatio}%</p>
        </div>
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 flex flex-col items-center justify-center text-center">
          <PiggyBank size={36} className="text-yellow-400 mb-3" />
          <p className="text-zinc-300 text-sm">Your LP Value</p>
          <p className="text-3xl font-bold text-white">${userLpHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* S&P 500 Price Chart */}
      <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700 mb-8">
        <h3 className="text-2xl font-bold text-white mb-4">S&P 500 Price Chart</h3>
        <p className="text-zinc-400 text-sm mb-4">Data from Chainlink Oracle (simulated)</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={sp500ChartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="name" stroke="#a1a1aa" />
            <YAxis stroke="#a1a1aa" domain={['dataMin - 100', 'dataMax + 100']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#27272a', border: 'none', borderRadius: '8px' }}
              labelStyle={{ color: '#a78bfa' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
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

      {/* Recent Activity */}
      <div className="bg-zinc-800 p-6 rounded-2xl shadow-xl border border-zinc-700">
        <h3 className="text-2xl font-bold text-white mb-4">Recent Activity</h3>
        {recentActivities.length > 0 ? (
          <ul className="space-y-3 text-zinc-300">
            {recentActivities.map((activity, index) => (
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
    </main>
  );
};

export default DashboardPage;