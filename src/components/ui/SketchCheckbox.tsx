import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DesignSystem } from '@/constants/design-system';

interface SketchCheckboxProps {
  checked: boolean;
  onPress: () => void;
}

export function SketchCheckbox({ checked, onPress }: SketchCheckboxProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={10}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      {checked && (
        <Ionicons name="checkmark" size={18} color={DesignSystem.colors.ink} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: DesignSystem.colors.ink,
    borderRadius: 4,
    backgroundColor: DesignSystem.colors.paperCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
