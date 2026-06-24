import { router, Stack } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { CalendarScreen } from '../components/calendar-screen';

export default function CalendarRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Kalender Check-in',
          headerShown: true,
          headerShadowVisible: false,
          headerTintColor: '#263238',
          headerStyle: { backgroundColor: '#F5FBFA' },
          contentStyle: { backgroundColor: '#F5FBFA' },
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
      <CalendarScreen />
    </>
  );
}
