import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

type NotificationsModule = typeof import('expo-notifications');

let notificationsPromise: Promise<NotificationsModule | null> | null = null;

export function areFocusNotificationsAvailable(): boolean {
  return Platform.OS !== 'web' && !isRunningInExpoGo();
}

function loadNotifications(): Promise<NotificationsModule | null> {
  if (!areFocusNotificationsAvailable()) return Promise.resolve(null);

  notificationsPromise ??= import('expo-notifications')
    .then((notifications) => {
      notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      return notifications;
    })
    .catch(() => null);

  return notificationsPromise;
}

export async function requestFocusPermission(): Promise<boolean> {
  const notifications = await loadNotifications();
  if (!notifications) return false;

  const current = await notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await notifications.requestPermissionsAsync()).granted;
}

export async function scheduleFocusNotification(taskId: string, title: string, date: Date): Promise<string | null> {
  const notifications = await loadNotifications();
  if (!notifications || !await requestFocusPermission()) return null;

  return notifications.scheduleNotificationAsync({
    content: { title: 'Foco concluído', body: title, data: { taskId } },
    trigger: { type: notifications.SchedulableTriggerInputTypes.DATE, date },
  });
}

export async function cancelFocusNotification(id?: string | null): Promise<void> {
  if (!id) return;
  const notifications = await loadNotifications();
  if (notifications) await notifications.cancelScheduledNotificationAsync(id);
}
