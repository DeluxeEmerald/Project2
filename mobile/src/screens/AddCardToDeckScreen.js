import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { searchInventory, addCardToDeck } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardRow from '../components/CardRow';
import SearchBar from '../components/SearchBar';
import { colors } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function AddCardToDeckScreen({ route, navigation }) {
  const { deck } = route.params;
  const { token, userId } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (term) => {
      try {
        const result = await searchInventory(token, userId, term ?? '');
        if (!result.error) setCards(result.results || []);
      } catch (e) {
        Alert.alert('Error', e.message);
      }
    },
    [token, userId]
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load('');
      setLoading(false);
    })();
  }, [load]);

  const onSearchChange = (text) => {
    setSearch(text);
    load(text);
  };

  const addToDeck = async (card) => {
    try {
      const result = await addCardToDeck(token, deck.deckID, card.id, 1);
      if (result.error) {
        Alert.alert('Could not add card', result.error);
      } else {
        showToast(`${card.CardName || card.name} added to ${deck.deckName}`);
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Could not add card', e.message);
    }
  };

  // Decks are singleton now, same as Inventory - a card is either in
  // the deck or it isn't, no quantity. Mark cards already present
  // instead of letting them be added again.
  const deckCardIds = new Set((deck.cards || []).map((c) => String(c.cardId)));

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <TexturedBackground style={styles.container}>
      <SearchBar value={search} onChangeText={onSearchChange} placeholder="Search your inventory..." />

      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.inventoryId)}
        ListEmptyComponent={<Text style={styles.empty}>No matching cards in your inventory.</Text>}
        renderItem={({ item, index }) => {
          const alreadyInDeck = deckCardIds.has(String(item.id));
          return (
            <View style={index % 2 === 1 ? styles.rowAlt : null}>
              <CardRow
                card={item}
                onPress={() => (alreadyInDeck ? null : addToDeck(item))}
                right={
                  alreadyInDeck ? (
                    <View style={styles.inDeckBadge}>
                      <Text style={styles.inDeckBadgeText}>In Deck</Text>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addBtn} onPress={() => addToDeck(item)}>
                      <Text style={styles.addBtnText}>+ Add</Text>
                    </TouchableOpacity>
                  )
                }
              />
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
  inDeckBadge: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  inDeckBadgeText: { color: colors.parchmentDim, fontWeight: '700', fontSize: 12 },
});
