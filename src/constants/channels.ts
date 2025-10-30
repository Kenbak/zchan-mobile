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
export const CHANNELS: Channel[] = [
  {
    id: 'general',
    name: '/general/',
    description: 'General discussion - anything goes',
    address: 'zs1qmmklamqh288s48ekxt07kw5zpl4k9eevxfmqe9cnx2ld0y5k0a3zyn4r4c5afcnu2wsgs0wjwn',
    cost: 0.0001,
    icon: '💬'
  },
  {
    id: 'whistleblow',
    name: '/whistleblow/',
    description: 'Expose corruption safely - high privacy',
    address: 'zs1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // TODO: Generate
    cost: 0.0005,
    icon: '🚨'
  },
  {
    id: 'crypto',
    name: '/crypto/',
    description: 'Discuss crypto projects and markets',
    address: 'zs1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // TODO: Generate
    cost: 0.0001,
    icon: '💰'
  },
  {
    id: 'privacy',
    name: '/privacy/',
    description: 'Privacy tech, tools, and techniques',
    address: 'zs1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // TODO: Generate
    cost: 0.0001,
    icon: '🔐'
  },
  {
    id: 'zcash',
    name: '/zcash/',
    description: 'All about Zcash - the protocol powering this board',
    address: 'zs1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // TODO: Generate
    cost: 0.0001,
    icon: '⚡'
  }
];

export const getChannelById = (id: string): Channel | undefined => {
  return CHANNELS.find(channel => channel.id === id);
};

export const getChannelByAddress = (address: string): Channel | undefined => {
  return CHANNELS.find(channel => channel.address === address);
};
