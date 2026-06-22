import { useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useAuth } from '../../context/auth-context';
import { AuthService } from '../../services/repository/auth-service';
import { Pressable, ScrollView, Text, View } from '../../components/tw';

export default function ProfilRoute() {
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch {
      // API errors are safe to ignore — AuthService.logout() always clears
      // the token in its own finally block regardless of network failure.
    } finally {
      setIsLoading(false);
    }

    // Update auth state — AuthGuard in _layout.tsx handles the redirect to /.
    signOut();
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="flex-grow items-center justify-center gap-6 px-8 py-12"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-aqua">
        <Text className="text-[32px] font-extrabold text-brand-ink">T</Text>
      </View>
      <Text className="text-center text-[30px] font-extrabold text-brand-ink">Profil</Text>
      <Text
        className="max-w-[280px] text-center text-[15px] leading-6 text-brand-ink"
        style={{ opacity: 0.5 }}
      >
        Layar profil akan dibangun di sini.
      </Text>

      <Pressable
        accessibilityRole="button"
        className="h-[52px] w-full items-center justify-center rounded-control border-2 border-brand-ink bg-brand-white"
        disabled={isLoading}
        onPress={handleLogout}
        style={isLoading ? { opacity: 0.6 } : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color="#263238" />
        ) : (
          <Text className="text-[17px] font-bold text-brand-ink">Keluar</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
