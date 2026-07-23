import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme';

export default function SearchBar({ value, onChangeText, placeholder }) {
  return (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || 'Search...'}
      placeholderTextColor={colors.parchmentDim}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.parchment,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 12,
  },
});
