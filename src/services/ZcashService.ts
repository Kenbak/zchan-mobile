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

      // Convertir la seed phrase en bytes
      const seedBytes = bip39.mnemonicToSeedSync(seedPhrase);
      const seedHex = seedBytes.toString('hex');
      
      console.log('[ZcashService] Getting birthday height...');
      
      // Obtenir le birthday height (hauteur de bloc actuelle)
      const birthdayHeight = await Tools.getBirthdayHeight(
        config.lightwalletdHost,
        config.lightwalletdPort
      );
      
      console.log('[ZcashService] Birthday height:', birthdayHeight);
      
      // Créer un alias unique pour ce wallet
      const alias = `zchan_${Date.now()}`;
      
      console.log('[ZcashService] Initializing synchronizer...');
      
      // Créer le synchronizer
      const synchronizer = await makeSynchronizer({
        networkName: config.network,
        defaultHost: config.lightwalletdHost,
        defaultPort: config.lightwalletdPort,
        mnemonicSeed: seedHex,
        alias,
        birthdayHeight,
        newWallet: true,
      });
      
      currentSynchronizer = synchronizer;
      
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
      
      // S'abonner aux événements
      synchronizer.subscribe({
        onBalanceChanged: (balance) => {
          console.log('[ZcashService] Balance changed:', balance);
        },
        onStatusChanged: (status) => {
          console.log('[ZcashService] Status changed:', status.name);
        },
        onTransactionsChanged: (transactions) => {
          console.log('[ZcashService] Transactions changed:', transactions.transactions.length);
        },
        onUpdate: (event) => {
          console.log('[ZcashService] Sync progress:', event.scanProgress);
        },
        onError: (error) => {
          console.error('[ZcashService] Sync error:', error);
        },
      });
      
      console.log('[ZcashService] Sync started successfully');
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
      
      // Convertir seed phrase en hex
      const seedBytes = bip39.mnemonicToSeedSync(seedPhrase);
      const seedHex = seedBytes.toString('hex');
      
      // Créer et broadcaster la transaction
      const result = await synchronizer.createTransfer({
        mnemonicSeed: seedHex,
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

