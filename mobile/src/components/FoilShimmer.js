import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// A soft diagonal band of light sweeping across the card, looping with a
// pause in between - mimics how a foil card catches light when tilted.
// Purely decorative (pointerEvents: none) so it never blocks taps.
// `size` should roughly match the width of the container it's overlaid
// on, so the sweep distance and band width scale correctly whether it's
// a small list thumbnail or the large card-detail image.
export default function FoilShimmer({ size = 200 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.delay(1400),
        Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(200),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const sweep = size * 1.3;
  const bandWidth = Math.max(size * 0.45, 14);
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [-sweep, sweep] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.band,
        {
          width: bandWidth,
          marginLeft: -bandWidth / 2,
          transform: [{ translateX }, { rotate: '18deg' }],
        },
      ]}
    >
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255,255,255,0.0)',
          'rgba(255,255,255,0.4)',
          'rgba(255,223,150,0.35)',
          'rgba(255,255,255,0.0)',
          'transparent',
        ]}
        locations={[0, 0.35, 0.5, 0.55, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: 'absolute',
    top: -40,
    bottom: -40,
    left: '50%',
  },
});
