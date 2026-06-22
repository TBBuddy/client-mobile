import { Redirect, Stack } from 'expo-router';

import { needsOnboarding, useAuth } from '../../context/auth-context';

export default function AuthLayout() {
  const { status, user } = useAuth();

  if (status === 'authenticated') {
    if (needsOnboarding(user)) return <Redirect href="/(onboarding)" />;
    return <Redirect href="/(tabs)" />;
  }

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
