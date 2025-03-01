import { Connection } from '@solana/web3.js';
import { NETWORK_CONFIG } from '../config/constants';

class RPCConnectionPool {
  constructor() {
    this.connections = new Map();
    this.healthStatus = new Map();
    this.lastHealthCheck = new Map();
    this.defaultEndpoint = NETWORK_CONFIG.RPC_ENDPOINTS[0];
  }

  getConnection(endpoint = this.defaultEndpoint) {
    if (!this.connections.has(endpoint)) {
      this.connections.set(
        endpoint,
        new Connection(endpoint, {
          commitment: NETWORK_CONFIG.COMMITMENT,
          confirmTransactionInitialTimeout: 60000
        })
      );
    }
    return this.connections.get(endpoint);
  }

  async checkHealth(endpoint) {
    const now = Date.now();
    const lastCheck = this.lastHealthCheck.get(endpoint) || 0;
    
    // Only check health if cache expired
    if (now - lastCheck > 60000) { // 1 minute cache
      try {
        const conn = this.getConnection(endpoint);
        const start = Date.now();
        await conn.getHealth();
        const latency = Date.now() - start;
        
        this.healthStatus.set(endpoint, {
          healthy: true,
          latency,
          lastChecked: now
        });
      } catch (error) {
        console.warn(`RPC endpoint ${endpoint} health check failed:`, error);
        this.healthStatus.set(endpoint, {
          healthy: false,
          error: error.message,
          lastChecked: now
        });
      }
      this.lastHealthCheck.set(endpoint, now);
    }
    
    return this.healthStatus.get(endpoint);
  }

  async getBestEndpoint() {
    try {
      const healthChecks = await Promise.all(
        NETWORK_CONFIG.RPC_ENDPOINTS.map(async endpoint => {
          const health = await this.checkHealth(endpoint);
          return { endpoint, health };
        })
      );

      const healthyEndpoints = healthChecks.filter(({ health }) => health?.healthy);
      
      // If no healthy endpoints, return default
      if (healthyEndpoints.length === 0) {
        console.warn('No healthy RPC endpoints found, using default');
        return this.defaultEndpoint;
      }

      // Sort by latency
      healthyEndpoints.sort((a, b) => a.health.latency - b.health.latency);
      return healthyEndpoints[0].endpoint;
    } catch (error) {
      console.error('Failed to get best endpoint:', error);
      return this.defaultEndpoint;
    }
  }

  async createConnectionPool(size = NETWORK_CONFIG.CONNECTION_POOL_SIZE) {
    const connections = [];
    const endpoint = await this.getBestEndpoint();
    
    for (let i = 0; i < size; i++) {
      connections.push(this.getConnection(endpoint));
    }
    
    return connections;
  }
}

const connectionPool = new RPCConnectionPool();

export async function createConnectionWithFailover() {
  try {
    const endpoint = await connectionPool.getBestEndpoint();
    return connectionPool.getConnection(endpoint);
  } catch (error) {
    console.error('Failed to create connection with failover:', error);
    // Fallback to default endpoint
    return connectionPool.getConnection();
  }
}

export async function createConnectionPool(size = NETWORK_CONFIG.CONNECTION_POOL_SIZE) {
  return connectionPool.createConnectionPool(size);
}

export async function getHealthyEndpoints() {
  const healthChecks = await Promise.all(
    NETWORK_CONFIG.RPC_ENDPOINTS.map(async endpoint => {
      const health = await connectionPool.checkHealth(endpoint);
      return { endpoint, health };
    })
  );

  return healthChecks.filter(({ health }) => health?.healthy)
    .map(({ endpoint }) => endpoint);
}

export function clearConnectionPool() {
  connectionPool.connections.clear();
  connectionPool.healthStatus.clear();
  connectionPool.lastHealthCheck.clear();
}
