import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Connection } from "@solana/web3.js";
import { executePayment, getPaymentStatus } from "../utils/payments";
import SwapForm from "../components/SwapForm";
import { motion } from "framer-motion";
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Toaster } from "react-hot-toast";
import Layout from "../components/Layout";

const PaymentPage = () => {
  const router = useRouter();
  const { publicKey, wallet } = useWallet();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [status, setStatus] = useState("pending"); // pending, processing, success, error
  const [error, setError] = useState(null);

  useEffect(() => {
    if (router.isReady) {
      const { merchant, amount, currency } = router.query;
      if (merchant && amount && currency) {
        setPaymentDetails({
          merchantAddress: merchant,
          amount: parseFloat(amount),
          currency,
        });
      }
    }
  }, [router.isReady, router.query]);

  const handlePayment = async (inputToken, inputAmount) => {
    if (!publicKey || !wallet || !paymentDetails) return;

    try {
      setStatus("processing");
      setError(null);

      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC_HOST,
        "confirmed",
      );

      const result = await executePayment({
        connection,
        wallet,
        inputToken,
        inputAmount,
      });

      if (result.success) {
        // Wait for confirmation
        const { confirmed } = await getPaymentStatus(result.txId, connection);
        if (confirmed) {
          setStatus("success");
        } else {
          throw new Error("Transaction failed to confirm");
        }
      } else {
        throw new Error("Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message);
      setStatus("error");
    }
  };

  if (!paymentDetails) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <XCircleIcon className="w-16 h-16 text-error-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Invalid Payment Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This payment link appears to be invalid or expired.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <CurrencyDollarIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Complete Payment
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600 dark:text-gray-400">
                Amount Due:
              </span>
              <span className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
                {paymentDetails.amount} {paymentDetails.currency}
              </span>
            </div>
          </motion.div>

          {!publicKey ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
            >
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Connect your wallet to continue
              </p>
              <WalletMultiButton className="!bg-gradient-to-r from-primary-500 to-primary-600 !rounded-xl !py-3 !px-6 !text-white hover:from-primary-600 hover:to-primary-700 transition-all duration-200" />
            </motion.div>
          ) : (
            <SwapForm
              targetAmount={paymentDetails.amount}
              onSwap={handlePayment}
              disabled={status === "processing"}
            />
          )}

          {/* Status Displays */}
          <AnimatePresence mode="wait">
            {status === "processing" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center"
              >
                <div className="inline-flex items-center space-x-2 text-primary-500">
                  <ArrowPathIcon className="w-6 h-6 animate-spin" />
                  <span>Processing payment...</span>
                </div>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center text-success-500"
              >
                <CheckCircleIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="text-xl font-semibold">Payment Successful!</p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center text-error-500"
              >
                <XCircleIcon className="w-16 h-16 mx-auto mb-4" />
                <p className="font-semibold">Payment Failed</p>
                <p className="text-sm mt-2">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentPage;
