import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { decodeJwtPayload } from '../utils/jwt';
import { setUnauthorizedHandler } from '../api';

const AuthContext = createContext(null);
const STORAGE_KEY = 'mtg_auth_v1';
const avatarKey = (userId) => `mtg_avatar:${userId}`;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [name, setName] = useState(null);
  const [avatarUri, setAvatarUri] = useState(null);
  const [isReady, setIsReady] = useState(false);

  // A *restored* (from-storage) session starts locked behind biometrics
  // if the device supports them. A session that just came from typing a
  // password (signIn) is unlocked immediately - you already proved who
  // you are. We never store the raw password, so biometrics can't "log
  // you in" on a fresh login; they can only re-confirm it's you before
  // handing back a session we already saved.
  const [isUnlocked, setIsUnlocked] = useState(true);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);

  // Restore session on app launch
  useEffect(() => {
    (async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = hasHardware && (await LocalAuthentication.isEnrolledAsync());
        setBiometricsAvailable(isEnrolled);

        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          setToken(saved.token);
          setUserId(saved.userId);
          setName(saved.name);

          if (saved.userId) {
            const savedAvatar = await AsyncStorage.getItem(avatarKey(saved.userId));
            if (savedAvatar) setAvatarUri(savedAvatar);
          }

          // Lock a restored session only if biometrics are actually set
          // up on this device - otherwise there'd be no way to unlock.
          setIsUnlocked(!isEnrolled);
        }
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const unlock = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Unlock as ${name || 'yourself'}`,
        fallbackLabel: 'Use Passcode',
      });
      if (result.success) {
        setIsUnlocked(true);
      }
      return result.success;
    } catch (e) {
      return false;
    }
  };

  // Call this right after a successful /api/login response.
  // The server only returns { accessToken }, so we pull userId/name
  // out of the JWT payload ourselves.
  const signIn = async (accessToken) => {
    const payload = decodeJwtPayload(accessToken);
    const newUserId = payload?.userId ?? null;
    const newName = payload?.name ?? null;

    setToken(accessToken);
    setUserId(newUserId);
    setName(newName);
    setIsUnlocked(true); // just typed a real password, no need to also gate this

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: accessToken, userId: newUserId, name: newName })
    );

    if (newUserId) {
      const savedAvatar = await AsyncStorage.getItem(avatarKey(newUserId));
      setAvatarUri(savedAvatar || null);
    }
  };

  const signOut = async () => {
    setToken(null);
    setUserId(null);
    setName(null);
    setAvatarUri(null);
    setIsUnlocked(true);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  // Any authenticated API call that comes back with an expired/invalid
  // JWT triggers this automatically - so a stale session self-heals by
  // dropping back to the Login screen instead of leaving the user stuck
  // seeing the same error scattered across whichever screen happened to
  // make the next request.
  useEffect(() => {
    let alreadyHandled = false;
    setUnauthorizedHandler(() => {
      if (alreadyHandled) return; // several requests can fail around the same moment
      alreadyHandled = true;
      Alert.alert('Session Expired', 'Please log in again.');
      signOut();
      // Only suppresses duplicates in the same burst - a later, genuine
      // expiry (after logging back in) should still trigger this again.
      setTimeout(() => {
        alreadyHandled = false;
      }, 3000);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stored locally per-user (device-only) - your API doesn't have a
  // field for this yet, so it won't sync across devices or survive an
  // app reinstall/uninstall.
  const setAvatar = async (uri) => {
    setAvatarUri(uri);
    if (userId) {
      if (uri) {
        await AsyncStorage.setItem(avatarKey(userId), uri);
      } else {
        await AsyncStorage.removeItem(avatarKey(userId));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        name,
        avatarUri,
        isReady,
        isUnlocked,
        biometricsAvailable,
        unlock,
        signIn,
        signOut,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
