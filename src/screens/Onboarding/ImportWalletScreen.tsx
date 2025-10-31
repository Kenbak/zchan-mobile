import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { TerminalText } from '../../components/Terminal/TerminalText';
import { TerminalBox } from '../../components/Terminal/TerminalBox';
import { COLORS } from '../../constants/colors';
import { WalletService } from '../../services/WalletService';
import * as bip39 from 'bip39';

interface ImportWalletScreenProps {
  onComplete: () => void;
  onBack: () => void;
}

export const ImportWalletScreen: React.FC<ImportWalletScreenProps> = ({
  onComplete,
  onBack,
}) => {
  const [words, setWords] = useState<string[]>(Array(24).fill(''));
  const [isImporting, setIsImporting] = useState(false);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value.trim().toLowerCase();
    setWords(newWords);
  };

  const handleImport = async () => {
    console.log('[ImportWallet] Starting wallet import...');

    // Join all words
    const seedPhrase = words.join(' ').trim();

    // Check if all words are filled
    const emptyWords = words.filter(w => !w.trim()).length;
    if (emptyWords > 0) {
      Alert.alert(
        'Incomplete Seed Phrase',
        `Please fill in all 24 words. ${emptyWords} word(s) missing.`
      );
      return;
    }

    // Validate seed phrase
    if (!bip39.validateMnemonic(seedPhrase)) {
      Alert.alert(
        'Invalid Seed Phrase',
        'The seed phrase you entered is invalid. Please check for typos in each word.'
      );
      return;
    }

    setIsImporting(true);

    try {
      console.log('[ImportWallet] Restoring wallet from imported seed...');
      await WalletService.restoreWallet(seedPhrase);
      console.log('[ImportWallet] Wallet imported successfully');

      Alert.alert(
        'Wallet Imported!',
        'Your wallet has been successfully restored.',
        [
          {
            text: 'OK',
            onPress: onComplete,
          },
        ]
      );
    } catch (error: any) {
      console.error('[ImportWallet] Failed to import wallet:', error);
      Alert.alert(
        'Import Failed',
        error.message || 'Failed to import wallet. Please try again.'
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <TerminalText style={styles.title}>
          &gt; IMPORT EXISTING WALLET
        </TerminalText>

        <TerminalText style={styles.subtitle}>
          Enter your 24-word seed phrase to restore your wallet.
        </TerminalText>

        {/* Warning */}
        <TerminalBox style={styles.warningBox}>
          <TerminalText style={styles.warningTitle}>⚠️ SECURITY WARNING</TerminalText>
          <TerminalText style={styles.warningText}>
            • Never share your seed phrase with anyone
            {'\n'}
            • Make sure you are alone
            {'\n'}
            • Double-check every word
          </TerminalText>
        </TerminalBox>

        {/* Seed Phrase Inputs */}
        <TerminalBox style={styles.inputBox}>
          <TerminalText style={styles.inputLabel}>
            &gt; SEED PHRASE (24 WORDS):
          </TerminalText>
          <View style={styles.wordsGrid}>
            {words.map((word, index) => (
              <View key={index} style={styles.wordInputContainer}>
                <TerminalText style={styles.wordNumber}>
                  {String(index + 1).padStart(2, '0')}
                </TerminalText>
                <TextInput
                  style={styles.wordInput}
                  placeholder="word"
                  placeholderTextColor={COLORS.textDim}
                  value={word}
                  onChangeText={(value) => handleWordChange(index, value)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isImporting}
                  returnKeyType={index === 23 ? 'done' : 'next'}
                />
              </View>
            ))}
          </View>
          <TerminalText style={styles.wordCount}>
            {words.filter(w => w.trim()).length} / 24 words filled
          </TerminalText>
        </TerminalBox>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={onBack}
            disabled={isImporting}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.buttonText}>
              &gt; BACK
            </TerminalText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.importButton,
              isImporting && styles.buttonDisabled,
            ]}
            onPress={handleImport}
            disabled={isImporting}
            activeOpacity={0.7}
          >
            {isImporting ? (
              <ActivityIndicator color={COLORS.bg} />
            ) : (
              <TerminalText style={[styles.buttonText, styles.importButtonText]}>
                &gt; IMPORT WALLET
              </TerminalText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    padding: 20,
  },
  content: {
    paddingBottom: 50,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  subtitle: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  warningBox: {
    marginBottom: 20,
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  warningTitle: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  warningText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 22,
  },
  inputBox: {
    marginBottom: 30,
  },
  inputLabel: {
    color: COLORS.primary,
    fontSize: 16,
    marginBottom: 15,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  wordInputContainer: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wordNumber: {
    color: COLORS.textMuted,
    fontSize: 12,
    marginRight: 8,
    minWidth: 24,
  },
  wordInput: {
    flex: 1,
    backgroundColor: COLORS.bgLight,
    color: COLORS.text,
    fontFamily: 'Courier',
    fontSize: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  wordCount: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backButton: {
    backgroundColor: COLORS.bgLight,
    borderColor: COLORS.secondary,
  },
  importButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
  },
  importButtonText: {
    color: COLORS.bg,
    fontWeight: 'bold',
  },
});
