import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import InventoryStack from './InventoryStack';
import DecksStack from './DecksStack';
import BrowseStack from './BrowseStack';
import AccountScreen from '../screens/AccountScreen';
import { useDeckCount } from '../context/DeckCountContext';
import { selection } from '../utils/haptics';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

// Outline icon when inactive, filled when the tab is focused - standard
// iOS tab bar convention.
const TAB_ICONS = {
  InventoryTab: { outline: 'albums-outline', filled: 'albums' },
  DecksTab: { outline: 'layers-outline', filled: 'layers' },
  BrowseTab: { outline: 'search-outline', filled: 'search' },
  AccountTab: { outline: 'person-circle-outline', filled: 'person-circle' },
};

function TabIcon({ routeName, focused, color, size }) {
  const icons = TAB_ICONS[routeName];
  const name = icons ? (focused ? icons.filled : icons.outline) : 'ellipse-outline';
  return <Ionicons name={name} size={size} color={color} />;
}

export default function MainTabs() {
  const { deckCount } = useDeckCount();

  return (
    <Tab.Navigator
      screenListeners={{
        tabPress: () => selection(),
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.parchmentDim,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarBadgeStyle: {
          backgroundColor: colors.gold,
          color: colors.background,
          fontWeight: '700',
          fontSize: 10,
        },
        tabBarIcon: ({ focused, color, size }) => (
          <TabIcon routeName={route.name} focused={focused} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="InventoryTab" component={InventoryStack} options={{ title: 'Inventory' }} />
      <Tab.Screen
        name="DecksTab"
        component={DecksStack}
        options={{
          title: 'Decks',
          tabBarBadge: deckCount > 0 ? deckCount : undefined,
        }}
      />
      <Tab.Screen name="BrowseTab" component={BrowseStack} options={{ title: 'Browse' }} />
      <Tab.Screen name="AccountTab" component={AccountScreen} options={{ title: 'Account' }} />
    </Tab.Navigator>
  );
}
