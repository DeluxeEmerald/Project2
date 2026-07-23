import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getRarityColor } from '../utils/rarity';
import { getTypeIcon } from '../utils/cardType';
import { getColorStripe } from '../utils/colorIdentity';
import FoilShimmer from './FoilShimmer';
import { colors } from '../theme';

const THUMB_WIDTH = 50;
const THUMB_HEIGHT = 70;

// `card` needs at minimum: name/CardName, imageUrl, rarity, typeLine,
// colors, setCode. `right` is an optional element rendered on the far
// right (a quantity badge, +/- buttons, an "Add" button, etc.) so this
// one row can serve the inventory list, the deck list, and browse.
export default function CardRow({ card, onPress, right }) {
  const displayName = card.CardName || card.name;
  const isMythic = (card.rarity || '').toLowerCase() === 'mythic';
  const stripeColors = getColorStripe(card.colors);

  return (
    <TouchableOpacity style={styles.row} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.stripe}>
        {stripeColors.map((c, i) => (
          <View key={i} style={[styles.stripeSegment, { backgroundColor: c }]} />
        ))}
      </View>

      <View style={styles.thumbShadowWrap}>
        <View style={styles.thumbClip}>
          {card.imageUrl ? (
            <Image
              source={{ uri: card.imageUrl }}
              style={[styles.thumb, { borderColor: getRarityColor(card.rarity) }]}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[
                styles.thumb,
                styles.thumbPlaceholder,
                { borderColor: getRarityColor(card.rarity) },
              ]}
            />
          )}
          {isMythic ? <FoilShimmer size={THUMB_WIDTH} /> : null}
        </View>
      </View>

      <View style={styles.rowText}>
        <View style={styles.nameLine}>
          <View style={[styles.rarityDot, { backgroundColor: getRarityColor(card.rarity) }]} />
          {getTypeIcon(card.typeLine) ? (
            <Text style={styles.typeIcon}>{getTypeIcon(card.typeLine)}</Text>
          ) : null}
          <Text style={styles.cardName} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
        {card.setCode ? (
          <View style={styles.setBadge}>
            <Text style={styles.setBadgeText}>{card.setCode.toUpperCase()}</Text>
          </View>
        ) : null}
      </View>

      {right ? <View style={styles.right}>{right}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  stripe: {
    width: 4,
    height: THUMB_HEIGHT,
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  stripeSegment: { flex: 1 },
  thumbShadowWrap: {
    width: THUMB_WIDTH,
    height: THUMB_HEIGHT,
    marginRight: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbClip: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },
  thumbPlaceholder: { backgroundColor: colors.surface },
  rowText: { flex: 1, marginRight: 8 },
  nameLine: { flexDirection: 'row', alignItems: 'center' },
  rarityDot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  typeIcon: { fontSize: 13, color: colors.gold, marginRight: 6, opacity: 0.85 },
  cardName: { fontSize: 16, fontWeight: '600', color: colors.parchment, flexShrink: 1 },
  setBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginTop: 4,
    marginLeft: 16,
  },
  setBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.parchmentDim,
    letterSpacing: 0.5,
  },
  right: { flexDirection: 'row', alignItems: 'center' },
});
