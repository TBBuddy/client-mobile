import { HomeScreen } from '../../components/home-screen';
import { SupporterHomeScreen } from '../../components/supporter-home-screen';
import { useAuth } from '../../context/auth-context';

export default function BerandaRoute() {
  const { user } = useAuth();
  return user?.hasActivePatientProfile ? (
    <HomeScreen />
  ) : (
    <SupporterHomeScreen />
  );
}
