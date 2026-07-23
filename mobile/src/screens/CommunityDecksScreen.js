import React, { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchPublicDecks } from '../api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import SectionHeader from '../components/SectionHeader';
import TexturedBackground from '../components/TexturedBackground';
import { colors } from '../theme';

export default function CommunityDecksScreen({ navigation }) {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef(null);

  const runSearch = useCallback(
    async (term) => {
      setError('');
      setLoading(true);
      try {
        const result = await searchPublicDecks(token, term);
        if (result.error) {
          setError(result.error);
        } else {
          setDecks(result.results || []);
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

  // Empty search still returns all public decks (the server only
  // requires `public: true`), so load once up front too.
  React.useEffect(() => {
    runSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearchChange = (text) => {
    setSearch(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(text);
    }, 400);
  };

  return (
    <TexturedBackground style={styles.container}>
      <SectionHeader title="Community Decks" />
      <SearchBar
        value={search}
        onChangeText={onSearchChange}
        placeholder="Search public deck names..."
      />

      {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: 20 }} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && hasSearched && decks.length === 0 && !error ? (
        <Text style={styles.empty}>No public decks found.</Text>
      ) : null}

      <FlatList
        data={decks}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[styles.row, index % 2 === 1 ? styles.rowAlt : null]}
            onPress={() =>
              navigation.navigate('PublicDeckDetail', {
                deckId: item.id,
                ownerUserId: item.userID,
                deckName: item.name,
              })
            }
          >
            <Text style={styles.deckName}>{item.name}</Text>
            <Text style={styles.viewLink}>View {'\u203A'}</Text>
          </TouchableOpacity>
        )}
      />
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  error: { color: colors.error, marginBottom: 12 },
  empty: { textAlign: 'center', marginTop: 40, color: colors.parchmentDim },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  rowAlt: { backgroundColor: colors.surfaceAlt },
  deckName: { color: colors.parchment, fontSize: 16, fontWeight: '600', flex: 1 },
  viewLink: { color: colors.gold, fontSize: 14, fontWeight: '600' },
});
