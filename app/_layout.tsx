import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <PaperProvider>
        <SafeAreaProvider>
          <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="room" options={{ headerShown: false }} />
        </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </ThemeProvider>
  );
}
