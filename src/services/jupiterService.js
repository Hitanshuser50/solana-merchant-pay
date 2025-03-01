import { Jupiter } from '@jup-ag/core';
import { Connection, PublicKey } from '@solana/web3.js';
import { TokenListProvider } from '@solana/spl-token-registry';

const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC

export class JupiterService {
  constructor(connection, wallet) {
    this.connection = connection;
    this.wallet = wallet;
    this.jupiter = null;
    this.tokens = null;
  }

  async initialize() {
    try {
      // Initialize Jupiter
      this.jupiter = await Jupiter.load({
        connection: this.connection,
        cluster: 'mainnet-beta',
        user: this.wallet, // Pass the wallet adapter
      });

      // Load token list
      const tokens = await new TokenListProvider().resolve();
      this.tokens = tokens.filterByClusterSlug('mainnet-beta').getList();

      return true;
    } catch (error) {
      console.error('Error initializing Jupiter:', error);
      throw error;
    }
  }

  async getQuote(inputMint, amount) {
    try {
      if (!this.jupiter) {
        throw new Error('Jupiter not initialized');
      }

      // Get routes for swapping input token to USDC
      const routes = await this.jupiter.computeRoutes({
        inputMint: new PublicKey(inputMint),
        outputMint: USDC_MINT,
        amount: amount,
        slippageBps: 50, // 0.5% slippage
      });

      if (!routes.routesInfos?.length) {
        throw new Error('No routes found');
      }

      // Return the best route
      return routes.routesInfos[0];
    } catch (error) {
      console.error('Error getting quote:', error);
      throw error;
    }
  }

  async executeSwap(route) {
    try {
      if (!this.jupiter) {
        throw new Error('Jupiter not initialized');
      }

      // Execute the swap
      const { transactions } = await this.jupiter.exchange({
        routeInfo: route,
      });

      // Execute the transaction
      const { signature } = await this.wallet.sendTransaction(
        transactions.swapTransaction,
        this.connection
      );

      // Wait for confirmation
      await this.connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Error executing swap:', error);
      throw error;
    }
  }

  async getTokenInfo(mint) {
    return this.tokens?.find((t) => t.address === mint);
  }
}

export const createJupiterService = async (connection, wallet) => {
  const service = new JupiterService(connection, wallet);
  await service.initialize();
  return service;
};
