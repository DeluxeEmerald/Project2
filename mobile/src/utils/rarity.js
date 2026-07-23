// Standard MTG rarity color conventions.
const RARITY_COLORS = {
  common: '#c4c4c4',
  uncommon: '#8a9ba8',
  rare: '#c9a227',
  mythic: '#d8582b',
  'mythic rare': '#d8582b',
  special: '#7b3fa0',
  bonus: '#7b3fa0',
};

const DEFAULT_COLOR = '#999999';

export function getRarityColor(rarity) {
  if (!rarity) return DEFAULT_COLOR;
  return RARITY_COLORS[rarity.toLowerCase().trim()] || DEFAULT_COLOR;
}
