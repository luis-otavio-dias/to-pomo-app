import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task, TaskDraft, TaskList, FocusSession } from './task-types';

const STORAGE_KEY = 'to-pomodoro:state:v1';
const DRAFT_KEY = 'to-pomodoro:draft:v1';
export interface PersistedState { tasks: Task[]; lists: TaskList[]; focusSession: FocusSession | null; draft: TaskDraft; selectedTaskId?: string | null; notificationId?: string | null; }

const defaultDraft = (listId: string): TaskDraft => ({ listId, title: '', focusMinutes: 25, targetSessions: 4, priority: 'medium', notes: '', subtasks: [], alertEnabled: true });
export const createDefaultState = (): PersistedState => {
  const now = new Date().toISOString();
  const list = { id: 'list-1', name: 'List #1', createdAt: now };
  return { tasks: [], lists: [list], focusSession: null, draft: defaultDraft(list.id), selectedTaskId: null, notificationId: null };
};

export async function loadState(): Promise<PersistedState> {
  const [raw, draftRaw] = await Promise.all([AsyncStorage.getItem(STORAGE_KEY), AsyncStorage.getItem(DRAFT_KEY)]);
  if (!raw && !draftRaw) return createDefaultState();
  try {
    const parsed = raw ? JSON.parse(raw) as Partial<PersistedState> : {};
    const savedDraft = draftRaw ? JSON.parse(draftRaw) as Partial<TaskDraft> : parsed.draft;
    const fallback = createDefaultState();
    const lists = parsed.lists?.length ? parsed.lists : fallback.lists;
    const tasks = (parsed.tasks ?? []).map(task => { const priority = (task as Task & { priority?: unknown }).priority; return { ...task, priority: typeof priority === 'boolean' ? (priority ? 'high' : 'medium') : priority }; });
    const oldPriority = (savedDraft as (TaskDraft & { priority?: unknown }) | undefined)?.priority;
    const draft = { ...fallback.draft, ...savedDraft, priority: typeof oldPriority === 'boolean' ? (oldPriority ? 'high' : 'medium') : (oldPriority ?? fallback.draft.priority) };
    return { ...fallback, ...parsed, lists, tasks, draft, focusSession: parsed.focusSession ?? null };
  } catch { throw new Error('Dados salvos inválidos.'); }
}

export async function saveState(state: PersistedState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, draft: undefined }));
  await saveDraft(state.draft);
}
export const saveDraft = (draft: TaskDraft) => AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
export const makeDraft = defaultDraft;
