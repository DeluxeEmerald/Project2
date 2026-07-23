import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDecks, removeCardFromDeck, removeDeck, searchInventory, searchCards } from '../api';
import { useAuth } from '../context/AuthContext';
import CardRow from '../components/CardRow';
import SwipeableRow from '../components/SwipeableRow';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function DeckDetailScreen({ route, navigation }) {
  const { deck: initialDeck } = route.params;
  const { token, userId } = useAuth();
  const [deck, setDeck] = useState(initialDeck);
  const [cardLookup, setCardLookup] = useState({});
  const [loading, setLoading] = useState(true);

  // deck.cards is an array of { cardId, quantity } objects - confirmed
  // against a real document, not the flat-array-of-strings a since-
  // corrected doc had described. Adding an already-present card
  // increments its quantity server-side rather than being rejected.
  // We cross-reference each cardId against the user's own inventory
  // first (fast, one call) so owned cards get full detail; anything not
  // found there is resolved individually against the full card catalog
  // instead, since a deck can reference cards you don't currently own.
  const load = useCallback(async () => {
    try {
      const [decksResult, invResult] = await Promise.all([
        getDecks(token, userId, ''),
        searchInventory(token, userId, ''),
      ]);

      let freshDeck = deck;
      if (!decksResult.error) {
        const fresh = (decksResult.results || []).find(
          (d) => String(d.deckID) === String(deck.deckID)
        );
        if (fresh) {
          freshDeck = fresh;
          setDeck(fresh);
        }
      }

      const map = {};
      if (!invResult.error) {
        (invResult.results || []).forEach((c) => {
          map[String(c.id)] = c;
        });
      }

      const missingIds = (freshDeck.cards || [])
        .map((c) => c.cardId)
        .filter((cardId) => !map[String(cardId)]);

      if (missingIds.length > 0) {
        const resolved = await Promise.all(
          missingIds.map(async (cardId) => {
            try {
              const result = await searchCards(token, String(cardId));
              return (result.results || []).find((c) => String(c.id) === String(cardId)) || null;
            } catch {
              return null;
            }
          })
        );
        resolved.forEach((card, i) => {
          if (card) map[String(missingIds[i])] = card;
        });
      }

      setCardLookup(map);
    } catch (e) {
      Alert.alert('Error loading deck', e.message);
    }
  }, [token, userId, deck.deckID]);

  // Refetch every time this screen regains focus - covers coming back
  // from "Add Card from Inventory" and any other screen that might have
  // changed this deck's contents.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        await load();
        if (!cancelled) setLoading(false);
      })();
      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load])
  );

  const confirmDeleteDeck = () => {
    Alert.alert('Delete Deck', `Delete "${deck.deckName}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await removeDeck(token, deck.deckID);
            if (result.error) {
              Alert.alert('Could not delete deck', result.error);
            } else {
              navigation.goBack();
            }
          } catch (e) {
            Alert.alert('Could not delete deck', e.message);
          }
        },
      },
    ]);
  };

  const removeCard = async (cardId) => {
    try {
      const result = await removeCardFromDeck(token, deck.deckID, cardId, 1);
      if (result.error) {
        Alert.alert('Could not remove card', result.error);
      } else {
        load();
      }
    } catch (e) {
      Alert.alert('Could not remove card', e.message);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      title: deck.deckName,
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditDeck', { deck })}
            style={{ marginRight: 16 }}
          >
            <Text style={styles.headerEdit}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={confirmDeleteDeck} style={{ marginRight: 12 }}>
            <Text style={styles.headerDelete}>Delete</Text>
          </TouchableOpacity>
        </View>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation, deck]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  const deckCards = deck.cards || [];

  return (
    <TexturedBackground style={styles.container}>
      <TouchableOpacity
        style={styles.addCardBtn}
        onPress={() => navigation.navigate('AddCardToDeck', { deck })}
      >
        <Text style={styles.addCardBtnText}>+ Add Card from Inventory</Text>
      </TouchableOpacity>

      <FlatList
        data={deckCards}
        keyExtractor={(item, i) => `${item.cardId}-${i}`}
        ListEmptyComponent={
          <Text style={styles.empty}>No cards in this deck yet.</Text>
        }
        renderItem={({ item, index }) => {
          const card = cardLookup[String(item.cardId)];
          return (
            <View style={index % 2 === 1 ? styles.rowAlt : null}>
              <SwipeableRow onRemove={() => removeCard(item.cardId)}>
                {card ? (
                  <CardRow
                    card={card}
                    onPress={() => navigation.navigate('CardDetail', { card })}
                  />
                ) : (
                  <View style={styles.fallbackRow}>
                    <Text style={styles.fallbackText}>
                      Unknown card ({String(item.cardId).slice(-6)})
                    </Text>
                  </View>
                )}
              </SwipeableRow>
            </View>
          );
        }}
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
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  headerDelete: { color: colors.error, fontWeight: '600', fontSize: 15 },
  headerEdit: { color: colors.gold, fontWeight: '600', fontSize: 15 },
  rowAlt: { backgroundColor: colors.surfaceAlt, borderRadius: 8 },
  addCardBtn: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  addCardBtnText: { color: colors.parchment, fontWeight: '600', fontSize: 14 },
  fallbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  fallbackText: { color: colors.parchmentDim, fontSize: 13, flex: 1, marginRight: 8 },
});
