import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/design-system';

interface WobblyCircleProps extends TouchableOpacityProps {
  children: React.ReactNode;
  selected?: boolean;
}

export function WobblyCircle({ style, children, selected, ...props }: WobblyCircleProps) {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.selected, style]}
      accessibilityRole="button"
      hitSlop={6}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.paperCard,
    borderWidth: 2,
    borderColor: DesignSystem.colors.ink,
    borderTopLeftRadius: 54,
    borderTopRightRadius: 46,
    borderBottomLeftRadius: 52,
    borderBottomRightRadius: 48,
    boxShadow: `2px 2px 0px ${DesignSystem.colors.ink}99`,
    shadowColor: DesignSystem.colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: DesignSystem.colors.inkBlue,
    boxShadow: `2px 2px 0px ${DesignSystem.colors.inkBlue}99`,
    shadowColor: DesignSystem.colors.inkBlue,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
  },
});
