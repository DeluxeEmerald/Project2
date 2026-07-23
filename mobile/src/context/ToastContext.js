import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Animated, Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }
  const anim = useRef(new Animated.Value(0)).current;
  const hideTimeout = useRef(null);

  const showToast = useCallback(
    (message, type = 'success') => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);

      setToast({ message, type });
      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 8,
        tension: 60,
        useNativeDriver: true,
      }).start();

      hideTimeout.current = setTimeout(() => {
        Animated.timing(anim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToast(null));
      }, 2200);
    },
    [anim]
  );

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] });

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.wrap, { opacity: anim, transform: [{ translateY }] }]}
        >
          <View style={[styles.toast, toast.type === 'error' ? styles.error : styles.success]}>
            <Text style={styles.text}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  toast: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    borderWidth: 1,
    maxWidth: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  success: { backgroundColor: colors.surface, borderColor: colors.gold },
  error: { backgroundColor: colors.surface, borderColor: colors.danger },
  text: { color: colors.parchment, fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
