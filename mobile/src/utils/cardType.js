// Maps a card's typeLine (e.g. "Legendary Creature — Dragon God") to a
// small monochrome glyph for quick visual scanning in lists. Checked in
// priority order since a type line can contain multiple type words.
const TYPE_ICONS = [
  { match: /planeswalker/i, symbol: '\u269C' }, // fleur-de-lis
  { match: /battle/i, symbol: '\u2691' }, // flag
  { match: /creature/i, symbol: '\u2694' }, // crossed swords
  { match: /instant/i, symbol: '\u26A1' }, // lightning bolt
  { match: /sorcery/i, symbol: '\u2726' }, // four-pointed star
  { match: /artifact/i, symbol: '\u2699' }, // gear
  { match: /enchantment/i, symbol: '\u2727' }, // small sparkle
  { match: /land/i, symbol: '\u26F0' }, // mountain
];

export function getTypeIcon(typeLine) {
  if (!typeLine) return null;
  const found = TYPE_ICONS.find((entry) => entry.match.test(typeLine));
  return found ? found.symbol : null;
}
