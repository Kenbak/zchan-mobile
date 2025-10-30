// MUST be imported first for crypto to work in React Native
import 'react-native-get-random-values';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { COLORS } from './src/constants/colors';
import { useWalletStore } from './src/store/walletStore';
import { CreateWalletScreen } from './src/screens/Onboarding/CreateWalletScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { BoardScreen } from './src/screens/Board/BoardScreen';
import { TerminalText } from './src/components/Terminal/TerminalText';

type RootStackParamList = {
  Home: undefined;
  Board: { channelId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    VT323_400Regular,
  });

  const wallet = useWalletStore((state) => state.wallet);
  const isInitialized = useWalletStore((state) => state.isInitialized);
  const initializeWallet = useWalletStore((state) => state.initializeWallet);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

  useEffect(() => {
    if (isInitialized && !wallet) {
      setShowOnboarding(true);
    }
  }, [isInitialized, wallet]);

  if (!fontsLoaded || !isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.text} />
        <TerminalText style={styles.loadingText}>
          {'\n'}&gt; INITIALIZING ZCHAN...
        </TerminalText>
      </View>
    );
  }

  // Show onboarding if no wallet
  if (showOnboarding) {
    return (
      <>
        <StatusBar style="light" backgroundColor={COLORS.bg} />
        <CreateWalletScreen onComplete={() => setShowOnboarding(false)} />
      </>
    );
  }

  return (
    <>
      <StatusBar style="light" backgroundColor={COLORS.bg} />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.bg },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Home">
            {({ navigation }) => (
              <HomeScreen
                onChannelPress={(channelId) =>
                  navigation.navigate('Board', { channelId })
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Board">
            {({ route, navigation }) => (
              <BoardScreen
                channelId={route.params.channelId}
                onBack={() => navigation.goBack()}
              />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});
