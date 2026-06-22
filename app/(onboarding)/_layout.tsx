import { Redirect, Stack } from 'expo-router';

import { needsOnboarding, useAuth } from '../../context/auth-context';

export default function OnboardingLayout() {
  const { status, user } = useAuth();

  if (status === 'unauthenticated') return <Redirect href="/" />;
  if (status === 'loading') return null;
  if (!needsOnboarding(user)) return <Redirect href="/(tabs)" />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F5FBFA' },
      }}
    />
  );
}
