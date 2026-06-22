import { Stack } from 'expo-router';

export default function AuthLayout() {
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
