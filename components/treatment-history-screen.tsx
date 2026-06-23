import { router, type Href } from "expo-router";
import { ChevronRight } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { PatientService } from "../services/repository/patient-service";
import type { PatientHistorySummary } from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

export function TreatmentHistoryScreen() {
  const [items, setItems] = useState<PatientHistorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    PatientService.getHistory({ signal: controller.signal })
      .then(setItems)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Riwayat pengobatan gagal dimuat.");
        }
      })
      .finally(() => setIsLoading(false));
    return () => controller.abort();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="gap-3 px-5 py-5"
      contentInsetAdjustmentBehavior="automatic"
    >
      {error ? (
        <View className="rounded-control border border-red-200 bg-red-50 p-4">
          <Text className="text-[13px] text-red-600">{error}</Text>
        </View>
      ) : null}
      {items.length === 0 ? (
        <View className="rounded-card border border-brand-border bg-brand-white p-5">
          <Text className="text-[15px] font-bold text-brand-ink">
            Belum ada riwayat pengobatan.
          </Text>
        </View>
      ) : (
        items.map((item) => (
          <Pressable
            accessibilityRole="button"
            className="flex-row items-center gap-3 rounded-card border border-brand-border bg-brand-white p-4"
            key={item.id}
            onPress={() => router.push(`/history/${item.id}` as Href)}
          >
            <View className="flex-1 gap-1">
              <Text className="text-[15px] font-bold text-brand-ink">
                {statusLabel(item.status)}
              </Text>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                {formatDate(item.treatmentStartDate)} –{" "}
                {formatDate(item.endedAt ?? item.estimatedTreatmentEndDate)}
              </Text>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                {item.totalCheckins} check-in
              </Text>
            </View>
            <ChevronRight color="#263238" size={18} opacity={0.35} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

export function formatDate(value: string | null): string {
  if (!value) return "Belum ditentukan";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function statusLabel(status: PatientHistorySummary["status"]): string {
  return {
    ACTIVE: "Sedang menjalani pengobatan",
    RECOVERED: "Pengobatan selesai",
    DROPPED: "Pengobatan terhenti",
    CANCELLED: "Episode dibatalkan",
  }[status];
}
