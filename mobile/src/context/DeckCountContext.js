import React, { createContext, useContext, useState } from 'react';

const DeckCountContext = createContext(null);

export function DeckCountProvider({ children }) {
  const [deckCount, setDeckCount] = useState(0);

  return (
    <DeckCountContext.Provider value={{ deckCount, setDeckCount }}>
      {children}
    </DeckCountContext.Provider>
  );
}

export function useDeckCount() {
  const ctx = useContext(DeckCountContext);
  if (!ctx) throw new Error('useDeckCount must be used within a DeckCountProvider');
  return ctx;
}
