import {
  Bell,
  ChevronRight,
  Flame,
  Pill,
  RefreshCw,
  ShieldCheck,
  Trophy,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, View as RNView } from "react-native";

import { useAuth } from "../context/auth-context";
import { ApiError } from "../services/repository/api-error";
import { PatientService } from "../services/repository/patient-service";
import type { PatientDashboard } from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const DAY_NAMES_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

function getWeekDays() {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 3 + i);
    return {
      day: DAY_NAMES_ID[d.getDay()],
      date: d.getDate(),
      isToday: i === 3,
    };
  });
}

function formatDateID(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return "Selamat pagi";
  if (h < 15) return "Selamat siang";
  if (h < 18) return "Selamat sore";
  return "Selamat malam";
}

function getGreetingEmoji(): string {
  const h = new Date().getHours();
  if (h < 11) return "☀️";
  if (h < 18) return "🌤️";
  return "🌙";
}

export function HomeScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    PatientService.getDashboard({ signal: controller.signal })
      .then((data) => {
        setDashboard(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setError(
          err instanceof ApiError ? err.message : "Gagal memuat data.",
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [refetchKey]);

  const weekDays = getWeekDays();
  const displayName = user?.fullName ?? user?.username ?? "Kamu";
  const greeting = getGreeting();
  const greetingEmoji = getGreetingEmoji();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" size="large" />
      </View>
    );
  }

  if (error || !dashboard) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-brand-mist px-8">
        <Text
          className="text-center text-[15px] text-brand-ink"
          style={{ opacity: 0.6 }}
        >
          {error ?? "Gagal memuat data."}
        </Text>
        <Pressable
          accessibilityRole="button"
          className="h-11 flex-row items-center gap-2 rounded-control bg-brand-ink px-6"
          onPress={() => setRefetchKey((v) => v + 1)}
        >
          <RefreshCw color="#FFFFFF" size={15} strokeWidth={2} />
          <Text className="text-[14px] font-bold text-brand-white">
            Coba lagi
          </Text>
        </Pressable>
      </View>
    );
  }

  const totalDays = dashboard.treatmentDurationMonths * 30;
  const progress = Math.min(
    100,
    Math.round((dashboard.treatmentDayCount / totalDays) * 100),
  );

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - dashboard.treatmentDayCount);

  const hasCheckedIn = dashboard.todayCheckin !== null;

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
              {greeting}, {displayName} {greetingEmoji}
            </Text>
            <Text
              className="text-[14px] text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              Semangat! Kamu tidak sendiri.
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Notifikasi"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white"
          >
            <Bell color="#263238" size={20} strokeWidth={2} />
          </Pressable>
        </View>

        <View className="flex-row justify-between rounded-card border border-brand-border bg-brand-white px-3 py-3">
          {weekDays.map((item) => (
            <View className="items-center gap-1" key={`${item.day}-${item.date}`}>
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
                  backgroundColor: "transparent",
                }}
              />
            </View>
          ))}
        </View>

        <View className="rounded-card bg-brand-aqua p-5 gap-3">
          <View className="flex-row justify-end">
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: hasCheckedIn
                  ? "rgba(255,255,255,0.7)"
                  : "#FFE082",
              }}
            >
              <Text className="text-[11px] font-bold text-brand-ink">
                {hasCheckedIn ? "Sudah check-in ✓" : "Belum check-in"}
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
                {dashboard.medicineTime
                  ? `Jadwal minum obat: ${dashboard.medicineTime}`
                  : "Jangan lupa minum obat sesuai jadwalmu."}
              </Text>
            </View>
            <View
              className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-white"
              style={{ opacity: 0.65 }}
            >
              <Pill color="#263238" size={38} strokeWidth={1.5} />
            </View>
          </View>

          {!hasCheckedIn && (
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-control bg-brand-ink"
            >
              <Text className="text-[15px] font-bold text-brand-white">
                Check-in sekarang
              </Text>
            </Pressable>
          )}
        </View>

        <View className="rounded-card border border-brand-border bg-brand-white p-5 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-[15px] font-bold text-brand-ink">
              Perjalanan pengobatan
            </Text>
            <Pressable
              accessibilityRole="button"
              className="flex-row items-center gap-0.5"
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
                {dashboard.treatmentDayCount}
              </Text>
              {` dari ${totalDays} hari`}
            </Text>
            <Text className="text-[15px] font-extrabold text-brand-ink">
              {progress}%
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
            {formatDateID(startDate.toISOString())}
            {" – "}
            {dashboard.estimatedTreatmentEndDate
              ? formatDateID(dashboard.estimatedTreatmentEndDate)
              : "—"}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-1">
            <Text
              className="text-[12px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Streak aktif
            </Text>
            <View className="flex-row items-end gap-1.5">
              <Text className="text-[32px] font-extrabold leading-9 text-brand-ink">
                {dashboard.currentStreak}
              </Text>
              <Flame
                color="#FF6B35"
                size={20}
                strokeWidth={1.75}
                style={{ marginBottom: 4 }}
              />
            </View>
            <Text
              className="text-[12px] text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              hari berturut-turut
            </Text>
          </View>

          <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-1">
            <Text
              className="text-[12px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Rekor terbaik
            </Text>
            <View className="flex-row items-end gap-1.5">
              <Text className="text-[32px] font-extrabold leading-9 text-brand-ink">
                {dashboard.longestStreak}
              </Text>
              <Trophy
                color="#263238"
                size={18}
                strokeWidth={1.75}
                style={{ marginBottom: 5, opacity: 0.4 }}
              />
            </View>
            <Text
              className="text-[12px] text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              hari terpanjang
            </Text>
          </View>
        </View>

        {dashboard.latestAssessment === null ? null : (
          <View className="gap-3">
            <Text className="text-[15px] font-bold text-brand-ink">
              Insight terbaru
            </Text>
            <View className="flex-row items-start gap-4 rounded-card border border-brand-border bg-brand-white p-4">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-aqua">
                <ShieldCheck color="#263238" size={22} strokeWidth={2} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-bold text-brand-ink">
                  Risiko rendah
                </Text>
                <Text
                  className="text-[13px] leading-5 text-brand-ink"
                  style={{ opacity: 0.6 }}
                >
                  Perkembanganmu stabil. Kondisimu baik,{"\n"}pertahankan
                  kebiasaanmu.
                </Text>
                <Pressable accessibilityRole="button" className="mt-1">
                  <Text className="text-[13px] font-semibold text-brand-aqua">
                    Lihat detail insight →
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
