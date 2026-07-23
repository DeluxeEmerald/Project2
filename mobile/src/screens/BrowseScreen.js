import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { searchCards, addInventory } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import CardRow from '../components/CardRow';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';

export default function BrowseScreen({ navigation }) {
  const { token, userId } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const runSearch = useCallback(
    async (term) => {
      setError('');
      setLoading(true);
      try {
        const result = await searchCards(token, term);
        if (result.error) {
          setError(result.error);
        } else {
          setCards(result.results || []);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
        setHasSearched(true);
      }
    },
    [token]
  );

  const onSearchChange = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (text.trim() === '') {
        setCards([]);
        setHasSearched(false);
        return;
      }
      runSearch(text);
    }, 400);
  };

  const addOneToInventory = async (card) => {
    try {
      const result = await addInventory(token, userId, card.id, 1, card.name);
      if (result.error) {
        Alert.alert('Could not add card', result.error);
      } else {
        showToast(`${card.name} added to your inventory`);
      }
    } catch (e) {
      Alert.alert('Could not add card', e.message);
    }
  };

  return (
    <TexturedBackground style={styles.container}>
      <SectionHeader title="Browse Cards" />
      <SearchBar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search all cards (name, type, set...)"
      />

      {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && hasSearched && cards.length === 0 && !error ? (
        <Text style={styles.empty}>No cards matched your search.</Text>
      ) : null}

      {!hasSearched && !loading ? (
        <Text style={styles.hint}>Start typing to search the full card catalog.</Text>
      ) : null}

      <FlatList
        data={cards}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <View style={index % 2 === 1 ? styles.rowAlt : null}>
            <CardRow
              card={item}
              onPress={() => navigation.navigate('CardDetail', { card: item })}
              right={
                <TouchableOpacity style={styles.addBtn} onPress={() => addOneToInventory(item)}>
                  <Text style={styles.addBtnText}>+ Add</Text>
                </TouchableOpacity>
              }
            />
          </View>
        )}
      />
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  error: { color: colors.error, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  hint: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
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
});
