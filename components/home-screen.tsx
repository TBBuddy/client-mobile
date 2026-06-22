import {
  Bell,
  ChevronRight,
  Flame,
  Pill,
  ShieldCheck,
} from "lucide-react-native";
import { View as RNView } from "react-native";

import { Pressable, ScrollView, Text, View } from "./tw";

// ─── Static mock data (replace with real data later) ─────────────────────────

const MOCK = {
  userName: "Rani",
  greeting: "Selamat pagi",
  greetingEmoji: "☀️",
  subtitle: "Semangat! Kamu tidak sendiri.",
  treatmentDay: 48,
  treatmentTotal: 180,
  treatmentStart: "15 Mei 2026",
  treatmentEnd: "15 Nov 2026",
  streak: 12,
  stockDoses: 18,
  hasCheckedInToday: false,
};

const PROGRESS = Math.round((MOCK.treatmentDay / MOCK.treatmentTotal) * 100);

const WEEK_DAYS = [
  { day: "Sel", date: 12, isToday: false, hasCheckin: true },
  { day: "Sen", date: 13, isToday: false, hasCheckin: true },
  { day: "Rab", date: 14, isToday: true, hasCheckin: false },
  { day: "Kam", date: 15, isToday: false, hasCheckin: false },
  { day: "Jum", date: 16, isToday: false, hasCheckin: false },
  { day: "Sab", date: 17, isToday: false, hasCheckin: false },
  { day: "Min", date: 18, isToday: false, hasCheckin: false },
] as const;

// ─────────────────────────────────────────────────────────────────────────────

export function HomeScreen() {
  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-8 pt-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-4">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 gap-0.5 pr-4">
            <Text className="text-[22px] font-extrabold leading-7 text-brand-ink">
              {MOCK.greeting}, {MOCK.userName} {MOCK.greetingEmoji}
            </Text>
            <Text
              className="text-[14px] text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              {MOCK.subtitle}
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

        {/* ── Week Calendar ───────────────────────────────────────────────── */}
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

        {/* ── Check-in Card ───────────────────────────────────────────────── */}
        <View className="rounded-card bg-brand-aqua p-5 gap-3">
          {/* Badge */}
          <View className="flex-row justify-end">
            <View className="rounded-full bg-brand-yellow px-3 py-1">
              <Text className="text-[11px] font-bold text-brand-ink">
                Belum check-in
              </Text>
            </View>
          </View>

          {/* Content */}
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
            {/* Pill illustration placeholder */}
            <View
              className="h-20 w-20 items-center justify-center rounded-2xl bg-brand-white"
              style={{ opacity: 0.65 }}
            >
              <Pill color="#263238" size={38} strokeWidth={1.5} />
            </View>
          </View>

          {/* CTA */}
          <Pressable
            accessibilityRole="button"
            className="h-12 items-center justify-center rounded-control bg-brand-ink"
          >
            <Text className="text-[15px] font-bold text-brand-white">
              Check-in sekarang
            </Text>
          </Pressable>
        </View>

        {/* ── Treatment Progress ──────────────────────────────────────────── */}
        <View className="rounded-card border border-brand-border bg-brand-white p-5 gap-3">
          {/* Title row */}
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

          {/* Day count + percentage */}
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
                {MOCK.treatmentDay}
              </Text>
              {` dari ${MOCK.treatmentTotal} hari`}
            </Text>
            <Text className="text-[15px] font-extrabold text-brand-ink">
              {PROGRESS}%
            </Text>
          </View>

          {/* Progress bar */}
          <View className="h-2 w-full overflow-hidden rounded-full bg-brand-border">
            <RNView
              style={{
                height: "100%",
                width: `${PROGRESS}%`,
                backgroundColor: "#A3E7E2",
                borderRadius: 999,
              }}
            />
          </View>

          {/* Date range */}
          <Text
            className="text-[12px] text-brand-ink"
            style={{ opacity: 0.45 }}
          >
            {MOCK.treatmentStart} – {MOCK.treatmentEnd}
          </Text>
        </View>

        {/* ── Stats Row ───────────────────────────────────────────────────── */}
        <View className="flex-row gap-3">
          {/* Streak */}
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-1">
            <Text
              className="text-[12px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Streak aktif
            </Text>
            <View className="flex-row items-end gap-1.5">
              <Text className="text-[32px] font-extrabold leading-9 text-brand-ink">
                {MOCK.streak}
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

          {/* Stock */}
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-1">
            <Text
              className="text-[12px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Stok obat
            </Text>
            <View className="flex-row items-end gap-1.5">
              <Text className="text-[32px] font-extrabold leading-9 text-brand-ink">
                {MOCK.stockDoses}
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

        {/* ── Insight ─────────────────────────────────────────────────────── */}
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
      </View>
    </ScrollView>
  );
}
