import { router } from 'expo-router';
import NewTaskScreen from '@/features/tasks/NewTaskScreen';

export default function NewTaskRoute() {
  return <NewTaskScreen onClose={() => router.replace('/todo')} />;
}
