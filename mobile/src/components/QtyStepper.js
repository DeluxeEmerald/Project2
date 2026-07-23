import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { tapLight } from '../utils/haptics';

export default function QtyStepper({ value, onIncrement, onDecrement, disabled }) {
  const handleDecrement = () => {
    tapLight();
    onDecrement();
  };

  const handleIncrement = () => {
    tapLight();
    onIncrement();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btn}
        onPress={handleDecrement}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.btnText}>{'\u2212'}</Text>
      </TouchableOpacity>
      <Text style={styles.value}>{value}</Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={handleIncrement}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={styles.btnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  btn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: colors.gold, fontSize: 15, fontWeight: '700', marginTop: -1 },
  value: {
    color: colors.gold,
    fontWeight: '700',
    fontSize: 14,
    minWidth: 22,
    textAlign: 'center',
  },
});
