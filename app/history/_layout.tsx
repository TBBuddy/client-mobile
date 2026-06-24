import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

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
      <Stack.Screen
        name="index"
        options={{
          title: 'Riwayat pengobatan',
          headerLeft: () => (
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              style={{ marginRight: 8 }}
            >
              <ChevronLeft color="#263238" size={24} strokeWidth={2} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="[id]" options={{ title: 'Detail pengobatan' }} />
    </Stack>
  );
}
