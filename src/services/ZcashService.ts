import * as bip39 from 'bip39';
import { makeSynchronizer, Synchronizer, Tools, Network, Addresses } from 'react-native-zcash';

export interface ZcashWallet {
  id: string;
  addresses: Addresses;
  balance: {
    saplingAvailable: number;
    saplingTotal: number;
    orchardAvailable: number;
    orchardTotal: number;
    transparentAvailable: number;
    transparentTotal: number;
  };
  createdAt: number;
  lastSynced: number;
}

interface ZcashConfig {
  network: Network;
  lightwalletdHost: string;
  lightwalletdPort: number;
}

// Configuration par défaut pour testnet
const DEFAULT_CONFIG: ZcashConfig = {
  network: 'testnet',
  lightwalletdHost: 'lightwalletd.testnet.electriccoin.co',
  lightwalletdPort: 9067,
};

let currentSynchronizer: Synchronizer | null = null;

export class ZcashService {
  /**
   * Crée un nouveau wallet Zcash avec une seed phrase BIP-39
   */
  static async createWallet(
    seedPhrase: string,
    config: ZcashConfig = DEFAULT_CONFIG
  ): Promise<{ wallet: ZcashWallet; synchronizer: Synchronizer }> {
    try {
      console.log('[ZcashService] Creating wallet...');

      // Valider la seed phrase
      if (!bip39.validateMnemonic(seedPhrase)) {
        throw new Error('Invalid seed phrase');
      }

      console.log('[ZcashService] Getting birthday height...');

      // Obtenir le birthday height avec retry et timeout augmenté
      const FALLBACK_BIRTHDAY_HEIGHT = 2800000; // October 2024 testnet checkpoint
      const MAX_RETRIES = 3;
      const RETRY_DELAY_MS = 2000;

      let birthdayHeight = FALLBACK_BIRTHDAY_HEIGHT;

      // Retry loop avec délai entre tentatives
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          console.log(`[ZcashService] Fetching birthday height (attempt ${attempt}/${MAX_RETRIES})...`);

          // Timeout wrapper: 30 secondes par tentative
          const fetchedHeight = await Promise.race([
            Tools.getBirthdayHeight(
              config.lightwalletdHost,
              config.lightwalletdPort
            ),
            new Promise<number>((_, reject) =>
              setTimeout(() => reject(new Error('Timeout after 30s')), 30000)
            )
          ]);

          birthdayHeight = fetchedHeight;
          console.log('[ZcashService] ✅ Birthday height from server:', birthdayHeight);
          break; // Success, exit retry loop
        } catch (error) {
          console.warn(`[ZcashService] Attempt ${attempt} failed:`, error);

          if (attempt < MAX_RETRIES) {
            console.log(`[ZcashService] Retrying in ${RETRY_DELAY_MS}ms...`);
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          } else {
            console.warn('[ZcashService] ❌ All attempts failed, using fallback:', FALLBACK_BIRTHDAY_HEIGHT);
            birthdayHeight = FALLBACK_BIRTHDAY_HEIGHT;
          }
        }
      }

      // Créer un alias unique pour ce wallet
      const alias = `zchan_${Date.now()}`;

      console.log('[ZcashService] Initializing synchronizer...');

      // Créer le synchronizer
      console.log('[ZcashService] makeSynchronizer config:', {
        networkName: config.network,
        defaultHost: config.lightwalletdHost,
        defaultPort: config.lightwalletdPort,
        alias,
        birthdayHeight,
        newWallet: true,
        seedPhraseLength: seedPhrase.split(' ').length,
      });

      const synchronizer = await makeSynchronizer({
        networkName: config.network,
        defaultHost: config.lightwalletdHost,
        defaultPort: config.lightwalletdPort,
        mnemonicSeed: seedPhrase, // Seed phrase in text format (24 words)
        alias,
        birthdayHeight,
        newWallet: true,
      });

      currentSynchronizer = synchronizer;

      console.log('[ZcashService] Synchronizer created:', typeof synchronizer);
      console.log('[ZcashService] Synchronizer methods:', Object.keys(synchronizer).join(', '));

      console.log('[ZcashService] Deriving unified address...');

      // Dériver les adresses
      const addresses = await synchronizer.deriveUnifiedAddress();

