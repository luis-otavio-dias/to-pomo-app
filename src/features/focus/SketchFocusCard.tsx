import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { SketchCard } from '@/components/ui/SketchCard';
import { DesignSystem } from '@/constants/design-system';
import { SketchCardTokens, type SketchCardVariant } from '@/constants/sketch-card';

export type FocusPlanSession = { label: string; status: string; state: 'completed' | 'active' | 'pending' };

export type SketchFocusCardProps = {
  headerTone?: 'paper' | 'beige';
  sessionPlan?: FocusPlanSession[];
  planSummary?: string;
  planNote?: string;
  title: string;
  timer: string;
  sessionLabel?: string;
  currentSession?: number;
  totalSessions?: number;
  showProgress?: boolean;
  running?: boolean;
  alertEnabled?: boolean;
  onToggleTimer?: () => void;
  onReset?: () => void;
  onToggleAlert?: () => void;
  variant?: SketchCardVariant;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  children?: ReactNode;
  testID?: string;
};

function DashedRule() {
  const [width, setWidth] = useState(306);
  return (
    <View style={styles.rule} onLayout={({ nativeEvent: { layout } }) => setWidth(layout.width)}>
      <View style={styles.ruleClip}>
        {/* Repeat the original asset without scaling the dash or its stroke. */}
        {Array.from({ length: Math.ceil(width / 306) }, (_, index) => (
          <Image key={index} source={require('@/assets/sketch-card/divider.svg')}
            style={[styles.ruleAsset, { left: index * 306 }]} accessible={false} />
        ))}
      </View>
    </View>
  );
}

