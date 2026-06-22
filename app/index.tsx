import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { needsOnboarding, useAuth } from '../context/auth-context';
import { WelcomeScreen } from '../components/welcome-screen';

export default function WelcomeRoute() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: '#F5FBFA' }} />;
  }

  if (status === 'authenticated') {
    if (needsOnboarding(user)) return <Redirect href="/(onboarding)" />;
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
