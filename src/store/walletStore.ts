import { create } from 'zustand';
import { Wallet } from '../types/wallet';
import { WalletService } from '../services/WalletService';
import { ZcashService } from '../services/ZcashService';

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
    console.log('[WalletStore] Initializing wallet...');
    set({ isLoading: true, error: null });

    // Enregistrer le callback de balance UNE SEULE FOIS au démarrage
    console.log('[WalletStore] 🎯 Registering global balance change callback...');
    ZcashService.onBalanceChange((balanceEvent) => {
      console.log('[WalletStore] 💰 Balance event received:', balanceEvent);

      // Convertir le format du SDK en format wallet
      const balance = {
        saplingAvailable: parseInt(balanceEvent.saplingAvailableZatoshi || '0'),
        saplingTotal: parseInt(balanceEvent.saplingTotalZatoshi || '0'),
        orchardAvailable: parseInt(balanceEvent.orchardAvailableZatoshi || '0'),
        orchardTotal: parseInt(balanceEvent.orchardTotalZatoshi || '0'),
        transparentAvailable: parseInt(balanceEvent.transparentAvailableZatoshi || '0'),
        transparentTotal: parseInt(balanceEvent.transparentTotalZatoshi || '0'),
      };

      const currentWallet = get().wallet;
      if (currentWallet) {
        console.log('[WalletStore] ✅ Updating wallet balance in store...');
        set({
          wallet: {
            ...currentWallet,
            balance,
            lastSynced: Date.now()
          }
        });
      }
    });

    try {
      console.log('[WalletStore] Checking if wallet exists...');
      const hasWallet = await WalletService.hasWallet();
      console.log('[WalletStore] Has wallet:', hasWallet);

      if (hasWallet) {
        console.log('[WalletStore] Loading wallet...');
        const wallet = await WalletService.getWallet();
        console.log('[WalletStore] Wallet loaded:', wallet ? 'Success' : 'Failed');
        set({ wallet, isInitialized: true, isLoading: false });
      } else {
        console.log('[WalletStore] No wallet found, showing onboarding');
        set({ isInitialized: true, isLoading: false });
      }
    } catch (error) {
      console.error('[WalletStore] Error initializing wallet:', error);
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
      // Le callback est déjà enregistré globalement dans initializeWallet
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

      // S'abonner aux changements de balance
      ZcashService.onBalanceChange((balanceEvent) => {
        const balance = {
          saplingAvailable: parseInt(balanceEvent.saplingAvailableZatoshi || '0'),
          saplingTotal: parseInt(balanceEvent.saplingTotalZatoshi || '0'),
          orchardAvailable: parseInt(balanceEvent.orchardAvailableZatoshi || '0'),
          orchardTotal: parseInt(balanceEvent.orchardTotalZatoshi || '0'),
          transparentAvailable: parseInt(balanceEvent.transparentAvailableZatoshi || '0'),
          transparentTotal: parseInt(balanceEvent.transparentTotalZatoshi || '0'),
        };

        const currentWallet = get().wallet;
        if (currentWallet) {
          set({ wallet: { ...currentWallet, balance, lastSynced: Date.now() } });
        }
      });
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
      // Se désabonner des événements de balance
      ZcashService.offBalanceChange();

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
  // Note: The balance is automatically updated by the Zcash SDK synchronizer via onBalanceChanged
  // This function mainly serves as a user-triggered action to indicate a sync is happening
  refreshBalance: async () => {
    const { wallet } = get();
    if (!wallet) {
      console.log('[WalletStore] No wallet to refresh');
      return;
    }

    console.log('[WalletStore] 🔄 Triggering refresh...');
    set({ isLoading: true });

    try {
      await ZcashService.refreshBalance();
      // Balance will be updated automatically via WalletService.getWallet()
      // which is called by the Zcash SDK's onBalanceChanged event
      console.log('[WalletStore] ✅ Refresh triggered, waiting for sync...');

      // Simulate a delay to give user feedback
      setTimeout(() => {
        set({ isLoading: false });
      }, 1000);
    } catch (error) {
      console.error('[WalletStore] ❌ Failed to refresh balance:', error);
      set({ isLoading: false });
    }
  },

  // Send transaction
  sendTransaction: async (to: string, amount: number, memo: string) => {
    const { wallet } = get();
    if (!wallet) throw new Error('No wallet available');

    set({ isLoading: true, error: null });

    try {
      const txid = await WalletService.sendTransaction(to, amount, memo);

      // Balance will be updated automatically by the Zcash SDK synchronizer
      // No need to manually update it here
      set({ isLoading: false });

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
