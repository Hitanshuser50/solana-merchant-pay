import { PublicKey } from '@solana/web3.js';

// Network Configuration
export const NETWORK_CONFIG = {
  SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta',
  RPC_ENDPOINTS: [
    process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    'https://ssc-dao.genesysgo.net'
  ],
  COMMITMENT: 'confirmed',
  PREFLIGHT_COMMITMENT: 'processed',
  WEBSOCKET_ENABLED: true,
  CONNECTION_POOL_SIZE: 3
};

// Token Configuration
export const TOKEN_CONFIG = {
  USDC_MINT: new PublicKey(process.env.NEXT_PUBLIC_USDC_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDC_DECIMALS: 6,
  COMMON_TOKENS: [
    'SOL',
    'USDC',
    'USDT',
    'RAY',
    'SRM',
    'BONK',
    'ORCA',
    'MNGO',
    'FIDA'
  ]
};

// For backward compatibility
export const USDC_MINT = TOKEN_CONFIG.USDC_MINT;

// Asset Types
export const ASSET_TYPES = {
  SPL_TOKEN: 'spl-token',
  NFT: 'nft',
  FIAT: 'fiat'
};

// Price Configuration
export const PRICE_CONFIG = {
  UPDATE_INTERVAL: 10000, // 10 seconds
  SLIPPAGE_TOLERANCE: 0.5, // 0.5%
  PRICE_IMPACT_WARNING: 5, // 5%
  PRICE_FEEDS: {
    PYTH: true,
    SWITCHBOARD: true,
    CHAINLINK: false
  }
};

// Jupiter Configuration
export const JUPITER_CONFIG = {
  API_ENDPOINT: process.env.NEXT_PUBLIC_JUPITER_API || 'https://quote-api.jup.ag/v4',
  DEFAULT_SLIPPAGE: 1, // 1%
  REFRESH_RATE: 15, // Refresh rate in seconds
  ROUTE_CACHE_DURATION: 10, // Route cache duration in seconds
  STRICT_TOKEN_LIST: false, // Allow unlisted tokens
  USE_THOR: true // Enable Thor API for better routing
};

// NFT Configuration
export const NFT_CONFIG = {
  COLLECTION_WHITELIST: [],
  MARKETPLACE_FEES: 0, // No fees
  ROYALTY_ENFORCEMENT: true
};

// Transaction Configuration
export const TX_CONFIG = {
  CONFIRMATION_COMMITMENT: 'confirmed',
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 second
};

// Cache Configuration
export const CACHE_CONFIG = {
  TOKEN_LIST: 300000, // 5 minutes
  PRICE_QUOTE: 10000, // 10 seconds
  ROUTE: 10000, // 10 seconds
  RPC_HEALTH: 60000 // 1 minute
};

// Refresh Intervals
export const REFRESH_INTERVAL = 15000; // 15 seconds
