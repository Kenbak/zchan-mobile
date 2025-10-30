// MUST be imported first for crypto to work in React Native
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS } from './src/constants/colors';
import { useWalletStore } from './src/store/walletStore';
import { CreateWalletScreen } from './src/screens/Onboarding/CreateWalletScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';

export default function App() {
  const wallet = useWalletStore((state) => state.wallet);
  const isInitialized = useWalletStore((state) => state.isInitialized);
  const initializeWallet = useWalletStore((state) => state.initializeWallet);
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  // Loading state
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>&gt; INITIALIZING...</Text>
      </View>
    );
  }

  // Onboarding
  if (showOnboarding) {
    return (
      <>
        <StatusBar style="light" />
        <CreateWalletScreen
          onComplete={async () => {
            await initializeWallet();
            setShowOnboarding(false);
          }}
        />
      </>
    );
  }

  // Main app (no navigation for now)
  return (
    <>
      <StatusBar style="light" />
      <HomeScreen
        onChannelPress={(channelId) => {
          console.log('Channel pressed:', channelId);
          // TODO: Navigate to board
        }}
      />
    </>
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
