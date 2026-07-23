import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

// The actual username/password live in the device Keychain, gated behind
// Face ID / Touch ID / passcode (requireAuthentication) - never in plain
// AsyncStorage. A separate, non-protected flag just remembers *whose*
// name to show on the "Log In with Face ID" button, so the Login screen
// doesn't need to prompt Face ID just to decide whether to show a button.
const SECURE_KEY = 'mtg_saved_creds';
const FLAG_KEY = 'mtg_saved_creds_username';

export async function saveCredentials(name, password) {
  try {
    await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify({ name, password }), {
      requireAuthentication: true,
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    await AsyncStorage.setItem(FLAG_KEY, name);
    return true;
  } catch (e) {
    return false;
  }
}

// No biometric prompt here - just tells the Login screen whether to show
// the Face ID button, and whose name to put on it.
export async function getSavedUsername() {
  try {
    return await AsyncStorage.getItem(FLAG_KEY);
  } catch (e) {
    return null;
  }
}

// This is what actually triggers the OS Face ID / Touch ID / passcode
// prompt, via the Keychain item's requireAuthentication protection.
export async function getSavedCredentials() {
  try {
    const raw = await SecureStore.getItemAsync(SECURE_KEY, {
      requireAuthentication: true,
      authenticationPrompt: 'Log in with Face ID',
    });
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export async function clearSavedCredentials() {
  try {
    await SecureStore.deleteItemAsync(SECURE_KEY);
  } catch (e) {
    // ignore - nothing to delete
  }
  await AsyncStorage.removeItem(FLAG_KEY);
}
