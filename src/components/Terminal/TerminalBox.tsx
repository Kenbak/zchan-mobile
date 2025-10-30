import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface TerminalBoxProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const TerminalBox: React.FC<TerminalBoxProps> = ({ children, style }) => {
  return (
    <View style={[styles.box, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    borderColor: COLORS.border,
    padding: 16,
    marginVertical: 12,
    backgroundColor: COLORS.bgLight,
    // Add glow effect (shadow on iOS/Android)
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10, // Android
  },
});
