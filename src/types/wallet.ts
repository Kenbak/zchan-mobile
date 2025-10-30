// Wallet Types
import { Addresses } from 'react-native-zcash';

export interface Wallet {
  id: string;
  seedPhrase?: string; // Only available during creation/restore
  addresses: string[] | Addresses; // Zcash z-addresses or unified addresses
  balance: number | {
    saplingAvailable: number;
    saplingTotal: number;
    orchardAvailable: number;
    orchardTotal: number;
    transparentAvailable: number;
    transparentTotal: number;
  }; // in zatoshis or detailed balance
  createdAt: number; // timestamp
  lastSynced: number; // timestamp
}

export interface WalletState {
  wallet: Wallet | null;
  isLocked: boolean;
  isSyncing: boolean;
  lastError: string | null;
}

export interface Transaction {
  txid: string;
  type: 'send' | 'receive';
  address: string; // to/from address
  amount: number; // in zatoshis
  memo?: string;
  fee: number; // in zatoshis
  blockHeight?: number;
  confirmations: number;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface Address {
  address: string;
  index: number;
  balance: number; // in zatoshis
  label?: string;
}
