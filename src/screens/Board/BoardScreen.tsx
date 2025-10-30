import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TerminalText } from '../../components/Terminal/TerminalText';
import { TerminalBox } from '../../components/Terminal/TerminalBox';
import { COLORS } from '../../constants/colors';
import { CHANNELS } from '../../constants/channels';
import { useWalletStore } from '../../store/walletStore';
import { Message } from '../../types/message';

interface BoardScreenProps {
  channelId: string;
  onBack: () => void;
}

// Mock messages for demo
const MOCK_MESSAGES: Record<string, Message[]> = {
  general: [
    {
      id: 'tx1',
      channelId: 'general',
      content:
        'First post on Zchan! This message is stored on the Zcash blockchain forever.',
      timestamp: Date.now() - 1000 * 60 * 10, // 10 min ago
      txid: 'abc123def456...',
    },
    {
      id: 'tx2',
      channelId: 'general',
      content:
        'Testing the immutability. Nobody can delete this. Nobody can censor this. This is true free speech.',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 min ago
      txid: 'def456ghi789...',
    },
  ],
  whistleblow: [
    {
      id: 'tx3',
      channelId: 'whistleblow',
      content:
        'Company X is dumping toxic waste in River Delta. I have proof. This is stored forever on-chain.',
      timestamp: Date.now() - 1000 * 60 * 120, // 2 hours ago
      txid: 'ghi789jkl012...',
    },
  ],
};

export const BoardScreen: React.FC<BoardScreenProps> = ({
  channelId,
  onBack,
}) => {
  const channel = CHANNELS.find((c) => c.id === channelId);
  const wallet = useWalletStore((state) => state.wallet);
  const sendTransaction = useWalletStore((state) => state.sendTransaction);
  const isLoading = useWalletStore((state) => state.isLoading);

  const [messages, setMessages] = useState<Message[]>(
    MOCK_MESSAGES[channelId] || []
  );
  const [messageText, setMessageText] = useState('');
  const [posting, setPosting] = useState(false);

  if (!channel) {
    return (
      <View style={styles.container}>
        <TerminalBox>
          <TerminalText>&gt; ERROR: Board not found</TerminalText>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <TerminalText>&lt; Back</TerminalText>
          </TouchableOpacity>
        </TerminalBox>
      </View>
    );
  }

  const handlePost = async () => {
    if (!wallet) {
      Alert.alert('Error', 'Wallet not found');
      return;
    }

    if (!messageText.trim()) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }

    if (wallet.balance < channel.cost) {
      Alert.alert(
        'Insufficient Balance',
        `You need at least ${channel.cost} ZEC to post. Your balance: ${wallet.balance.toFixed(4)} ZEC`
      );
      return;
    }

    const byteLength = new TextEncoder().encode(messageText).length;
    if (byteLength > 512) {
      Alert.alert('Error', `Message too long (${byteLength} bytes). Max: 512 bytes`);
      return;
    }

    setPosting(true);

    try {
      // Send transaction with memo
      const txid = await sendTransaction(
        channel.address,
        channel.cost,
        messageText
      );

      // Add message to list (mock)
      const newMessage: Message = {
        id: txid.substring(0, 8),
        channelId: channel.id,
        content: messageText,
        timestamp: Date.now(),
        txid,
      };

      setMessages([newMessage, ...messages]);
      setMessageText('');

      Alert.alert(
        'Message Sent! 🎉',
        `Your message will appear on the blockchain in ~75 seconds.\n\nTransaction ID: ${txid.substring(0, 16)}...`
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message'
      );
    } finally {
      setPosting(false);
    }
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <TerminalText style={styles.backLink}>&lt; back</TerminalText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Board Title */}
        <View style={styles.titleContainer}>
          <TerminalText style={styles.icon}>{channel.icon}</TerminalText>
          <TerminalText style={styles.title}>{channel.name}</TerminalText>
        </View>
        <TerminalText style={styles.description}>
          {channel.description}
        </TerminalText>

        {/* Post Form */}
        <TerminalBox>
          <TerminalText style={styles.formTitle}>
            &gt; POST MESSAGE:
          </TerminalText>

          <TextInput
            style={styles.input}
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Your anonymous message..."
            placeholderTextColor={COLORS.textDim}
            multiline
            numberOfLines={5}
            maxLength={512}
            editable={!posting && !isLoading}
          />

          <View style={styles.formFooter}>
            <TerminalText style={styles.charCount}>
              {new TextEncoder().encode(messageText).length}/512 bytes • {channel.cost} ZEC
            </TerminalText>
            <TouchableOpacity
              style={[
                styles.postButton,
                (posting || isLoading || !messageText.trim()) &&
                  styles.postButtonDisabled,
              ]}
              onPress={handlePost}
              disabled={posting || isLoading || !messageText.trim()}
              activeOpacity={0.7}
            >
              <TerminalText style={styles.postButtonText}>
                {posting ? 'POSTING...' : 'POST'}
              </TerminalText>
            </TouchableOpacity>
          </View>

          <TerminalText style={styles.warning}>
            ⚠️ Permanent & public
          </TerminalText>
        </TerminalBox>

        {/* Messages */}
        <TerminalText style={styles.messagesTitle}>
          &gt; MESSAGES ({messages.length})
        </TerminalText>

        {messages.length === 0 ? (
          <TerminalBox>
            <TerminalText style={styles.noMessages}>
              &gt; No messages yet. Be the first!
            </TerminalText>
          </TerminalBox>
        ) : (
          messages.map((msg) => (
            <TerminalBox key={msg.id} style={styles.message}>
              <View style={styles.messageHeader}>
                <TerminalText style={styles.messageAuthor}>
                  Anonymous
                </TerminalText>
                <TerminalText style={styles.messageTime}>
                  {timeAgo(msg.timestamp)}
                </TerminalText>
              </View>
              <TerminalText style={styles.messageContent}>
                {msg.content}
              </TerminalText>
              <TerminalText style={styles.messageTxid}>
                &gt; TX: {msg.txid.substring(0, 16)}...
              </TerminalText>
            </TerminalBox>
          ))
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backLink: {
    fontSize: 16,
    opacity: 0.7,
  },
  backButton: {
    marginTop: 12,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 2,
    borderColor: COLORS.border,
    color: COLORS.text,
    fontFamily: 'VT323_400Regular',
    fontSize: 16,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  formFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    opacity: 0.6,
  },
  postButton: {
    borderWidth: 2,
    borderColor: COLORS.border,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  postButtonDisabled: {
    opacity: 0.4,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  warning: {
    fontSize: 12,
    opacity: 0.4,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  noMessages: {
    opacity: 0.6,
  },
  message: {
    marginBottom: 16,
    backgroundColor: 'rgba(0, 20, 0, 0.3)',
    borderLeftWidth: 3,
    borderLeftColor: COLORS.border,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    opacity: 0.7,
  },
  messageAuthor: {
    fontSize: 14,
  },
  messageTime: {
    fontSize: 12,
  },
  messageContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  messageTxid: {
    fontSize: 12,
    opacity: 0.4,
  },
});
