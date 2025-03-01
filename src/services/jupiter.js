import { Jupiter } from "@jup-ag/core";
import { Connection, PublicKey } from "@solana/web3.js";
import { JUPITER_CONFIG, NETWORK_CONFIG } from "../config/constants";
import Decimal from "decimal.js";

export class JupiterService {
  constructor() {
    this.jupiter = null;
    this.routeMap = new Map();
    this.init();
  }

  async init() {
    try {
      const connection = new Connection(NETWORK_CONFIG.RPC_ENDPOINTS[0], {
        commitment: NETWORK_CONFIG.COMMITMENT,
      });

      this.jupiter = await Jupiter.load({
        connection,
        cluster: NETWORK_CONFIG.SOLANA_NETWORK,
        restrictIntermediateTokens: true,
        wrapUnwrapSOL: true,
      });
    } catch (error) {
      console.error("Failed to initialize Jupiter:", error);
      throw new Error("Jupiter initialization failed");
    }
  }

  async getQuote({
    inputMint,
    outputMint,
    amount,
    slippageBps = JUPITER_CONFIG.DEFAULT_SLIPPAGE * 100,
  }) {
    if (!this.jupiter) {
      await this.init();
    }

    try {
      const inputToken = new PublicKey(inputMint);
      const outputToken = new PublicKey(outputMint);

      const routes = await this.jupiter.computeRoutes({
        inputMint: inputToken,
        outputMint: outputToken,
        amount,
        slippageBps,
        forceFetch: true,
      });

      if (!routes.routesInfos.length) {
        throw new Error("No routes found");
      }

      // Get best route
      const bestRoute = routes.routesInfos[0];

      // Calculate price impact
      const priceImpactPct = new Decimal(bestRoute.priceImpactPct).toFixed(2);

      return {
        route: bestRoute,
        inputAmount: bestRoute.inAmount,
        outputAmount: bestRoute.outAmount,
        priceImpact: priceImpactPct,
        fees: bestRoute.fees,
      };
    } catch (error) {
      console.error("Error getting quote:", error);
      throw new Error("Failed to get quote");
    }
  }

  async executeSwap({ route, userPublicKey }) {
    if (!this.jupiter) {
      await this.init();
    }

    try {
      const { transactions } = await this.jupiter.exchange({
        routeInfo: route,
        userPublicKey,
      });

      const { swapTransaction } = transactions;

      return {
        transaction: swapTransaction,
        signers: [], // Jupiter handles signers internally
      };
    } catch (error) {
      console.error("Error executing swap:", error);
      throw new Error("Swap execution failed");
    }
  }

  async getTokenList() {
    if (!this.jupiter) {
      await this.init();
    }

    try {
      return await this.jupiter.tokens();
    } catch (error) {
      console.error("Error fetching token list:", error);
      throw new Error("Failed to fetch token list");
    }
  }

  // Cache route for faster subsequent swaps
  cacheRoute(inputMint, outputMint, route) {
    const key = `${inputMint.toString()}-${outputMint.toString()}`;
    this.routeMap.set(key, {
      route,
      timestamp: Date.now(),
    });
  }

  // Get cached route if still valid
  getCachedRoute(inputMint, outputMint) {
    const key = `${inputMint.toString()}-${outputMint.toString()}`;
    const cached = this.routeMap.get(key);

    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp >
      JUPITER_CONFIG.ROUTE_CACHE_DURATION * 1000;
    return isExpired ? null : cached.route;
  }
}
