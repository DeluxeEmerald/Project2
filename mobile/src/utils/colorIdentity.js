// Reuses the same W/U/B/R/G/colorless palette as the mana pips, so a
// card's color-identity stripe, frame, and mana cost all agree visually.
const COLOR_HEX = {
  W: '#f8f4e3',
  U: '#2467a6',
  B: '#2b2530',
  R: '#c0392b',
  G: '#2e7d4f',
};

const COLORLESS = '#7d7488';

// Returns one hex color per entry in the card's `colors` array, in order -
// used to render a stacked multi-segment stripe for multicolor cards.
// Colorless/land cards (empty array) get a single neutral segment.
export function getColorStripe(colorsArray) {
  if (!colorsArray || colorsArray.length === 0) return [COLORLESS];
  return colorsArray.map((c) => COLOR_HEX[c] || COLORLESS);
}

// A single representative color for things that can only show one
// (e.g. a border) - first color in the identity, or neutral if colorless
// or if for some reason more than 2 colors (looks muddy as a single
// accent, colorless reads more cleanly for 3+ color cards).
export function getPrimaryColor(colorsArray) {
  if (!colorsArray || colorsArray.length === 0) return COLORLESS;
  if (colorsArray.length > 2) return COLORLESS;
  return COLOR_HEX[colorsArray[0]] || COLORLESS;
}
