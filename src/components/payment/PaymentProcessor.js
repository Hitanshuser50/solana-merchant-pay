import React, { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createJupiterService } from '@/services/jupiterService';
import { PublicKey } from '@solana/web3.js';
import { SettlementService } from '@/services/settlement';
import toast from 'react-hot-toast';

export const PaymentProcessor = ({ 
  amount, 
  merchantAddress, 
  onSuccess, 
  onError,
  onProcessingChange,
  supportedTokens = [] 
}) => {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [jupiterService, setJupiterService] = useState(null);
  const [settlementService, setSettlementService] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    onProcessingChange?.(loading);
  }, [loading, onProcessingChange]);

  useEffect(() => {
    const initServices = async () => {
      if (wallet.connected) {
        try {
          const jupiter = await createJupiterService(connection, wallet);
          const settlement = new SettlementService();
          setJupiterService(jupiter);
          setSettlementService(settlement);
        } catch (error) {
          console.error('Failed to initialize services:', error);
          toast.error('Failed to initialize payment service');
        }
      }
    };

    initServices();
  }, [connection, wallet.connected]);

  const handleTokenSelect = async (token) => {
    try {
      setLoading(true);
      setSelectedToken(token);
      
      if (!jupiterService) {
        throw new Error('Payment service not initialized');
      }

      const newQuote = await jupiterService.getQuote(token.address, amount);
      setQuote(newQuote);
    } catch (error) {
      console.error('Error getting quote:', error);
      toast.error('Failed to get price quote');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedToken || !quote || !jupiterService || !settlementService) {
      return;
    }

    try {
      setLoading(true);
      
      // Execute the swap
      const signature = await jupiterService.executeSwap(quote);
      
      // Process settlement
      await settlementService.settlePayment({
        merchantWallet: merchantAddress,
        usdcAmount: amount,
        signature,
        inputToken: selectedToken.address,
        inputAmount: quote.inAmount,
      });
      
      toast.success('Payment successful!');
      onSuccess?.(signature);
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex flex-col items-center space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Connect Wallet to Pay
        </h2>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Payment Token
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {supportedTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => handleTokenSelect(token)}
              disabled={loading}
              className={`p-4 rounded-lg border transition-all ${
                selectedToken?.address === token.address
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={token.logoURI}
                  alt={token.symbol}
                  className="w-8 h-8 rounded-full"
                />
                <div className="text-left">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {token.symbol}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {token.name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {quote && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                You Pay
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {quote.inAmount} {selectedToken?.symbol}
              </span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Merchant Receives
              </span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(amount / 1e6).toFixed(2)} USDC
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Merchant Address
                </span>
                <span className="text-sm font-mono text-gray-900 dark:text-white">
                  {`${merchantAddress.slice(0, 4)}...${merchantAddress.slice(-4)}`}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {loading ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      )}
    </div>
  );
};
