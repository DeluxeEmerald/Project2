import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { getRarityColor } from '../utils/rarity';
import { parseManaCost, getManaSymbolStyle } from '../utils/mana';
import { getPrimaryColor } from '../utils/colorIdentity';
import { colors, fonts } from '../theme';
import TexturedBackground from '../components/TexturedBackground';
import FlipZoomImage from '../components/FlipZoomImage';
import FoilShimmer from '../components/FoilShimmer';

function Row({ label, value, valueColor }) {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, valueColor ? { color: valueColor } : null]}>
        {String(value)}
      </Text>
    </View>
  );
}

function ManaPips({ manaCost }) {
  const symbols = parseManaCost(manaCost);
  if (symbols.length === 0) return null;

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>Mana Cost</Text>
      <View style={styles.pipRow}>
        {symbols.map((symbol, i) => {
          const style = getManaSymbolStyle(symbol);
          return (
            <View key={i} style={[styles.pip, { backgroundColor: style.bg }]}>
              <Text style={[styles.pipText, { color: style.text }]}>{symbol}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function CardDetailScreen({ route }) {
  const { card } = route.params;

  const displayName = card.CardName || card.name;
  const powerToughness =
    card.power != null && card.toughness != null ? `${card.power} / ${card.toughness}` : null;

  const isMythic = (card.rarity || '').toLowerCase() === 'mythic';
  const numColors = (card.colors || []).length;
  // Colorless/land/artifact and 3+ color cards keep the app's usual gold
  // frame; single/two-color cards get a frame in their own color instead.
  const frameColor =
    numColors >= 1 && numColors <= 2 ? getPrimaryColor(card.colors) : colors.gold;
  const showTint = numColors >= 1 && numColors <= 2;
  const tintColor = getPrimaryColor(card.colors);

  return (
    <TexturedBackground>
      {showTint ? (
        <View pointerEvents="none" style={[styles.colorTint, { backgroundColor: tintColor }]} />
      ) : null}

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {card.imageUrl ? (
          <View style={[styles.imageFrame, { borderColor: frameColor }]}>
            <FlipZoomImage uri={card.imageUrl} style={styles.imageTouchArea} />
            {isMythic ? <FoilShimmer size={260} /> : null}
          </View>
        ) : null}

        <Text style={styles.name}>{displayName}</Text>
        <View style={styles.subLine}>
          {card.total != null ? <Text style={styles.owned}>{'\u2713'} In your inventory</Text> : null}
          {card.setCode ? (
            <View style={styles.setBadge}>
              <Text style={styles.setBadgeText}>{card.setCode.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.divider} />

        <ManaPips manaCost={card.manaCost} />
        <Row label="CMC" value={card.cmc} />
        <Row label="Type" value={card.typeLine} />
        <Row label="Power / Toughness" value={powerToughness} />
        <Row label="Loyalty" value={card.loyalty} />
        <Row label="Rarity" value={card.rarity} valueColor={getRarityColor(card.rarity)} />
        <Row label="Set" value={card.setName ? `${card.setName} (${card.setCode || ''})` : null} />
        <Row label="Artist" value={card.artist} />

        {card.oracleText ? (
          <>
            <View style={styles.divider} />
            <Text style={styles.oracleText}>{card.oracleText}</Text>
          </>
        ) : null}
      </ScrollView>
    </TexturedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, alignItems: 'center' },
  colorTint: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.06,
  },
  imageFrame: {
    width: '80%',
    aspectRatio: 5 / 7,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.surface,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  imageTouchArea: { width: '100%', height: '100%' },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    color: colors.gold,
    textAlign: 'center',
  },
  subLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  owned: { fontSize: 15, color: colors.parchmentDim, marginRight: 8 },
  setBadge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  setBadgeText: { fontSize: 10, fontWeight: '700', color: colors.parchmentDim, letterSpacing: 0.5 },
  divider: { height: 1, backgroundColor: colors.border, width: '100%', marginVertical: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 6,
  },
  rowLabel: { color: colors.parchmentDim, fontSize: 14 },
  rowValue: {
    color: colors.parchment,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: 12,
  },
  pipRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1, marginLeft: 12 },
  pip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pipText: { fontSize: 11, fontWeight: '700' },
  oracleText: { fontSize: 15, lineHeight: 22, color: colors.parchment, width: '100%' },
});
