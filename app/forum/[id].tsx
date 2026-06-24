import { useLocalSearchParams } from "expo-router";

import { ForumPostScreen } from "../../components/forum-post-screen";

export default function ForumPostRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <ForumPostScreen id={id} />;
}
