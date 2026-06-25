import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Heart,
  MessageCircle,
  Pill,
  Plane,
} from "lucide-react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useState } from "react";
import { View as RNView } from "react-native";

import { useAuth } from "../context/auth-context";
import { ForumService } from "../services/repository/forum-service";
import { PatientService } from "../services/repository/patient-service";
import type { ForumPost, PatientDashboard } from "../services/repository/types";
import { authorName, formatRelativeTime } from "./forum-screen";
import { NotificationBellButton } from "./notification-bell-button";
import { Pressable, ScrollView, Text, View } from "./tw";

const MOCK = {
  userName: "Rani",
  greeting: "Selamat pagi",
  greetingEmoji: "☀️",
  subtitle: "Semangat! Kamu tidak sendiri.",
};

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const;

function buildCurrentWeek(hasCheckedInToday: boolean) {
  const now = new Date();
  const todayDow = now.getDay(); // 0=Sun
  // Mon-first offset: Mon=0 … Sun=6
  const monOffset = (todayDow + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - monOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    return {
      day: DAY_LABELS[d.getDay()],
      date: d.getDate(),
      isToday,
      hasCheckin: isToday && hasCheckedInToday,
    };
  });
}

export function HomeScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);
  const [latestPost, setLatestPost] = useState<ForumPost | null>(null);

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      PatientService.getDashboard({ signal: controller.signal })
        .then((patientDashboard) => {
          setDashboard(patientDashboard);
        })
        .catch(() => {
          if (!controller.signal.aborted) setHasLoadFailed(true);
        });
      ForumService.listPosts(
        { sort: "latest", limit: 10 },
        { signal: controller.signal },
      )
        .then((res) => {
          setLatestPost(res.data.find((p) => !p.isDeleted) ?? null);
        })
        .catch(() => {});
      return () => controller.abort();
    }, []),
  );

  const treatmentTotal = dashboard
    ? dashboard.treatmentDurationMonths * 30
    : null;
  const treatmentStart = dashboard?.treatmentStartDate
    ? new Date(dashboard.treatmentStartDate)
    : null;
  const treatmentEnd = dashboard?.estimatedTreatmentEndDate
    ? new Date(dashboard.estimatedTreatmentEndDate)
    : null;
  const viewModel = {
    ...MOCK,
    userName:
      user?.fullName?.trim().split(/\s+/)[0] || user?.username || MOCK.userName,
    treatmentDay: dashboard?.treatmentDayCount ?? "—",
    treatmentTotal: treatmentTotal ?? "—",
    treatmentStart: treatmentStart ? formatDashboardDate(treatmentStart) : "—",
    treatmentEnd: treatmentEnd ? formatDashboardDate(treatmentEnd) : "—",
    stockDoses: dashboard?.stockDoses ?? "—",
    hasCheckedInToday: dashboard?.hasCheckedInToday ?? false,
  };
  const weekDays = buildCurrentWeek(viewModel.hasCheckedInToday);
  const stockDoseCount =
    typeof dashboard?.stockDoses === "number" ? dashboard.stockDoses : null;
  const isLowStock = stockDoseCount !== null && stockDoseCount <= 7;
  const progress =
    dashboard && treatmentTotal
      ? Math.min(
          100,
          Math.round((dashboard.treatmentDayCount / treatmentTotal) * 100),
        )
      : 0;

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-8 pt-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-0.5 pr-4">
            <Text className="text-[22px] font-extrabold leading-7 text-brand-ink">
              {viewModel.greeting}, {viewModel.userName}{" "}
              {viewModel.greetingEmoji}
            </Text>
            <Text
              className="text-[14px] text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              {viewModel.subtitle}
            </Text>
          </View>
          <NotificationBellButton />
        </View>

        <View className="gap-2">
          <View className="flex-row items-center justify-between px-0.5">
            <View className="flex-row items-center gap-2">
              <CalendarDays color="#263238" size={15} strokeWidth={2} style={{ opacity: 0.5 }} />
              <Text className="text-[13px] font-semibold text-brand-ink" style={{ opacity: 0.65 }}>
                Check-in minggu ini
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-0.5"
              onPress={() => router.push("/calendar" as Href)}
            >
              <Text className="text-[13px] font-semibold text-brand-aqua">Lihat semua</Text>
              <ChevronRight color="#A3E7E2" size={14} strokeWidth={2.5} />
            </Pressable>
          </View>

        <View className="flex-row justify-between rounded-card border border-brand-border bg-brand-white px-3 py-3">
          {weekDays.map((item) => (
            <View className="items-center gap-1" key={item.day}>
              <Text
                className="text-[11px] font-semibold text-brand-ink"
                style={{ opacity: 0.4 }}
              >
                {item.day}
              </Text>
              <View
                className={[
                  "h-8 w-8 items-center justify-center rounded-full",
                  item.isToday ? "bg-brand-aqua" : "",
                ].join(" ")}
              >
                <Text
                  className="text-[13px] font-bold text-brand-ink"
                  style={{ opacity: item.isToday ? 1 : 0.75 }}
                >
                  {item.date}
                </Text>
              </View>
              <RNView
                style={{
                  height: 5,
                  width: 5,
                  borderRadius: 999,
                  backgroundColor: item.hasCheckin ? "#A3E7E2" : "transparent",
                }}
              />
            </View>
          ))}
        </View>
        </View>

        <View className="rounded-card bg-brand-aqua p-5 gap-3">
          <View className="flex-row justify-end">
            <View className="rounded-full bg-brand-yellow px-3 py-1">
              <Text className="text-[11px] font-bold text-brand-ink">
                {dashboard
                  ? viewModel.hasCheckedInToday
                    ? "Sudah check-in"
                    : "Belum check-in"
                  : hasLoadFailed
                    ? "Status tidak tersedia"
                    : "Memuat status"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="flex-1 gap-1">
              <Text className="text-[20px] font-extrabold leading-6 text-brand-ink">
                Sudah minum obat{"\n"}hari ini?
              </Text>
              <Text
                className="text-[13px] leading-5 text-brand-ink"
                style={{ opacity: 0.65 }}
              >
                Jangan lupa minum obat sesuai jadwalmu.
              </Text>
            </View>
            <View
              className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-white"
              style={{ opacity: 0.65 }}
            >
              <Pill color="#263238" size={38} strokeWidth={1.5} />
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            className="h-12 items-center justify-center rounded-control bg-brand-ink"
            onPress={() => router.push("/(tabs)/check-in")}
          >
            <Text className="text-[15px] font-bold text-brand-white">
              Check-in sekarang
            </Text>
          </Pressable>
        </View>

        <View className="rounded-card border border-brand-border bg-brand-white p-5 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-brand-ink">
              Perjalanan pengobatan
            </Text>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-0.5"
              onPress={() => router.push("/history" as Href)}
            >
              <Text className="text-[13px] font-semibold text-brand-aqua">
                Lihat detail
              </Text>
              <ChevronRight color="#A3E7E2" size={14} strokeWidth={2.5} />
            </Pressable>
          </View>

          <View className="flex-row items-baseline justify-between">
            <Text
              className="text-[13px] text-brand-ink"
              style={{ opacity: 0.65 }}
            >
              {"Hari ke-"}
              <Text
                className="text-[15px] font-extrabold text-brand-ink"
                style={{ opacity: 1 }}
              >
                {viewModel.treatmentDay}
              </Text>
              {` dari ${viewModel.treatmentTotal} hari`}
            </Text>
            <Text className="text-[15px] font-extrabold text-brand-ink">
              {dashboard ? progress : "—"}%
            </Text>
          </View>

          <View className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
            <RNView
              style={{
                height: "100%",
                width: `${progress}%`,
                backgroundColor: "#A3E7E2",
                borderRadius: 999,
              }}
            />
          </View>

          <Text
            className="text-[12px] text-brand-ink"
            style={{ opacity: 0.45 }}
          >
            {viewModel.treatmentStart} – {viewModel.treatmentEnd}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className="overflow-hidden rounded-card border border-brand-border bg-brand-white active:opacity-90"
          onPress={() => router.push("/medicine-stocks")}
        >
          <View className="flex-row items-center gap-3 px-4 pt-4 pb-3">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-aqua">
              <Pill color="#263238" size={20} strokeWidth={2} />
            </View>
            <Text className="flex-1 text-[15px] font-bold text-brand-ink">
              Stok obat
            </Text>
            {isLowStock ? (
              <View className="flex-row items-center gap-1 rounded-full bg-brand-yellow px-2.5 py-1">
                <AlertTriangle color="#263238" size={12} strokeWidth={2.25} />
                <Text className="text-[11px] font-bold text-brand-ink">
                  Stok menipis
                </Text>
              </View>
            ) : (
              <ChevronRight
                color="#263238"
                size={18}
                strokeWidth={2}
                style={{ opacity: 0.3 }}
              />
            )}
          </View>

          <View className="flex-row items-end gap-1.5 px-4 pb-4">
            <Text className="text-[40px] font-extrabold leading-[44px] text-brand-ink">
              {viewModel.stockDoses}
            </Text>
            <Text
              className="text-[13px] text-brand-ink"
              style={{ opacity: 0.5, marginBottom: 7 }}
            >
              dosis tersisa
            </Text>
          </View>

          <View className="flex-row items-center justify-between border-t border-brand-border bg-brand-mist px-4 py-3">
            <Text className="text-[13px] font-semibold text-brand-ink">
              {isLowStock ? "Segera isi ulang obatmu" : "Kelola stok obatmu"}
            </Text>
            <ChevronRight color="#263238" size={15} strokeWidth={2.5} />
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="overflow-hidden rounded-card border border-brand-border bg-brand-white active:opacity-90"
          onPress={() => router.push("/travel-plans" as Href)}
        >
          <View className="flex-row items-center gap-3 p-4">
            <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-yellow">
              <Plane color="#263238" size={20} strokeWidth={2} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[15px] font-bold text-brand-ink">
                Mode Perjalanan
              </Text>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                Cek kesiapan stok obat sebelum bepergian
              </Text>
            </View>
            <ChevronRight color="#263238" size={18} strokeWidth={2} />
          </View>
        </Pressable>

        <View className="gap-2">
          <View className="flex-row items-center justify-between px-0.5">
            <Text className="text-[15px] font-bold text-brand-ink">
              Post Terbaru
            </Text>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-0.5"
              onPress={() => router.push("/(tabs)/komunitas")}
            >
              <Text className="text-[13px] font-semibold text-brand-aqua">
                Lihat semua
              </Text>
              <ChevronRight color="#A3E7E2" size={14} strokeWidth={2.5} />
            </Pressable>
          </View>

          <Pressable
            accessibilityRole="button"
            className="flex-row items-start gap-4 rounded-card border border-brand-border bg-brand-white p-4 active:opacity-80"
            onPress={() => router.push("/(tabs)/komunitas")}
          >
            <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-aqua">
              <MessageCircle color="#263238" size={22} strokeWidth={2} />
            </View>
            {latestPost ? (
              <View className="flex-1 gap-1">
                <Text
                  className="text-[15px] font-bold leading-5 text-brand-ink"
                  numberOfLines={2}
                >
                  {latestPost.title ?? "(Post dihapus)"}
                </Text>
                <Text
                  className="text-[12px] text-brand-ink"
                  style={{ opacity: 0.5 }}
                >
                  {authorName(latestPost.author)} ·{" "}
                  {formatRelativeTime(latestPost.createdAt)}
                </Text>
                <View className="mt-0.5 flex-row items-center gap-4">
                  <View className="flex-row items-center gap-1.5">
                    <Heart
                      color="#263238"
                      size={14}
                      strokeWidth={2}
                      style={{ opacity: 0.5 }}
                    />
                    <Text
                      className="text-[12px] font-semibold text-brand-ink"
                      style={{ opacity: 0.5 }}
                    >
                      {latestPost.likeCount}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-1.5">
                    <MessageCircle
                      color="#263238"
                      size={14}
                      strokeWidth={2}
                      style={{ opacity: 0.5 }}
                    />
                    <Text
                      className="text-[12px] font-semibold text-brand-ink"
                      style={{ opacity: 0.5 }}
                    >
                      {latestPost.commentCount}
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="flex-1 justify-center gap-1">
                <Text className="text-[15px] font-bold text-brand-ink">
                  Belum ada post
                </Text>
                <Text
                  className="text-[13px] leading-5 text-brand-ink"
                  style={{ opacity: 0.6 }}
                >
                  Jadilah yang pertama berbagi di Komunitas.
                </Text>
              </View>
            )}
            <ChevronRight
              color="#263238"
              size={18}
              strokeWidth={2}
              style={{ opacity: 0.3, marginTop: 2 }}
            />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

function formatDashboardDate(value: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}
