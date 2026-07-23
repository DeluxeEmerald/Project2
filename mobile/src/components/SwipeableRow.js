import React, { useRef } from 'react';
import { Animated, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { colors } from '../theme';
import { selection, warning } from '../utils/haptics';

// Wraps any row with a swipe-left-to-reveal "Remove" action. Used for
// Inventory rows and Deck-card rows so removal doesn't rely solely on
// a visible button - a common native-feeling gesture on both.
export default function SwipeableRow({ children, onRemove, confirmLabel = 'Remove' }) {
  const swipeableRef = useRef(null);

  const renderRightActions = (progress, dragX) => {
    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    return (
      <TouchableOpacity
        style={styles.actionContainer}
        onPress={() => {
          warning();
          swipeableRef.current?.close();
          onRemove();
        }}
      >
        <Animated.View style={[styles.action, { transform: [{ translateX }] }]}>
          <Text style={styles.actionText}>{confirmLabel}</Text>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      rightThreshold={40}
      onSwipeableWillOpen={selection}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    width: 80,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  action: { alignItems: 'center', justifyContent: 'center' },
  actionText: { color: colors.parchment, fontWeight: '700', fontSize: 13 },
});
