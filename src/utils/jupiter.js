import { Jupiter } from "@jup-ag/core";
import { Connection, PublicKey } from "@solana/web3.js";

let jupiterInstance = null;

export const initJupiter = async (connection, cluster = "devnet") => {
  if (!jupiterInstance) {
    jupiterInstance = await Jupiter.load({
      connection,
      cluster,
      user: null, // Will be set during transactions
    });
  }
  return jupiterInstance;
};

export const getRoutes = async (
  inputMint,
  outputMint,
  amount,
  slippage = 1,
  feeBps = 0,
) => {
  try {
    const routes = await jupiterInstance.computeRoutes({
      inputMint: new PublicKey(inputMint),
      outputMint: new PublicKey(outputMint),
      amount,
      slippageBps: slippage * 100,
      feeBps,
    });

    return routes.routesInfos;
  } catch (error) {
    console.error("Error getting routes:", error);
    throw error;
  }
};

export const executeSwap = async (wallet, route, inputToken, outputToken) => {
  try {
    const { transactions } = await jupiterInstance.exchange({
      route,
      userPublicKey: wallet.publicKey,
    });

    const { signature } = await wallet.signAndSendTransaction(
      transactions.swapTransaction,
    );

    return {
      signature,
      inputToken,
      outputToken,
      status: "completed",
    };
  } catch (error) {
    console.error("Error executing swap:", error);
    throw error;
  }
};
