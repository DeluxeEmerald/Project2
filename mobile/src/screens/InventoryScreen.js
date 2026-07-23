import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { searchInventory, removeInventory } from '../api';
import { useAuth } from '../context/AuthContext';
import CardRow from '../components/CardRow';
import SearchBar from '../components/SearchBar';
import SwipeableRow from '../components/SwipeableRow';
import SectionHeader from '../components/SectionHeader';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function InventoryScreen({ navigation }) {
  const { token, userId, name } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const debounceRef = useRef(null);

  const load = useCallback(
    async (searchTerm) => {
      setError('');
      try {
        const result = await searchInventory(token, userId, searchTerm ?? '');
        if (result.error) {
          setError(result.error);
        } else {
          setCards(result.results || []);
        }
      } catch (e) {
        setError(e.message);
      }
    },
    [token, userId]
  );

  // Keep a ref of the current search text so the focus-effect below can
  // reload with it without needing `search` in its dependency array
  // (which would refire on every keystroke, duplicating the debounced
  // search-as-you-type fetch below).
  const searchRef = useRef('');
  useEffect(() => {
    searchRef.current = search;
  }, [search]);

  const hasLoadedOnce = useRef(false);

  // Reload every time this tab regains focus - not just on first mount -
  // so a card added/removed from the Browse tab (or anywhere else) shows
  // up when you switch back to Inventory. Only the very first load shows
  // the blocking spinner; every refocus after that refreshes quietly in
  // the background so switching tabs doesn't flash the whole screen away.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        if (!hasLoadedOnce.current) {
          setLoading(true);
        }
        await load(searchRef.current);
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

  // Debounce search-as-you-type so we're not hitting the server on every keystroke.
  const onSearchChange = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      load(text);
    }, 400);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load(search);
    setRefreshing(false);
  };

  // Cards only ever exist once in inventory now - no quantity tracking.
  // "Remove" just deletes the entry outright. Still overshoot the
  // removal amount rather than trusting whatever `total` the server
  // happens to have on file for it (a legacy data issue - some
  // documents ended up with inflated/string totals) - the server floors
  // at 0 either way, so requesting more than could possibly be there
  // guarantees the entry is actually gone rather than leaving a
  // leftover remainder.
  const removeCard = (item) => {
    Alert.alert('Remove Card', `Remove "${item.CardName || item.name}" from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const cardID = item.id || item.cardId;
          const previous = cards;

          // Instant feedback - don't wait on the network round-trip to
          // show the row disappearing.
          setCards((prev) => prev.filter((c) => c.inventoryId !== item.inventoryId));

          try {
            const result = await removeInventory(token, userId, cardID, 999999999);
            if (result.error) {
              setCards(previous);
              Alert.alert('Could not remove card', result.error);
            } else {
              load(search);
            }
          } catch (e) {
            setCards(previous);
            Alert.alert('Could not remove card', e.message);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <TexturedBackground style={styles.container}>
      <SectionHeader title={`Welcome${name ? `, ${name}` : ''}`} />

      <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search your cards..." />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.inventoryId)}
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
            <Text style={styles.empty}>
              {search ? 'No matching cards.' : 'No cards in your inventory yet.'}
            </Text>
          ) : null
        }
        renderItem={({ item, index }) => (
          <View style={index % 2 === 1 ? styles.rowAlt : null}>
            <SwipeableRow onRemove={() => removeCard(item)}>
              <CardRow
                card={item}
                onPress={() => navigation.navigate('CardDetail', { card: item })}
              />
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
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  rowAlt: { backgroundColor: colors.surfaceAlt, borderRadius: 8 },
});
