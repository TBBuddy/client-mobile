import { Stack } from 'expo-router';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTintColor: '#263238',
        headerStyle: { backgroundColor: '#F5FBFA' },
        contentStyle: { backgroundColor: '#F5FBFA' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Riwayat pengobatan' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detail pengobatan' }} />
    </Stack>
  );
}
