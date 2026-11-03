import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  ImageBackground,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurTargetView, BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DesignSystem } from '@/constants/design-system';
import { AdvancedOptionsCard } from './AdvancedOptionsCard';
import { JournalCard } from '@/components/ui/JournalCard';
import { JournalSurface } from '@/components/ui/JournalSurface';
import { JournalUnderline } from '@/components/ui/JournalUnderline';
import { WobblyCircle } from '@/components/ui/WobblyCircle';
import { useTasks } from './task-context';
import type { FocusMinutes, Subtask } from './task-types';
import DateInput from './DateInput';
import { requestFocusPermission } from '@/features/focus/focus-notifications';

const ink = DesignSystem.colors.ink;
const paper = DesignSystem.colors.paper;
const hand = DesignSystem.fonts.sketchBold;

export interface NewTaskScreenProps {
  onClose?: () => void;
}

export default function NewTaskScreen({ onClose }: NewTaskScreenProps) {
  const { lists, draft, setDraft, draftSaved, saveDraft, createTask, createList, loading, error, clearError, retryLoad } = useTasks();
  const [optionsOpen, setOptionsOpen] = useState(true);
  const [showDate, setShowDate] = useState(false);
  const [newList, setNewList] = useState('');
  const [showNewList, setShowNewList] = useState(false);
  const [subtaskText, setSubtaskText] = useState('');
  const listInputRef = useRef<TextInput>(null);
  const blurTarget = useRef<View>(null);
  const [saving, setSaving] = useState(false);
  const [alertError, setAlertError] = useState('');

  const dueLabel = useMemo(() => draft.dueAt ? new Date(draft.dueAt).toLocaleDateString('pt-BR') : 'Sem prazo', [draft.dueAt]);
  const update = (patch: Partial<typeof draft>) => { clearError?.(); setDraft(patch); };
  const addSubtask = () => {
    const title = subtaskText.trim();
    if (!title) return;
    const item: Subtask = { id: `subtask-${Date.now()}`, title, completed: false };
    update({ subtasks: [...draft.subtasks, item] });
    setSubtaskText('');
  };
  const submit = async () => {
    if (!draft.title.trim() || loading || saving) return;
    setSaving(true);
    try {
      const task = await createTask();
      if (task) onClose?.();
    } finally { setSaving(false); }
  };
  const close = async () => {
    if (saving) return;
    setSaving(true);
    try { await saveDraft(); onClose?.(); }
    catch { /* O erro de gravação é mostrado pelo provedor. */ }
    finally { setSaving(false); }
  };
  const addList = async () => {
    const name = newList.trim();
    if (!name || saving) return;
    setSaving(true);
    try {
      if (await createList(name)) {
        setNewList('');
        setShowNewList(false);
      }
    }
    finally { setSaving(false); }
  };
  const changeAlert = async (enabled: boolean) => {
    if (enabled && !await requestFocusPermission()) {
      setAlertError('Permissão para alertas não concedida.');
      return;
    }
    setAlertError('');
    update({ alertEnabled: enabled });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ImageBackground source={require('@/assets/images/bullet-journal-paper.png')} resizeMode="repeat" imageStyle={{ width: '100%', height: '100%' }} style={styles.flex}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <BlurTargetView ref={blurTarget} style={styles.flex}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, overlayStyles.content]}>
            <JournalCard>
              <View style={[styles.rowBetween, { flexWrap: 'wrap' }]}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={focusStyles.headingDot} /><Text style={styles.label}>NOME DA TAREFA</Text></View><Text style={styles.hint}>página de planejamento</Text></View>
              <View style={nameStyles.field}><View pointerEvents="none" style={nameStyles.rules}><View style={nameStyles.rule} /><View style={nameStyles.rule} /></View><TextInput accessibilityLabel="Nome da tarefa" maxLength={200} value={draft.title} onChangeText={(title) => update({ title })} placeholder="O que você vai realizar hoje?" placeholderTextColor="#99948b" multiline style={[styles.titleInput, nameStyles.input]} /></View>
            </JournalCard>
  
            <Text style={styles.sectionTitle}>Selecionar Lista:</Text>
            <View style={styles.chips}>{lists.map((list) => <Pressable key={list.id} onPress={() => update({ listId: list.id })} style={[styles.chip, draft.listId === list.id && styles.chipSelected]}><Text style={[styles.chipText, draft.listId === list.id && styles.chipTextSelected]}>#{list.name}</Text>{draft.listId === list.id && <Text style={styles.check}>✓</Text>}</Pressable>)}
              <Pressable accessibilityRole="button" accessibilityState={{ expanded: showNewList }} onPress={() => { setShowNewList(true); listInputRef.current?.focus(); }} style={[styles.chip, styles.dashed]}><Text style={styles.chipText}>+ Nova lista</Text></Pressable>
            </View>
            {showNewList && <TextInput autoFocus accessibilityLabel="Nome da nova lista" ref={listInputRef} value={newList} onChangeText={setNewList} onSubmitEditing={addList} placeholder="Nome da nova lista" placeholderTextColor="#99948b" style={styles.listInput} returnKeyType="done" />}
  
            <JournalCard contentStyle={focusStyles.card}>
              <View style={focusStyles.heading}>
                <View style={focusStyles.headingDot} />
                <Text style={focusStyles.title}>Duração do Bloco de Foco</Text>
              </View>
              <View style={focusStyles.display}>
                <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={focusStyles.ruler}>
                  {[[2, 12], [1, 6], [1.5, 8], [1, 6], [2.5, 14], [1, 6], [1.5, 8], [1, 6], [2, 12]].map(([width, height], index) =>
                    <View key={index} style={{ width, height, backgroundColor: index === 4 ? '#1d35d8' : '#141414' }} />
                  )}
                </View>
                <View style={focusStyles.timerBox}><Text style={focusStyles.timer}>{String(draft.focusMinutes).padStart(2, '0')}:00</Text></View>
              </View>
              <View style={focusStyles.durationRow}>{([25, 30, 45] as FocusMinutes[]).map((minutes) => <Pressable
                key={minutes}
                accessibilityRole="button"
                accessibilityState={{ selected: draft.focusMinutes === minutes }}
                onPress={() => update({ focusMinutes: minutes })}
                style={({ pressed }) => [focusStyles.duration, pressed && focusStyles.pressed]}
              ><JournalSurface fill={draft.focusMinutes === minutes ? '#141414' : paper} style={focusStyles.durationSurface}><Text style={[focusStyles.durationText, draft.focusMinutes === minutes && focusStyles.durationTextSelected]}>{draft.focusMinutes === minutes ? '✓ ' : ''}{minutes} min</Text></JournalSurface></Pressable>)}</View>
              <View style={focusStyles.note}>
                <Ionicons name="information-circle" size={14} color="#1d35d8" />
                <Text style={focusStyles.noteText}>Os intervalos de descanso seguem as preferências gerais do aplicativo.</Text>
              </View>
            </JournalCard>

            <AdvancedOptionsCard expanded={optionsOpen} onToggle={() => setOptionsOpen((open) => !open)}>
              {optionsOpen && <View style={styles.optionsBody}>
                <View style={styles.rowBetween}><View style={{ flex: 1 }}><Text style={styles.label}>SESSÕES ESTIMADAS</Text><Text style={styles.small}>Planejamento de blocos de foco</Text></View><View style={styles.stepper}><Pressable accessibilityLabel="Diminuir sessões" onPress={() => update({ targetSessions: Math.max(1, draft.targetSessions - 1) })} style={styles.circleButton}><Text>−</Text></Pressable><Text style={styles.counter}>{draft.targetSessions}</Text><Pressable accessibilityLabel="Aumentar sessões" onPress={() => update({ targetSessions: Math.min(16, draft.targetSessions + 1) })} style={styles.circleButton}><Text>+</Text></Pressable></View></View>
                <View style={styles.rule} />
                <View style={styles.rowBetween}><View style={{ flex: 1 }}><Text style={styles.label}>PRAZO</Text><Text style={styles.due}>{dueLabel}</Text></View><Pressable onPress={() => setShowDate(true)} style={styles.outlineButton}><Text>{draft.dueAt ? 'Alterar' : 'Definir prazo'}</Text></Pressable></View>
                {draft.dueAt && <Pressable onPress={() => update({ dueAt: undefined })}><Text style={styles.remove}>Remover prazo</Text></Pressable>}
                {showDate && (Platform.OS === 'web'
                  ? <DateInput value={draft.dueAt?.slice(0, 10) ?? ''} onChange={(value) => update({ dueAt: value ? new Date(value + 'T12:00:00').toISOString() : undefined })} />
                  : <DateTimePicker value={draft.dueAt ? new Date(draft.dueAt) : new Date()} mode="date" onChange={(_: unknown, date?: Date) => { setShowDate(false); if (date) update({ dueAt: date.toISOString() }); }} />)}
                <View style={styles.rule} />
                <Text style={styles.label}>PRIORIDADE</Text><View style={styles.priorityRow}>{([['Baixa', 'low'], ['Média', 'medium'], ['★ Alta', 'high']] as const).map(([text, priority]) => <Pressable key={text} onPress={() => update({ priority })} style={[styles.priority, draft.priority === priority && styles.prioritySelected]}><Text>{text}</Text></Pressable>)}</View>
                <View style={styles.rule} />
                <Text style={styles.label}>SUBTAREFAS</Text>{draft.subtasks.map((subtask) => <View key={subtask.id} style={styles.subtask}><Pressable onPress={() => update({ subtasks: draft.subtasks.map((item) => item.id === subtask.id ? { ...item, completed: !item.completed } : item) })} style={[styles.checkbox, subtask.completed && styles.checkboxChecked]}><Text>{subtask.completed ? '✓' : ''}</Text></Pressable><Text style={styles.subtaskText}>{subtask.title}</Text></View>)}
                <View style={styles.addSubtask}><TextInput value={subtaskText} onChangeText={setSubtaskText} onSubmitEditing={addSubtask} placeholder="Nova subtarefa..." placeholderTextColor="#99948b" style={styles.subtaskInput} /><Pressable onPress={addSubtask}><Text style={styles.addText}>+ Adicionar</Text></Pressable></View>
                <View style={styles.rule} /><Text style={styles.label}>ANOTAÇÕES LIVRES</Text><TextInput multiline numberOfLines={3} value={draft.notes} onChangeText={(notes) => update({ notes })} placeholder="Escreva observações, referências ou anotações livres..." placeholderTextColor="#99948b" style={styles.notes} />
                <View style={styles.alertRow}><View style={{ flex: 1 }}><Text style={styles.label}>Alerta ao terminar</Text><Text style={styles.small}>{Platform.OS === 'web' ? 'Alerta nativo indisponível na web' : 'Notificação ao final do bloco'}</Text></View><Switch disabled={Platform.OS === 'web'} value={draft.alertEnabled} onValueChange={(alertEnabled) => { void changeAlert(alertEnabled); }} trackColor={{ false: '#c6c0b7', true: ink }} thumbColor={draft.alertEnabled ? DesignSystem.colors.inkHighlight : '#fff'} /></View>
                {alertError ? <Text style={styles.error}>{alertError}</Text> : null}
              </View>}
            </AdvancedOptionsCard>
            {error && <Pressable onPress={() => { if (error.includes('carregar')) void retryLoad(); else clearError(); }}><Text style={styles.error}>{error}</Text></Pressable>}
          </ScrollView>
        </BlurTargetView>
        <View style={[styles.header, overlayStyles.header]}>
          <BlurView
            pointerEvents="none"
            intensity={20}
            tint="light"
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
          <ImageBackground
            source={require('@/assets/images/bullet-journal-paper.png')}
            resizeMode="repeat"
            imageStyle={{ width: '100%', height: '100%' }}
            style={overlayStyles.paperTexture}
          />
          <WobblyCircle accessibilityLabel="Fechar" accessibilityRole="button" onPress={close} style={styles.close}>
            <Ionicons name="close" size={24} color="#141414" />
          </WobblyCircle>
          <View style={styles.headerTitle}>
            <Text style={styles.title}>Nova Tarefa</Text>
            <JournalUnderline />
          </View>
          <View style={overlayStyles.badgeSlot}><Text style={styles.badge}>Ficha #01</Text></View>
        </View>
        <View style={[styles.footer, overlayStyles.footer]}>
          <BlurView
            pointerEvents="none"
            intensity={20}
            tint="light"
            blurTarget={blurTarget}
            blurMethod="dimezisBlurViewSdk31Plus"
            style={StyleSheet.absoluteFill}
          />
          <ImageBackground
            source={require('@/assets/images/bullet-journal-paper.png')}
            resizeMode="repeat"
            imageStyle={{ width: '100%', height: '100%' }}
            style={overlayStyles.paperTexture}
          />
          <Pressable
            accessibilityRole="button"
            disabled={loading || saving || !draft.title.trim()}
            onPress={submit}
            style={({ pressed }) => [styles.submit, overlayStyles.submit, pressed && overlayStyles.submitPressed]}
          >
            {[0, 1].map((side) => <View pointerEvents="none" key={side} style={[overlayStyles.tape, side === 0 ? { left: 4 } : { right: 4 }]}>
              {Array.from({ length: 12 }, (_, i) => <View key={i} style={[overlayStyles.tapeStripe, { top: i * 6 - 3 }]} />)}
            </View>)}
            <Text style={[styles.submitText, overlayStyles.submitText]}>{loading || saving ? 'Salvando…' : 'Adicionar tarefa'}</Text>
            <Text style={overlayStyles.submitCheck}>✓</Text>
          </Pressable>
          <Pressable accessibilityRole="button" disabled={saving} onPress={() => { void saveDraft().catch(() => {}); }} style={overlayStyles.draftStatus}>
            <View style={[overlayStyles.statusDot, !draftSaved && overlayStyles.unsavedDot]} />
            <Text style={[styles.saved, overlayStyles.saved]}>{draftSaved ? 'Rascunho salvo' : 'Salvar rascunho'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: paper }, flex: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 8 }, close: { width: 44, height: 44, borderColor: '#141414', borderWidth: 2.2, backgroundColor: '#fffefb', boxShadow: '2px 2.5px 0px #141414' }, closeText: { fontSize: 30, lineHeight: 32, color: ink }, headerTitle: { flex: 1, minWidth: 0, alignItems: 'center', paddingHorizontal: 4, paddingVertical: 4 }, title: { width: '100%', textAlign: 'center', fontFamily: hand, fontSize: 34, lineHeight: 42, paddingHorizontal: 4, includeFontPadding: false, color: '#141414' }, badge: { minWidth: 64, flexShrink: 0, textAlign: 'center', backgroundColor: '#fef3c7', borderWidth: 2, borderColor: '#141414', borderRadius: 15, paddingHorizontal: 8, paddingVertical: 2, fontFamily: hand, fontSize: 12, lineHeight: 16, color: '#52525b', transform: [{ rotate: '1deg' }] }, content: { padding: 16, paddingTop: 2, gap: 16, paddingBottom: 196 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 }, label: { fontFamily: DesignSystem.fonts.sansBold, fontSize: 11, letterSpacing: 0.5, color: ink }, hint: { fontFamily: hand, color: DesignSystem.colors.inkMuted, fontSize: 13 }, titleInput: { minHeight: 74, fontFamily: hand, fontSize: 25, lineHeight: 33, color: ink, padding: 0, marginTop: 4, borderBottomWidth: 1, borderBottomColor: '#ddd4c6' }, sectionTitle: { fontFamily: hand, fontSize: 23, fontWeight: '700', color: ink }, chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 }, chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 2, borderColor: ink, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: DesignSystem.colors.paperCard, shadowColor: ink, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.35, shadowRadius: 0 }, chipSelected: { backgroundColor: ink }, dashed: { borderStyle: 'dashed', backgroundColor: 'transparent' }, chipText: { fontFamily: hand, fontSize: 17, color: ink }, chipTextSelected: { color: '#fff3a4' }, check: { color: '#fff' }, listInput: { borderBottomWidth: 1, borderBottomColor: '#bdb5aa', fontFamily: hand, fontSize: 17, minHeight: 44, paddingVertical: 4, color: ink }, headingLine: { borderBottomWidth: 2, borderBottomColor: '#d7d0c4', borderStyle: 'dashed', paddingBottom: 8 }, timerBox: { alignSelf: 'center', backgroundColor: DesignSystem.colors.inkHighlight, borderWidth: 2, borderColor: ink, borderRadius: 9, paddingHorizontal: 22, paddingVertical: 8, marginVertical: 12, shadowColor: ink, shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.45, shadowRadius: 0 }, timer: { fontFamily: hand, fontSize: 43, lineHeight: 46, fontWeight: '700', color: ink }, durationRow: { flexDirection: 'row', gap: 8 }, duration: { flex: 1, borderWidth: 2, borderColor: ink, borderRadius: 18, alignItems: 'center', paddingVertical: 7 }, durationSelected: { backgroundColor: ink }, durationText: { fontFamily: hand, fontSize: 17, color: ink }, durationTextSelected: { color: '#fff3a4' }, note: { marginTop: 12, fontFamily: DesignSystem.fonts.sans, fontSize: 11, color: DesignSystem.colors.inkMuted }, optionsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#f4efe6', borderBottomWidth: 2, borderBottomColor: ink }, configure: { fontFamily: DesignSystem.fonts.sansBold, fontSize: 11, color: DesignSystem.colors.inkMuted }, optionsBody: { paddingHorizontal: 14, paddingBottom: 18, gap: 12 }, small: { fontFamily: DesignSystem.fonts.sans, color: DesignSystem.colors.inkMuted, fontSize: 12, marginTop: 2 }, stepper: { flexDirection: 'row', alignItems: 'center', gap: 8 }, circleButton: { width: 32, height: 32, borderWidth: 2, borderColor: ink, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: paper }, counter: { width: 22, textAlign: 'center', fontFamily: hand, fontSize: 24, color: ink }, rule: { borderBottomWidth: 1, borderBottomColor: '#d6cec2', borderStyle: 'dashed' }, due: { fontFamily: hand, fontSize: 18, color: DesignSystem.colors.inkMuted, marginTop: 2 }, outlineButton: { borderWidth: 2, borderColor: ink, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: paper }, remove: { color: DesignSystem.colors.inkBlue, fontFamily: DesignSystem.fonts.sansBold, fontSize: 11, alignSelf: 'flex-end' }, priorityRow: { flexDirection: 'row', gap: 8, marginTop: 7 }, priority: { flex: 1, alignItems: 'center', borderWidth: 2, borderColor: ink, borderRadius: 8, paddingVertical: 6, backgroundColor: paper }, prioritySelected: { backgroundColor: DesignSystem.colors.inkHighlight }, subtask: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 }, checkbox: { width: 21, height: 21, borderWidth: 2, borderColor: ink, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }, checkboxChecked: { backgroundColor: ink }, subtaskText: { flex: 1, fontFamily: hand, fontSize: 18, color: ink }, addSubtask: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 9 }, subtaskInput: { flex: 1, borderBottomWidth: 1, borderBottomColor: '#c7beb1', fontFamily: hand, fontSize: 17, paddingVertical: 2, color: ink }, addText: { color: DesignSystem.colors.inkBlue, fontFamily: DesignSystem.fonts.sansBold, fontSize: 12 }, notes: { minHeight: 80, marginTop: 6, borderWidth: 1, borderColor: '#c7beb1', borderRadius: 8, padding: 8, fontFamily: hand, fontSize: 18, lineHeight: 27, color: ink, backgroundColor: paper }, alertRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, error: { color: '#b3261e', fontFamily: DesignSystem.fonts.sansBold, fontSize: 13 }, footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 10, borderTopWidth: 2, borderTopColor: '#d0c7bb', borderStyle: 'dashed', backgroundColor: paper }, submit: { borderWidth: 2, borderColor: ink, borderRadius: 11, backgroundColor: ink, paddingVertical: 13, alignItems: 'center', shadowColor: ink, shadowOffset: { width: 3, height: 4 }, shadowOpacity: 0.65, shadowRadius: 0 }, disabled: { opacity: 0.5 }, submitText: { color: '#fff', fontFamily: hand, fontSize: 23 }, saved: { alignSelf: 'center', marginTop: 5, fontFamily: hand, fontSize: 16, color: ink },
});

