import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { createDeck, addCardToDeck, removeDeck } from '../api';
import { useAuth } from '../context/AuthContext';
import TexturedBackground from '../components/TexturedBackground';
import { colors, fonts } from '../theme';

// Your backend has no "update deck" endpoint - only create / delete /
// add-card / remove-card. So an "edit" here is really: create a new
// deck with the new name/visibility, copy every card over, then delete
// the old one. If copying a card fails partway, we stop and leave both
// decks in place rather than risk losing cards - the person can check
// what happened rather than silently losing data.
export default function EditDeckScreen({ route, navigation }) {
  const { deck } = route.params;
  const { token, userId } = useAuth();
  const [name, setName] = useState(deck.deckName);
  const [isPublic, setIsPublic] = useState(!!deck.public);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a deck name.');
      return;
    }

    const nameChanged = trimmedName !== deck.deckName;
    const visibilityChanged = isPublic !== !!deck.public;

    if (!nameChanged && !visibilityChanged) {
      navigation.goBack();
      return;
    }

    setSaving(true);
    try {
      const createResult = await createDeck(token, userId, trimmedName, isPublic);
      if (createResult.error) {
        Alert.alert('Could not save changes', createResult.error);
        return;
      }

      const newDeckID = createResult.deckID;
      const cardsToCopy = deck.cards || [];

      for (const c of cardsToCopy) {
        const addResult = await addCardToDeck(token, newDeckID, c.cardId, 1);
        if (addResult.error) {
          Alert.alert(
            'Only partially saved',
            `Your updated deck "${trimmedName}" was created, but not every card copied over ` +
              `(${addResult.error}). Your original deck "${deck.deckName}" was kept as-is - ` +
              `please check both decks and finish moving cards manually if needed.`
          );
          navigation.navigate('Decks');
          return;
        }
      }

      const removeResult = await removeDeck(token, deck.deckID);
      if (removeResult.error) {
        Alert.alert(
          'Mostly done',
          `Created "${trimmedName}" with all your cards, but couldn't remove the old ` +
            `"${deck.deckName}" automatically (${removeResult.error}). You may want to delete it manually.`
        );
      }

      navigation.navigate('Decks');
    } catch (e) {
      Alert.alert('Could not save changes', e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <TexturedBackground style={styles.container}>
      <Text style={styles.label}>Deck Name</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Deck name"
        placeholderTextColor={colors.parchmentDim}
        editable={!saving}
      />

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Public Deck</Text>
          <Text style={styles.hint}>Public decks are visible to other users via Browse.</Text>
        </View>
        <Switch
          value={isPublic}
          onValueChange={setIsPublic}
          disabled={saving}
          trackColor={{ false: colors.border, true: colors.purple }}
          thumbColor={colors.gold}
        />
      </View>

      <Text style={styles.note}>
        Note: since there's no direct "edit" on the server, saving creates a new deck with your
        changes, copies all {(deck.cards || []).length} card
        {(deck.cards || []).length === 1 ? '' : 's'} over, then removes the old deck.
      </Text>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
        {saving ? (
          <ActivityIndicator color={colors.parchment} />
        ) : (
          <Text style={styles.saveBtnText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { color: colors.gold, fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.parchment,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  hint: { color: colors.parchmentDim, fontSize: 12, marginTop: 2 },
  note: {
    color: colors.parchmentDim,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 28,
    fontStyle: 'italic',
  },
  saveBtn: {
    backgroundColor: colors.purple,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnText: { color: colors.parchment, fontWeight: '600', fontSize: 15 },
});
