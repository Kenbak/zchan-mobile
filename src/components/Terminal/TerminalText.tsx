import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface TerminalTextProps {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  onPress?: () => void;
}

export const TerminalText: React.FC<TerminalTextProps> = ({
  children,
  style,
  onPress
}) => {
  return (
    <Text
      style={[styles.text, style]}
      onPress={onPress}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontFamily: 'monospace', // Will be 'VT323' when we add the font
    fontSize: 16,
    color: COLORS.primary,
    lineHeight: 24,
  },
});
