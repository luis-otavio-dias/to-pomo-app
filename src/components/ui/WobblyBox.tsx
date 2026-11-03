import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { DesignSystem } from '@/constants/design-system';

interface WobblyBoxProps extends ViewProps {
  selected?: boolean;
  children: React.ReactNode;
}

export function WobblyBox({ selected, style, children, ...props }: WobblyBoxProps) {
  return (
    <View
      style={[
        styles.container,
        selected && styles.selected,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.paperCard,
    borderWidth: 2,
    borderColor: DesignSystem.colors.ink,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 15,
    boxShadow: `2px 2px 0px ${DesignSystem.colors.ink}99`,
    shadowColor: DesignSystem.colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
    padding: 12,
  },
  selected: {
    borderWidth: 2.2,
    borderColor: DesignSystem.colors.inkBlue,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 17,
    borderBottomRightRadius: 15,
    boxShadow: `2px 2px 0px ${DesignSystem.colors.inkBlue}99`,
    shadowColor: DesignSystem.colors.inkBlue,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
    elevation: 3,
  },
});
