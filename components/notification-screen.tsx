import { router, type Href } from "expo-router";
import {
  ArrowLeft,
  Bell,
  Bot,
  CalendarClock,
  CheckCheck,
  Clock,
  PackageCheck,
  Pill,
  Plane,
  TriangleAlert,
} from "lucide-react-native";
import { useEffect } from "react";
import { ActivityIndicator, FlatList, RefreshControl } from "react-native";

import { useNotifications } from "../context/notification-context";
import type {
  NotificationListItem,
  NotificationType,
} from "../services/repository/types";
import { Pressable, Text, View } from "./tw";

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}

function notificationIcon(type: NotificationType) {
  const props = { color: "#263238", size: 20, strokeWidth: 1.9 };

  switch (type) {
    case "MEDICINE_REMINDER_BEFORE":
    case "MEDICINE_REMINDER_TIME":
      return <Pill {...props} />;
    case "MEDICINE_SKIP_ALERT":
      return <TriangleAlert {...props} color="#B45309" />;
    case "AI_WARNING":
      return <Bot {...props} />;
    case "STOCK_ALERT":
      return <PackageCheck {...props} />;
    case "TRAVEL_REMINDER_H1":
      return <Plane {...props} />;
    default:
      return <Bell {...props} />;
  }
}

function NotificationItem({
  notification,
  onPress,
}: {
  notification: NotificationListItem;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className={[
        "flex-row gap-3 border-b border-brand-border px-5 py-4",
        notification.isRead ? "bg-white" : "bg-brand-mist",
      ].join(" ")}
      onPress={onPress}
    >
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-aqua">
        {notificationIcon(notification.type)}
      </View>

      <View className="min-w-0 flex-1 gap-1">
        <View className="flex-row items-start gap-2">
          <Text
            className="flex-1 text-[14px] font-bold text-brand-ink"
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          {!notification.isRead ? (
            <View className="mt-1.5 h-2 w-2 rounded-full bg-brand-aqua" />
          ) : null}
        </View>

        <Text
          className="text-[13px] leading-5 text-brand-ink"
          numberOfLines={2}
          style={{ opacity: 0.62 }}
        >
          {notification.body}
        </Text>

        <View className="flex-row items-center gap-1">
          <Clock color="#8A9A9A" size={12} strokeWidth={1.8} />
          <Text
            className="text-[11px] text-brand-ink"
            style={{ opacity: 0.45 }}
          >
            {formatRelativeTime(notification.createdAt)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-brand-mist">
        <Bell color="#8A9A9A" size={30} strokeWidth={1.6} />
      </View>
      <Text className="mt-4 text-center text-[16px] font-bold text-brand-ink">
        Belum ada notifikasi
      </Text>
      <Text
        className="mt-2 text-center text-[13px] leading-5 text-brand-ink"
        style={{ opacity: 0.55 }}
      >
        Reminder, stok, dan peringatan penting akan muncul di sini.
      </Text>
    </View>
  );
}

export function NotificationScreen() {
  const {
    notifications,
    isLoading,
    unreadCount,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    void refreshNotifications();
    void refreshUnreadCount();
  }, [refreshNotifications, refreshUnreadCount]);

  async function handleNotificationPress(notification: NotificationListItem) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    if (notification.deepLink) {
      router.push(notification.deepLink as Href);
      return;
    }

    router.push("/notifications" as Href);
  }

  async function handleMarkAllRead() {
    if (unreadCount > 0) {
      await markAllAsRead();
    }
  }

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center gap-3 border-b border-brand-border bg-brand-white px-5 pb-4 pt-14">
        <View className="flex-1 flex-row items-center gap-2">
          <Pressable
            accessibilityRole="button"
            className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
            onPress={() => router.back()}
          >
            <ArrowLeft color="#263238" size={18} strokeWidth={2} />
          </Pressable>
          <CalendarClock color="#263238" size={20} strokeWidth={1.9} />
          <View className="flex-1">
            <Text className="text-[18px] font-extrabold text-brand-ink">
              Notification
            </Text>
          </View>
        </View>
        {unreadCount > 0 ? (
          <Text className="text-[12px] font-semibold text-brand-ink opacity-50">
            {unreadCount} baru
          </Text>
        ) : null}
      </View>

      {unreadCount > 0 ? (
        <View className="flex-row justify-end border-b border-brand-border bg-white px-5 py-2">
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-1 rounded-full bg-brand-mist px-3 py-2"
            onPress={handleMarkAllRead}
          >
            <CheckCheck color="#263238" size={15} strokeWidth={2} />
            <Text className="text-[12px] font-bold text-brand-ink">
              Tandai semua
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#263238" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => void handleNotificationPress(item)}
            />
          )}
          ListEmptyComponent={<EmptyState />}
          refreshControl={
            <RefreshControl
              colors={["#263238"]}
              onRefresh={refreshNotifications}
              refreshing={isLoading}
              tintColor="#263238"
            />
          }
          contentContainerStyle={
            notifications.length === 0 ? { flexGrow: 1 } : undefined
          }
        />
      )}
    </View>
  );
}
