import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UnlockScreen from '../screens/UnlockScreen';
import MainTabs from './MainTabs';
import { colors, stackScreenOptions } from '../theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { token, isReady, isUnlocked } = useAuth();

  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  if (token && !isUnlocked) {
    return <UnlockScreen />;
  }

  if (token) {
    // MainTabs manages its own headers per-tab, so no wrapping stack needed here.
    return <MainTabs />;
  }

  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Log In' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
    </Stack.Navigator>
  );
}
