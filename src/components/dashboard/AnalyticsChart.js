import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const AnalyticsChart = ({ data = [] }) => {
  const maxValue = Math.max(...data.map(d => d.volume));
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Transaction Volume
      </h3>
      <div className="relative h-60">
        <div className="absolute bottom-0 left-0 right-0 h-[200px] flex items-end space-x-2">
          {data.map((item, index) => {
            const height = (item.volume / maxValue) * 100;
            return (
              <motion.div
                key={index}
                className="flex-1 bg-blue-500 dark:bg-blue-600 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  backgroundColor: '#3B82F6'
                }}
              >
                <div className="absolute bottom-full mb-1 text-xs text-gray-600 dark:text-gray-400 transform -rotate-45 origin-bottom-left">
                  {format(new Date(item.date), 'MMM d')}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