      console.log('[ZcashService] Addresses derived:');
      console.log('- Unified:', addresses.unifiedAddress.substring(0, 20) + '...');
      console.log('- Sapling:', addresses.saplingAddress.substring(0, 20) + '...');
      console.log('- Transparent:', addresses.transparentAddress.substring(0, 20) + '...');

      const wallet: ZcashWallet = {
        id: alias,
        addresses,
        balance: {
          saplingAvailable: 0,
          saplingTotal: 0,
          orchardAvailable: 0,
          orchardTotal: 0,
          transparentAvailable: 0,
          transparentTotal: 0,
        },
        createdAt: Date.now(),
        lastSynced: Date.now(),
      };

      console.log('[ZcashService] Wallet created successfully');

      return { wallet, synchronizer };
    } catch (error) {
      console.error('[ZcashService] Error creating wallet:', error);
      throw error;
    }
  }

  /**
   * Démarre la synchronisation du wallet avec la blockchain
   */
  static async startSync(synchronizer: Synchronizer): Promise<void> {
    try {
      console.log('[ZcashService] Starting sync...');

      console.log('[ZcashService] Subscribing to events...');

      // S'abonner aux événements
      synchronizer.subscribe({
        onBalanceChanged: (balance) => {
          console.log('[ZcashService] ✅ Balance changed:', balance);
        },
        onStatusChanged: (status) => {
          console.log('[ZcashService] 🔄 Status changed:', status.name, '- isConnected:', status.isConnected);
        },
        onTransactionsChanged: (transactions) => {
          console.log('[ZcashService] 💸 Transactions changed:', transactions.transactions.length);
        },
        onUpdate: (event) => {
          console.log('[ZcashService] 📊 Sync progress:', event.scanProgress, '- networkHeight:', event.networkBlockHeight);
        },
        onError: (error) => {
          console.error('[ZcashService] ❌ Sync error:', error);
        },
      });

      console.log('[ZcashService] Subscription registered');

      // Le synchronizer démarre automatiquement après makeSynchronizer
      // Pas besoin d'appeler .start()
      console.log('[ZcashService] Synchronizer should be running now...');
    } catch (error) {
      console.error('[ZcashService] Error starting sync:', error);
      throw error;
    }
  }

  /**
   * Envoie une transaction shielded avec memo
   */
  static async sendShieldedTransaction(
    synchronizer: Synchronizer,
    seedPhrase: string,
    toAddress: string,
    amountZec: number,
    memo: string
  ): Promise<string> {
    try {
      console.log('[ZcashService] Sending shielded transaction...');
      console.log('- To:', toAddress);
      console.log('- Amount:', amountZec, 'ZEC');
      console.log('- Memo:', memo.substring(0, 50) + '...');

      // Convertir ZEC en zatoshi (1 ZEC = 100,000,000 zatoshi)
      const zatoshi = Math.floor(amountZec * 100_000_000).toString();

      // Proposer la transaction
      const proposal = await synchronizer.proposeTransfer({
        zatoshi,
        toAddress,
        memo,
      });

      console.log('[ZcashService] Proposal created:', proposal.proposalBase64.substring(0, 20) + '...');
      console.log('- Tx count:', proposal.transactionCount);
      console.log('- Total fee:', proposal.totalFee);

      // Créer et broadcaster la transaction
      const result = await synchronizer.createTransfer({
        mnemonicSeed: seedPhrase, // Seed phrase in text format (24 words)
        proposalBase64: proposal.proposalBase64,
      });

      if (typeof result === 'string') {
        console.log('[ZcashService] Transaction sent successfully:', result);
        return result; // txId
      } else {
        throw new Error(result.errorMessage || 'Transaction failed');
      }
    } catch (error) {
      console.error('[ZcashService] Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * Arrête le synchronizer
   */
  static async stopSync(): Promise<void> {
    if (currentSynchronizer) {
      console.log('[ZcashService] Stopping sync...');
      currentSynchronizer.unsubscribe();
      await currentSynchronizer.stop();
      currentSynchronizer = null;
      console.log('[ZcashService] Sync stopped');
    }
  }

  /**
   * Obtenir le synchronizer actuel
   */
  static getCurrentSynchronizer(): Synchronizer | null {
    return currentSynchronizer;
  }

  /**
   * Valider une adresse Zcash
   */
  static async isValidAddress(address: string, network: Network = 'testnet'): Promise<boolean> {
    try {
      return await Tools.isValidAddress(address, network);
    } catch (error) {
      console.error('[ZcashService] Error validating address:', error);
      return false;
    }
  }
}
