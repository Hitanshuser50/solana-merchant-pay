import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletTransactions } from "../hooks/useWalletTransactions";

export default function PaymentStatus() {
  const { publicKey } = useWallet();
  const { tokenAccounts, isLoading, error, refresh } = useWalletTransactions();

  const getUSDCBalance = () => {
    const usdcAccount = tokenAccounts.find(
      (account) => account.mint === process.env.NEXT_PUBLIC_USDC_MINT,
    );
    return usdcAccount?.amount || 0;
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Payment Status</h2>
        <button onClick={refresh} className="text-blue-500 hover:text-blue-700">
          Refresh
        </button>
      </div>

      {error ? (
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">Wallet Address</div>
            <div className="font-medium truncate">
              {publicKey?.toString() || "Not connected"}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-500">USDC Balance</div>
            <div className="font-medium">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                `${getUSDCBalance().toFixed(2)} USDC`
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg md:col-span-2">
            <div className="text-sm text-gray-500">Other Token Balances</div>
            <div className="mt-2 space-y-2">
              {tokenAccounts
                .filter(
                  (account) =>
                    account.mint !== process.env.NEXT_PUBLIC_USDC_MINT,
                )
                .map((account) => (
                  <div key={account.mint} className="flex justify-between">
                    <span className="text-sm">
                      {account.mint.slice(0, 8)}...
                    </span>
                    <span className="font-medium">
                      {account.amount.toFixed(4)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
