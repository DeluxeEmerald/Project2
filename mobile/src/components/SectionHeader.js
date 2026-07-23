import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '../theme';

export default function SectionHeader({ title }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.ornamentRow}>
        <View style={styles.line} />
        <Text style={styles.diamond}>{'\u2726'}</Text>
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  title: {
    fontFamily: fonts.display,
    fontSize: 19,
    fontWeight: '600',
    color: colors.gold,
  },
  ornamentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    width: 90,
  },
  line: { flex: 1, height: 1, backgroundColor: colors.gold, opacity: 0.4 },
  diamond: { color: colors.gold, fontSize: 10, marginHorizontal: 6, opacity: 0.8 },
});
