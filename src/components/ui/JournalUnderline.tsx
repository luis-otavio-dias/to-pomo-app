import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

/** Traço com folga para não cortar as extremidades no Android. */
export function JournalUnderline() {
  return (
    <View style={styles.container} pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={128} height={16} viewBox="0 0 128 16">
        <Path d="M 4 7 Q 33 1 64 7 T 124 6" stroke="#1d35d8" strokeWidth={3} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 128, height: 16, flexShrink: 0 },
});
