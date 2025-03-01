import React, { useState } from 'react';
import { PaymentProcessor } from '@/components/payment/PaymentProcessor';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import Head from 'next/head';

const MERCHANT_ADDRESS = 'gosoCfuYsaHjFz69jN8GtM8P4JzfQLdJgNSwMs2XcYd';

const DEMO_TOKENS = [
  {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    decimals: 5,
    logoURI: 'https://arweave.net/hQB7PMqg_2Hn_QM8-Z9YVTdb8VKdXlwzYDHe_hVHhYE',
  },
  {
    symbol: 'RAY',
    name: 'Raydium',
    address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R/logo.png',
  }
];

export default function DemoPage() {
  const wallet = useWallet();
  const [amount, setAmount] = useState('10');
  const [processing, setProcessing] = useState(false);

  const handleSuccess = (signature) => {
    console.log('Payment successful:', signature);
    setProcessing(false);
    toast.success('Payment completed successfully!');
  };

  const handleError = (error) => {
    console.error('Payment failed:', error);
    setProcessing(false);
    toast.error('Payment failed: ' + error.message);
  };

  return (
    <>
      <Head>
        <title>Crypto Payment Gateway Demo</title>
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Crypto Payment Demo
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Test our payment gateway with demo tokens
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Merchant Address
                  </label>
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md break-all text-sm text-gray-600 dark:text-gray-400">
                    {MERCHANT_ADDRESS}
                  </div>
                </div>

                <div className="pt-4">
                  <label 
                    htmlFor="amount" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Payment Amount (USDC)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="amount"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={processing}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USDC</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {amount && Number(amount) > 0 && (
              <PaymentProcessor
                amount={Number(amount) * 1e6} // Convert to USDC decimals
                merchantAddress={MERCHANT_ADDRESS}
                supportedTokens={DEMO_TOKENS}
                onSuccess={handleSuccess}
                onError={handleError}
                onProcessingChange={setProcessing}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
