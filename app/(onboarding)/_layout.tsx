import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../../context/auth-context';

export default function OnboardingLayout() {
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/');
    if (status === 'authenticated' && user?.hasActivePatientProfile) {
      router.replace('/(tabs)');
    }
  }, [status, user?.hasActivePatientProfile]);

  if (status !== 'authenticated' || user?.hasActivePatientProfile) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5FBFA' },
      }}
    />
  );
}
