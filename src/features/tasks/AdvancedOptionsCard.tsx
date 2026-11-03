import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';

import { SketchCard } from '@/components/ui/SketchCard';
import { DesignSystem } from '@/constants/design-system';

const tint = '#F4EFE6';

type Props = {
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/** Content-sized compact paper, matching the Expanded / Collapsed Figma family. */
export function AdvancedOptionsCard({ expanded, onToggle, children }: Props) {
  return (
    <SketchCard
      variant="compact"
      fill={expanded ? '#FFFDF9' : tint}
      headerTint={expanded ? { color: tint, height: 50 } : undefined}
      contentStyle={[styles.paper, expanded && styles.expanded]}
      testID="advanced-options-card"
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mais opções"
        accessibilityState={{ expanded }}
        onPress={onToggle}
        style={styles.header}
      >
        <Text style={styles.title}>Mais opções</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>AVANÇADO</Text></View>
        {expanded ? <Text style={styles.configure}>Configurar</Text> : null}
        <Image source={require('../../../assets/options-chevron.svg')}
          style={[styles.chevron, expanded && styles.chevronExpanded]} />
        {expanded ? <View style={styles.divider} /> : null}
      </Pressable>
      {expanded ? children : null}
    </SketchCard>
  );
}

const styles = StyleSheet.create({
  paper: { padding: 0, minHeight: 62 },
  expanded: { minHeight: 588 },
  header: { height: 62, position: 'relative' },
  title: { position: 'absolute', top: 12, left: 14, fontFamily: DesignSystem.fonts.sketchBold, fontSize: 22, lineHeight: 28, color: '#222020', includeFontPadding: false },
  badge: { position: 'absolute', left: 126, top: 17, width: 62, height: 18, borderWidth: 1.5, borderColor: '#222020', borderRadius: 9, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 9, lineHeight: 12, letterSpacing: 0.3, color: '#66615C', includeFontPadding: false },
  configure: { position: 'absolute', right: 26, top: 19, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 10, lineHeight: 14, color: '#66615C' },
  chevron: { position: 'absolute', right: 6, top: 21, width: 14, height: 10 },
  chevronExpanded: { transform: [{ rotate: '180deg' }] },
  divider: { position: 'absolute', left: 5, right: 5, top: 48, height: 2, backgroundColor: '#222020' },
});
