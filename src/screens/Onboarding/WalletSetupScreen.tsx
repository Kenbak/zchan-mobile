import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TerminalText } from '../../components/Terminal/TerminalText';
import { TerminalBox } from '../../components/Terminal/TerminalBox';
import { COLORS } from '../../constants/colors';

interface WalletSetupScreenProps {
  onCreateNew: () => void;
  onImportExisting: () => void;
}

export const WalletSetupScreen: React.FC<WalletSetupScreenProps> = ({
  onCreateNew,
  onImportExisting,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Logo */}
        <TerminalText style={styles.logo}>
          {`
███████╗███████╗ █████╗ ███╗   ██╗
╚══███╔╝██╔════╝██╔══██╗████╗  ██║
  ███╔╝ █████╗  ███████║██╔██╗ ██║
 ███╔╝  ██╔══╝  ██╔══██║██║╚██╗██║
███████╗███████╗██║  ██║██║ ╚████║
╚══════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
          `}
        </TerminalText>

        <TerminalText style={styles.systemMessage}>
          &gt; ZCHAN MOBILE INTERFACE V0.1
          {'\n'}
          &gt; WALLET SETUP
          {'\n'}
          &gt; CHOOSE AN OPTION
        </TerminalText>

        {/* Options */}
        <TerminalBox style={styles.optionsBox}>
          <TouchableOpacity
            style={styles.option}
            onPress={onCreateNew}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.optionTitle}>
              &gt; CREATE NEW WALLET
            </TerminalText>
            <TerminalText style={styles.optionDescription}>
              Generate a new 24-word seed phrase
            </TerminalText>
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.option}
            onPress={onImportExisting}
            activeOpacity={0.7}
          >
            <TerminalText style={styles.optionTitle}>
              &gt; IMPORT EXISTING WALLET
            </TerminalText>
            <TerminalText style={styles.optionDescription}>
              Restore from your 24-word seed phrase
            </TerminalText>
          </TouchableOpacity>
        </TerminalBox>

        <TerminalText style={styles.footer}>
          &gt; DECENTRALIZED • PRIVATE • UNSTOPPABLE
        </TerminalText>
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
    justifyContent: 'center',
    flexGrow: 1,
  },
  logo: {
    color: COLORS.primary,
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  systemMessage: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 20,
  },
  optionsBox: {
    marginBottom: 30,
  },
  option: {
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  optionTitle: {
    color: COLORS.primary,
    fontSize: 18,
    marginBottom: 8,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  optionDescription: {
    color: COLORS.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
    marginVertical: 5,
  },
  footer: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: 'center',
  },
});
