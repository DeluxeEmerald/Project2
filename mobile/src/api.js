import { API_BASE_URL } from './config';

// The exact error string the server returns when a JWT is expired/invalid
// (per every authenticated endpoint's shared check). AuthContext
// registers itself here so a stuck expired-token session automatically
// signs out and drops back to Login, instead of leaving the user seeing
// this error scattered across whichever screens happen to make a call.
const JWT_INVALID_MESSAGE = 'The JWT is no longer valid';
let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function post(path, body) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new Error(
      `Could not reach the server at ${API_BASE_URL}. Check src/config.js and your network connection.`
    );
  }

  if (!response.ok) {
    throw new Error(`Server returned status ${response.status}`);
  }

  const data = await response.json();

  if (data && data.error === JWT_INVALID_MESSAGE && onUnauthorized) {
    onUnauthorized();
  }

  return data;
}

// { id, error }
export function registerUser(name, email, password) {
  return post('/api/register', { name, email, password });
}

// { accessToken, error }
export function loginUser(name, password) {
  return post('/api/login', { name, password });
}

// { results: [{ inventoryId, cardId, name, CardName, imageUrl, total }], error, jwtToken }
export function getInventory(jwtToken, userID) {
  return post('/api/getinventory', { jwtToken, userID });
}

// Like getInventory, but returns the FULL card object per item
// (manaCost, typeLine, oracleText, power/toughness, rarity, set, etc.)
// plus supports an optional search term / comBan / gamechanger filters.
// { results: [{ inventoryId, total, CardName, id, name, manaCost, cmc,
//               colors, colorIdentity, typeLine, oracleText, power,
//               toughness, loyalty, rarity, setName, setCode, artist,
//               imageUrl, comBan, gamechanger }], error, jwtToken }
//
// Note: /api/removeinventory floors a card's `total` at 0 but never
// deletes the underlying document, so the server keeps returning
// zero-count entries forever. We filter those out here, at the source,
// so nothing downstream (the inventory list, deck-card picker, account
// stats) has to remember to do it separately.
//
// Also coerces `total` to a real number - some documents in the
// Inventory collection have it stored as a string (a data issue in
// MongoDB, not something this app wrote), which otherwise causes
// silent string concatenation instead of addition wherever totals are
// summed (e.g. "1" + "1" = "11" instead of 2).
export async function searchInventory(jwtToken, userID, search) {
  const result = await post('/api/searchinventory', { jwtToken, userID, search });
  if (result.results) {
    result.results = result.results
      .map((c) => ({ ...c, total: Number(c.total) || 0 }))
      .filter((c) => c.total > 0);
  }
  return result;
}

// { error, jwtToken } - adds to an existing entry or creates a new one
export function addInventory(jwtToken, userID, cardID, total, CardName) {
  return post('/api/addinventory', { jwtToken, userID, cardID, total, CardName });
}

// { error, jwtToken } - subtracts `total`; entry floors at 0, doesn't go negative
export function removeInventory(jwtToken, userID, cardID, total) {
  return post('/api/removeinventory', { jwtToken, userID, cardID, total });
}

// Searches the full MTGSET card catalog (not just what you own).
// { results: [ full card objects ], error, jwtToken }
export function searchCards(jwtToken, search) {
  return post('/api/searchcards', { jwtToken, search });
}

// ---------------------------------------------------------------------
// Decks
// ---------------------------------------------------------------------

// { results: [{ id, deckID, deckName, cards: [{cardId, quantity}], public }], error, jwtToken }
export function getDecks(jwtToken, userId, search) {
  return post('/api/getdecks', { jwtToken, userId, search });
}

// { id, deckID, error, jwtToken }
export function createDeck(jwtToken, userId, deckName, isPublic) {
  return post('/api/createdeck', { jwtToken, userId, deckName, public: isPublic });
}

// { error, jwtToken }
export function removeDeck(jwtToken, deckId) {
  return post('/api/removedeck', { jwtToken, deckId });
}

// { error, jwtToken }
export function addCardToDeck(jwtToken, deckId, cardId, quantity) {
  return post('/api/addcardtodeck', { jwtToken, deckId, cardId, quantity });
}

// { error, jwtToken }
export function removeCardFromDeck(jwtToken, deckId, cardId, quantity) {
  return post('/api/removecardfromdeck', { jwtToken, deckId, cardId, quantity });
}

// Searches public deck *covers* across ALL users - only { id, name, userID }
// per result, no card list or owner username. See PublicDeckDetailScreen
// for how the actual card list gets assembled from other endpoints.
// { results: [{ id, name, userID }], error, jwtToken }
export function searchPublicDecks(jwtToken, search) {
  return post('/api/searchpublicdecks', { jwtToken, search });
}
