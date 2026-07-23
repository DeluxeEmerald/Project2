import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DecksScreen from '../screens/DecksScreen';
import DeckDetailScreen from '../screens/DeckDetailScreen';
import EditDeckScreen from '../screens/EditDeckScreen';
import AddCardToDeckScreen from '../screens/AddCardToDeckScreen';
import CommunityDecksScreen from '../screens/CommunityDecksScreen';
import PublicDeckDetailScreen from '../screens/PublicDeckDetailScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import { stackScreenOptions } from '../theme';

const Stack = createNativeStackNavigator();

export default function DecksStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Decks" component={DecksScreen} options={{ title: 'My Decks' }} />
      <Stack.Screen
        name="DeckDetail"
        component={DeckDetailScreen}
        options={({ route }) => ({ title: route.params?.deck?.deckName || 'Deck' })}
      />
      <Stack.Screen
        name="EditDeck"
        component={EditDeckScreen}
        options={{ title: 'Edit Deck', presentation: 'modal' }}
      />
      <Stack.Screen
        name="AddCardToDeck"
        component={AddCardToDeckScreen}
        options={{ title: 'Add Card', presentation: 'modal' }}
      />
      <Stack.Screen
        name="CommunityDecks"
        component={CommunityDecksScreen}
        options={{ title: 'Community Decks' }}
      />
      <Stack.Screen
        name="PublicDeckDetail"
        component={PublicDeckDetailScreen}
        options={({ route }) => ({ title: route.params?.deckName || 'Deck' })}
      />
      <Stack.Screen
        name="CardDetail"
        component={CardDetailScreen}
        options={({ route }) => ({
          title: route.params?.card?.CardName || route.params?.card?.name || 'Card',
          animation: 'fade',
        })}
      />
    </Stack.Navigator>
  );
}
