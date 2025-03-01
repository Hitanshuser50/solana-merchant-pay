import React, { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createJupiterService } from '@/services/jupiterService';

const JupiterContext = createContext({});

export function useJupiter() {
  return useContext(JupiterContext);
}

export function JupiterProvider({ children }) {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [jupiterService, setJupiterService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initJupiter = async () => {
      if (wallet.connected) {
        try {
          setLoading(true);
          setError(null);
          const service = await createJupiterService(connection, wallet);
          setJupiterService(service);
        } catch (err) {
          console.error('Failed to initialize Jupiter:', err);
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setJupiterService(null);
      }
    };

    initJupiter();
  }, [connection, wallet.connected]);

  const value = {
    jupiterService,
    loading,
    error,
  };

  return (
    <JupiterContext.Provider value={value}>
      {children}
    </JupiterContext.Provider>
  );
}
