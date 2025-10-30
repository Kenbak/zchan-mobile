import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Channel } from '../../config/channels';
import { useWalletStore } from '../../store/walletStore';
import { ZcashService } from '../../services/ZcashService';

interface ChannelScreenProps {
  channel: Channel;
  onBack: () => void;
}

export const ChannelScreen: React.FC<ChannelScreenProps> = ({ channel, onBack }) => {
  const wallet = useWalletStore((state) => state.wallet);
  const [message, setMessage] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePostMessage = async () => {
    if (!wallet) {
      Alert.alert('Error', 'No wallet found');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty');
      return;
    }

    if (message.length > 500) {
      Alert.alert('Error', 'Message too long (max 500 characters)');
      return;
    }

    setIsPosting(true);

    try {
      console.log('[ChannelScreen] Posting message to channel:', channel.id);
      console.log('[ChannelScreen] To address:', channel.address);
      console.log('[ChannelScreen] Message:', message);

      // Get seed phrase from secure storage
      const { WalletService } = await import('../../services/WalletService');
      const seedPhrase = await WalletService.getSeedPhrase();

      if (!seedPhrase) {
        throw new Error('Seed phrase not found');
      }

      // Get synchronizer
      const synchronizer = ZcashService.getCurrentSynchronizer();
      if (!synchronizer) {
        throw new Error('Synchronizer not initialized');
      }

      // Amount: Small fee (0.00001 ZEC = 1000 zatoshi minimum for memo)
      const amount = 0.00001;

      // Send transaction with memo
      const txId = await ZcashService.sendShieldedTransaction(
        synchronizer,
        seedPhrase,
        channel.address,
        amount,
        message
      );

      console.log('[ChannelScreen] Message posted! TxId:', txId);

      Alert.alert(
        'Message Posted! 🎉',
        `Your message has been posted to ${channel.name}\n\nTransaction ID:\n${txId.substring(0, 20)}...`,
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[ChannelScreen] Error posting message:', error);
      Alert.alert('Error', `Failed to post message: ${error}`);
    } finally {
      setIsPosting(false);
    }
  };

  const getBalanceInZec = () => {
    if (!wallet) return 0;
    if (typeof wallet.balance === 'number') {
      return wallet.balance;
    } else {
      const totalZatoshi =
        wallet.balance.saplingAvailable +
        wallet.balance.orchardAvailable +
        wallet.balance.transparentAvailable;
      return totalZatoshi / 100_000_000;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{channel.name}</Text>
        <Text style={styles.balance}>{getBalanceInZec().toFixed(4)} ZEC</Text>
      </View>

      {/* Messages (placeholder for now) */}
      <ScrollView style={styles.messagesContainer}>
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>
            [System] Welcome to {channel.name}
          </Text>
          <Text style={styles.messageDescription}>{channel.description}</Text>
          <Text style={styles.messageMeta}>
            Post a message by sending a transaction to this channel.
          </Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>📍 Channel Address:</Text>
          <Text style={styles.addressText}>
            {channel.address.substring(0, 30)}...
          </Text>
          <Text style={styles.infoText}>
            ℹ️ Messages are stored as memos in Zcash shielded transactions
          </Text>
        </View>
      </ScrollView>

      {/* Post message form */}
      <View style={styles.postContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
          editable={!isPosting}
        />
        <View style={styles.postFooter}>
          <Text style={styles.charCount}>{message.length}/500</Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              (!message.trim() || isPosting) && styles.postButtonDisabled,
            ]}
            onPress={handlePostMessage}
            disabled={!message.trim() || isPosting}
          >
            {isPosting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post Message</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
    backgroundColor: '#0a0a0a',
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 16,
  },
  title: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  balance: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 14,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageBox: {
    borderWidth: 1,
    borderColor: '#00ff00',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  messageText: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 14,
    marginBottom: 8,
  },
  messageDescription: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 12,
    marginBottom: 8,
  },
  messageMeta: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 10,
    opacity: 0.7,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: '#00ff00',
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#0a0a0a',
  },
  infoText: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 12,
    marginBottom: 4,
  },
  addressText: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 10,
    marginBottom: 8,
    opacity: 0.8,
  },
  postContainer: {
    borderTopWidth: 1,
    borderTopColor: '#00ff00',
    padding: 16,
    backgroundColor: '#0a0a0a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#00ff00',
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 14,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    color: '#00ff00',
    fontFamily: 'Courier New',
    fontSize: 12,
  },
  postButton: {
    backgroundColor: '#00ff00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  postButtonText: {
    color: '#000',
    fontFamily: 'Courier New',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

