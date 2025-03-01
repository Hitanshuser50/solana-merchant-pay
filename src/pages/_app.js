import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import dynamic from "next/dynamic";
import { JupiterProvider } from "@/providers/JupiterProvider";
import { Toaster } from 'react-hot-toast';

require("@solana/wallet-adapter-react-ui/styles.css");
import "../styles/globals.css";

// Create a dynamic version of the app without SSR
const AppWrapper = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Mainnet; // Changed to mainnet for production use

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <JupiterProvider>
            <Component {...pageProps} />
            <Toaster position="bottom-right" />
          </JupiterProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Export a dynamic version of the app without SSR
export default dynamic(() => Promise.resolve(AppWrapper), {
  ssr: false,
});
