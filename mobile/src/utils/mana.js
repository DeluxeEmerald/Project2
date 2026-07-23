// Parses a mana cost string like "{2}{U}{U}" into individual symbol
// tokens ["2", "U", "U"], and maps each symbol to a pip color/label
// for rendering as small colored circles instead of raw text.

export function parseManaCost(manaCost) {
  if (!manaCost) return [];
  const matches = manaCost.match(/\{([^}]+)\}/g);
  if (!matches) return [];
  return matches.map((m) => m.slice(1, -1));
}

const SYMBOL_STYLES = {
  W: { bg: '#f8f4e3', text: '#8a7a3d' },
  U: { bg: '#2467a6', text: '#ffffff' },
  B: { bg: '#2b2530', text: '#e0d8c0' },
  R: { bg: '#c0392b', text: '#ffffff' },
  G: { bg: '#2e7d4f', text: '#ffffff' },
  C: { bg: '#9aa0a6', text: '#ffffff' }, // colorless
  X: { bg: '#5a5266', text: '#efe6d8' },
};

const DEFAULT_STYLE = { bg: '#5a5266', text: '#efe6d8' };

export function getManaSymbolStyle(symbol) {
  const key = symbol.toUpperCase();
  if (SYMBOL_STYLES[key]) return SYMBOL_STYLES[key];
  if (!isNaN(Number(symbol))) return { bg: '#5a5266', text: '#efe6d8' }; // generic numeric cost
  return DEFAULT_STYLE; // hybrid / phyrexian / anything unusual - shown with raw label
}
