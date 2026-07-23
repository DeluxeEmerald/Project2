// Shared color/spacing tokens for the app's dark fantasy theme.
export const colors = {
  background: '#131022',      // deep indigo-black
  surface: '#1d1830',         // cards, inputs, rows
  surfaceAlt: '#241f3a',      // alternating rows / pressed states
  border: '#3a3157',
  gold: '#c9a227',            // primary accent - matches "rare" rarity color
  goldBright: '#e0bb3e',
  parchment: '#efe6d8',       // primary text on dark backgrounds
  parchmentDim: '#a89bc2',    // secondary text
  purple: '#7b4fc9',          // primary action / buttons
  purpleDim: '#5b3f8a',
  danger: '#9a3b3b',
  error: '#ff6b6b',
};

export const fonts = {
  // Georgia is a built-in serif on iOS; falls back to default serif elsewhere.
  display: 'Georgia',
};

// Shared header styling for every native-stack navigator in the app.
// Import this into any Stack.Navigator's screenOptions so headers never
// default back to a plain white bar.
export const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.gold,
  headerTitleStyle: { fontFamily: fonts.display, fontWeight: '700', color: colors.gold },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};
