import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion } from 'framer-motion';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import TransactionTable from '../../components/dashboard/TransactionTable';
import MarketInsights from '../../components/dashboard/MarketInsights';
import { AnalyticsService } from '../../services/analytics';

const analyticsService = new AnalyticsService();

export default function Dashboard() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState(null);
  const [insights, setInsights] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      if (!publicKey) return;

      try {
        setLoading(true);
        
        // Fetch merchant stats
        const merchantStats = await analyticsService.getMerchantStats(
          publicKey.toString()
        );
        setStats(merchantStats);

        // Fetch market insights
        const marketInsights = await analyticsService.getMarketInsights();
        setInsights(marketInsights);

        // Mock transactions for now
        setTransactions([
          {
            timestamp: new Date().toISOString(),
            amount: 100,
            token: 'USDC',
            status: 'completed'
          },
          {
            timestamp: new Date().toISOString(),
            amount: 50,
            token: 'SOL',
            status: 'pending'
          }
        ]);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [publicKey]);

  if (!publicKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to view the dashboard
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Merchant Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {publicKey.toString()}
        </p>
      </motion.div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">
            Total Volume
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${stats?.totalVolume.toLocaleString()}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">
            Success Rate
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.successRate}%
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.transactionCount}
          </p>
        </div>
      </motion.div>

      {/* Analytics Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <AnalyticsChart data={stats?.dailyVolume} />
      </motion.div>

      {/* Market Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <MarketInsights insights={insights} />
      </motion.div>

      {/* Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <TransactionTable transactions={transactions} />
      </motion.div>
    </div>
  );
}
