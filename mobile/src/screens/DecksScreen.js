import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDecks, createDeck, removeDeck } from '../api';
import { useAuth } from '../context/AuthContext';
import { useDeckCount } from '../context/DeckCountContext';
import { useToast } from '../context/ToastContext';
import SwipeableRow from '../components/SwipeableRow';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function DecksScreen({ navigation }) {
  const { token, userId } = useAuth();
  const { setDeckCount } = useDeckCount();
  const { showToast } = useToast();
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await getDecks(token, userId, '');
      if (result.error) {
        setError(result.error);
      } else {
        const results = result.results || [];
        setDecks(results);
        setDeckCount(results.length);
      }
    } catch (e) {
      setError(e.message);
    }
  }, [token, userId, setDeckCount]);

  const hasLoadedOnce = useRef(false);

  // Reload every time this screen comes into focus - not just on first
  // mount - so a deck created/deleted elsewhere is reflected when you
  // land back on this list. Only the first load blocks with a spinner;
  // refocuses after that refresh quietly so tab switches stay snappy.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!hasLoadedOnce.current) {
          setLoading(true);
        }
        await load();
        if (!cancelled) {
          setLoading(false);
          hasLoadedOnce.current = true;
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const promptNewDeck = () => {
    if (Platform.OS !== 'ios') {
      Alert.alert('Not supported', 'Creating a deck by prompt is only wired up for iOS right now.');
      return;
    }
    Alert.prompt(
      'New Deck',
      'Name your deck',
      async (deckName) => {
        if (!deckName || !deckName.trim()) return;
        try {
          const result = await createDeck(token, userId, deckName.trim(), false);
          if (result.error) {
            Alert.alert('Could not create deck', result.error);
          } else {
            showToast(`"${deckName.trim()}" created`);
            load();
          }
        } catch (e) {
          Alert.alert('Could not create deck', e.message);
        }
      },
      'plain-text'
    );
  };

  const deleteDeck = (item) => {
    Alert.alert('Delete Deck', `Delete "${item.deckName}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const previous = decks;

          // Instant feedback - don't wait on the network round-trip.
          setDecks((prev) => prev.filter((d) => String(d.id) !== String(item.id)));

          try {
            const result = await removeDeck(token, item.deckID);
            if (result.error) {
              setDecks(previous);
              Alert.alert('Could not delete deck', result.error);
            } else {
              setDeckCount((c) => Math.max(0, c - 1));
              load();
            }
          } catch (e) {
            setDecks(previous);
            Alert.alert('Could not delete deck', e.message);
          }
        },
      },
    ]);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={promptNewDeck} style={{ marginRight: 12 }}>
          <Text style={styles.headerAdd}>+ New</Text>
        </TouchableOpacity>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <TexturedBackground style={styles.container}>
      <TouchableOpacity
        style={styles.communityBtn}
        onPress={() => navigation.navigate('CommunityDecks')}
      >
        <Text style={styles.communityBtnText}>{'\u2726'} Browse Community Decks</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={decks}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
        ListEmptyComponent={
          !error ? (
            <Text style={styles.empty}>No decks yet. Tap "+ New" to create one.</Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={index % 2 === 1 ? styles.rowAlt : null}>
            <SwipeableRow onRemove={() => deleteDeck(item)}>
              <TouchableOpacity
                style={styles.row}
                onPress={() => navigation.navigate('DeckDetail', { deck: item })}
              >
                <View style={styles.rowText}>
                  <Text style={styles.deckName}>{item.deckName}</Text>
                  <Text style={styles.cardCount}>
                    {(item.cards || []).length} card{(item.cards || []).length === 1 ? '' : 's'}
                  </Text>
                </View>
                {item.public ? (
                  <Text style={styles.publicBadge}>Public</Text>
                ) : (
                  <Text style={styles.privateBadge}>Private</Text>
                )}
              </TouchableOpacity>
            </SwipeableRow>
          </View>
        )}
      />
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  error: { color: colors.error, marginBottom: 12 },
  communityBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  communityBtnText: { color: colors.gold, fontWeight: '600', fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  headerAdd: { color: colors.gold, fontWeight: '700', fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rowAlt: { backgroundColor: colors.surfaceAlt },
  rowText: { flex: 1 },
  deckName: { color: colors.parchment, fontSize: 17, fontWeight: '600' },
  cardCount: { color: colors.parchmentDim, fontSize: 13, marginTop: 3 },
  publicBadge: {
    color: colors.gold,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '700',
  },
  privateBadge: {
    color: colors.error,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 11,
    fontWeight: '700',
  },
});
