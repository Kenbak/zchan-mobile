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
// Using Sapling address instead of Unified for better SDK compatibility
const TEST_ADDRESS = 'ztestsapling1reqyw497yvm7uhx0gzm6s8atq38d6vv0jrvh9mxpukk87lhf5clcqclqvyz02d9jg3xxsqst5lfz';

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
