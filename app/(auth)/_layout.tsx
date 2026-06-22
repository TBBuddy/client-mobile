import { Redirect, Stack } from 'expo-router';

import { useAuth } from '../../context/auth-context';

export default function AuthLayout() {
  const { status } = useAuth();

  // Already authenticated — don't render login/register at all.
  // After signIn() is called, this layout re-renders and redirects to tabs.
  if (status === 'authenticated') {
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
