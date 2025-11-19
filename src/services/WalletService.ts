import * as SecureStore from 'expo-secure-store';
import * as bip39 from 'bip39';
import { Wallet } from '../types/wallet';
import { ZcashService } from './ZcashService';
import { Synchronizer } from 'react-native-zcash';

const WALLET_KEY = 'zchan_wallet_seed';
const WALLET_ID_KEY = 'zchan_wallet_id';
const WALLET_ALIAS_KEY = 'zchan_wallet_alias';
const WALLET_BIRTHDAY_KEY = 'zchan_wallet_birthday';

export class WalletService {
  /**
   * Generate a new BIP-39 24-word seed phrase
   */
  static generateSeedPhrase(): string {
    try {
      console.log('[WalletService] Generating seed phrase...');
      const mnemonic = bip39.generateMnemonic(256); // 24 words
      console.log('[WalletService] Seed phrase generated successfully');
      return mnemonic;
    } catch (error) {
      console.error('[WalletService] Error generating seed phrase:', error);
      throw error;
    }
  }

  /**
   * Validate a seed phrase
   */
  static validateSeedPhrase(seedPhrase: string): boolean {
    return bip39.validateMnemonic(seedPhrase);
  }

  /**
   * Create a new wallet with a generated seed phrase
   */
  static async createWallet(): Promise<{ wallet: Wallet; seedPhrase: string }> {
    try {
      console.log('[WalletService] Creating new wallet...');
      const seedPhrase = this.generateSeedPhrase();
      console.log('[WalletService] Creating wallet from seed...');
      const wallet = await this.createWalletFromSeed(seedPhrase);
      console.log('[WalletService] Wallet created successfully');

      return { wallet, seedPhrase };
    } catch (error) {
      console.error('[WalletService] Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Restore wallet from existing seed phrase
   */
  static async restoreWallet(seedPhrase: string): Promise<Wallet> {
    if (!this.validateSeedPhrase(seedPhrase)) {
      throw new Error('Invalid seed phrase');
    }

    return await this.createWalletFromSeed(seedPhrase);
  }

  /**
   * Create wallet from seed phrase (internal)
   */
  private static async createWalletFromSeed(seedPhrase: string): Promise<Wallet> {
    try {
      console.log('[WalletService] Creating wallet from seed using ZcashService...');

      // Store seed phrase securely FIRST
      console.log('[WalletService] Storing seed phrase in SecureStore...');
      try {
        await SecureStore.setItemAsync(WALLET_KEY, seedPhrase);
        console.log('[WalletService] Seed phrase stored successfully');
      } catch (storeError) {
        console.error('[WalletService] SecureStore error (seed):', storeError);
        throw new Error('Failed to store seed phrase securely');
      }

      // Create Zcash wallet using native SDK (new wallet)
      console.log('[WalletService] Creating Zcash wallet with native SDK...');
      const { wallet: zcashWallet, synchronizer, alias, birthdayHeight } = await ZcashService.createWallet(
        seedPhrase,
        true // newWallet = true for first time creation
      );

      console.log('[WalletService] Zcash wallet created successfully');
      console.log('- Wallet ID:', zcashWallet.id);
      console.log('- Alias:', alias);
      console.log('- Birthday height:', birthdayHeight);
      console.log('- Unified address:', zcashWallet.addresses.unifiedAddress.substring(0, 30) + '...');
      console.log('- Sapling address:', zcashWallet.addresses.saplingAddress.substring(0, 30) + '...');

      // Store wallet ID, alias, and birthday height
      console.log('[WalletService] Storing wallet metadata...');
      try {
        await SecureStore.setItemAsync(WALLET_ID_KEY, zcashWallet.id);
        await SecureStore.setItemAsync(WALLET_ALIAS_KEY, alias);
        await SecureStore.setItemAsync(WALLET_BIRTHDAY_KEY, birthdayHeight.toString());
        console.log('[WalletService] Wallet metadata stored successfully');
      } catch (storeError) {
        console.error('[WalletService] SecureStore error:', storeError);
        throw new Error('Failed to store wallet metadata');
      }

      // Start synchronization in background
      console.log('[WalletService] Starting blockchain sync...');
      ZcashService.startSync(synchronizer).catch((err) => {
        console.error('[WalletService] Sync error:', err);
      });

      const wallet: Wallet = {
        id: zcashWallet.id,
        addresses: zcashWallet.addresses,
        balance: zcashWallet.balance,
        createdAt: zcashWallet.createdAt,
        lastSynced: zcashWallet.lastSynced,
      };

      console.log('[WalletService] Wallet object created successfully');
      return wallet;
    } catch (error) {
      console.error('[WalletService] Error in createWalletFromSeed:', error);
      throw error;
    }
  }

  /**
   * Get stored wallet
   */
  static async getWallet(): Promise<Wallet | null> {
    try {
      console.log('[WalletService] Getting wallet from SecureStore...');

      const walletId = await SecureStore.getItemAsync(WALLET_ID_KEY);
      console.log('[WalletService] Retrieved wallet ID:', walletId ? 'Found' : 'Not found');

      if (!walletId) {
        console.log('[WalletService] No wallet ID found');
        return null;
      }

      console.log('[WalletService] Getting seed phrase...');
      const seedPhrase = await SecureStore.getItemAsync(WALLET_KEY);
      console.log('[WalletService] Retrieved seed phrase:', seedPhrase ? 'Found' : 'Not found');

      if (!seedPhrase) {
        console.log('[WalletService] No seed phrase found');
        return null;
      }

      console.log('[WalletService] Getting stored alias and birthday height...');
      const storedAlias = await SecureStore.getItemAsync(WALLET_ALIAS_KEY);
      const storedBirthday = await SecureStore.getItemAsync(WALLET_BIRTHDAY_KEY);
      
      console.log('[WalletService] Re-initializing Zcash wallet with existing seed...');
      console.log('- Stored alias:', storedAlias || 'Not found (will use default)');
      console.log('- Stored birthday:', storedBirthday || 'Not found (will fetch new)');
      
      // Re-create the wallet using ZcashService with the stored seed
      // Use newWallet: false to reuse existing sync data
      const { wallet: zcashWallet, synchronizer } = await ZcashService.createWallet(
        seedPhrase,
        false, // newWallet = false to resume sync
        storedAlias || undefined,
        storedBirthday ? parseInt(storedBirthday) : undefined
      );

      console.log('[WalletService] Zcash wallet re-initialized successfully');
      console.log('- Unified address:', zcashWallet.addresses.unifiedAddress.substring(0, 30) + '...');
      console.log('- Will resume sync from last position');

      // Start synchronization in background
      console.log('[WalletService] Starting blockchain sync...');
      ZcashService.startSync(synchronizer).catch((err) => {
        console.error('[WalletService] Sync error:', err);
      });

      const wallet: Wallet = {
        id: zcashWallet.id,
        addresses: zcashWallet.addresses,
        balance: zcashWallet.balance,
        createdAt: zcashWallet.createdAt,
        lastSynced: zcashWallet.lastSynced,
      };

      console.log('[WalletService] Wallet object created successfully');
      console.log('[WalletService] 💰 BALANCE DETAILS (from getWallet):');
      console.log('- Raw balance:', JSON.stringify(zcashWallet.balance, null, 2));
      if (typeof zcashWallet.balance === 'object') {
        const totalZatoshi =
          zcashWallet.balance.saplingAvailable +
          zcashWallet.balance.orchardAvailable +
          zcashWallet.balance.transparentAvailable;
        console.log('- Total zatoshi:', totalZatoshi);
        console.log('- Total ZEC:', (totalZatoshi / 100_000_000).toFixed(8));
      } else {
        console.log('- Balance is a number:', zcashWallet.balance);
      }
      return wallet;
    } catch (error) {
      console.error('[WalletService] Failed to get wallet:', error);
      return null;
    }
  }

  /**
   * Get seed phrase (requires authentication)
   */
  static async getSeedPhrase(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(WALLET_KEY);
    } catch (error) {
      console.error('Failed to get seed phrase:', error);
      return null;
    }
  }

  /**
   * Export Unified Full Viewing Key (UFVK)
   * Allows viewing all transactions without spending ability
   */
  static async exportViewingKey(): Promise<string> {
    try {
      console.log('[WalletService] Exporting viewing key...');

      // Récupérer la seed phrase depuis SecureStore
      const seedPhrase = await SecureStore.getItemAsync(WALLET_KEY);
      if (!seedPhrase) {
        throw new Error('No wallet found');
      }

      // Dériver la viewing key
      const ufvk = await ZcashService.deriveViewingKey(seedPhrase, 'testnet');

      console.log('[WalletService] ✅ Viewing key exported successfully');
      return ufvk;
    } catch (error) {
      console.error('[WalletService] Error exporting viewing key:', error);
      throw error;
    }
  }

  /**
   * Delete wallet (DANGER!)
   */
  static async deleteWallet(): Promise<void> {
    await SecureStore.deleteItemAsync(WALLET_KEY);
    await SecureStore.deleteItemAsync(WALLET_ID_KEY);
    await SecureStore.deleteItemAsync(WALLET_ALIAS_KEY);
    await SecureStore.deleteItemAsync(WALLET_BIRTHDAY_KEY);
  }

  /**
   * Check if wallet exists
   */
  static async hasWallet(): Promise<boolean> {
    try {
      console.log('[WalletService] Checking if wallet exists...');
      const walletId = await SecureStore.getItemAsync(WALLET_ID_KEY);
      console.log('[WalletService] Wallet ID from store:', walletId ? 'Found' : 'Not found');
      return walletId !== null;
    } catch (error) {
      console.error('[WalletService] Error checking wallet existence:', error);
      return false;
    }
  }

  /**
   * Generate a mock Zcash testnet address (zs1...)
   * In Phase 2, this will be replaced with real address derivation
   */
  private static generateMockZcashAddress(): string {
    // Zcash testnet addresses start with "zs1" (sapling shielded)
    // Followed by 75 random characters (base58)
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = 'zs1';

    for (let i = 0; i < 75; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return address;
  }

  /**
   * Mock: Send transaction
   * In Phase 2, this will use Zcash SDK to create real transactions
   */
  static async sendTransaction(
    to: string,
    amount: number,
    memo: string
  ): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock transaction ID
    const txid = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    console.log('Mock transaction sent:', { to, amount, memo, txid });

    return txid;
  }

  /**
   * Mock: Get balance
   * In Phase 2, this will sync with blockchain
   */
  static async getBalance(): Promise<number> {
    // Return mock balance (in ZEC)
    return 0.001; // 0.001 ZEC for testing
  }
}
