// Zchan Channels Configuration

export interface Channel {
  id: string;
  name: string;
  description: string;
  address: string; // Zcash z-address (shielded)
  cost: number; // Cost in ZEC to post (0.0001 ZEC = 10000 zatoshis)
  icon: string;
}

// Testnet channels
// For MVP testing: All channels use the same test address (your wallet)
// In production, each channel would have its own dedicated address
// Using Unified address for better compatibility with latest SDK
const TEST_ADDRESS = 'utest1qz2c9w98v9xavajc8ml5zd459902alt62tndt3sktsx0hd3gd20evhwfrqq834335a7lmw4a4mx79pnhczxvs50w5cfffelsuvtl9fer';

export const CHANNELS: Channel[] = [
  {
    id: 'general',
    name: '/general/',
    description: 'General discussion - anything goes',
    address: TEST_ADDRESS, // Using unified address for better compatibility
    cost: 0.00001, // Minimum for testing
    icon: '💬'
  },
  {
    id: 'whistleblow',
    name: '/whistleblow/',
    description: 'Expose corruption safely - high privacy',
    address: TEST_ADDRESS,
    cost: 0.00001,
    icon: '🚨'
  },
  {
    id: 'crypto',
    name: '/crypto/',
    description: 'Discuss crypto projects and markets',
    address: TEST_ADDRESS,
    cost: 0.00001,
    icon: '💰'
  },
  {
    id: 'privacy',
    name: '/privacy/',
    description: 'Privacy tech, tools, and techniques',
    address: TEST_ADDRESS,
    cost: 0.00001,
    icon: '🔐'
  },
  {
    id: 'zcash',
    name: '/zcash/',
    description: 'All about Zcash - the protocol powering this board',
    address: TEST_ADDRESS,
    cost: 0.00001,
    icon: '⚡'
  }
];

export const getChannelById = (id: string): Channel | undefined => {
  return CHANNELS.find(channel => channel.id === id);
};

export const getChannelByAddress = (address: string): Channel | undefined => {
  return CHANNELS.find(channel => channel.address === address);
};
