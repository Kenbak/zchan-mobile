// Zchan App Configuration

export const APP_CONFIG = {
  // App Info
  name: 'Zchan',
  version: '0.1.0',
  tagline: 'Anonymous • Immutable • Uncensorable',

  // Network
  network: 'testnet' as 'testnet' | 'mainnet',

  // Zcash Configuration
  zcash: {
    testnet: {
      lightwalletd: {
        host: 'lightwalletd.testnet.electriccoin.co',
        port: 9067,
      },
      chainName: 'test',
      defaultFee: 1000, // zatoshis (0.00001 ZEC)
      explorerUrl: 'https://explorer.zcha.in/transactions/',
    },
    mainnet: {
      lightwalletd: {
        host: 'lightwalletd.electriccoin.co',
        port: 9067,
      },
      chainName: 'main',
      defaultFee: 1000,
      explorerUrl: 'https://explorer.zcha.in/transactions/',
    },
  },

  // Messages
  message: {
    maxLength: 512, // bytes (Zcash memo field limit)
    syncInterval: 30000, // ms (30 seconds)
    refreshInterval: 10000, // ms (10 seconds for active channels)
  },

  // Security
  security: {
    requireBiometricForSend: true,
    requireBiometricForView: false,
    lockTimeout: 300000, // ms (5 minutes)
    maxFailedAttempts: 3,
  },

  // UI
  ui: {
    animationDuration: 200, // ms
    toastDuration: 3000, // ms
    terminalFont: 'VT323',
    fallbackFont: 'monospace',
  },

  // Links
  links: {
    github: 'https://github.com/Kenbak/zchan',
    zashi: 'https://zashi.app',
    zcash: 'https://z.cash',
    faucet: 'https://faucet.testnet.z.cash',
  },
} as const;

// Helper to get current network config
export const getNetworkConfig = () => {
  return APP_CONFIG.zcash[APP_CONFIG.network];
};

// Convert ZEC to zatoshis
export const zecToZatoshis = (zec: number): number => {
  return Math.round(zec * 100_000_000);
};

// Convert zatoshis to ZEC
export const zatoshisToZec = (zatoshis: number): number => {
  return zatoshis / 100_000_000;
};
