import { useLocalSearchParams } from 'expo-router';

import { EditPmoScreen } from '../../components/edit-pmo-screen';

export default function EditPmoRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditPmoScreen id={id} />;
}
