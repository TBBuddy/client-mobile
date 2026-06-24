import { Redirect } from "expo-router";

import { FacilityDetailScreen } from "../../components/facility-detail-screen";
import { useAuth } from "../../context/auth-context";

export default function FacilityDetailRoute() {
  const { status } = useAuth();
  if (status === "unauthenticated") return <Redirect href="/" />;
  if (status === "loading") return null;
  return <FacilityDetailScreen />;
}
