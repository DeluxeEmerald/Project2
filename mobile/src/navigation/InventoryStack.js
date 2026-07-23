import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InventoryScreen from '../screens/InventoryScreen';
import CardDetailScreen from '../screens/CardDetailScreen';
import { stackScreenOptions } from '../theme';

const Stack = createNativeStackNavigator();

export default function InventoryStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="Inventory" component={InventoryScreen} options={{ title: 'My Cards' }} />
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
