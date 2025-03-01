import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '../ui/Skeleton';

/**
 * @typedef {Object} TokenVolume
 * @property {string} symbol
 * @property {number} volume
 */

/**
 * @typedef {Object} RouteDistribution
 * @property {string} protocol
 * @property {number} percentage
 */

/**
 * @typedef {Object} Insights
 * @property {TokenVolume[]} topTokensByVolume
 * @property {RouteDistribution[]} routeDistribution
 * @property {number} averageSlippage
 * @property {string} averageSettlementTime
 */

/**
 * @param {{ insights?: Insights }} props
 */
const MarketInsights = ({ insights }) => {
  const [error, setError] = React.useState(null);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="text-red-500 dark:text-red-400 text-center">
          <p>Error loading market insights</p>
          <button 
            onClick={() => setError(null)} 
            className="mt-2 text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">
        Market Insights
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Tokens */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Top Tokens by Volume
          </h4>
          <div className="space-y-4">
            {insights.topTokensByVolume?.map((token, index) => (
              <motion.div
                key={token.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-gray-900 dark:text-white">
                  {token.symbol}
                </span>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  ${token.volume.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Route Distribution */}
        <div>
          <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">
            Route Distribution
          </h4>
          <div className="space-y-4">
            {insights.routeDistribution?.map((route, index) => (
              <motion.div
                key={route.protocol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-900 dark:text-white">
                    {route.protocol}
                  </span>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {route.percentage}%
                  </span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${route.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          label="Avg. Slippage"
          value={`${insights.averageSlippage}%`}
        />
        <MetricCard
          label="Avg. Settlement"
          value={insights.averageSettlementTime}
        />
      </div>
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
    <h5 className="text-xs text-gray-600 dark:text-gray-400 mb-1">
      {label}
    </h5>
    <p className="text-lg font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
  </div>
);

const LoadingSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-6 w-full" />
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="h-6 w-36 mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="h-6 w-full mb-1" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default MarketInsights;
