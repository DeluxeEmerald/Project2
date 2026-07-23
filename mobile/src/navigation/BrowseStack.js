import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BrowseScreen from '../screens/BrowseScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import { stackScreenOptions } from '../theme';

const Stack = createNativeStackNavigator();

export default function BrowseStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Browse" component={BrowseScreen} options={{ title: 'Browse Cards' }} />
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
