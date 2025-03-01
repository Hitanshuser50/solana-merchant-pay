import React, { useState } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const MerchantConfig = ({ onSave }) => {
  const wallet = useWallet();
  const [config, setConfig] = useState({
    name: '',
    walletAddress: '',
    supportedTokens: [],
    webhookUrl: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate wallet address
      try {
        new PublicKey(config.walletAddress);
      } catch {
        throw new Error('Invalid wallet address');
      }

      // TODO: Add your backend call here to save merchant configuration
      // await saveMerchantConfig(config);
      
      onSave?.(config);
    } catch (error) {
      console.error('Error saving merchant config:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connect Wallet to Configure
        </h2>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Merchant Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label 
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Business Name
            </label>
            <input
              type="text"
              id="name"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="walletAddress"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Settlement Wallet Address
            </label>
            <input
              type="text"
              id="walletAddress"
              value={config.walletAddress}
              onChange={(e) => setConfig({ ...config, walletAddress: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="Solana wallet address for receiving payments"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="webhookUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Webhook URL (Optional)
            </label>
            <input
              type="url"
              id="webhookUrl"
              value={config.webhookUrl}
              onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              placeholder="https://your-server.com/webhook"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              We'll send payment notifications to this URL
            </p>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </form>
  );
};
