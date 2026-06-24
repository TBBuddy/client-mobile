import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../context/auth-context';

export default function OnboardingLayout() {
  const { status, user } = useAuth();

  if (status === 'unauthenticated') return <Redirect href="/welcome" />;
  if (status === 'loading') return null;
  if (user?.hasActivePatientProfile) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5FBFA' },
      }}
    />
  );
}
