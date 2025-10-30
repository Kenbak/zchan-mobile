import React, { useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { TerminalText } from '../../components/Terminal/TerminalText';
import { TerminalBox } from '../../components/Terminal/TerminalBox';
import { COLORS } from '../../constants/colors';
import { CHANNELS } from '../../constants/channels';
import { useWalletStore } from '../../store/walletStore';

interface HomeScreenProps {
  onChannelPress: (channelId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onChannelPress }) => {
  const wallet = useWalletStore((state) => state.wallet);
  const refreshBalance = useWalletStore((state) => state.refreshBalance);
  const deleteWallet = useWalletStore((state) => state.deleteWallet);

  useEffect(() => {
    // Initial balance fetch
    if (wallet) {
      refreshBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleCopyAddress = async () => {
    if (wallet?.addresses[0]) {
      await Clipboard.setStringAsync(wallet.addresses[0]);
      Alert.alert('Copied!', 'Address copied to clipboard');
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Wallet?',
      'This will remove your wallet. Make sure you have your seed phrase backed up!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            await deleteWallet();
          },
        },
      ]
    );
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 12)}...${address.substring(address.length - 8)}`;
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <TerminalText style={styles.logo}>
          {`
╔═══════════════════════════════════╗
║  ▒███████▒ ▄████▄   ██░ ██  ▄▄▄  ║
║  ▒ ▒ ▒ ▄▀░▒██▀ ▀█  ▓██░ ██▒▒████▄║
║  ░ ▒ ▄▀▒░ ▒▓█    ▄ ▒██▀▀██░▒██  █║
║    ▄▀▒   ░▒▓▓▄ ▄██▒░▓█ ░██ ░██▄▄ ║
║  ▒███████▒▒ ▓███▀ ░░▓█▒░██▓ ▓█  ▓║
╚═══════════════════════════════════╝

   ANONYMOUS • IMMUTABLE • UNCENSORABLE
          `}
        </TerminalText>

        {/* Wallet Info */}
        {wallet && (
          <TerminalBox>
            <TerminalText style={styles.sectionTitle}>
              &gt; YOUR WALLET
            </TerminalText>

            <View style={styles.balanceContainer}>
              <TerminalText style={styles.balanceLabel}>Balance:</TerminalText>
              <TerminalText style={styles.balanceAmount}>
                {wallet.balance.toFixed(4)} ZEC
              </TerminalText>
            </View>

            <TouchableOpacity
              onPress={handleCopyAddress}
              activeOpacity={0.7}
              style={styles.addressContainer}
            >
              <TerminalText style={styles.addressLabel}>
                Address:
              </TerminalText>
              <TerminalText style={styles.address}>
                {formatAddress(wallet.addresses[0])}
              </TerminalText>
              <TerminalText style={styles.copyHint}>
                {' '}
                [TAP TO COPY]
              </TerminalText>
            </TouchableOpacity>

            {wallet.balance === 0 && (
              <TerminalText style={styles.fundWarning}>
                {'\n'}
                ⚠️ You need ZEC to post messages.{'\n'}
                Send testnet ZEC to your address above.
              </TerminalText>
            )}

            <TouchableOpacity
              onPress={handleDisconnect}
              activeOpacity={0.7}
              style={styles.disconnectButton}
            >
              <TerminalText style={styles.disconnectText}>
                &gt; DISCONNECT WALLET
              </TerminalText>
            </TouchableOpacity>
          </TerminalBox>
        )}

        {/* Boards/Channels */}
        <TerminalBox>
          <TerminalText style={styles.sectionTitle}>
            &gt; SELECT A BOARD:
          </TerminalText>

          <View style={styles.channelList}>
            {CHANNELS.map((channel) => (
              <TouchableOpacity
                key={channel.id}
                style={styles.channelItem}
                onPress={() => onChannelPress(channel.id)}
                activeOpacity={0.7}
              >
                <View style={styles.channelHeader}>
                  <TerminalText style={styles.channelIcon}>
                    {channel.icon}
                  </TerminalText>
                  <TerminalText style={styles.channelName}>
                    {channel.name}
                  </TerminalText>
                </View>
                <TerminalText style={styles.channelDescription}>
                  {channel.description}
                </TerminalText>
                <TerminalText style={styles.channelCost}>
                  Cost: {channel.cost} ZEC per post
                </TerminalText>
              </TouchableOpacity>
            ))}
          </View>
        </TerminalBox>

        {/* How it Works */}
        <TerminalBox>
          <TerminalText style={styles.sectionTitle}>
            &gt; HOW IT WORKS
          </TerminalText>
          <TerminalText style={styles.howItWorks}>
            1. Write a message (max 512 bytes){'\n'}
            2. Send ZEC to a board&apos;s address{'\n'}
            3. Message stored in transaction memo{'\n'}
            4. Confirmed on blockchain (~75 seconds){'\n'}
            5. Visible to everyone, forever{'\n'}
            {'\n'}
            → Privacy via Zcash shielded transactions
          </TerminalText>
        </TerminalBox>

        {/* Footer */}
        <TerminalText style={styles.footer}>
          Powered by Zcash • Zypherpunk Hackathon 2025{'\n'}
          {'\n'}
          [Tap a board to view messages]
        </TerminalText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
  },
  logo: {
    textAlign: 'center',
    fontSize: 10,
    marginBottom: 20,
    lineHeight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    opacity: 0.6,
    marginRight: 8,
  },
  balanceAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  addressLabel: {
    opacity: 0.6,
    marginRight: 8,
  },
  address: {
    fontWeight: 'bold',
  },
  copyHint: {
    opacity: 0.4,
    fontSize: 12,
  },
  fundWarning: {
    color: COLORS.warning,
    fontSize: 14,
    lineHeight: 20,
  },
  disconnectButton: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.textDim,
    alignItems: 'center',
  },
  disconnectText: {
    fontSize: 14,
    opacity: 0.6,
  },
  channelList: {
    marginTop: 8,
  },
  channelItem: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    marginBottom: 12,
  },
  channelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  channelIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  channelName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  channelDescription: {
    opacity: 0.7,
    fontSize: 14,
    marginBottom: 4,
  },
  channelCost: {
    opacity: 0.5,
    fontSize: 12,
  },
  howItWorks: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  footer: {
    textAlign: 'center',
    opacity: 0.4,
    fontSize: 12,
    marginTop: 20,
    marginBottom: 40,
  },
});
