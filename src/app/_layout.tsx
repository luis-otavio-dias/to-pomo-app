import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import {
  PatrickHand_400Regular,
} from '@expo-google-fonts/patrick-hand';
import {
  Caveat_600SemiBold,
  Caveat_700Bold,
} from '@expo-google-fonts/caveat';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { TasksProvider } from '@/features/tasks/task-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [fontsLoaded, fontError] = useFonts({
    'PatrickHand': PatrickHand_400Regular,
    'CaveatSemiBold': Caveat_600SemiBold,
    'CaveatBold': Caveat_700Bold,
    'Inter': Inter_400Regular,
    'InterMedium': Inter_500Medium,
    'InterSemiBold': Inter_600SemiBold,
    'InterBold': Inter_700Bold,
  });

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay fontsLoaded={fontsLoaded || Boolean(fontError)} />
      <TasksProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="new-task" options={{ presentation: 'modal' }} />
        </Stack>
      </TasksProvider>
    </ThemeProvider>
  );
}
