import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletService } from "../services/wallet";
import { REFRESH_INTERVAL } from "../config/constants";

export function useWalletTransactions() {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [tokenAccounts, setTokenAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const walletService = new WalletService();

  const fetchData = useCallback(async () => {
    if (!publicKey) return;

    try {
      setIsLoading(true);
      setError(null);

      const [txs, accounts] = await Promise.all([
        walletService.getRecentTransactions(publicKey),
        walletService.getTokenAccounts(publicKey),
      ]);

      setTransactions(txs);
      setTokenAccounts(accounts);
    } catch (err) {
      console.error("Error fetching wallet data:", err);
      setError("Failed to fetch wallet data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    fetchData();

    // Set up polling for updates
    const interval = setInterval(fetchData, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    transactions,
    tokenAccounts,
    isLoading,
    error,
    refresh,
  };
}
