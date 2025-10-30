import { create } from 'zustand';
import { Wallet } from '../types/wallet';
import { WalletService } from '../services/WalletService';

interface WalletStore {
  // State
  wallet: Wallet | null;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeWallet: () => Promise<void>;
  createWallet: () => Promise<{ seedPhrase: string }>;
  restoreWallet: (seedPhrase: string) => Promise<void>;
  deleteWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  sendTransaction: (to: string, amount: number, memo: string) => Promise<string>;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  // Initial state
  wallet: null,
  isInitialized: false,
  isLoading: false,
  error: null,

  // Initialize wallet on app start
  initializeWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const hasWallet = await WalletService.hasWallet();

      if (hasWallet) {
        const wallet = await WalletService.getWallet();
        set({ wallet, isInitialized: true, isLoading: false });
      } else {
        set({ isInitialized: true, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to initialize wallet',
        isLoading: false,
        isInitialized: true
      });
    }
  },

  // Create new wallet
  createWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      const { wallet, seedPhrase } = await WalletService.createWallet();
      set({ wallet, isLoading: false });
      return { seedPhrase };
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create wallet',
        isLoading: false
      });
      throw error;
    }
  },

  // Restore wallet from seed
  restoreWallet: async (seedPhrase: string) => {
    set({ isLoading: true, error: null });

    try {
      const wallet = await WalletService.restoreWallet(seedPhrase);
      set({ wallet, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to restore wallet',
        isLoading: false
      });
      throw error;
    }
  },

  // Delete wallet
  deleteWallet: async () => {
    set({ isLoading: true, error: null });

    try {
      await WalletService.deleteWallet();
      set({ wallet: null, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete wallet',
        isLoading: false
      });
      throw error;
    }
  },

  // Refresh balance
  refreshBalance: async () => {
    const { wallet } = get();
    if (!wallet) return;

    try {
      const balance = await WalletService.getBalance();
      set({ wallet: { ...wallet, balance, lastSynced: Date.now() } });
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  },

  // Send transaction
  sendTransaction: async (to: string, amount: number, memo: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('No wallet available');

    set({ isLoading: true, error: null });

    try {
      const txid = await WalletService.sendTransaction(to, amount, memo);

      // Update balance (mock: subtract amount + fee)
      const newBalance = wallet.balance - amount - 0.00001; // Mock fee
      set({
        wallet: { ...wallet, balance: newBalance },
        isLoading: false
      });

      return txid;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to send transaction',
        isLoading: false
      });
      throw error;
    }
  },
}));
