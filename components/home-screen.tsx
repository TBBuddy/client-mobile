import {
  Bell,
  ChevronRight,
  Flame,
  Pill,
  ShieldCheck,
} from "lucide-react-native";
import { router, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { View as RNView } from "react-native";

import { useAuth } from "../context/auth-context";
import { PatientService } from "../services/repository/patient-service";
import type { PatientDashboard } from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const MOCK = {
  userName: "Rani",
  greeting: "Selamat pagi",
  greetingEmoji: "☀️",
  subtitle: "Semangat! Kamu tidak sendiri.",
};

const WEEK_DAYS = [
  { day: "Sel", date: 12, isToday: false, hasCheckin: true },
  { day: "Sen", date: 13, isToday: false, hasCheckin: true },
  { day: "Rab", date: 14, isToday: true, hasCheckin: false },
  { day: "Kam", date: 15, isToday: false, hasCheckin: false },
  { day: "Jum", date: 16, isToday: false, hasCheckin: false },
  { day: "Sab", date: 17, isToday: false, hasCheckin: false },
  { day: "Min", date: 18, isToday: false, hasCheckin: false },
] as const;

export function HomeScreen() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    PatientService.getDashboard({ signal: controller.signal })
      .then((patientDashboard) => {
        setDashboard(patientDashboard);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHasLoadFailed(true);
      });
    return () => controller.abort();
  }, []);

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
    streak: dashboard?.currentStreak ?? "—",
    stockDoses: dashboard?.stockDoses ?? "—",
    hasCheckedInToday: dashboard?.hasCheckedInToday ?? false,
  };
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
          <Pressable
            accessibilityLabel="Notifikasi"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white"
          >
            <Bell color="#263238" size={20} strokeWidth={2} />
          </Pressable>
        </View>

        <View className="flex-row justify-between rounded-card border border-brand-border bg-brand-white px-3 py-3">
          {WEEK_DAYS.map((item) => (
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
                {viewModel.streak}
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
              Stok obat
            </Text>
            <View className="flex-row items-end gap-1.5">
              <Text className="text-[32px] font-extrabold leading-9 text-brand-ink">
                {viewModel.stockDoses}
              </Text>
              <Pill
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
              dosis tersisa
            </Text>
          </View>
        </View>

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
              <Pressable
                accessibilityRole="button"
                className="mt-1"
                onPress={() => router.push("/(tabs)/komunitas")}
              >
                <Text className="text-[13px] font-semibold text-brand-aqua">
                  Lihat detail insight →
                </Text>
              </Pressable>
            </View>
          </View>
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
