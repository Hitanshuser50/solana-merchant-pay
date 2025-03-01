import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { NETWORK_CONFIG, TOKEN_CONFIG } from "../config/constants";
import { createConnectionWithFailover } from "../utils/rpc";
import { format } from "date-fns";

export class SettlementService {
  constructor() {
    this.connection = null;
    this.init();
  }

  async init() {
    try {
      this.connection = await createConnectionWithFailover();
    } catch (error) {
      console.error("Failed to initialize settlement service:", error);
      throw new Error("Settlement service initialization failed");
    }
  }

  async settlePayment(payment) {
    if (!this.connection) {
      await this.init();
    }

    try {
      const merchantPublicKey = new PublicKey(payment.merchantWallet);

      // Get merchant's USDC token account
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        merchantPublicKey,
        { programId: TOKEN_PROGRAM_ID },
      );

      const usdcAccount = tokenAccounts.value.find(
        (account) =>
          account.account.data.parsed.info.mint ===
          TOKEN_CONFIG.USDC_MINT.toString(),
      );

      if (!usdcAccount) {
        throw new Error("Merchant USDC account not found");
      }

      // Update settlement status
      payment.settlement = {
        status: "completed",
        amount: payment.usdcAmount,
        account: usdcAccount.pubkey.toString(),
        completedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };

      return payment;
    } catch (error) {
      console.error("Error settling payment:", error);
      payment.settlement = {
        status: "failed",
        error: error.message,
        failedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
      throw new Error("Settlement failed");
    }
  }

  async getSettlementBalance(merchantWallet) {
    if (!this.connection) {
      await this.init();
    }

    try {
      const merchantPublicKey = new PublicKey(merchantWallet);

      // Get all token accounts
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        merchantPublicKey,
        { programId: TOKEN_PROGRAM_ID },
      );

      // Find USDC account
      const usdcAccount = tokenAccounts.value.find(
        (account) =>
          account.account.data.parsed.info.mint ===
          TOKEN_CONFIG.USDC_MINT.toString(),
      );

      if (!usdcAccount) {
        return {
          balance: 0,
          decimals: TOKEN_CONFIG.USDC_DECIMALS,
        };
      }

      return {
        balance: usdcAccount.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: usdcAccount.account.data.parsed.info.tokenAmount.decimals,
      };
    } catch (error) {
      console.error("Error getting settlement balance:", error);
      throw new Error("Failed to get settlement balance");
    }
  }

  async getSettlementHistory(merchantWallet, options = {}) {
    try {
      const { limit = 10, offset = 0 } = options;

      // Here you would typically fetch settlement history from your database
      // For now, we'll return mock data
      return {
        settlements: [
          {
            id: "SETTLEMENT-1",
            amount: 100,
            status: "completed",
            completedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
        ],
        total: 1,
      };
    } catch (error) {
      console.error("Error getting settlement history:", error);
      throw new Error("Failed to get settlement history");
    }
  }

  async generateSettlementReport(merchantWallet, startDate, endDate) {
    try {
      // Here you would typically generate a settlement report from your database
      // For now, we'll return mock data
      return {
        totalSettlements: 1,
        totalAmount: 100,
        successfulSettlements: 1,
        failedSettlements: 0,
        averageSettlementTime: "1m 30s",
        reportGeneratedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      };
    } catch (error) {
      console.error("Error generating settlement report:", error);
      throw new Error("Failed to generate settlement report");
    }
  }
}
