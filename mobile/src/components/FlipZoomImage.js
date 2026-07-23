import React, { useRef, useState } from 'react';
import { Modal, Pressable, Animated, Image, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Tapping the card image plays a quick 3D flip-reveal (rotateY + scale)
// as a full-size version appears over a dark backdrop. Built entirely
// on React Native's built-in Animated API - no extra dependency.
export default function FlipZoomImage({ uri, style }) {
  const [visible, setVisible] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const open = () => {
    setVisible(true);
    flipAnim.setValue(0);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const close = () => {
    Animated.timing(flipAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setVisible(false));
  };

  const rotateY = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['90deg', '0deg'],
  });
  const scale = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });
  const opacity = flipAnim;

  return (
    <>
      <Pressable onPress={open} style={style}>
        <Image source={{ uri }} style={styles.thumbImage} resizeMode="contain" />
      </Pressable>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <Pressable style={styles.backdrop} onPress={close}>
          <Animated.View
            style={[
              styles.zoomFrame,
              {
                opacity,
                transform: [{ perspective: 800 }, { rotateY }, { scale }],
              },
            ]}
          >
            <Image source={{ uri }} style={styles.zoomImage} resizeMode="contain" />
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  thumbImage: { width: '100%', height: '100%', borderRadius: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomFrame: {
    width: SCREEN_WIDTH * 0.88,
    aspectRatio: 5 / 7,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gold,
    backgroundColor: colors.surface,
    padding: 8,
  },
  zoomImage: { width: '100%', height: '100%', borderRadius: 10 },
});
