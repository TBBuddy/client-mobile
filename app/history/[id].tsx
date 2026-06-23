import { useLocalSearchParams } from 'expo-router';

import { TreatmentHistoryDetailScreen } from '../../components/treatment-history-detail-screen';

export default function TreatmentHistoryDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TreatmentHistoryDetailScreen profileId={id} />;
}
