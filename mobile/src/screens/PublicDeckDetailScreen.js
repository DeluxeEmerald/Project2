import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { getDecks, searchCards, addInventory } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardRow from '../components/CardRow';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

// Public decks only give us { id, name, userID } from searchpublicdecks -
// no card list. So this screen:
//   1. Calls getdecks with the *owner's* userID + the deck's own id as
//      the search term, which matches on the deckID field and returns
//      that one deck's full cards contents. Decks are treated as
//      singleton (presence-only, no quantity display), consistent with
//      how Inventory works.
//   2. Resolves each card by ID via searchcards (the full catalog, not
//      just what we own), since these cards may not be in our own
//      inventory at all.
export default function PublicDeckDetailScreen({ route }) {
  const { deckId, ownerUserId, deckName } = route.params;
  const { token, userId } = useAuth();
  const { showToast } = useToast();
  const [cards, setCards] = useState([]); // [{ cardId, card }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const decksResult = await getDecks(token, ownerUserId, String(deckId));
        if (decksResult.error) {
          setError(decksResult.error);
          return;
        }

        const match = (decksResult.results || []).find(
          (d) => String(d.deckID) === String(deckId)
        );
        const deckCards = match?.cards || [];

        if (deckCards.length === 0) {
          setCards([]);
          return;
        }

        const resolved = await Promise.all(
          deckCards.map(async (dc) => {
            try {
              const cardResult = await searchCards(token, String(dc.cardId));
              const found = (cardResult.results || []).find(
                (c) => String(c.id) === String(dc.cardId)
              );
              return { cardId: dc.cardId, card: found || null };
            } catch {
              return { cardId: dc.cardId, card: null };
            }
          })
        );

        setCards(resolved);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, ownerUserId, deckId]);

  const addToMyInventory = async (entry) => {
    if (!entry.card) return;
    try {
      const result = await addInventory(token, userId, entry.card.id, 1, entry.card.name);
      if (result.error) {
        Alert.alert('Could not add card', result.error);
      } else {
        showToast(`${entry.card.name} added to your inventory`);
      }
    } catch (e) {
      Alert.alert('Could not add card', e.message);
    }
  };

  if (loading) {
    return (
      <TexturedBackground style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </TexturedBackground>
    );
  }

  return (
    <TexturedBackground style={styles.container}>
      <Text style={styles.title}>{deckName}</Text>
      <Text style={styles.subtitle}>Public deck - viewing only</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={cards}
        keyExtractor={(item, i) => `${item.cardId}-${i}`}
        ListEmptyComponent={
          !error ? <Text style={styles.empty}>This deck has no cards yet.</Text> : null
        }
        renderItem={({ item, index }) => (
          <View style={index % 2 === 1 ? styles.rowAlt : null}>
            {item.card ? (
              <CardRow
                card={item.card}
                onPress={() => {}}
                right={
                  <TouchableOpacity style={styles.addBtn} onPress={() => addToMyInventory(item)}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </TouchableOpacity>
                }
              />
            ) : (
              <View style={styles.fallbackRow}>
                <Text style={styles.fallbackText}>
                  Unknown card ({String(item.cardId).slice(-6)})
                </Text>
              </View>
            )}
          </View>
        )}
      />
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.display, fontSize: 20, fontWeight: '700', color: colors.gold },
  subtitle: { color: colors.parchmentDim, fontSize: 12, marginTop: 2, marginBottom: 14 },
  error: { color: colors.error, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  rowAlt: { backgroundColor: colors.surfaceAlt, borderRadius: 8 },
  addBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { color: colors.gold, fontWeight: '700', fontSize: 12 },
  fallbackRow: { paddingVertical: 12, paddingHorizontal: 8 },
  fallbackText: { color: colors.parchmentDim, fontSize: 13 },
});
