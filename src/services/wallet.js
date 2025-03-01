import { Connection, PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createConnectionWithFailover } from "../utils/rpc";

export class WalletService {
  constructor() {
    // Initialize with default endpoint, will be updated in init()
    this.connection = null;
    this.init();
  }

  async init() {
    try {
      this.connection = await createConnectionWithFailover();
    } catch (error) {
      console.error("Failed to initialize wallet service:", error);
      // Fallback to default RPC endpoint
      const defaultEndpoint =
        process.env.NEXT_PUBLIC_RPC_ENDPOINT ||
        "https://api.mainnet-beta.solana.com";
      this.connection = new Connection(defaultEndpoint, "confirmed");
    }
  }

  async getTokenAccounts(publicKey) {
    if (!this.connection) {
      await this.init();
    }

    try {
      const accounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID },
      );

      return accounts.value.map((account) => ({
        mint: account.account.data.parsed.info.mint,
        amount: account.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
      }));
    } catch (error) {
      console.error("Error fetching token accounts:", error);
      throw new Error("Failed to fetch token accounts");
    }
  }

  async getRecentTransactions(publicKey, limit = 10) {
    if (!this.connection) {
      await this.init();
    }

    try {
      const signatures = await this.connection.getSignaturesForAddress(
        publicKey,
        { limit },
      );

      const transactions = await Promise.all(
        signatures.map(async (sig) => {
          const tx = await this.connection.getParsedTransaction(sig.signature);
          return this.parseTransaction(tx, sig);
        }),
      );

      return transactions.filter((tx) => tx !== null);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }

  async getBalance(publicKey) {
    if (!this.connection) {
      await this.init();
    }

    try {
      return await this.connection.getBalance(publicKey);
    } catch (error) {
      console.error("Error fetching balance:", error);
      throw new Error("Failed to fetch balance");
    }
  }

  async getTransaction(signature) {
    if (!this.connection) {
      await this.init();
    }

    try {
      return await this.connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("Failed to fetch transaction");
    }
  }

  parseTransaction(tx, sig) {
    if (!tx) return null;

    return {
      signature: sig.signature,
      timestamp: sig.blockTime,
      status: tx.meta?.err ? "failed" : "success",
      amount: this.extractAmount(tx),
      type: this.determineTransactionType(tx),
    };
  }

  extractAmount(tx) {
    // Implementation depends on specific transaction structure
    // This is a simplified version
    try {
      const preBalances = tx.meta?.preBalances?.[0] || 0;
      const postBalances = tx.meta?.postBalances?.[0] || 0;
      return Math.abs((postBalances - preBalances) / 1e9);
    } catch (error) {
      return 0;
    }
  }

  determineTransactionType(tx) {
    // Implement logic to determine if it's a swap, transfer, etc.
    return "transfer";
  }
}
