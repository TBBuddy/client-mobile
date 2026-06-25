import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  RefreshCw,
  XCircle,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, View as RNView } from "react-native";

import { AiAssessmentService } from "../services/repository/ai-assessment-service";
import { ApiError } from "../services/repository/api-error";
import { CheckinService } from "../services/repository/checkin-service";
import type {
  AiAssessment,
  DailyCheckin,
  SeverityLevel,
} from "../services/repository/types";
import { AiAssessmentCard } from "./ai-assessment-card";
import { normalizeCheckinDate } from "./checkin-date";
import { Pressable, ScrollView, Text, View } from "./tw";

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const DAYS_ID = [
  "Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu",
];

function formatCheckinDate(checkin: DailyCheckin): string {
  const [y, m, d] = normalizeCheckinDate(checkin.checkinDate)
    .split("-")
    .map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return `${DAYS_ID[dow]}, ${d} ${MONTHS_ID[m - 1]} ${y}`;
}

function severityLabel(level: SeverityLevel): string {
  if (level === "NONE") return "Tidak ada";
  if (level === "MILD") return "Ringan";
  if (level === "MODERATE") return "Sedang";
  return "Berat";
}

function severityColor(level: SeverityLevel): string {
  if (level === "MILD") return "#FF9500";
  if (level === "MODERATE") return "#FF6B35";
  if (level === "SEVERE") return "#FF3B30";
  return "#A3E7E2";
}

// ─── component ───────────────────────────────────────────────────────────────

type Props = { id: string };

export function CheckinDetailScreen({ id }: Props) {
  const [checkin, setCheckin] = useState<DailyCheckin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [assessment, setAssessment] = useState<AiAssessment | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    CheckinService.getCheckinById(id, { signal: controller.signal })
      .then((data) => {
        setCheckin(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(err instanceof ApiError ? err.message : "Gagal memuat data.");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, refetchKey]);

  // Only show an AI assessment on the check-in detail of the day it was
  // generated (i.e. the day the user requested it) — not on every day.
  useEffect(() => {
    if (!checkin) return;
    const controller = new AbortController();

    AiAssessmentService.listAssessments({ signal: controller.signal })
      .then((list) => {
        const dateKey = normalizeCheckinDate(checkin.checkinDate);
        const match = list.find(
          (a) => a.created_at.slice(0, 10) === dateKey,
        );
        setAssessment(match ?? null);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [checkin]);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" size="large" />
      </View>
    );
  }

  if (loadError || !checkin) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-brand-mist px-8">
        <Text
          className="text-center text-[15px] text-brand-ink"
          style={{ opacity: 0.6 }}
        >
          {loadError ?? "Data tidak ditemukan."}
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

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-10 pt-5 gap-4"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View className="gap-1">
        <Text className="text-[20px] font-extrabold text-brand-ink">
          {formatCheckinDate(checkin)}
        </Text>
        <Text
          className="text-[13px] text-brand-ink"
          style={{ opacity: 0.45 }}
        >
          Hari pengobatan ke-{checkin.treatmentDayNumber}
        </Text>
      </View>

      {/* ── Medicine status ── */}
      <View className="rounded-card border border-brand-border bg-brand-white p-4 gap-3">
        <Text className="text-[13px] font-bold text-brand-ink" style={{ opacity: 0.5 }}>
          MINUM OBAT
        </Text>

        <View className="flex-row items-center gap-3">
          {checkin.hasTakenMedicine ? (
            <CheckCircle2 color="#34C07B" size={24} strokeWidth={2} />
          ) : (
            <XCircle color="#FF6B6B" size={24} strokeWidth={2} />
          )}
          <View className="flex-1">
            <Text className="text-[15px] font-semibold text-brand-ink">
              {checkin.hasTakenMedicine ? "Sudah minum obat" : "Tidak minum obat"}
            </Text>
            {checkin.takenAt && (
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Pukul {checkin.takenAt}
              </Text>
            )}
            {checkin.skippedReason && (
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                Alasan: {checkin.skippedReason}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Complaint + symptoms ── */}
      <View className="rounded-card border border-brand-border bg-brand-white p-4 gap-3">
        <Text className="text-[13px] font-bold text-brand-ink" style={{ opacity: 0.5 }}>
          KELUHAN
        </Text>

        {!checkin.hasComplaint ? (
          <View className="flex-row items-center gap-3">
            <CheckCircle2 color="#34C07B" size={24} strokeWidth={2} />
            <Text className="text-[15px] font-semibold text-brand-ink">
              Tidak ada keluhan
            </Text>
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row items-center gap-2">
              <AlertTriangle color="#FF9500" size={18} strokeWidth={2} />
              <Text className="text-[14px] font-semibold text-brand-ink">
                Ada keluhan
              </Text>
              {checkin.severity !== "NONE" && (
                <View
                  className="rounded-full px-2 py-0.5"
                  style={{ backgroundColor: severityColor(checkin.severity) + "22" }}
                >
                  <Text
                    className="text-[11px] font-bold"
                    style={{ color: severityColor(checkin.severity) }}
                  >
                    {severityLabel(checkin.severity)}
                  </Text>
                </View>
              )}
            </View>

            {checkin.symptoms.length > 0 && (
              <View className="gap-2">
                {checkin.symptoms.map((s) => (
                  <View
                    className="rounded-xl border border-brand-border bg-brand-mist p-3 gap-1"
                    key={s.id}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-[14px] font-semibold text-brand-ink">
                        {s.name}
                      </Text>
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: severityColor(s.severity) + "22" }}
                      >
                        <Text
                          className="text-[11px] font-bold"
                          style={{ color: severityColor(s.severity) }}
                        >
                          {severityLabel(s.severity)}
                        </Text>
                      </View>
                    </View>
                    {s.note && (
                      <Text
                        className="text-[12px] leading-5 text-brand-ink"
                        style={{ opacity: 0.6 }}
                      >
                        {s.note}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* ── General note ── */}
      {checkin.generalNote && (
        <View className="rounded-card border border-brand-border bg-brand-white p-4 gap-3">
          <Text className="text-[13px] font-bold text-brand-ink" style={{ opacity: 0.5 }}>
            CATATAN UMUM
          </Text>
          <View className="flex-row items-start gap-2">
            <ClipboardList
              color="#263238"
              size={16}
              strokeWidth={2}
              style={{ opacity: 0.4, marginTop: 2 }}
            />
            <Text
              className="flex-1 text-[14px] leading-6 text-brand-ink"
              style={{ opacity: 0.75 }}
            >
              {checkin.generalNote}
            </Text>
          </View>
        </View>
      )}

      {/* ── AI assessment ── */}
      {assessment ? <AiAssessmentCard assessment={assessment} /> : null}

      {/* ── Timestamps ── */}
      <Text
        className="text-center text-[11px] text-brand-ink"
        style={{ opacity: 0.3 }}
      >
        Dicatat:{" "}
        {new Date(checkin.createdAt).toLocaleString("id-ID", {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </Text>
    </ScrollView>
  );
}
