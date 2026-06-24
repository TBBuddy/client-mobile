import { Redirect, Tabs } from 'expo-router';
import { CircleCheckBig, Home, MapPin, User, Users } from 'lucide-react-native';

import { useAuth } from '../../context/auth-context';

export default function TabsLayout() {
  const { status, user } = useAuth();

  if (status === 'unauthenticated') {
    return <Redirect href="/welcome" />;
  }

  if (status === 'loading') {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#D9E5E5',
          borderTopWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#263238',
        tabBarInactiveTintColor: 'rgba(38,50,56,0.35)',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: 'Check-in',
          href: user?.hasActivePatientProfile ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <CircleCheckBig color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="faskes"
        options={{
          title: 'Faskes',
          tabBarIcon: ({ color, size }) => (
            <MapPin color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="komunitas"
        options={{
          title: 'Komunitas',
          tabBarIcon: ({ color, size }) => (
            <Users color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
