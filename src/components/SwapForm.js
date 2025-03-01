import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import {
  NETWORK_CONFIG,
  TOKEN_CONFIG,
  ASSET_TYPES,
  PRICE_CONFIG,
  JUPITER_CONFIG,
  NFT_CONFIG,
  TX_CONFIG,
  CACHE_CONFIG,
} from '../config/constants';
import { createConnectionWithFailover } from '../utils/rpc';
import { JupiterService } from '../services/jupiter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowPathIcon,
  ArrowsUpDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const jupiterService = new JupiterService();

export default function SwapForm({ targetAmount, onSwap, disabled }) {
  const { publicKey, signTransaction } = useWallet();
  const [amount, setAmount] = useState(targetAmount || '');
  const [selectedToken, setSelectedToken] = useState(null);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    async function loadTokens() {
      try {
        const tokenList = await jupiterService.getTokenList();
        setTokens(tokenList);
      } catch (error) {
        console.error('Error loading tokens:', error);
        setError('Failed to load tokens');
      }
    }

    loadTokens();
  }, []);

  const fetchQuote = async () => {
    if (!selectedToken || !amount) return;

    try {
      setLoading(true);
      setError(null);

      const quote = await jupiterService.getQuote({
        inputMint: selectedToken.address,
        outputMint: TOKEN_CONFIG.USDC_MINT.toString(),
        amount: parseFloat(amount) * Math.pow(10, selectedToken.decimals)
      });

      setQuote(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      setError('Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedToken && amount) {
      fetchQuote();
    }
  }, [selectedToken, amount]);

  const handleSwap = async () => {
    if (!quote || !publicKey) return;

    try {
      setLoading(true);
      setError(null);

      const { transaction } = await jupiterService.executeSwap({
        route: quote.route,
        userPublicKey: publicKey
      });

      const signedTx = await signTransaction(transaction);
      
      if (onSwap) {
        onSwap({
          transaction: signedTx,
          quote,
          token: selectedToken
        });
      }
    } catch (error) {
      console.error('Error executing swap:', error);
      setError('Failed to execute swap');
    } finally {
      setLoading(false);
    }
  };

  const priceImpactWarning = useMemo(() => {
    if (!quote) return false;
    return parseFloat(quote.priceImpact) > PRICE_CONFIG.PRICE_IMPACT_WARNING;
  }, [quote]);

  if (!publicKey) {
    return (
      <div className="text-center p-4">
        <p className="text-gray-600 dark:text-gray-400">
          Please connect your wallet to swap tokens
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="space-y-4">
        {/* Token Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Token
          </label>
          <select
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2"
            value={selectedToken?.address || ''}
            onChange={(e) => {
              const token = tokens.find(t => t.address === e.target.value);
              setSelectedToken(token);
            }}
            disabled={disabled || loading}
          >
            <option value="">Select a token</option>
            {tokens.map((token) => (
              <option key={token.address} value={token.address}>
                {token.symbol}
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount
          </label>
          <input
            type="number"
            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            disabled={disabled || loading}
          />
        </div>

        {/* Quote Display */}
        {quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                You'll receive
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {(quote.outputAmount / Math.pow(10, TOKEN_CONFIG.USDC_DECIMALS)).toFixed(2)} USDC
              </span>
            </div>
            
            {priceImpactWarning && (
              <div className="mt-2 flex items-center text-yellow-600 dark:text-yellow-500">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">High price impact!</span>
              </div>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-red-600 dark:text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swap Button */}
        <button
          className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
            disabled || loading || !quote
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleSwap}
          disabled={disabled || loading || !quote}
        >
          {loading ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin mx-auto" />
          ) : (
            'Swap'
          )}
        </button>
      </div>
    </div>
  );
}
