import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import { TerminalText } from '../../components/Terminal/TerminalText';
import { TerminalBox } from '../../components/Terminal/TerminalBox';
import { COLORS } from '../../constants/colors';
import { useWalletStore } from '../../store/walletStore';

export const CreateWalletScreen: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [step, setStep] = useState<'welcome' | 'generating' | 'show-seed' | 'confirm'>(
    'welcome'
  );
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [hasWrittenDown, setHasWrittenDown] = useState(false);
  const [hasUnderstood, setHasUnderstood] = useState(false);

  const createWallet = useWalletStore((state) => state.createWallet);

  const handleCreateWallet = async () => {
    setStep('generating');

    try {
      console.log('[CreateWallet] Starting wallet creation...');

      // Simulate generation delay for UX
      await new Promise((resolve) => setTimeout(resolve, 1500));

      console.log('[CreateWallet] Calling createWallet...');
      const { seedPhrase: generatedSeed } = await createWallet();

      console.log('[CreateWallet] Wallet created successfully');
      setSeedPhrase(generatedSeed);
      setStep('show-seed');
    } catch (error) {
      console.error('[CreateWallet] Error creating wallet:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      Alert.alert(
        'Error',
        `Failed to create wallet: ${errorMessage}\n\nPlease try again.`
      );
      setStep('welcome');
    }
  };

  const handleCopySeed = () => {
    Clipboard.setString(seedPhrase);
    Alert.alert('Copied!', 'Seed phrase copied to clipboard');
  };

  const handleContinue = () => {
    if (!hasWrittenDown || !hasUnderstood) {
      Alert.alert(
        'Warning',
        'Please confirm that you have written down your seed phrase and understand the risks.'
      );
      return;
    }

    onComplete();
  };

  if (step === 'welcome') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TerminalText style={styles.logo}>
            {`
╔═══════════════╗
║   ▒███████▒   ║
║   ▒ ▒ ▒ ▄▀░   ║
║   ░ ▒ ▄▀▒░    ║
║     ▄▀▒   ░   ║
║   ▒███████▒   ║
╚═══════════════╝
            `}
          </TerminalText>

          <TerminalText style={styles.title}>
            WELCOME TO ZCHAN
          </TerminalText>

          <TerminalBox>
            <TerminalText style={styles.description}>
              &gt; CREATE YOUR WALLET{'\n'}
              {'\n'}
              You need a Zcash wallet to post and read messages on Zchan.
              {'\n'}
              {'\n'}
              This wallet will:{'\n'}
              • Generate a secure seed phrase{'\n'}
              • Store it encrypted on your device{'\n'}
              • Never be sent to any server{'\n'}
              {'\n'}
              You control your keys 🔐
            </TerminalText>
          </TerminalBox>

          <TerminalBox>
            <TerminalText style={styles.warning}>
              ⚠️ IMPORTANT{'\n'}
              {'\n'}
              Write down your 24-word seed phrase on paper. If you lose it, you
              lose access to your wallet FOREVER.{'\n'}
              {'\n'}
              No one can recover it. Not us. Not anyone.
            </TerminalText>
          </TerminalBox>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateWallet}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.buttonText}>
              &gt; CREATE WALLET
            </TerminalText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (step === 'generating') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <TerminalText style={styles.generating}>
            &gt; GENERATING SECURE SEED PHRASE...{'\n'}
            {'\n'}
            Using cryptographically secure random{'\n'}
            BIP-39 24-word mnemonic{'\n'}
            {'\n'}
            Please wait...
          </TerminalText>
        </View>
      </View>
    );
  }

  if (step === 'show-seed') {
    const words = seedPhrase.split(' ');

    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TerminalText style={styles.title}>
            YOUR SEED PHRASE
          </TerminalText>

          <TerminalBox style={styles.warningBox}>
            <TerminalText style={styles.criticalWarning}>
              🚨 CRITICAL: WRITE THIS DOWN NOW{'\n'}
              {'\n'}
              This is your ONLY chance to see these words.{'\n'}
              {'\n'}
              Without this, you cannot recover your wallet.
            </TerminalText>
          </TerminalBox>

          <TerminalBox>
            <View style={styles.seedGrid}>
              {words.map((word, index) => (
                <View key={index} style={styles.seedWord}>
                  <TerminalText style={styles.seedNumber}>
                    {index + 1}.
                  </TerminalText>
                  <TerminalText style={styles.seedText}>{word}</TerminalText>
                </View>
              ))}
            </View>
          </TerminalBox>

          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopySeed}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.copyButtonText}>
              📋 COPY TO CLIPBOARD
            </TerminalText>
          </TouchableOpacity>

          <TerminalBox>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setHasWrittenDown(!hasWrittenDown)}
              activeOpacity={0.7}
            >
              <TerminalText>
                [{hasWrittenDown ? 'X' : ' '}] I have written down my 24-word
                seed phrase on paper
              </TerminalText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setHasUnderstood(!hasUnderstood)}
              activeOpacity={0.7}
            >
              <TerminalText>
                [{hasUnderstood ? 'X' : ' '}] I understand I cannot recover my
                wallet without it
              </TerminalText>
            </TouchableOpacity>
          </TerminalBox>

          <TouchableOpacity
            style={[
              styles.button,
              (!hasWrittenDown || !hasUnderstood) && styles.buttonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!hasWrittenDown || !hasUnderstood}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.buttonText}>
              &gt; CONTINUE
            </TerminalText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  content: {
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 16,
    lineHeight: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  warning: {
    color: COLORS.warning,
    fontSize: 14,
    lineHeight: 22,
  },
  button: {
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  generating: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 255, 0, 0.1)',
    borderColor: COLORS.warning,
  },
  criticalWarning: {
    color: COLORS.warning,
    fontSize: 14,
    lineHeight: 22,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  seedWord: {
    width: '48%',
    flexDirection: 'row',
    marginBottom: 12,
  },
  seedNumber: {
    opacity: 0.5,
    marginRight: 8,
    minWidth: 30,
  },
  seedText: {
    fontWeight: 'bold',
    flex: 1,
  },
  copyButton: {
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  copyButtonText: {
    fontSize: 14,
    opacity: 0.7,
  },
  checkbox: {
    marginVertical: 8,
    padding: 8,
  },
});
