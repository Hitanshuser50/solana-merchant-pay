import { Connection, PublicKey, TransactionSignature } from "@solana/web3.js";
import { USDC_MINT } from "../config/constants";

export class PaymentError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
    this.details = details;
  }
}

export const generatePaymentLink = ({ merchantAddress, amount, currency }) => {
  if (!merchantAddress || !amount || !currency) {
    throw new PaymentError("Missing required parameters", "INVALID_PARAMS");
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const params = new URLSearchParams({
    merchant: merchantAddress,
    amount: amount.toString(),
    currency,
  });

  return `${baseUrl}/pay?${params.toString()}`;
};

export const executePayment = async ({
  connection,
  wallet,
  inputToken,
  inputAmount,
  slippage = 1, // 1% slippage
}) => {
  try {
    if (!connection || !wallet || !inputToken || !inputAmount) {
      throw new PaymentError("Missing required parameters", "INVALID_PARAMS");
    }

    // Validate wallet connection
    if (!wallet.publicKey) {
      throw new PaymentError("Wallet not connected", "WALLET_NOT_CONNECTED");
    }

    // Dynamically import Jupiter to avoid fs module issues
    const { Jupiter } = await import("@jup-ag/core");

    const jupiter = await Jupiter.load({
      connection,
      cluster: "mainnet-beta",
      user: wallet,
    });

    // Get routes for the swap
    const routes = await jupiter
      .computeRoutes({
        inputMint: new PublicKey(inputToken),
        outputMint: new PublicKey(USDC_MINT),
        amount: inputAmount,
        slippageBps: slippage * 100,
      })
      .catch((error) => {
        throw new PaymentError("Failed to compute routes", "ROUTE_ERROR", {
          error: error.message,
        });
      });

    if (!routes.routesInfos?.length) {
      throw new PaymentError("No routes found for swap", "NO_ROUTES");
    }

    // Execute the swap with the best route
    const { execute } = await jupiter.exchange({
      routeInfo: routes.routesInfos[0],
    });

    const result = await execute();

    if (!result.success) {
      throw new PaymentError("Swap execution failed", "SWAP_FAILED", result);
    }

    return {
      success: true,
      txId: result.txid,
      outputAmount: result.outputAmount,
      route: routes.routesInfos[0],
    };
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }
    console.error("Payment execution error:", error);
    throw new PaymentError("Payment execution failed", "EXECUTION_ERROR", {
      error: error.message,
    });
  }
};

export const getPaymentStatus = async (signature, connection) => {
  try {
    if (!signature || !connection) {
      throw new PaymentError(
        "Missing signature or connection",
        "INVALID_PARAMS",
      );
    }

    const status = await connection.getSignatureStatus(signature);

    if (!status?.value) {
      throw new PaymentError("Transaction not found", "TX_NOT_FOUND");
    }

    const { confirmationStatus, err } = status.value;

    if (err) {
      throw new PaymentError("Transaction failed", "TX_FAILED", { error: err });
    }

    return {
      confirmed: confirmationStatus === "confirmed",
      finalized: confirmationStatus === "finalized",
      slot: status.value.slot,
      confirmationStatus,
    };
  } catch (error) {
    if (error instanceof PaymentError) {
      throw error;
    }
    console.error("Error getting payment status:", error);
    throw new PaymentError("Failed to get payment status", "STATUS_ERROR", {
      error: error.message,
    });
  }
};
