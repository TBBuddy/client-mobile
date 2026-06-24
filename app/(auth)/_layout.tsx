import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

import { needsOnboarding, useAuth } from '../../context/auth-context';

export default function AuthLayout() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status !== 'authenticated') return;

    router.replace(needsOnboarding(user) ? '/(onboarding)' : '/(tabs)');
  }, [status, user]);

  if (status === 'authenticated') return null;

  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Kembali',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: '#F5FBFA' },
        headerTintColor: '#263238',
        contentStyle: { backgroundColor: '#F5FBFA' },
      }}
    />
  );
}
