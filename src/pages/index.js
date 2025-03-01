import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import TransactionList from "../components/TransactionList";
import PaymentStatus from "../components/PaymentStatus";
import SwapForm from "../components/SwapForm";

export default function Home() {
  const { publicKey } = useWallet();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Crypto Payment Gateway</h1>
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {publicKey ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <PaymentStatus />
              <SwapForm />
            </div>
            <div>
              <TransactionList />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">
              Welcome to Crypto Payment Gateway
            </h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to start managing your crypto payments and
              automatic USDC conversions.
            </p>
            <div className="inline-block">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white mt-auto py-6">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Powered by Solana and Jupiter</p>
        </div>
      </footer>
    </div>
  );
}
