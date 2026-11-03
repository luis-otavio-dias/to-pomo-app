export type FocusMinutes = 25 | 30 | 45;
export type TaskPriority = 'low' | 'medium' | 'high';
export type FocusStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  completedAt?: string;
  focusMinutes: FocusMinutes;
  targetSessions: number;
  completedSessions: number;
  dueAt?: string;
  priority: TaskPriority;
  notes: string;
  subtasks: Subtask[];
  alertEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  name: string;
  createdAt: string;
}

export type TaskDraft = Pick<Task, 'listId' | 'title' | 'focusMinutes' | 'targetSessions' | 'priority' | 'notes' | 'subtasks' | 'alertEnabled'> & {
  dueAt?: string;
};

export interface FocusSession {
  taskId: string;
  durationSeconds: number;
  status: FocusStatus;
  startedAt?: string;
  endsAt?: string;
  remainingSeconds: number;
  completedAt?: string;
}
