import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { useAuth } from '../context/auth-context';
import { WelcomeScreen } from '../components/welcome-screen';

export default function WelcomeRoute() {
  const { status } = useAuth();

  // While bootstrap is running, render nothing so there's no flash of content.
  if (status === 'loading') {
    return <View style={{ flex: 1, backgroundColor: '#F5FBFA' }} />;
  }

  // Valid session found — skip the welcome screen entirely.
  if (status === 'authenticated') {
    return <Redirect href="/(tabs)" />;
  }

  return <WelcomeScreen />;
}
