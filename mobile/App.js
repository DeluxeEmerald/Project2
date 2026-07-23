import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { DeckCountProvider } from './src/context/DeckCountContext';
import { ToastProvider } from './src/context/ToastContext';
import RootNavigator from './src/navigation/RootNavigator';

// Keep the native splash screen up until we know whether there's a
// saved session, instead of it disappearing to a blank/spinner frame.
SplashScreen.preventAutoHideAsync().catch(() => {});

function AppContent() {
  const { isReady } = useAuth();

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <DeckCountProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DeckCountProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
