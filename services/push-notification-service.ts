import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { UserService } from "./repository/user-service";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class PushNotificationService {
  static async registerForPushNotifications(): Promise<string | null> {
    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#A3E7E2",
        });
      }

      const existingPermission = await Notifications.getPermissionsAsync();
      let isGranted =
        PushNotificationService.isPermissionGranted(existingPermission);

      if (!isGranted) {
        const requestedPermission =
          await Notifications.requestPermissionsAsync();
        isGranted =
          PushNotificationService.isPermissionGranted(requestedPermission);
      }

      if (!isGranted) {
        console.warn("Push notification permission not granted.");
        return null;
      }

      const projectId = PushNotificationService.getProjectId();
      if (!projectId) {
        console.warn(
          "Expo project ID not found. Push token registration skipped.",
        );
        return null;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      const token = tokenData.data;

      await UserService.addPushToken({ token });
      return token;
    } catch (error) {
      console.warn(
        "Push notification registration skipped. Rebuild the Android app after adding google-services.json if Firebase is not initialized.",
        error,
      );
      return null;
    }
  }

  static async unregisterPushToken(token: string): Promise<void> {
    try {
      await UserService.removePushToken({ token });
    } catch (error) {
      console.error("Error unregistering push token:", error);
    }
  }

  static addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void,
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  static addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void,
  ): Notifications.EventSubscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }

  private static getProjectId(): string | null {
    const extra = Constants.expoConfig?.extra;
    const eas =
      typeof extra?.eas === "object" && extra.eas !== null ? extra.eas : null;
    const projectId =
      eas && "projectId" in eas ? (eas.projectId as unknown) : null;

    return typeof projectId === "string" && projectId.trim() ? projectId : null;
  }

  private static isPermissionGranted(permission: unknown): boolean {
    const value = permission as { granted?: unknown; status?: unknown };
    return value.granted === true || value.status === "granted";
  }
}
