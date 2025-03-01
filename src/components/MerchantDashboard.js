import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { generatePaymentLink } from "../utils/payments";

export default function MerchantDashboard() {
  const { publicKey } = useWallet();
  const [amount, setAmount] = useState("");
  const [paymentLink, setPaymentLink] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (publicKey) {
      loadTransactions();
    }
  }, [publicKey]);

  const loadTransactions = async () => {
    // TODO: Implement transaction history loading
  };

  const handleGenerateLink = async () => {
    if (!amount || !publicKey) return;

    try {
      setLoading(true);
      const link = await generatePaymentLink({
        merchantAddress: publicKey.toString(),
        amount: parseFloat(amount),
        currency: "USDC",
      });
      setPaymentLink(link);
    } catch (error) {
      console.error("Error generating payment link:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet to Continue</h2>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Generate Payment Link</h2>
        <div className="flex gap-4 mb-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in USDC"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleGenerateLink}
            disabled={loading || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Link"}
          </button>
        </div>

        {paymentLink && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-medium mb-2">Payment Link:</p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={paymentLink}
                readOnly
                className="flex-1 p-2 border rounded bg-white"
              />
              <button
                onClick={() => navigator.clipboard.writeText(paymentLink)}
                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet</p>
        ) : (
          <div className="divide-y">
            {transactions.map((tx) => (
              <div key={tx.signature} className="py-4">
                <p className="font-medium">{tx.amount} USDC</p>
                <p className="text-sm text-gray-500">{tx.timestamp}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
