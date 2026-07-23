import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { searchInventory, getDecks } from '../api';
import { getRarityColor } from '../utils/rarity';
import { getSavedUsername, clearSavedCredentials } from '../utils/secureCredentials';
import { API_BASE_URL } from '../config';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

const APP_VERSION = Constants.expoConfig?.version || '1.0.0';
// Common convention for an Express app serving swagger-ui-express - adjust
// this path if your API's docs are actually hosted somewhere else.
const API_DOCS_URL = `${API_BASE_URL}/api-docs`;

export default function AccountScreen() {
  const { token, userId, name, avatarUri, setAvatar, signOut, biometricsAvailable } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pickingImage, setPickingImage] = useState(false);
  const [faceIdUsername, setFaceIdUsername] = useState(null);

  useEffect(() => {
    getSavedUsername().then(setFaceIdUsername);
  }, []);

  const load = useCallback(async () => {
    try {
      const [invResult, decksResult] = await Promise.all([
        searchInventory(token, userId, ''),
        getDecks(token, userId, ''),
      ]);

      const inventory = invResult.error ? [] : invResult.results || [];
      const decks = decksResult.error ? [] : decksResult.results || [];

      const uniqueCards = inventory.length;

      const rarityCounts = { mythic: 0, rare: 0, uncommon: 0, common: 0 };
      inventory.forEach((c) => {
        const key = (c.rarity || '').toLowerCase();
        if (rarityCounts[key] !== undefined) rarityCounts[key] += 1;
      });

      setStats({
        uniqueCards,
        deckCount: decks.length,
        rarityCounts,
      });
    } catch (e) {
      // Stats are a nice-to-have - fail quietly rather than blocking the screen.
      setStats(null);
    }
  }, [token, userId]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const confirmSignOut = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const pickAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access in Settings to set a profile picture.'
      );
      return;
    }

    setPickingImage(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await setAvatar(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Could not set profile picture', e.message);
    } finally {
      setPickingImage(false);
    }
  };

  const removeAvatar = () => {
    setAvatar(null);
  };

  const openApiDocs = () => {
    Linking.openURL(API_DOCS_URL).catch(() => {
      Alert.alert('Could not open link', `Try visiting ${API_DOCS_URL} in a browser.`);
    });
  };

  const disableFaceIdLogin = () => {
    Alert.alert(
      'Disable Face ID Login',
      `Remove the saved login for "${faceIdUsername}"? You can re-enable it next time you log in with your password.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable',
          style: 'destructive',
          onPress: async () => {
            await clearSavedCredentials();
            setFaceIdUsername(null);
          },
        },
      ]
    );
  };

  return (
    <TexturedBackground style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatarGlow} />
          <TouchableOpacity style={styles.avatar} onPress={pickAvatar} disabled={pickingImage}>
            {pickingImage ? (
              <ActivityIndicator color={colors.gold} />
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{(name || '?').charAt(0).toUpperCase()}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.editBadge} onPress={pickAvatar} disabled={pickingImage}>
            <Ionicons name="pencil" size={13} color={colors.background} />
          </TouchableOpacity>
        </View>

        <Text style={styles.changePhoto}>
          {avatarUri ? 'Tap to change photo' : 'Tap to add a photo'}
        </Text>
        {avatarUri ? (
          <TouchableOpacity onPress={removeAvatar}>
            <Text style={styles.removePhoto}>Remove Photo</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.name}>{name}</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
        ) : stats ? (
          <View style={styles.statsSection}>
            <View style={styles.primaryStatsRow}>
              <StatBox label="Unique Cards" value={stats.uniqueCards} />
              <StatBox label="Decks" value={stats.deckCount} />
            </View>

            <View style={styles.rarityStatsRow}>
              <RarityStatBox label="Mythic" value={stats.rarityCounts.mythic} rarity="mythic" />
              <RarityStatBox label="Rare" value={stats.rarityCounts.rare} rarity="rare" />
              <RarityStatBox label="Common" value={stats.rarityCounts.common} rarity="common" />
            </View>
          </View>
        ) : null}

        <TouchableOpacity style={styles.logoutButton} onPress={confirmSignOut}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

        {biometricsAvailable ? (
          <View style={styles.aboutSection}>
            <View style={styles.aboutDivider} />
            <Text style={styles.aboutHeader}>Security</Text>

            {faceIdUsername ? (
              <TouchableOpacity style={styles.aboutRow} onPress={disableFaceIdLogin}>
                <Text style={styles.aboutLabel}>Face ID Login</Text>
                <Text style={styles.aboutLinkDanger}>Disable</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.aboutRow}>
                <Text style={styles.aboutLabel}>Face ID Login</Text>
                <Text style={styles.aboutValueDim}>Not enabled</Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={styles.aboutSection}>
          <View style={styles.aboutDivider} />
          <Text style={styles.aboutHeader}>About</Text>

          <View style={styles.aboutRow}>
            <Text style={styles.aboutLabel}>Version</Text>
            <Text style={styles.aboutValue}>{APP_VERSION}</Text>
          </View>

          <TouchableOpacity style={styles.aboutRow} onPress={openApiDocs}>
            <Text style={styles.aboutLabel}>API Documentation</Text>
            <Text style={styles.aboutLink}>Open {'\u203A'}</Text>
          </TouchableOpacity>

          <Text style={styles.aboutCredit}>Emblem & theme designed for MTG Collection</Text>
        </View>
      </ScrollView>
    </TexturedBackground>
  );
}

function StatBox({ label, value }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function RarityStatBox({ label, value, rarity }) {
  const color = getRarityColor(rarity);
  return (
    <View style={[styles.rarityStatBox, { borderColor: color }]}>
      <Text style={[styles.rarityStatValue, { color }]}>{value}</Text>
      <Text style={styles.rarityStatLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  avatarWrap: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  avatarGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gold,
    opacity: 0.18,
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarText: { fontSize: 34, color: colors.gold, fontFamily: fonts.display, fontWeight: '700' },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.gold,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changePhoto: { fontSize: 12, color: colors.parchmentDim, marginBottom: 2 },
  removePhoto: { fontSize: 12, color: colors.error, marginBottom: 16, marginTop: 4 },
  name: { fontSize: 20, color: colors.parchment, fontWeight: '600', marginBottom: 24, marginTop: 4 },

  statsSection: {
    width: '100%',
    marginBottom: 28,
  },

  primaryStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  statBox: {
    width: '43%',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    margin: '1.5%',
  },
  statValue: { fontSize: 20, fontWeight: '700', color: colors.gold, fontFamily: fonts.display },
  statLabel: { fontSize: 11, color: colors.parchmentDim, marginTop: 4, textAlign: 'center' },

  rarityStatsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 8,
  },
  rarityStatBox: {
    width: '30%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    margin: '1.5%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  rarityStatValue: { fontSize: 28, fontWeight: '800', fontFamily: fonts.display },
  rarityStatLabel: {
    fontSize: 12,
    color: colors.parchment,
    marginTop: 6,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  logoutButton: {
    backgroundColor: colors.danger,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 8,
  },
  logoutButtonText: { color: colors.parchment, fontWeight: '600', fontSize: 15 },

  aboutSection: { width: '100%', marginTop: 32 },
  aboutDivider: { height: 1, backgroundColor: colors.border, width: '100%', marginBottom: 16 },
  aboutHeader: {
    fontFamily: fonts.display,
    fontSize: 14,
    fontWeight: '700',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aboutLabel: { color: colors.parchmentDim, fontSize: 13 },
  aboutValue: { color: colors.parchment, fontSize: 13, fontWeight: '600' },
  aboutValueDim: { color: colors.parchmentDim, fontSize: 13, fontStyle: 'italic' },
  aboutLink: { color: colors.gold, fontSize: 13, fontWeight: '600' },
  aboutLinkDanger: { color: colors.error, fontSize: 13, fontWeight: '600' },
  aboutCredit: {
    color: colors.parchmentDim,
    fontSize: 11,
    marginTop: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
