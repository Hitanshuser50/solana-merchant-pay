import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_CONFIG } from "../config/constants";
import { createConnectionWithFailover } from "./rpc";

/**
 * Track merchant settlement status
 * @param {string} txId - Transaction ID
 * @param {string} merchantAddress - Merchant's wallet address
 * @returns {Promise<Object>} Settlement status
 */
export async function trackSettlement(txId, merchantAddress) {
  const connection = await createConnectionWithFailover();

  try {
    // Get transaction details
    const tx = await connection.getTransaction(txId, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return {
        status: "pending",
        message: "Transaction not found",
      };
    }

    // Check if transaction was successful
    if (!tx.meta?.err) {
      // Verify USDC transfer to merchant
      const postTokenBalances = tx.meta.postTokenBalances || [];
      const merchantUsdcTransfer = postTokenBalances.find(
        (balance) =>
          balance.mint === TOKEN_CONFIG.USDC_MINT.toString() &&
          balance.owner === merchantAddress,
      );

      if (merchantUsdcTransfer) {
        return {
          status: "success",
          amount: merchantUsdcTransfer.uiTokenAmount.uiAmount,
          message: "Settlement completed",
        };
      }
    }

    return {
      status: "failed",
      message: "Settlement failed",
    };
  } catch (error) {
    console.error("Error tracking settlement:", error);
    return {
      status: "error",
      message: "Error tracking settlement",
    };
  }
}

/**
 * Get merchant settlement history
 * @param {string} merchantAddress - Merchant's wallet address
 * @param {number} limit - Number of transactions to fetch
 * @returns {Promise<Array>} Settlement history
 */
export async function getSettlementHistory(merchantAddress, limit = 10) {
  const connection = await createConnectionWithFailover();

  try {
    const signatures = await connection.getSignaturesForAddress(
      new PublicKey(merchantAddress),
      { limit },
    );

    const settlements = await Promise.all(
      signatures.map(async (sig) => {
        const status = await trackSettlement(sig.signature, merchantAddress);
        return {
          ...status,
          signature: sig.signature,
          timestamp: sig.blockTime,
        };
      }),
    );

    return settlements.filter((s) => s.status === "success");
  } catch (error) {
    console.error("Error fetching settlement history:", error);
    return [];
  }
}
