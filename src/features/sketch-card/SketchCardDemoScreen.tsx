import { useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SketchCard } from '@/components/ui/SketchCard';
import { SketchFocusCard } from '@/features/focus/SketchFocusCard';
import { DesignSystem } from '@/constants/design-system';
import { SketchCardTokens } from '@/constants/sketch-card';

type Priority = 'Baixa' | 'Média' | 'Alta';
type DemoSubtask = { id: number; title: string; done: boolean };

const ink = SketchCardTokens.ink;

export default function SketchCardDemoScreen() {
  const [name, setName] = useState('Revisar Design System');
  const [focusRunning, setFocusRunning] = useState(false);
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [dueTomorrow, setDueTomorrow] = useState(false);
  const [priority, setPriority] = useState<Priority>('Média');
  const [subtasks, setSubtasks] = useState<DemoSubtask[]>([
    { id: 1, title: 'Reunir referências', done: true },
    { id: 2, title: 'Comparar espaçamentos', done: false },
  ]);
  const [nextSubtaskId, setNextSubtaskId] = useState(3);
  const [newSubtask, setNewSubtask] = useState('');
  const [notes, setNotes] = useState('');
  const [notesHeight, setNotesHeight] = useState(96);
  const webNotesHeight = Math.max(96, 20 + 25 * notes.split('\n').reduce(
    (lines, line) => lines + Math.max(1, Math.ceil(line.length / 25)), 0,
  ));

  const addSubtask = () => {
    const title = newSubtask.trim();
    if (!title) return;
    setSubtasks((items) => [...items, { id: nextSubtaskId, title, done: false }]);
    setNextSubtaskId((id) => id + 1);
    setNewSubtask('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ImageBackground
        source={require('@/assets/images/bullet-journal-paper.png')}
        resizeMode="repeat"
        style={styles.fill}
      >
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            testID="sketch-card-demo-scroll"
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.content}
          >
            <View style={styles.header}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => router.back()}
                style={styles.back}
              >
                <Ionicons name="arrow-back" size={20} color={ink} />
              </Pressable>
              <View style={styles.headerText}>
                <Text style={styles.title}>SketchCard</Text>
                <Text style={styles.subtitle}>Três formas do mesmo papel</Text>
              </View>
            </View>

            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Sessão de foco · padrão 350 × 321</Text>
              <SketchFocusCard
                testID="sketch-card-default"
                title="Revisar o projeto"
                timer="30:00"
                running={focusRunning}
                alertEnabled={alertEnabled}
                onToggleTimer={() => setFocusRunning((value) => !value)}
                onReset={() => setFocusRunning(false)}
                onToggleAlert={() => setAlertEnabled((value) => !value)}
              />
            </View>

            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Plano de sessões · cabeçalho bege</Text>
              <SketchFocusCard
                testID="sketch-card-beige-header"
                title="Revisar o projeto"
                timer="30:00"
                headerTone="beige"
                running={focusRunning}
                alertEnabled={alertEnabled}
                onToggleTimer={() => setFocusRunning((value) => !value)}
                onReset={() => setFocusRunning(false)}
                onToggleAlert={() => setAlertEnabled((value) => !value)}
                sessionPlan={[
                  { label: 'Sessão 1 · 30 min', status: 'Concluída', state: 'completed' },
                  { label: 'Sessão 2 · 30 min', status: 'Em andamento', state: 'active' },
                  { label: 'Sessão 3 · 30 min', status: 'A seguir', state: 'pending' },
                  { label: 'Sessão 4 · 30 min', status: 'Pendente', state: 'pending' },
                ]}
              />
            </View>

            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Card curto · compacto</Text>
              <SketchCard variant="compact" testID="sketch-card-compact" contentStyle={styles.shortContent}>
                <Text style={styles.fieldLabel}>NOME DA TAREFA</Text>
                <TextInput
                  accessibilityLabel="Nome da tarefa"
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome da tarefa"
                  placeholderTextColor="#69645C"
                  style={styles.nameInput}
                />
              </SketchCard>
            </View>

            <View style={styles.example}>
              <Text style={styles.exampleLabel}>Mais opções · expandido</Text>
              <SketchCard variant="expanded" testID="sketch-card-expanded" contentStyle={styles.optionsContent}>
                <Pressable
                  testID="sketch-card-options-toggle"
                  accessibilityRole="button"
                  accessibilityState={{ expanded: optionsOpen }}
                  onPress={() => setOptionsOpen((value) => !value)}
                  style={styles.optionsHeader}
                >
                  <Text style={styles.optionsTitle}>Mais opções</Text>
                  <View style={styles.optionsAction}>
                    <Text style={styles.optionsActionText}>{optionsOpen ? 'Recolher' : 'Expandir'}</Text>
                    <Ionicons name={optionsOpen ? 'chevron-up' : 'chevron-down'} size={16} color={ink} />
                  </View>
                </Pressable>

                {optionsOpen && (
                  <View style={styles.optionsBody}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailText}>
                        <Text style={styles.fieldLabel}>PRAZO</Text>
                        <Text style={styles.detailValue}>{dueTomorrow ? 'Amanhã' : 'Sem prazo'}</Text>
                      </View>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={dueTomorrow ? 'Remover prazo' : 'Definir prazo para amanhã'}
                        onPress={() => setDueTomorrow((value) => !value)}
                        style={styles.smallButton}
                      >
                        <Text style={styles.smallButtonText}>{dueTomorrow ? 'Remover' : 'Definir'}</Text>
                      </Pressable>
                    </View>

                    <View style={styles.rule} />
                    <Text style={styles.fieldLabel}>PRIORIDADE</Text>
                    <View style={styles.priorityRow}>
                      {(['Baixa', 'Média', 'Alta'] as const).map((item) => (
                        <Pressable
                          key={item}
                          accessibilityRole="button"
                          accessibilityState={{ selected: priority === item }}
                          onPress={() => setPriority(item)}
                          style={[styles.priorityButton, priority === item && styles.prioritySelected]}
                        >
                          <Text style={styles.priorityButtonText}>{item}</Text>
                        </Pressable>
                      ))}
                    </View>

                    <View style={styles.rule} />
                    <Text style={styles.fieldLabel}>SUBTAREFAS</Text>
                    {subtasks.map((item) => (
                      <View key={item.id} style={styles.subtaskRow}>
                        <Pressable
                          accessibilityRole="checkbox"
                          accessibilityLabel={item.title}
                          accessibilityState={{ checked: item.done }}
                          onPress={() => setSubtasks((items) => items.map((entry) =>
                            entry.id === item.id ? { ...entry, done: !entry.done } : entry,
                          ))}
                          style={[styles.smallCheckbox, item.done && styles.smallCheckboxDone]}
                        >
                          {item.done && <Ionicons name="checkmark" size={14} color={SketchCardTokens.paper} />}
                        </Pressable>
                        <Text style={[styles.subtaskText, item.done && styles.subtaskCompleted]}>{item.title}</Text>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel={`Remover ${item.title}`}
                          onPress={() => setSubtasks((items) => items.filter((entry) => entry.id !== item.id))}
                          hitSlop={8}
                          style={styles.removeButton}
                        >
                          <Ionicons name="close" size={18} color={ink} />
                        </Pressable>
                      </View>
                    ))}
                    <View style={styles.addRow}>
                      <TextInput
                        accessibilityLabel="Nova subtarefa"
                        value={newSubtask}
                        onChangeText={setNewSubtask}
                        onSubmitEditing={addSubtask}
                        returnKeyType="done"
                        placeholder="Nova subtarefa"
                        placeholderTextColor="#69645C"
                        style={styles.addInput}
                      />
                      <Pressable accessibilityRole="button" accessibilityLabel="Adicionar subtarefa" onPress={addSubtask} style={styles.addButton}>
                        <Ionicons name="add" size={20} color={ink} />
                      </Pressable>
                    </View>

                    <View style={styles.rule} />
                    <Text style={styles.fieldLabel}>ANOTAÇÕES</Text>
                    <TextInput
                      testID="sketch-card-notes"
                      accessibilityLabel="Anotações"
                      multiline
                      textAlignVertical="top"
                      value={notes}
                      onChangeText={setNotes}
                      onContentSizeChange={Platform.OS === 'web' ? undefined : ({ nativeEvent: { contentSize } }) => {
                        const nextHeight = Math.max(96, Math.ceil(contentSize.height));
                        setNotesHeight((previous) => Math.abs(previous - nextHeight) < 2 ? previous : nextHeight);
                      }}
                      placeholder="Escreva anotações em várias linhas..."
                      placeholderTextColor="#69645C"
                      style={[styles.notesInput, { height: Platform.OS === 'web' ? webNotesHeight : notesHeight }]}
                    />
                  </View>
                )}
              </SketchCard>
            </View>

            <Text style={styles.endNote}>Fim da demonstração · role para conferir a sombra do último card</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DesignSystem.colors.paper },
  fill: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 48, gap: 24 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  back: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  headerText: { flex: 1 },
  title: { color: ink, fontFamily: DesignSystem.fonts.sketchBold, fontSize: 34, lineHeight: 40 },
  subtitle: { color: DesignSystem.colors.inkMuted, fontFamily: DesignSystem.fonts.hand, fontSize: 16 },
  example: { gap: 8 },
  exampleLabel: { color: DesignSystem.colors.inkMuted, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 11, letterSpacing: 0.4 },
  shortContent: { gap: 7 },
  fieldLabel: { color: ink, fontFamily: DesignSystem.fonts.sansBold, fontSize: 11, letterSpacing: 0.5 },
  nameInput: { minHeight: 43, padding: 0, borderBottomWidth: 1, borderBottomColor: '#CFC6B8', color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 25 },
  optionsContent: { gap: 0 },
  optionsHeader: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 },
  optionsTitle: { flex: 1, color: ink, fontFamily: DesignSystem.fonts.sketchBold, fontSize: 25, lineHeight: 31 },
  optionsAction: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  optionsActionText: { color: ink, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 11 },
  optionsBody: { paddingTop: 14, gap: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { flex: 1 },
  detailValue: { color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 19 },
  smallButton: { minHeight: 36, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ink, borderRadius: 8 },
  smallButtonText: { color: ink, fontFamily: DesignSystem.fonts.sansSemiBold, fontSize: 12 },
  rule: { height: 1, backgroundColor: '#D9D0C2' },
  priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  priorityButton: { minHeight: 36, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: ink, borderRadius: 7 },
  prioritySelected: { backgroundColor: DesignSystem.colors.inkHighlight },
  priorityButtonText: { color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 17 },
  subtaskRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 32 },
  smallCheckbox: { width: 22, height: 22, borderWidth: 1.5, borderColor: ink, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  smallCheckboxDone: { backgroundColor: ink },
  subtaskText: { flex: 1, color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 18, lineHeight: 23 },
  subtaskCompleted: { textDecorationLine: 'line-through', color: DesignSystem.colors.inkMuted },
  removeButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addInput: { flex: 1, minWidth: 0, minHeight: 42, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: '#CFC6B8', color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 18 },
  addButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  notesInput: { padding: 10, borderWidth: 1, borderColor: '#CFC6B8', borderRadius: 8, color: ink, fontFamily: DesignSystem.fonts.hand, fontSize: 18, lineHeight: 25 },
  endNote: { color: DesignSystem.colors.inkMuted, fontFamily: DesignSystem.fonts.hand, fontSize: 15, textAlign: 'center', marginTop: 2 },
});
