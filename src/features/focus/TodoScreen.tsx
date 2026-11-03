import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, FlatList, ImageBackground, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Href, router } from 'expo-router';
import { BlurTargetView, BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '@/features/tasks/task-context';
import { Task } from '@/features/tasks/task-types';
import { DesignSystem } from '@/constants/design-system';
import { JournalCard } from '@/components/ui/JournalCard';
import { JournalSurface } from '@/components/ui/JournalSurface';
import { JournalUnderline } from '@/components/ui/JournalUnderline';
import { WobblyCircle } from '@/components/ui/WobblyCircle';
import { SketchCheckbox } from '@/components/ui/SketchCheckbox';

const fmt = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')}:${(Math.max(0, seconds) % 60).toString().padStart(2, '0')}`;

function Sessions({ task, active }: { task: Task; active: boolean }) {
  return <View style={styles.sessions} accessibilityLabel={`${task.completedSessions} de ${task.targetSessions} sessões`}>
    {Array.from({ length: Math.min(16, task.targetSessions) }).map((_, i) => <View key={i} style={[styles.sessionDot, i < task.completedSessions && styles.sessionDone, active && i === task.completedSessions && styles.sessionActive]} />)}
  </View>;
}

export default function TodoScreen() {
  const state = useTasks();
  const [listOverride, setListOverride] = useState<string | null>(null);
  const selectedListId = listOverride ?? state.tasks.find((task) => task.id === state.selectedTaskId)?.listId ?? state.lists[0]?.id;
  const list = useMemo(() => state.lists.find((item) => item.id === selectedListId) ?? state.lists[0], [state.lists, selectedListId]);
  const visibleTasks = useMemo(() => state.tasks.filter((task) => !selectedListId || task.listId === selectedListId), [state.tasks, selectedListId]);
  const focusedTask = state.focusSession ? state.tasks.find((task) => task.id === state.focusSession?.taskId) : undefined;
  const selectedTask = state.tasks.find((task) => task.id === state.selectedTaskId);
  const activeTask = state.focusSession && ['running', 'paused'].includes(state.focusSession.status)
    ? focusedTask : selectedTask ?? focusedTask;
  const [now, setNow] = useState(0);
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const blurTarget = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    void AccessibilityInfo.isReduceTransparencyEnabled().then(setReduceTransparency);
    const subscription = AccessibilityInfo.addEventListener('reduceTransparencyChanged', setReduceTransparency);
    return () => subscription.remove();
  }, []);
  useEffect(() => {
    if (state.focusSession?.status !== 'running' || !state.focusSession.endsAt) return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [state.focusSession?.status, state.focusSession?.endsAt]);
  const remaining = (session: typeof state.focusSession | undefined, fallback: number) => session?.status === 'running' && session.endsAt && now ? Math.max(0, Math.ceil((Date.parse(session.endsAt) - now) / 1000)) : session?.remainingSeconds ?? fallback;
  const ask = (title: string, message: string, onConfirm: () => void) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') { if (window.confirm(`${title}\n\n${message}`)) onConfirm(); return; }
    Alert.alert(title, message, [{ text: 'Cancelar', style: 'cancel' }, { text: 'Confirmar', style: 'destructive', onPress: onConfirm }]);
  };

  const complete = (task: Task) => {
    if (activeTask?.id === task.id && ['running', 'paused'].includes(state.focusSession?.status ?? '')) {
      const finish = () => { void state.completeTaskAndFinish(task.id); };
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const choice = window.prompt('Concluir tarefa: 1 = encerrar bloco, 2 = continuar foco. Cancelar mantém a tarefa.');
        if (choice === '1') finish();
        if (choice === '2') void state.toggleTask(task.id);
        return;
      }
      Alert.alert('Concluir tarefa', 'O que deseja fazer com o bloco de foco?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar foco', onPress: () => state.toggleTask(task.id) },
        { text: 'Encerrar bloco', style: 'destructive', onPress: finish },
      ]);
      return;
    }
    state.toggleTask(task.id);
  };

  const select = (id: string) => {
    if (state.focusSession && state.focusSession.taskId !== id && ['running', 'paused'].includes(state.focusSession.status)) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') { if (window.confirm('Sessão em andamento\n\nEncerrar e trocar de tarefa?')) state.selectTask(id, 'finish'); return; }
      Alert.alert('Sessão em andamento', 'Trocar de tarefa?', [
        { text: 'Manter sessão', onPress: () => state.selectTask(id, 'keep') },
        { text: 'Encerrar e trocar', style: 'destructive', onPress: () => state.selectTask(id, 'finish') },
        { text: 'Cancelar', style: 'cancel' },
      ]);
    } else state.selectTask(id);
  };

  const renderTask = ({ item }: { item: Task }) => {
    const active = activeTask?.id === item.id;
    const session = active && state.focusSession?.taskId === item.id ? state.focusSession : undefined;
    if (active) return <JournalCard contentStyle={styles.focusCard}>
      <View style={styles.cardTop}><View style={styles.titleBlock}><SketchCheckbox checked={!!item.completedAt} onPress={() => complete(item)} /><View style={styles.flex}><Text style={styles.focusTitle}>{item.title}</Text><Text style={styles.meta}>{item.focusMinutes} min · {item.completedSessions}/{item.targetSessions} sessões</Text></View></View><Sessions task={item} active /></View>
      <View style={styles.timerWrap}><View style={styles.highlight} /><Text style={styles.timer}>{fmt(remaining(session, item.focusMinutes * 60))}</Text><Text style={styles.meta}>restantes de {item.focusMinutes}:00</Text></View>
      <Text style={styles.status}><View style={[styles.statusDot, session?.status === 'running' ? styles.running : styles.paused]} /> {session?.status === 'running' ? 'Em andamento' : session?.status === 'paused' ? 'Pausado' : session?.status === 'completed' ? 'Concluído' : 'Pronto para iniciar'}</Text>
      <View style={styles.controls}><WobblyCircle accessibilityLabel="Reiniciar bloco" style={styles.round} onPress={() => { if (session?.status === 'running') ask('Reiniciar bloco?', 'O tempo atual será perdido.', state.resetFocus); else state.resetFocus(); }}><Ionicons name="refresh" size={18} color={DesignSystem.colors.ink} /></WobblyCircle><Pressable accessibilityLabel={session?.status === 'running' ? 'Pausar foco' : 'Iniciar foco'} accessibilityRole="button" style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]} onPress={() => session?.status === 'running' ? state.pauseFocus() : session?.status === 'paused' ? state.resumeFocus() : state.startFocus(item.id)}><JournalSurface fill="#141414" style={styles.mainButtonSurface}><Ionicons name={session?.status === 'running' ? 'pause' : 'play'} size={16} color={DesignSystem.colors.paperCard} /><Text style={styles.mainText}>{session?.status === 'running' ? 'Pausar' : session?.status === 'paused' ? 'Retomar' : 'Iniciar foco'}</Text></JournalSurface></Pressable><WobblyCircle accessibilityLabel="Alternar alerta" style={[styles.round, item.alertEnabled && styles.alertOn]} onPress={() => { if (Platform.OS === 'web') window.alert('Alerta nativo indisponível na web.'); else void state.setAlertEnabled(item.id, !item.alertEnabled); }}><Ionicons name={item.alertEnabled ? 'notifications' : 'notifications-off-outline'} size={18} color={item.alertEnabled ? DesignSystem.colors.inkBlue : DesignSystem.colors.ink} /></WobblyCircle></View>
      {session && ['running', 'paused'].includes(session.status) && <Pressable accessibilityRole="button" accessibilityLabel="Concluir bloco de foco" onPress={() => ask('Concluir bloco?', 'O bloco será contabilizado como concluído.', () => { void state.finishFocus(); })}><Text style={styles.link}>✓ Concluir bloco</Text></Pressable>}
      <View style={styles.footer}><Pressable onPress={() => state.adjustDuration(item.id)} disabled={session?.status === 'running'}><Text style={[styles.link, session?.status === 'running' && styles.disabled]}>⚙ Ajustar duração</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Excluir tarefa" onPress={() => ask('Excluir tarefa?', 'A sessão será encerrada e a tarefa removida.', () => { void state.deleteTask(item.id); })}><Text style={styles.link}>Excluir</Text></Pressable><Text style={styles.footerText}>pomodoro · {item.completedSessions + 1} de {item.targetSessions}</Text></View>
    </JournalCard>;
    return <JournalCard style={!!item.completedAt && styles.completed} contentStyle={styles.task}><View style={styles.taskLeft}><SketchCheckbox checked={!!item.completedAt} onPress={() => complete(item)} /><View style={styles.flex}><Text style={[styles.taskTitle, !!item.completedAt && styles.strike]} numberOfLines={2}>{item.title}</Text><Text style={styles.meta}>{item.priority === 'high' ? 'Prioridade alta · ' : ''}{item.focusMinutes}m · {item.completedSessions}/{item.targetSessions}</Text></View></View>{!item.completedAt && <View style={styles.taskActions}><WobblyCircle style={styles.smallRound} onPress={() => select(item.id)}><Ionicons name="play" size={13} color={DesignSystem.colors.ink} /></WobblyCircle><WobblyCircle accessibilityLabel="Excluir tarefa" style={styles.smallRound} onPress={() => ask('Excluir tarefa?', 'Esta tarefa será removida.', () => { void state.deleteTask(item.id); })}><Ionicons name="trash-outline" size={13} color={DesignSystem.colors.ink} /></WobblyCircle></View>}</JournalCard>;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.root}>
        <BlurTargetView ref={blurTarget} style={{ flex: 1 }}>
          <ImageBackground source={require('@/assets/images/bullet-journal-paper.png')} resizeMode="repeat" imageStyle={{ width: '100%', height: '100%' }} style={{ flex: 1 }}>
          <FlatList
            data={visibleTasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Nenhuma tarefa nesta lista</Text>
                <Text style={styles.meta}>Comece com uma pequena ação.</Text>
                <Pressable accessibilityRole="button" style={({ pressed }) => [styles.mainButton, pressed && styles.buttonPressed]} onPress={() => router.push('/new-task' as Href)}>
                  <JournalSurface fill="#141414" style={styles.mainButtonSurface}><Text style={styles.mainText}>Adicionar tarefa</Text></JournalSurface>
                </Pressable>
              </View>
            }
          />
          </ImageBackground>
        </BlurTargetView>
        <BlurView
          intensity={reduceTransparency ? 0 : 45}
          tint="light"
          blurTarget={blurTarget}
          blurMethod="dimezisBlurViewSdk31Plus"
          style={[styles.header, reduceTransparency && { backgroundColor: DesignSystem.colors.paper }]}
        >
          <Pressable accessibilityRole="button" accessibilityLabel="Selecionar lista" style={styles.menu} onPress={() => {
            const index = state.lists.findIndex((item) => item.id === selectedListId);
            const next = state.lists[(index + 1) % state.lists.length];
            if (next) setListOverride(next.id);
          }}>
            <Ionicons name="menu" size={25} color={DesignSystem.colors.ink} />
          </Pressable>
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>To Do <Text style={styles.blue}>{list?.name ?? 'List #1'}</Text>⌄</Text>
            <JournalUnderline />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Adicionar tarefa" style={styles.menu} onPress={() => router.push('/new-task' as Href)}>
            <Ionicons name="add" size={22} color={DesignSystem.colors.ink} />
          </Pressable>
        </BlurView>
        {state.loading && <Text style={styles.loading}>Carregando tarefas…</Text>}
        {state.error && <Pressable style={styles.error} onPress={() => { if (state.error?.includes('carregar')) void state.retryLoad(); else state.clearError(); }}><Text style={styles.errorText}>{state.error}</Text></Pressable>}
        {!state.loading && <WobblyCircle accessibilityLabel="Adicionar nova tarefa" style={styles.fab} onPress={() => router.push('/new-task' as Href)}>
          <Ionicons name="add" size={28} color={DesignSystem.colors.ink} />
        </WobblyCircle>}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: DesignSystem.colors.paper }, root: { flex: 1 }, loading: { position: 'absolute', top: 100, left: 20, zIndex: 10, color: DesignSystem.colors.ink }, header: { position: 'absolute', zIndex: 5, top: 0, left: 0, right: 0, height: 100, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', overflow: 'hidden', backgroundColor: 'rgba(250,246,238,0.55)' }, menu: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: DesignSystem.colors.ink, alignItems: 'center', justifyContent: 'center', backgroundColor: DesignSystem.colors.paperCard }, headerTitle: { alignItems: 'center', flex: 1, minWidth: 0, paddingHorizontal: 4, paddingVertical: 4 }, title: { width: '100%', textAlign: 'center', fontFamily: DesignSystem.fonts.sketchBold, fontSize: 28, lineHeight: 40, paddingHorizontal: 4, includeFontPadding: false, color: DesignSystem.colors.ink }, blue: { color: DesignSystem.colors.inkBlue }, content: { paddingTop: 110, paddingHorizontal: 16, paddingBottom: 100, gap: 14 }, task: { minHeight: 70, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, completed: { opacity: 0.65 }, taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }, flex: { flex: 1 }, taskTitle: { fontFamily: DesignSystem.fonts.sketchBold, fontSize: 22, lineHeight: 30, paddingVertical: 2, color: DesignSystem.colors.ink }, strike: { textDecorationLine: 'line-through', color: DesignSystem.colors.inkMuted }, meta: { fontFamily: DesignSystem.fonts.sans, color: DesignSystem.colors.inkMuted, fontSize: 11, marginTop: 2 }, taskActions: { flexDirection: 'row', alignItems: 'center', gap: 8 }, smallRound: { width: 34, height: 34 }, more: { fontWeight: '700', color: DesignSystem.colors.inkMuted }, focusCard: { padding: 16, gap: 12 }, cardTop: { flexDirection: 'column', gap: 8, borderBottomWidth: 1, borderStyle: 'dashed', borderColor: '#22202033', paddingBottom: 10 }, titleBlock: { flexDirection: 'row', gap: 10, flex: 1 }, focusTitle: { fontFamily: DesignSystem.fonts.sketchBold, fontSize: 27, lineHeight: 37, paddingVertical: 2, color: DesignSystem.colors.ink }, sessions: { flexDirection: 'row', gap: 4, paddingTop: 6 }, sessionDot: { width: 10, height: 10, borderRadius: 5, borderWidth: 1.5, borderColor: DesignSystem.colors.ink }, sessionDone: { backgroundColor: DesignSystem.colors.ink }, sessionActive: { borderColor: DesignSystem.colors.inkBlue, backgroundColor: '#DDE4FF' }, timerWrap: { alignItems: 'center', paddingVertical: 10 }, highlight: { position: 'absolute', top: 19, height: 58, left: 20, right: 20, backgroundColor: '#FEF08ACC', borderRadius: 8, transform: [{ rotate: '-1deg' }] }, timer: { fontFamily: DesignSystem.fonts.sketchBold, fontSize: 64, lineHeight: 82, paddingHorizontal: 6, letterSpacing: 2, color: DesignSystem.colors.ink }, status: { color: DesignSystem.colors.inkMuted, fontFamily: DesignSystem.fonts.sans, fontSize: 12 }, statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#8A8A8A' }, running: { backgroundColor: '#168347' }, paused: { backgroundColor: '#D28A00' }, controls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }, round: { width: 42, height: 42 }, alertOn: { backgroundColor: '#FFF0C2' }, mainButton: { minHeight: 50, flexShrink: 1 }, buttonPressed: { transform: [{ translateY: 2 }] }, mainButtonSurface: { minHeight: 50, paddingLeft: 18, paddingRight: 23, paddingTop: 6, paddingBottom: 12, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }, mainText: { color: DesignSystem.colors.paperCard, fontFamily: DesignSystem.fonts.sketchBold, fontSize: 21, lineHeight: 28, flexShrink: 1 }, footer: { borderTopWidth: 1, borderColor: '#2220201A', paddingTop: 9, flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' }, link: { color: DesignSystem.colors.inkBlue, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 12 }, disabled: { opacity: 0.5 }, footerText: { fontFamily: DesignSystem.fonts.hand, fontSize: 14, color: DesignSystem.colors.ink }, fab: { position: 'absolute', right: 22, bottom: 20, width: 58, height: 58, backgroundColor: DesignSystem.colors.paperCard }, empty: { alignItems: 'center', paddingTop: 180, gap: 12 }, emptyTitle: { textAlign: 'center', paddingHorizontal: 8, lineHeight: 38, fontFamily: DesignSystem.fonts.sketchBold, fontSize: 28, color: DesignSystem.colors.ink }, error: { position: 'absolute', top: 88, left: 20, right: 20, zIndex: 10, backgroundColor: '#F8D8D0', padding: 10, borderRadius: 8 }, errorText: { color: DesignSystem.colors.inkCoral, fontFamily: DesignSystem.fonts.sans, fontSize: 12 } });
