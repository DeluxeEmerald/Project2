import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import TexturedBackground from '../components/TexturedBackground';
import { colors, fonts } from '../theme';

export default function UnlockScreen() {
  const { name, unlock, signOut } = useAuth();
  const [failed, setFailed] = useState(false);
  const [attempting, setAttempting] = useState(false);

  const tryUnlock = async () => {
    setAttempting(true);
    setFailed(false);
    const success = await unlock();
    setAttempting(false);
    if (!success) setFailed(true);
  };

  // Prompt automatically as soon as this screen appears - most users
  // expect Face ID to just happen, not require a tap first.
  useEffect(() => {
    tryUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TexturedBackground style={styles.container}>
      <View style={styles.emblem}>
        <Text style={styles.emblemText}>{'\u2726'}</Text>
      </View>

      <Text style={styles.title}>Welcome back{name ? `, ${name}` : ''}</Text>
      <Text style={styles.subtitle}>
        {failed ? "Couldn't verify it's you - try again." : 'Verifying...'}
      </Text>

      <TouchableOpacity style={styles.unlockBtn} onPress={tryUnlock} disabled={attempting}>
        <Text style={styles.unlockBtnText}>
          {attempting ? 'Verifying...' : 'Unlock with Face ID'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signOut}>
        <Text style={styles.signOutLink}>Log out instead</Text>
      </TouchableOpacity>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emblem: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emblemText: { color: colors.gold, fontSize: 32 },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.gold,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: { color: colors.parchmentDim, fontSize: 13, marginBottom: 32, textAlign: 'center' },
  unlockBtn: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
    marginBottom: 20,
  },
  unlockBtnText: { color: colors.parchment, fontWeight: '600', fontSize: 15 },
  signOutLink: { color: colors.parchmentDim, fontSize: 13, textDecorationLine: 'underline' },
});
