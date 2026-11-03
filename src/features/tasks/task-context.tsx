import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { createDefaultState, loadState, makeDraft, PersistedState, saveDraft as persistDraft, saveState } from './task-repository';
import { FocusSession, Task, TaskDraft, TaskList } from './task-types';
import { areFocusNotificationsAvailable, cancelFocusNotification, requestFocusPermission, scheduleFocusNotification } from '../focus/focus-notifications';

type Choice = 'keep' | 'finish';
export interface TasksContextValue {
  tasks: Task[]; lists: TaskList[]; selectedTaskId: string | null; focusSession: FocusSession | null; draft: TaskDraft; loading: boolean; error: string | null; draftSaved: boolean;
  createList(name: string): Promise<TaskList | null>; setDraft(patch: Partial<TaskDraft>): void; saveDraft(): Promise<void>; createTask(): Promise<Task | null>; toggleTask(id: string): Promise<void>; completeTaskAndFinish(id: string): Promise<void>; selectTask(id: string, choice?: Choice): Promise<boolean>; startFocus(id: string): Promise<void>; pauseFocus(): Promise<void>; resumeFocus(): Promise<void>; resetFocus(): Promise<void>; finishFocus(): Promise<void>; adjustDuration(id: string): Promise<void>; setAlertEnabled(id: string, enabled: boolean): Promise<void>; deleteTask(id: string): Promise<void>; retryLoad(): Promise<void>; clearError(): void;
}
const TasksContext = createContext<TasksContextValue | undefined>(undefined);
const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(createDefaultState);
  const creatingTask = useRef(false);
  const creatingFocus = useRef(false);
  const draftVersion = useRef(0);
  const reconciling = useRef(false);
  const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null); const [draftSaved, setDraftSaved] = useState(false); const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const notificationId = useRef<string | null>(null);
  const retryLoad = useCallback(async () => {
    setLoading(true);
    try {
      const loaded = await loadState();
      setState(current => ({ ...loaded, draft: draftVersion.current ? current.draft : loaded.draft }));
      setSelectedTaskId(loaded.selectedTaskId ?? null);
      notificationId.current = loaded.notificationId ?? null;
      setError(null);
    } catch { setError('Não foi possível carregar os dados. Toque para tentar novamente.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { const timer = setTimeout(() => { void retryLoad(); }, 0); return () => clearTimeout(timer); }, [retryLoad]);
  const commit = useCallback(async (next: PersistedState) => { try { await saveState(next); setState(next); return true; } catch { setError('Não foi possível salvar os dados.'); return false; } }, []);
  const reconcile = useCallback(async (current: PersistedState) => {
    const session = current.focusSession;
    if (!session || session.status !== 'running' || !session.endsAt || Date.parse(session.endsAt) > Date.now() || reconciling.current) return;
    reconciling.current = true;
    const task = current.tasks.find(item => item.id === session.taskId); if (!task) { reconciling.current = false; return; }
    const nextTask = { ...task, completedSessions: Math.min(task.targetSessions, task.completedSessions + 1), updatedAt: new Date().toISOString() };
    try {
      await commit({ ...current, tasks: current.tasks.map(item => item.id === task.id ? nextTask : item), focusSession: { ...session, status: 'completed', remainingSeconds: 0, endsAt: undefined, completedAt: new Date().toISOString() }, notificationId: null });
      notificationId.current = null;
    } finally { reconciling.current = false; }
  }, [commit]);
  useEffect(() => { if (!loading) void reconcile(state); }, [loading, state, reconcile]);
  useEffect(() => { if (loading || state.focusSession?.status !== 'running') return; const timer = setInterval(() => { void reconcile(state); }, 1000); return () => clearInterval(timer); }, [loading, state, reconcile]);
  const updateTask = useCallback(async (id: string, fn: (task: Task) => Task): Promise<void> => { await commit({ ...state, tasks: state.tasks.map(task => task.id === id ? fn(task) : task) }); }, [commit, state]);
  const createList = useCallback(async (name: string) => { const clean = name.trim(); if (!clean) return null; const list = { id: uid('list'), name: clean, createdAt: new Date().toISOString() }; if (!await commit({ ...state, lists: [...state.lists, list], draft: { ...state.draft, listId: list.id } })) return null; return list; }, [commit, state]);
  const setDraft = useCallback((patch: Partial<TaskDraft>) => { draftVersion.current += 1; setDraftSaved(false); setState(value => ({ ...value, draft: { ...value.draft, ...patch } })); }, []);
  useEffect(() => {
    if (loading || draftVersion.current === 0) return;
    const version = draftVersion.current;
    const timer = setTimeout(() => {
      void persistDraft(state.draft).then(() => {
        if (version === draftVersion.current) setDraftSaved(true);
      }).catch(() => setError('Não foi possível salvar o rascunho.'));
    }, 500);
    return () => clearTimeout(timer);
  }, [loading, state.draft]);
  const saveDraft = useCallback(async () => { try { await persistDraft(state.draft); setDraftSaved(true); } catch { setError('Não foi possível salvar o rascunho.'); throw new Error('draft-save-failed'); } }, [state.draft]);
  const createTask = useCallback(async () => { if (creatingTask.current) return null; creatingTask.current = true; try { const d = state.draft; if (!d.title.trim() || d.title.trim().length > 200 || d.targetSessions < 1 || d.targetSessions > 16 || !state.lists.some(list => list.id === d.listId)) { setError('Informe um título de até 200 caracteres, uma lista e entre 1 e 16 sessões.'); return null; } const now = new Date().toISOString(); const task: Task = { ...d, id: uid('task'), title: d.title.trim(), completedSessions: 0, createdAt: now, updatedAt: now }; const next = { ...state, tasks: [...state.tasks, task], draft: makeDraft(d.listId), selectedTaskId: task.id }; if (!await commit(next)) return null; setSelectedTaskId(task.id); return task; } finally { creatingTask.current = false; } }, [commit, state]);
  const toggleTask = useCallback(async (id: string) => updateTask(id, task => ({ ...task, completedAt: task.completedAt ? undefined : new Date().toISOString(), updatedAt: new Date().toISOString() })), [updateTask]);
  const startFocus = useCallback(async (id: string) => {
    if (creatingFocus.current) return;
    const task = state.tasks.find(item => item.id === id);
    if (!task || (state.focusSession && ['running', 'paused'].includes(state.focusSession.status) && state.focusSession.taskId !== id) || state.focusSession?.status === 'running') return;
    creatingFocus.current = true;
    try {
      const seconds = state.focusSession?.taskId === id && state.focusSession.status === 'paused'
        ? state.focusSession.remainingSeconds : task.focusMinutes * 60;
      const now = new Date();
      const endsAt = new Date(now.getTime() + seconds * 1000).toISOString();
      const session: FocusSession = {
        taskId: id, durationSeconds: task.focusMinutes * 60, remainingSeconds: seconds,
        status: 'running', startedAt: state.focusSession?.status === 'paused' ? state.focusSession.startedAt : now.toISOString(), endsAt,
      };
      if (!await commit({ ...state, focusSession: session, notificationId: null })) return;
      if (task.alertEnabled) {
        try {
          const scheduled = await scheduleFocusNotification(id, task.title, new Date(endsAt));
          notificationId.current = scheduled;
          if (scheduled) await commit({ ...state, focusSession: session, notificationId: scheduled });
          else if (Platform.OS !== 'web') setError('Permissão para alertas não concedida.');
        } catch { setError('Alerta indisponível; o timer continua funcionando.'); }
      }
    } finally { creatingFocus.current = false; }
  }, [commit, state]);
  const pauseFocus = useCallback(async () => { const s = state.focusSession; if (!s || s.status !== 'running') return; const remaining = Math.max(0, Math.ceil((Date.parse(s.endsAt ?? '') - Date.now()) / 1000)); await cancelFocusNotification(notificationId.current); notificationId.current = null; await commit({ ...state, focusSession: { ...s, status: 'paused', remainingSeconds: remaining, endsAt: undefined }, notificationId: null }); }, [commit, state]);
  const resumeFocus = useCallback(async () => { if (!state.focusSession || state.focusSession.status !== 'paused') return; await startFocus(state.focusSession.taskId); }, [startFocus, state.focusSession]);
  const resetFocus = useCallback(async () => { await cancelFocusNotification(notificationId.current); notificationId.current = null; await commit({ ...state, focusSession: null, notificationId: null }); }, [commit, state]);
  const finishFocus = useCallback(async () => { const s = state.focusSession; if (!s) return; await cancelFocusNotification(notificationId.current); notificationId.current = null; const task = state.tasks.find(item => item.id === s.taskId); const tasks = task && s.status !== 'completed' ? state.tasks.map(item => item.id === s.taskId ? { ...item, completedSessions: Math.min(item.targetSessions, item.completedSessions + 1), updatedAt: new Date().toISOString() } : item) : state.tasks; await commit({ ...state, tasks, focusSession: { ...s, status: 'completed', remainingSeconds: 0, endsAt: undefined, completedAt: new Date().toISOString() }, notificationId: null }); }, [commit, state]);
  const selectTask = useCallback(async (id: string, choice?: Choice) => {
    if (!state.tasks.some(task => task.id === id)) return false;
    const session = state.focusSession;
    const switchingActive = session && ['running', 'paused'].includes(session.status) && session.taskId !== id;
    if (switchingActive && choice !== 'finish') return false;
    let next: PersistedState = { ...state, selectedTaskId: id };
    if (switchingActive && session) {
      await cancelFocusNotification(notificationId.current);
      notificationId.current = null;
      const now = new Date().toISOString();
      next = {
        ...next,
        notificationId: null,
        focusSession: { ...session, status: 'completed', remainingSeconds: 0, endsAt: undefined, completedAt: now },
        tasks: state.tasks.map(task => task.id === session.taskId
          ? { ...task, completedSessions: Math.min(task.targetSessions, task.completedSessions + 1), updatedAt: now }
          : task),
      };
    }
    if (!await commit(next)) return false;
    setSelectedTaskId(id);
    return true;
  }, [commit, state]);
  const completeTaskAndFinish = useCallback(async (id: string) => { const now = new Date().toISOString(); const s = state.focusSession; await cancelFocusNotification(notificationId.current); notificationId.current = null; const tasks = state.tasks.map(task => task.id === id ? { ...task, completedAt: task.completedAt ?? now, completedSessions: s?.taskId === id && s.status !== 'completed' ? Math.min(task.targetSessions, task.completedSessions + 1) : task.completedSessions, updatedAt: now } : task); const nextSession = s ? { ...s, status: 'completed' as const, remainingSeconds: 0, endsAt: undefined, completedAt: now } : null; await commit({ ...state, tasks, focusSession: nextSession, notificationId: null }); }, [commit, state]);
  const adjustDuration = useCallback(async (id: string) => updateTask(id, task => ({ ...task, focusMinutes: task.focusMinutes === 25 ? 30 : task.focusMinutes === 30 ? 45 : 25, updatedAt: new Date().toISOString() })), [updateTask]);
  const setAlertEnabled = useCallback(async (id: string, enabled: boolean) => {
    if (enabled && Platform.OS !== 'web' && !areFocusNotificationsAvailable()) {
      setError('Alertas exigem uma development build neste dispositivo.');
      return;
    }
    if (enabled && Platform.OS !== 'web' && !await requestFocusPermission()) {
      setError('Permissão para alertas não concedida.');
      return;
    }
    const session = state.focusSession;
    let scheduled: string | null = null;
    if (session?.taskId === id && session.status === 'running') {
      if (notificationId.current) await cancelFocusNotification(notificationId.current);
      notificationId.current = null;
      if (enabled && session.endsAt) {
        const task = state.tasks.find(item => item.id === id);
        if (task) {
          try { scheduled = await scheduleFocusNotification(id, task.title, new Date(session.endsAt)); }
          catch { setError('Alerta indisponível; o timer continua funcionando.'); }
        }
      }
    }
    if (session?.taskId === id && session.status === 'running') notificationId.current = scheduled;
    await commit({
      ...state,
      tasks: state.tasks.map(task => task.id === id ? { ...task, alertEnabled: enabled, updatedAt: new Date().toISOString() } : task),
      notificationId: session?.taskId === id && session.status === 'running' ? scheduled : state.notificationId,
    });
  }, [commit, state]);
  const deleteTask = useCallback(async (id: string) => {
    const deletingFocusedTask = state.focusSession?.taskId === id;
    if (deletingFocusedTask) {
      await cancelFocusNotification(notificationId.current);
      notificationId.current = null;
    }
    await commit({
      ...state,
      tasks: state.tasks.filter(task => task.id !== id),
      focusSession: deletingFocusedTask ? null : state.focusSession,
      notificationId: deletingFocusedTask ? null : state.notificationId,
      selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
    });
    if (state.selectedTaskId === id) setSelectedTaskId(null);
  }, [commit, state]);
  const value = useMemo(() => ({ tasks: state.tasks, lists: state.lists, selectedTaskId, focusSession: state.focusSession, draft: state.draft, loading, error, draftSaved, createList, setDraft, saveDraft, createTask, toggleTask, completeTaskAndFinish, selectTask, startFocus, pauseFocus, resumeFocus, resetFocus, finishFocus, adjustDuration, setAlertEnabled, deleteTask, retryLoad, clearError: () => setError(null) }), [state, selectedTaskId, loading, error, draftSaved, createList, setDraft, saveDraft, createTask, toggleTask, completeTaskAndFinish, selectTask, startFocus, pauseFocus, resumeFocus, resetFocus, finishFocus, adjustDuration, setAlertEnabled, deleteTask, retryLoad]);
  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}
export function useTasks() { const value = useContext(TasksContext); if (!value) throw new Error('useTasks must be used inside TasksProvider'); return value; }
