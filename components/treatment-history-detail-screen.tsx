import { useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";

import { PatientService } from "../services/repository/patient-service";
import type { PatientProfile } from "../services/repository/types";
import { ScrollView, Text, View } from "./tw";
import { formatDate, statusLabel } from "./treatment-history-screen";

export function TreatmentHistoryDetailScreen({
  profileId,
}: {
  profileId?: string;
}) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileId) {
      setError("ID riwayat tidak valid.");
      return;
    }
    const controller = new AbortController();
    PatientService.getHistoryById(profileId, { signal: controller.signal })
      .then(setProfile)
      .catch(() => {
        if (!controller.signal.aborted) {
          setError("Detail pengobatan gagal dimuat.");
        }
      });
    return () => controller.abort();
  }, [profileId]);

  if (!profile && !error) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="gap-4 px-5 py-5"
      contentInsetAdjustmentBehavior="automatic"
    >
      {error ? (
        <View className="rounded-control border border-red-200 bg-red-50 p-4">
          <Text className="text-[13px] text-red-600">{error}</Text>
        </View>
      ) : null}
      {profile ? (
        <>
          <View className="gap-2 rounded-card bg-brand-aqua p-5">
            <Text className="text-[20px] font-extrabold text-brand-ink">
              {statusLabel(profile.status)}
            </Text>
            <Text
              className="text-[13px] text-brand-ink"
              style={{ opacity: 0.6 }}
            >
              {formatDate(profile.treatmentStartDate)} –{" "}
              {formatDate(profile.endedAt ?? profile.estimatedTreatmentEndDate)}
            </Text>
            {profile.endedReason ? (
              <Text className="text-[13px] leading-5 text-brand-ink">
                {profile.endedReason}
              </Text>
            ) : null}
          </View>
          <View className="gap-3 rounded-card border border-brand-border bg-brand-white p-5">
            <HistoryRow
              label="Tanggal diagnosis"
              value={formatDate(profile.diagnosisDate)}
            />
            <HistoryRow label="Waktu minum obat" value={profile.medicineTime} />
            <HistoryRow
              label="Durasi pengobatan"
              value={`${profile.treatmentDurationMonths} bulan`}
            />
            <HistoryRow
              label="Total check-in"
              value={String(profile.totalCheckins)}
            />
            <HistoryRow
              label="Hari terlewat"
              value={String(profile.totalMissedDays)}
            />
            <HistoryRow
              label="Streak terpanjang"
              value={`${profile.longestStreak} hari`}
            />
          </View>
          {profile.pmos.length > 0 ? (
            <View className="gap-3 rounded-card border border-brand-border bg-brand-white p-5">
              <Text className="text-[15px] font-bold text-brand-ink">PMO</Text>
              {profile.pmos.map((pmo) => (
                <View className="gap-1" key={pmo.id}>
                  <Text className="text-[14px] font-semibold text-brand-ink">
                    {pmo.name}
                  </Text>
                  <Text
                    className="text-[12px] text-brand-ink"
                    style={{ opacity: 0.55 }}
                  >
                    {pmo.email}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

function HistoryRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between gap-4">
      <Text className="text-[13px] text-brand-ink" style={{ opacity: 0.55 }}>
        {label}
      </Text>
      <Text className="text-[13px] font-semibold text-brand-ink">{value}</Text>
    </View>
  );
}