const overlayStyles = StyleSheet.create({
  content: { paddingTop: 104 },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 2,
    height: 100, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  paperTexture: { ...StyleSheet.absoluteFill, opacity: 0.25, pointerEvents: 'none' },
  badgeSlot: { minWidth: 64, alignItems: 'flex-end', justifyContent: 'center' },
  footer: {
    zIndex: 2, minHeight: 132, padding: 16, paddingBottom: 16,
    backgroundColor: 'transparent',
    gap: 8, borderTopColor: 'rgba(156,163,175,0.6)',
  },
  submit: {
    minHeight: 62, flexDirection: 'row', justifyContent: 'center', gap: 10,
    backgroundColor: '#141414', borderColor: '#141414', borderWidth: 2.5,
    borderTopLeftRadius: 18, borderTopRightRadius: 24,
    borderBottomLeftRadius: 23, borderBottomRightRadius: 19,
    paddingVertical: 14, paddingHorizontal: 20,
    boxShadow: '4px 5px 0px #141414',
    shadowColor: '#141414', shadowOpacity: 1, shadowOffset: { width: 4, height: 5 },
  },
  submitPressed: { transform: [{ translateX: 2 }, { translateY: 2 }], boxShadow: '1px 1px 0px #141414', shadowOffset: { width: 1, height: 1 } },
  submitText: { fontSize: 24, lineHeight: 29, letterSpacing: 0.6 },
  submitCheck: { fontFamily: hand, fontSize: 24, lineHeight: 29, color: '#fde047' },
  tape: { position: 'absolute', top: 0, bottom: 0, width: 6, overflow: 'hidden' },
  tapeStripe: { position: 'absolute', width: 16, height: 3, left: -5, backgroundColor: 'rgba(255,255,255,0.2)', transform: [{ rotate: '-45deg' }] },
  draftStatus: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 2 },
  statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#141414' },
  unsavedDot: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#141414' },
  saved: { marginTop: 0, fontSize: 16, lineHeight: 20, color: '#141414' },
});

