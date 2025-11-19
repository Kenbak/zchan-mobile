// MUST be imported first for crypto to work in React Native
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/colors';
import { useWalletStore } from './src/store/walletStore';
import { WalletSetupScreen } from './src/screens/Onboarding/WalletSetupScreen';
import { CreateWalletScreen } from './src/screens/Onboarding/CreateWalletScreen';
import { ImportWalletScreen } from './src/screens/Onboarding/ImportWalletScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { BoardScreen } from './src/screens/Board/BoardScreen';

export default function App() {
  const wallet = useWalletStore((state) => state.wallet);
  const isInitialized = useWalletStore((state) => state.isInitialized);
  const initializeWallet = useWalletStore((state) => state.initializeWallet);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingScreen, setOnboardingScreen] = useState<'setup' | 'create' | 'import'>('setup');

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<'home' | 'board'>('home');
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  useEffect(() => {
    initializeWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    // Only auto-show onboarding if no wallet
    // Don't auto-hide it (let CreateWalletScreen handle its own flow)
    if (isInitialized && !wallet && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [isInitialized, wallet, showOnboarding]);

  const handleChannelPress = (channelId: string) => {
    setSelectedBoardId(channelId);
    setCurrentScreen('board');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
    setSelectedBoardId(null);
  };

  // Loading state
  if (!isInitialized) {
    return (
      <SafeAreaProvider>
        <View style={styles.container}>
          <Text style={styles.text}>&gt; INITIALIZING...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // Onboarding
  if (showOnboarding) {
    const handleWalletComplete = async () => {
      await initializeWallet();
      setShowOnboarding(false);
      setOnboardingScreen('setup'); // Reset for next time
    };

    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        {onboardingScreen === 'setup' && (
          <WalletSetupScreen
            onCreateNew={() => setOnboardingScreen('create')}
            onImportExisting={() => setOnboardingScreen('import')}
          />
        )}
        {onboardingScreen === 'create' && (
          <CreateWalletScreen
            onComplete={handleWalletComplete}
            onBack={() => setOnboardingScreen('setup')}
          />
        )}
        {onboardingScreen === 'import' && (
          <ImportWalletScreen
            onComplete={handleWalletComplete}
            onBack={() => setOnboardingScreen('setup')}
          />
        )}
      </SafeAreaProvider>
    );
  }

  // Main app with simple navigation
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      {currentScreen === 'home' ? (
        <HomeScreen onChannelPress={handleChannelPress} />
      ) : (
        <BoardScreen
          channelId={selectedBoardId!}
          onBack={handleBackToHome}
        />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.text,
    fontFamily: 'Courier',
    fontSize: 16,
  },
});
