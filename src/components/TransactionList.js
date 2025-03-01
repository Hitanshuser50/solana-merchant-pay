import { useWalletTransactions } from "../hooks/useWalletTransactions";

export default function TransactionList() {
  const { transactions, isLoading, error } = useWalletTransactions();

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-6 mt-4 shadow-sm">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 mt-4 shadow-sm">
        <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="bg-white rounded-lg p-6 mt-4 shadow-sm">
        <p className="text-gray-500 text-center">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 mt-4 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.signature} className="border-b pb-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium">
                  {tx.type === "swap" ? "Token Swap" : "Transfer"}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(tx.timestamp * 1000).toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {tx.amount} {tx.inputToken || "SOL"}
                  {tx.type === "swap" && (
                    <span className="mx-2">→ {tx.amountOut} USDC</span>
                  )}
                </div>
                <div
                  className={`text-sm ${
                    tx.status === "success" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {tx.status}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <a
                href={`https://explorer.solana.com/tx/${tx.signature}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 hover:text-blue-700"
              >
                View on Explorer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