const focusStyles = StyleSheet.create({
  card: { gap: 12, minHeight: 280 },
  heading: {
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 8,
    borderBottomWidth: 2, borderBottomColor: '#d1d5db', borderStyle: 'dashed',
  },
  headingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1d35d8' },
  title: { flexShrink: 1, fontFamily: hand, fontSize: 24, lineHeight: 32, color: '#141414' },
  display: { alignItems: 'center', paddingVertical: 4 },
  ruler: {
    width: '100%', maxWidth: 280, height: 14, paddingHorizontal: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    borderBottomWidth: 2, borderBottomColor: '#141414', marginBottom: 6,
  },
  timerBox: {
    backgroundColor: '#fef08a', borderColor: '#141414', borderWidth: 2,
    borderTopLeftRadius: 14, borderTopRightRadius: 22,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 16,
    paddingHorizontal: 24, paddingVertical: 8, transform: [{ rotate: '-0.5deg' }],
    boxShadow: '2px 2.5px 0px #141414', shadowColor: '#141414',
    shadowOffset: { width: 2, height: 2.5 }, shadowOpacity: 1, shadowRadius: 0,
  },
  timer: { fontFamily: hand, fontSize: 44, lineHeight: 54, letterSpacing: 2.2, color: '#141414' },
  durationRow: { flexDirection: 'row', gap: 8, paddingTop: 2 },
  duration: { flex: 1, minHeight: 48 },
  durationSurface: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  durationText: { fontFamily: hand, fontSize: 18, lineHeight: 24, color: '#141414' },
  durationTextSelected: { color: '#fde047' },
  pressed: { transform: [{ translateY: 2 }] },
  note: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, borderTopWidth: 1, borderTopColor: '#e5e7eb', paddingTop: 8 },
  noteText: { flex: 1, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 11.5, lineHeight: 14.5, color: '#3d3d3d' },
});

const nameStyles = StyleSheet.create({
  field: { position: 'relative', minHeight: 76, marginTop: 4 },
  rules: { ...StyleSheet.absoluteFill, paddingTop: 35, justifyContent: 'space-between', paddingBottom: 5 },
  rule: { height: 1, backgroundColor: '#ddd4c6' },
  input: { borderBottomWidth: 0, marginTop: 0, paddingTop: 0, paddingBottom: 5, textAlignVertical: 'top', lineHeight: 35 },
});
