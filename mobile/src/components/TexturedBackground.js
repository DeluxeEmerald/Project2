import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Subtle full-screen texture: two soft color glows in opposite corners
// plus a faint tiled glyph pattern, standing in for a card-back / parchment
// texture without needing an image asset. Wrap any screen's root View
// with this instead of a flat colors.background fill.
export default function TexturedBackground({ children, style }) {
  return (
    <View style={styles.base}>
      <View style={styles.glowPurple} pointerEvents="none" />
      <View style={styles.glowGold} pointerEvents="none" />

      <View style={styles.pattern} pointerEvents="none">
        {Array.from({ length: 16 }).map((_, r) => (
          <View key={r} style={styles.patternRow}>
            {Array.from({ length: 8 }).map((_, c) => (
              <Text key={c} style={styles.glyph}>
                {(r + c) % 2 === 0 ? '\u25C6' : '\u2726'}
              </Text>
            ))}
          </View>
        ))}
      </View>

      <View style={[styles.contentLayer, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
    overflow: 'hidden',
  },
  glowPurple: {
    position: 'absolute',
    top: -120,
    left: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.purple,
    opacity: 0.1,
  },
  glowGold: {
    position: 'absolute',
    bottom: -140,
    right: -110,
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: colors.gold,
    opacity: 0.06,
  },
  pattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
  },
  patternRow: { flexDirection: 'row', justifyContent: 'space-evenly' },
  glyph: { color: colors.gold, opacity: 0.045, fontSize: 15 },
  contentLayer: { flex: 1 },
});
