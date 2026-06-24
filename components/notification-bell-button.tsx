import { Bell } from 'lucide-react-native';
import { router, type Href } from 'expo-router';

import { useNotifications } from '../context/notification-context';
import { Pressable, Text, View } from './tw';

export function NotificationBellButton() {
  const { unreadCount } = useNotifications();

  return (
    <Pressable
      accessibilityLabel="Buka notifikasi"
      accessibilityRole="button"
      className="relative h-10 w-10 items-center justify-center rounded-full bg-brand-white"
      onPress={() => router.push('/notifications' as Href)}
    >
      <Bell color="#263238" size={22} strokeWidth={2} />

      {unreadCount > 0 ? (
        <View className="absolute right-0 top-0 min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 py-0.5">
          <Text className="text-[10px] font-extrabold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}
