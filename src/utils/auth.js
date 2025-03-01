import { PublicKey } from '@solana/web3.js';

// Validate merchant wallet address
export function validateMerchantWallet(wallet) {
  try {
    if (!wallet) {
      throw new Error('Merchant wallet is required');
    }
    new PublicKey(wallet);
    return true;
  } catch (error) {
    return false;
  }
}

// Validate API key
export function validateApiKey(apiKey) {
  // In a real implementation, this would validate against a database
  // For now, we'll just check if it's present and has the correct format
  if (!apiKey) {
    return false;
  }
  
  // Check if API key matches expected format (e.g., "pk_live_" or "pk_test_" followed by random string)
  const apiKeyRegex = /^(pk_live_|pk_test_)[a-zA-Z0-9]{32}$/;
  return apiKeyRegex.test(apiKey);
}

// Middleware to check authentication
export function withAuth(handler) {
  return async (req, res) => {
    try {
      const apiKey = req.headers['x-api-key'];
      const merchantWallet = req.headers['x-merchant-wallet'];

      if (!validateApiKey(apiKey)) {
        return res.status(401).json({
          error: 'Invalid API key'
        });
      }

      if (!validateMerchantWallet(merchantWallet)) {
        return res.status(401).json({
          error: 'Invalid merchant wallet'
        });
      }

      // Add merchant info to request
      req.merchant = {
        wallet: merchantWallet,
        apiKey
      };

      return handler(req, res);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        error: 'Internal server error'
      });
    }
  };
}

// Rate limiting (simple in-memory implementation)
const rateLimit = new Map();

export function withRateLimit(handler, { max = 100, window = 60000 } = {}) {
  return async (req, res) => {
    const key = req.headers['x-api-key'] || req.ip;
    const now = Date.now();
    
    const userRateLimit = rateLimit.get(key) || {
      count: 0,
      resetAt: now + window
    };

    if (now > userRateLimit.resetAt) {
      userRateLimit.count = 0;
      userRateLimit.resetAt = now + window;
    }

    if (userRateLimit.count >= max) {
      return res.status(429).json({
        error: 'Too many requests',
        resetAt: new Date(userRateLimit.resetAt)
      });
    }

    userRateLimit.count++;
    rateLimit.set(key, userRateLimit);

    return handler(req, res);
  };
}

// Combine multiple middleware
export function withMiddleware(...middleware) {
  return handler => {
    return middleware.reduceRight((h, m) => m(h), handler);
  };
}
