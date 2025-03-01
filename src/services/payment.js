import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { NETWORK_CONFIG, TOKEN_CONFIG } from "../config/constants";
import { JupiterService } from "./jupiter";
import { WalletService } from "./wallet";
import { createConnectionWithFailover } from "../utils/rpc";
import { format } from "date-fns";

export class PaymentService {
  constructor() {
    this.connection = null;
    this.jupiterService = new JupiterService();
    this.walletService = new WalletService();
    this.init();
  }

  async init() {
    try {
      this.connection = await createConnectionWithFailover();
    } catch (error) {
      console.error("Failed to initialize payment service:", error);
      throw new Error("Payment service initialization failed");
    }
  }

  async createPayment({
    amount,
    merchantWallet,
    inputToken,
    description = "",
    metadata = {},
  }) {
    if (!this.connection) {
      await this.init();
    }

    try {
      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error("Invalid amount");
      }

      const merchantPublicKey = new PublicKey(merchantWallet);
      const inputTokenMint = new PublicKey(inputToken);
      const usdcMint = TOKEN_CONFIG.USDC_MINT;

      // Get quote for token swap
      const quote = await this.jupiterService.getQuote({
        inputMint: inputTokenMint,
        outputMint: usdcMint,
        amount: amount,
      });

      // Create payment record
      const payment = {
        id: this.generatePaymentId(),
        amount,
        usdcAmount: quote.outputAmount,
        merchantWallet,
        inputToken,
        status: "pending",
        description,
        metadata,
        createdAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
        quote,
      };

      return payment;
    } catch (error) {
      console.error("Error creating payment:", error);
      throw new Error("Failed to create payment");
    }
  }

  async processPayment({ payment, userPublicKey }) {
    if (!this.connection) {
      await this.init();
    }

    try {
      // Get latest quote
      const quote = await this.jupiterService.getQuote({
        inputMint: payment.inputToken,
        outputMint: TOKEN_CONFIG.USDC_MINT.toString(),
        amount: payment.amount,
      });

      // Execute swap
      const { transaction, signers } = await this.jupiterService.executeSwap({
        route: quote.route,
        userPublicKey: new PublicKey(userPublicKey),
      });

      // Update payment status
      payment.status = "processing";
      payment.quote = quote;
      payment.processingStarted = format(new Date(), "yyyy-MM-dd HH:mm:ss");

      return {
        payment,
        transaction,
        signers,
      };
    } catch (error) {
      console.error("Error processing payment:", error);
      throw new Error("Payment processing failed");
    }
  }

  async confirmPayment(signature) {
    if (!this.connection) {
      await this.init();
    }

    try {
      const result = await this.connection.confirmTransaction(signature, {
        commitment: NETWORK_CONFIG.COMMITMENT,
      });

      if (result.value.err) {
        throw new Error("Transaction failed");
      }

      return true;
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw new Error("Payment confirmation failed");
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      // Here you would typically fetch the payment status from your database
      // For now, we'll just return a mock status
      return {
        status: "completed",
        signature: "mock_signature",
        confirmedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
    } catch (error) {
      console.error("Error getting payment status:", error);
      throw new Error("Failed to get payment status");
    }
  }

  generatePaymentId() {
    return `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
