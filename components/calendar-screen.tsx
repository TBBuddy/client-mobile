import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react-native";
import { router, useFocusEffect, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, View as RNView } from "react-native";

import { AiAssessmentService } from "../services/repository/ai-assessment-service";
import { ApiError } from "../services/repository/api-error";
import { CheckinService } from "../services/repository/checkin-service";
import type { DailyCheckin } from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const AI_MARKER_COLOR = "#C4A6C9";

// ─── constants ────────────────────────────────────────────────────────────────

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAY_HEADERS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// ─── helpers ─────────────────────────────────────────────────────────────────

function toDateKey(year: number, month: number, date: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(date).padStart(2, "0")}`;
}

type CalendarCell = {
  date: number;
  month: number;
  year: number;
  isCurrentMonth: boolean;
};

/** Build a 42-cell Mon-first calendar grid for the given month. */
function buildCalendarGrid(year: number, month: number): CalendarCell[] {
  const firstDow = new Date(year, month - 1, 1).getDay(); // 0=Sun
  const startOffset = (firstDow + 6) % 7; // shift so Mon=0
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrev = new Date(year, month - 1, 0).getDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  const cells: CalendarCell[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    cells.push({ date: daysInPrev - i, month: prevMonth, year: prevYear, isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: d, month, year, isCurrentMonth: true });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ date: d, month: nextMonth, year: nextYear, isCurrentMonth: false });
  }

  return cells;
}

function checkinDotColor(checkin: DailyCheckin): string {
  if (!checkin.hasTakenMedicine) return "#FF6B6B";
  if (checkin.hasComplaint) return "#FF9500";
  return "#34C07B";
}

function isToday(year: number, month: number, date: number): boolean {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === date
  );
}

// ─── component ───────────────────────────────────────────────────────────────

export function CalendarScreen() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [checkinMap, setCheckinMap] = useState<Record<string, DailyCheckin>>({});
  const [assessmentDays, setAssessmentDays] = useState<Set<string>>(new Set());
  const [todayCheckin, setTodayCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Refetch on focus (so a check-in just made shows up) and on month change.
  // Also fetch today's check-in so it can be pinned onto today's local cell
  // even if the backend filed it under the previous (UTC) day.
  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController();
      setIsLoading(true);
      setLoadError(null);

      Promise.all([
        CheckinService.getCheckins(
          { year, month, limit: 100, sortOrder: "asc" },
          { signal: controller.signal },
        ),
        CheckinService.getTodayCheckin({ signal: controller.signal }),
      ])
        .then(([res, today]) => {
          const map: Record<string, DailyCheckin> = {};
          for (const c of res.data) {
            map[c.checkinDate] = c;
          }
          setCheckinMap(map);
          setTodayCheckin(today);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
          setLoadError(
            err instanceof ApiError ? err.message : "Gagal memuat data.",
          );
          setIsLoading(false);
        });

      return () => controller.abort();
    }, [year, month]),
  );

  // Mark days that have an AI assessment (by the day it was generated).
  useEffect(() => {
    const controller = new AbortController();
    AiAssessmentService.listAssessments({ signal: controller.signal })
      .then((list) => {
        setAssessmentDays(new Set(list.map((a) => a.created_at.slice(0, 10))));
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  function prevMonth() {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
    setCheckinMap({});
  }

  function nextMonth() {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
    setCheckinMap({});
  }

  const cells = buildCalendarGrid(year, month);
  const weeks: CalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  // Pin today's check-in onto today's local cell when it was actually created
  // today (device-local), so a fresh check-in always shows on today even if the
  // backend filed it under the previous UTC day. Deduped by id.
  const todayKey = toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const checkinByDate: Record<string, DailyCheckin> =
    todayCheckin &&
    new Date(todayCheckin.createdAt).toDateString() === now.toDateString()
      ? {
          ...Object.fromEntries(
            Object.entries(checkinMap).filter(
              ([, c]) => c.id !== todayCheckin.id,
            ),
          ),
          [todayKey]: todayCheckin,
        }
      : checkinMap;

  // Don't allow navigating into the future beyond current month
  const nowYear = now.getFullYear();
  const nowMonth = now.getMonth() + 1;
  const isFutureMonth =
    year > nowYear || (year === nowYear && month > nowMonth);

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-10 pt-4 gap-5"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Month navigation ── */}
      <View className="flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bulan sebelumnya"
          className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white active:opacity-60"
          onPress={prevMonth}
        >
          <ChevronLeft color="#263238" size={20} strokeWidth={2} />
        </Pressable>

        <Text className="text-[17px] font-extrabold text-brand-ink">
          {MONTHS_ID[month - 1]} {year}
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bulan berikutnya"
          className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white active:opacity-60"
          disabled={isFutureMonth}
          onPress={nextMonth}
          style={isFutureMonth ? { opacity: 0.3 } : undefined}
        >
          <ChevronRight color="#263238" size={20} strokeWidth={2} />
        </Pressable>
      </View>

      {/* ── Legend ── */}
      <View className="flex-row items-center gap-4 px-1">
        <View className="flex-row items-center gap-1.5">
          <RNView style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#34C07B" }} />
          <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.6 }}>Minum obat</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <RNView style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF9500" }} />
          <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.6 }}>Ada keluhan</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <RNView style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#FF6B6B" }} />
          <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.6 }}>Terlewat</Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <RNView style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: AI_MARKER_COLOR }} />
          <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.6 }}>Analisis AI</Text>
        </View>
      </View>

      {/* ── Calendar grid ── */}
      <View className="rounded-card border border-brand-border bg-brand-white overflow-hidden">
        {/* Day headers */}
        <View className="flex-row border-b border-brand-border bg-brand-mist px-2 py-2">
          {DAY_HEADERS.map((d) => (
            <View className="flex-1 items-center" key={d}>
              <Text
                className="text-[11px] font-semibold text-brand-ink"
                style={{ opacity: 0.45 }}
              >
                {d}
              </Text>
            </View>
          ))}
        </View>

        {/* Loading overlay */}
        {isLoading && (
          <View className="items-center py-12">
            <ActivityIndicator color="#263238" />
          </View>
        )}

        {/* Error state */}
        {!isLoading && loadError && (
          <View className="items-center gap-3 py-10 px-5">
            <Text
              className="text-center text-[14px] text-brand-ink"
              style={{ opacity: 0.6 }}
            >
              {loadError}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-9 flex-row items-center gap-2 rounded-control bg-brand-ink px-4"
              onPress={() => {
                setLoadError(null);
                setIsLoading(true);
                // trigger re-fetch by toggling month then back
                setMonth((m) => m); // no-op, useEffect won't re-run unless deps change
                // Better: use a refetch key
              }}
            >
              <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />
              <Text className="text-[13px] font-bold text-brand-white">
                Coba lagi
              </Text>
            </Pressable>
          </View>
        )}

        {/* Date cells */}
        {!isLoading && !loadError &&
          weeks.map((week, wi) => (
            <View
              className={[
                "flex-row px-2",
                wi < weeks.length - 1 ? "border-b border-brand-border" : "",
              ].join(" ")}
              key={wi}
            >
              {week.map((cell) => {
                const key = toDateKey(cell.year, cell.month, cell.date);
                const checkin = cell.isCurrentMonth ? checkinByDate[key] : undefined;
                const hasAssessment =
                  cell.isCurrentMonth && assessmentDays.has(key);
                const today = isToday(cell.year, cell.month, cell.date);
                const detailId = checkin?.id ?? null;
                const isFuture =
                  cell.isCurrentMonth &&
                  new Date(cell.year, cell.month - 1, cell.date) > now;

                return (
                  <Pressable
                    accessibilityRole={detailId ? "button" : "none"}
                    className="flex-1 items-center py-3 gap-1 active:opacity-60"
                    disabled={!detailId}
                    key={key}
                    onPress={() => {
                      if (detailId) {
                        router.push(`/checkin-detail/${detailId}` as Href);
                      }
                    }}
                  >
                    {/* Date number */}
                    <RNView
                      style={[
                        {
                          width: 30,
                          height: 30,
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 15,
                        },
                        today && { backgroundColor: "#A3E7E2" },
                      ]}
                    >
                      <Text
                        className="text-[13px] font-bold text-brand-ink"
                        style={{
                          opacity: !cell.isCurrentMonth
                            ? 0.2
                            : isFuture
                              ? 0.35
                              : 1,
                        }}
                      >
                        {cell.date}
                      </Text>
                    </RNView>

                    {/* Dots: check-in status + AI assessment marker */}
                    <RNView
                      style={{
                        flexDirection: "row",
                        gap: 3,
                        height: 6,
                        alignItems: "center",
                      }}
                    >
                      {checkin ? (
                        <RNView
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: checkinDotColor(checkin),
                          }}
                        />
                      ) : null}
                      {hasAssessment ? (
                        <RNView
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: AI_MARKER_COLOR,
                          }}
                        />
                      ) : null}
                    </RNView>
                  </Pressable>
                );
              })}
            </View>
          ))}
      </View>

      {/* ── Summary row ── */}
      {!isLoading && !loadError && (
        <View className="flex-row gap-3">
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white items-center py-4 gap-1">
            <Text className="text-[24px] font-extrabold text-brand-ink">
              {Object.values(checkinMap).filter((c) => c.hasTakenMedicine).length}
            </Text>
            <Text
              className="text-[11px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Minum obat
            </Text>
          </View>
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white items-center py-4 gap-1">
            <Text className="text-[24px] font-extrabold text-brand-ink">
              {Object.values(checkinMap).filter((c) => c.hasComplaint).length}
            </Text>
            <Text
              className="text-[11px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Ada keluhan
            </Text>
          </View>
          <View className="flex-1 rounded-card border border-brand-border bg-brand-white items-center py-4 gap-1">
            <Text className="text-[24px] font-extrabold text-brand-ink">
              {Object.values(checkinMap).filter((c) => !c.hasTakenMedicine).length}
            </Text>
            <Text
              className="text-[11px] font-semibold text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Terlewat
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
