import { router, Stack, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { AuthProvider, useAuth } from "../context/auth-context";
import {
  NotificationProvider,
  useNotifications,
} from "../context/notification-context";
import "../global.css";
import { PushNotificationService } from "../services/push-notification-service";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#F5FBFA" },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="welcome" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="history" options={{ headerShown: false }} />
          <Stack.Screen name="calendar" />
          <Stack.Screen name="checkin-detail/[id]" />
          <Stack.Screen name="medicine-stocks" />
          <Stack.Screen name="edit-pmo/[id]" />
          <Stack.Screen name="forum/[id]" />
          <Stack.Screen name="notifications" />
          <Stack.Screen name="travel-plans" />
        </Stack>
        <StatusBar style="dark" />
        <NotificationBootstrap />
      </NotificationProvider>
    </AuthProvider>
  );
}

function NotificationBootstrap() {
  const { status } = useAuth();
  const { refreshUnreadCount } = useNotifications();

  useEffect(() => {
    if (status !== "authenticated") return;

    void PushNotificationService.registerForPushNotifications();
    void refreshUnreadCount();

    const receivedSubscription =
      PushNotificationService.addNotificationReceivedListener(() => {
        void refreshUnreadCount();
      });
    const responseSubscription =
      PushNotificationService.addNotificationResponseReceivedListener(
        (response) => {
          const deepLink = response.notification.request.content.data?.deepLink;

          if (typeof deepLink === "string" && deepLink.trim()) {
            router.push(deepLink as Href);
            return;
          }

          router.push("/notifications" as Href);
        },
      );

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [refreshUnreadCount, status]);

  return null;
}