/** Figma 2:93: 350 × 321 paper, with content-driven height and a rigid-corner profile. */
export function SketchFocusCard({
  title, timer, sessionLabel = 'SESSÃO DE FOCO', currentSession = 1, totalSessions = 4,
  showProgress = true, running = false, alertEnabled = true, onToggleTimer, onReset,
  onToggleAlert, variant = 'default', style, contentStyle, children, testID,
  headerTone = 'paper', sessionPlan, planSummary = '4 × 30 min', planNote = 'Pausas de 5 min entre os blocos.',
}: SketchFocusCardProps) {
  const [headerBottom, setHeaderBottom] = useState(70);
  const [actionsWidth, setActionsWidth] = useState(306);
  const sessions = Math.max(1, Math.floor(Number.isFinite(totalSessions) ? totalSessions : 4));
  const completed = Math.min(sessions, Math.max(0, Math.floor(Number.isFinite(currentSession) ? currentSession : 1)));

  return (
    <SketchCard variant={variant} style={style}
      headerTint={headerTone === 'beige' ? { color: '#F4EFE6', height: headerBottom } : undefined}
      contentStyle={[styles.content, sessionPlan && styles.expandedContent, contentStyle]} testID={testID}>
      <View style={styles.header} onLayout={({ nativeEvent: { layout } }) => setHeaderBottom(layout.y + layout.height + 16)}>
        <View style={styles.titleRow}>
          <Image source={require('@/assets/sketch-card/marker.svg')} style={styles.marker} accessible={false} />
          <Text style={styles.title}>{title}</Text>
        </View>
        {!sessionPlan && <Image source={require('@/assets/sketch-card/status.svg')} style={styles.headerDots} accessible={false} />}
      </View>
      <DashedRule />
      <View style={styles.timerBlock}>
        <View style={styles.highlight} />
        <Text style={styles.timer}>{timer}</Text>
        <Text style={styles.sessionLabel}>{sessionLabel}</Text>
      </View>
      <View onLayout={({ nativeEvent: { layout } }) => setActionsWidth(layout.width)}
        style={[styles.actions, actionsWidth < 270 && styles.narrowActions, actionsWidth < 236 && styles.wrappedActions]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Reiniciar sessão" onPress={onReset}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}>
          <Image source={require('@/assets/sketch-card/reset.svg')} style={styles.icon} accessible={false} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={running ? 'Pausar foco' : 'Iniciar foco'}
          accessibilityState={{ selected: running }} onPress={onToggleTimer}
          style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
          {running ? <Ionicons name="pause" size={16} color={SketchCardTokens.paper} /> :
            <Image source={require('@/assets/sketch-card/play.svg')} style={styles.playIcon} accessible={false} />}
          <Text style={styles.startText}>{running ? 'Pausar foco' : 'Iniciar foco'}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={alertEnabled ? 'Desativar alerta' : 'Ativar alerta'}
          accessibilityState={{ selected: alertEnabled }} onPress={onToggleAlert}
          style={({ pressed }) => [styles.circleButton, pressed && styles.pressed]}>
          {alertEnabled ? <Image source={require('@/assets/sketch-card/bell.svg')} style={styles.icon} accessible={false} /> :
            <Ionicons name="notifications-off-outline" size={20} color={SketchCardTokens.ink} />}
        </Pressable>
      </View>
      {children ? <View style={styles.extra}>{children}</View> : null}
      <DashedRule />
      {showProgress && (
        <View style={styles.footer}>
          <View style={styles.progress} accessible accessibilityLabel={`${completed} de ${sessions} sessões`}>
            {sessions === 4 && completed === 1 ? (
              <Image source={require('@/assets/sketch-card/sessions.svg')} style={styles.sessionsAsset} accessible={false} />
            ) : Array.from({ length: sessions }, (_, index) => (
              <View key={index} style={[styles.progressDot, index < completed && styles.progressDotDone]} />
            ))}
          </View>
          <Text style={styles.progressText}>{completed} de {sessions} sessões</Text>
        </View>
      )}
      {sessionPlan ? (
        <>
          <DashedRule />
          <View>
            <View style={styles.planHeading}>
              <Text style={styles.planTitle}>PLANO DE SESSÕES</Text>
              <Text style={styles.planSummary}>{planSummary}</Text>
            </View>
            <View style={styles.planRows}>
              {sessionPlan.map((session, index) => (
                <View key={index} style={styles.planRow}>
                  <View style={[styles.planDot, session.state === 'completed' && styles.planDone,
                    session.state === 'active' && styles.planActive]} />
                  <Text style={styles.planLabel}>{session.label}</Text>
                  <Text style={[styles.planStatus, session.state === 'active' && styles.planStatusActive]}>{session.status}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.planNote}>{planNote}</Text>
          </View>
        </>
      ) : null}
    </SketchCard>
  );
}

const styles = StyleSheet.create({
  expandedContent: { minHeight: 520, paddingBottom: 9 },
  planHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 18, gap: 8 },
  planTitle: { fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 11, lineHeight: 18, letterSpacing: 0.4, color: '#2339D6' },
  planSummary: { fontFamily: DesignSystem.fonts.hand, fontSize: 13, lineHeight: 18, color: SketchCardTokens.muted },
  planRows: { marginTop: 9 },
  planRow: { minHeight: 32, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  planDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: SketchCardTokens.ink, marginTop: 4 },
  planDone: { backgroundColor: SketchCardTokens.ink },
  planActive: { backgroundColor: '#2339D6', borderColor: '#2339D6' },
  planLabel: { flex: 1, fontFamily: DesignSystem.fonts.hand, fontSize: 15, lineHeight: 22, color: SketchCardTokens.ink },
  planStatus: { width: 78, textAlign: 'right', paddingTop: 3, fontFamily: DesignSystem.fonts.sans, fontSize: 10, lineHeight: 16, color: SketchCardTokens.muted },
  planStatusActive: { color: '#2339D6' },
  planNote: { marginTop: 7, fontFamily: DesignSystem.fonts.hand, fontSize: 12, lineHeight: 18, color: SketchCardTokens.muted },
  content: { minHeight: 321, padding: 22, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  titleRow: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  marker: { width: 8, height: 8 },
  title: { flex: 1, minWidth: 0, color: SketchCardTokens.ink, fontFamily: DesignSystem.fonts.sketchBold,
    fontSize: 26, lineHeight: 32, includeFontPadding: false },
  headerDots: { width: 28, height: 12 },
  rule: { height: 0, overflow: 'visible' },
  ruleClip: { position: 'absolute', top: -1, left: 0, right: 0, height: 1, overflow: 'hidden' },
  ruleAsset: { position: 'absolute', top: 0, width: 306, height: 1 },
  timerBlock: { minHeight: 95, alignItems: 'center', justifyContent: 'center', gap: 4 },
  highlight: { position: 'absolute', top: 10, left: 12, right: 12, height: 52,
    borderRadius: 6, backgroundColor: SketchCardTokens.highlight },
  timer: { alignSelf: 'stretch', color: SketchCardTokens.ink, fontFamily: DesignSystem.fonts.sketchBold,
    fontSize: 64, lineHeight: 68, textAlign: 'center', includeFontPadding: false },
  sessionLabel: { color: SketchCardTokens.muted, fontFamily: DesignSystem.fonts.hand,
    fontSize: 13, lineHeight: 18, textAlign: 'center', includeFontPadding: false },
  actions: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  narrowActions: { gap: 8 },
  wrappedActions: { flexWrap: 'wrap' },
  circleButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: SketchCardTokens.ink,
    backgroundColor: SketchCardTokens.paper, alignItems: 'center', justifyContent: 'center' },
  icon: { width: 20, height: 20 },
  playIcon: { width: 14, height: 16 },
  startButton: { minHeight: 52, width: 150, minWidth: 132, flexShrink: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 3, backgroundColor: SketchCardTokens.ink },
  pressed: { opacity: 0.75, transform: [{ translateY: 1 }] },
  startText: { width: 100, color: SketchCardTokens.paper, fontFamily: DesignSystem.fonts.sketchBold,
    fontSize: 24, lineHeight: 30, includeFontPadding: false },
  extra: { gap: 8 },
  footer: { minHeight: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  progress: { flexShrink: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 13 },
  sessionsAsset: { width: 72, height: 12 },
  progressDot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1.5, borderColor: SketchCardTokens.ink },
  progressDotDone: { backgroundColor: SketchCardTokens.ink },
  progressText: { width: 94, color: SketchCardTokens.muted, fontFamily: DesignSystem.fonts.hand,
    fontSize: 13, lineHeight: 18, includeFontPadding: false },
});
