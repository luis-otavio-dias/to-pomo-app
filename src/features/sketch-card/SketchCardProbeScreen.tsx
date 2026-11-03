import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SketchFocusCard } from '@/features/focus/SketchFocusCard';
import { DesignSystem } from '@/constants/design-system';
import { SketchCardTokens } from '@/constants/sketch-card';

const longTitle = 'Revisar a identidade visual e organizar as referências';

/**
 * Development probe for the default card outline.
 *
 * The three instances share a 350-unit paper width. The first matches the
 * 350 × 321 reference, the second grows from a wrapping title, and the third
 * grows from extra content. Compare corners, the 2 px stroke, and the 3 × 4
 * offset shadow across all three.
 */
export default function SketchCardProbeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView horizontal contentContainerStyle={styles.row}>
        <View style={styles.case}>
          <Text style={styles.label}>Original · papel 350 × 321</Text>
          <SketchFocusCard
            testID="probe-original"
            title="Revisar o projeto"
            timer="30:00"
            style={styles.card}
          />
        </View>

        <View style={styles.case}>
          <Text style={styles.label}>Título de duas linhas · altura natural</Text>
          <SketchFocusCard testID="probe-two-lines" title={longTitle} timer="30:00" style={styles.card} />
        </View>

        <View style={styles.case}>
          <Text style={styles.label}>Conteúdo mais alto · subtarefas</Text>
          <SketchFocusCard testID="probe-tall" title={longTitle} timer="30:00" style={styles.card}>
            <View style={styles.subtasks}>
              <Text style={styles.subtasksLabel}>SUBTAREFAS</Text>
              {['Reunir referências', 'Comparar espaçamentos', 'Validar o contorno', 'Anotar resultados'].map(
                (item) => (
                  <View key={item} style={styles.subtaskRow}>
                    <View style={styles.subtaskDot} />
                    <Text style={styles.subtaskText}>{item}</Text>
                  </View>
                ),
              )}
            </View>
          </SketchFocusCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DesignSystem.colors.paper },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 28, padding: 24 },
  case: { width: 358, gap: 10 },
  label: {
    color: DesignSystem.colors.inkMuted,
    fontFamily: DesignSystem.fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  card: { width: 358 },
  subtasks: { gap: 6 },
  subtasksLabel: {
    color: SketchCardTokens.ink,
    fontFamily: DesignSystem.fonts.sansBold,
    fontSize: 11,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 24 },
  subtaskDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: SketchCardTokens.ink },
  subtaskText: {
    color: SketchCardTokens.ink,
    fontFamily: DesignSystem.fonts.hand,
    fontSize: 18,
  },
});
