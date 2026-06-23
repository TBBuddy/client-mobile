import { Check, CircleCheck, Flame, RefreshCw } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  TextInput as RNTextInput,
} from "react-native";

import { ApiError } from "../services/repository/api-error";
import { CheckinService } from "../services/repository/checkin-service";
import { PatientService } from "../services/repository/patient-service";
import { SymptomService } from "../services/repository/symptom-service";
import type {
  CheckinSymptom,
  PatientDashboard,
  Symptom,
} from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const SEVERITY_OPTIONS: {
  value: CheckinSymptom["severity"];
  label: string;
}[] = [
  { value: "MILD", label: "Ringan" },
  { value: "MODERATE", label: "Sedang" },
  { value: "SEVERE", label: "Berat" },
];

type SelectedSymptomEntry = {
  severity: CheckinSymptom["severity"];
  note: string;
};

function formatFullDateID(date: Date): string {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

export function CheckInScreen() {
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const [hasComplaint, setHasComplaint] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<
    Record<string, SelectedSymptomEntry>
  >({});
  const [generalNote, setGeneralNote] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkedInNow, setCheckedInNow] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      PatientService.getDashboard({ signal: controller.signal }),
      SymptomService.listSymptoms({ signal: controller.signal }),
    ])
      .then(([dashboardData, symptomsData]) => {
        setDashboard(dashboardData);
        setSymptoms(symptomsData);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(err instanceof ApiError ? err.message : "Gagal memuat data.");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [refetchKey]);

  function toggleSymptom(id: string) {
    setSelectedSymptoms((prev) => {
      if (prev[id]) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { severity: "MILD", note: "" } };
    });
  }

  function setSymptomSeverity(id: string, severity: CheckinSymptom["severity"]) {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [id]: { ...prev[id], severity },
    }));
  }

  function setSymptomNote(id: string, note: string) {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [id]: { ...prev[id], note },
    }));
  }

  async function handleSubmit() {
    setSubmitError(null);
    setIsSubmitting(true);

    const symptomsPayload: CheckinSymptom[] = Object.entries(
      selectedSymptoms,
    ).map(([symptomId, { severity, note }]) => ({
      symptomId,
      severity,
      note: note.trim() || undefined,
    }));

    try {
      await CheckinService.createCheckin({
        hasTakenMedicine: true,
        hasComplaint: hasComplaint && symptomsPayload.length > 0,
        ...(generalNote.trim() && { generalNote: generalNote.trim() }),
        ...(symptomsPayload.length > 0 && { symptoms: symptomsPayload }),
      });
      setCheckedInNow(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCheckedInNow(true);
        return;
      }
      setSubmitError(
        err instanceof ApiError
          ? `[${err.status}] ${err.message}`
          : "Gagal melakukan check-in. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" size="large" />
      </View>
    );
  }

  if (loadError || !dashboard) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-brand-mist px-8">
        <Text
          className="text-center text-[15px] text-brand-ink"
          style={{ opacity: 0.6 }}
        >
          {loadError ?? "Gagal memuat data."}
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

  const alreadyDone = checkedInNow || dashboard.todayCheckin !== null;
  const today = new Date();

  if (alreadyDone) {
    const displayStreak = checkedInNow
      ? dashboard.currentStreak + 1
      : dashboard.currentStreak;
    const displayTotal = checkedInNow
      ? dashboard.totalCheckins + 1
      : dashboard.totalCheckins;

    return (
      <ScrollView
        className="flex-1 bg-brand-mist"
        contentContainerClassName="flex-grow items-center justify-center px-5 py-10 gap-6"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="h-28 w-28 items-center justify-center rounded-full bg-brand-aqua">
          <CircleCheck color="#263238" size={56} strokeWidth={1.75} />
        </View>

        <View className="items-center gap-2">
          <Text className="text-[28px] font-extrabold text-brand-ink">
            Mantap! 🎉
          </Text>
          <Text
            className="text-center text-[15px] leading-6 text-brand-ink"
            style={{ opacity: 0.6 }}
          >
            Check-in hari ini sudah tercatat.{"\n"}Tetap semangat!
          </Text>
          <Text
            className="mt-1 text-[13px] text-brand-ink"
            style={{ opacity: 0.4 }}
          >
            {formatFullDateID(today)}
          </Text>
        </View>

        <View className="w-full rounded-card border border-brand-border bg-brand-white p-5">
          <View className="flex-row items-center justify-between">
            <View className="gap-0.5">
              <Text
                className="text-[12px] font-semibold text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Streak aktif
              </Text>
              <View className="flex-row items-end gap-1.5">
                <Text className="text-[36px] font-extrabold leading-10 text-brand-ink">
                  {displayStreak}
                </Text>
                <Flame
                  color="#FF6B35"
                  size={22}
                  strokeWidth={1.75}
                  style={{ marginBottom: 5 }}
                />
              </View>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                hari berturut-turut
              </Text>
            </View>

            <View className="items-end gap-0.5">
              <Text
                className="text-[12px] font-semibold text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Total check-in
              </Text>
              <Text className="text-[36px] font-extrabold leading-10 text-brand-ink">
                {displayTotal}
              </Text>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                hari tercatat
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-10 pt-6 gap-5"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-[28px] font-extrabold leading-8 text-brand-ink">
          Check-in Harian
        </Text>
        <Text
          className="text-[14px] text-brand-ink"
          style={{ opacity: 0.55 }}
        >
          {formatFullDateID(today)}
        </Text>
      </View>

      <View className="rounded-card border border-brand-border bg-brand-white p-4 gap-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-[13px] font-semibold text-brand-ink">
            Ada keluhan hari ini?
          </Text>
          <Pressable
            accessibilityRole="switch"
            className={[
              "h-7 w-12 rounded-full",
              hasComplaint ? "bg-brand-aqua" : "bg-brand-border",
            ].join(" ")}
            onPress={() => {
              setHasComplaint((v) => !v);
              if (hasComplaint) setSelectedSymptoms({});
            }}
          >
            <View
              className="absolute top-1 h-5 w-5 rounded-full bg-brand-white"
              style={{
                left: hasComplaint ? undefined : 4,
                right: hasComplaint ? 4 : undefined,
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
              }}
            />
          </Pressable>
        </View>

        {hasComplaint && (
          <View className="gap-1">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Pilih gejala yang dirasakan
            </Text>
            <Text
              className="mb-2 text-[12px] text-brand-ink"
              style={{ opacity: 0.45 }}
            >
              Pilih satu atau lebih, lalu tentukan tingkat keparahannya.
            </Text>

            {symptoms.map((symptom) => {
              const entry = selectedSymptoms[symptom.id];
              const isChecked = !!entry;

              return (
                <View key={symptom.id}>
                  <Pressable
                    accessibilityRole="checkbox"
                    className="flex-row items-center gap-3 py-2.5"
                    onPress={() => toggleSymptom(symptom.id)}
                  >
                    <View
                      className="h-5 w-5 items-center justify-center rounded border-2"
                      style={{
                        borderColor: isChecked
                          ? "#A3E7E2"
                          : "rgba(38,50,56,0.2)",
                        backgroundColor: isChecked ? "#A3E7E2" : "transparent",
                      }}
                    >
                      {isChecked && (
                        <Check color="#263238" size={12} strokeWidth={3} />
                      )}
                    </View>
                    <Text
                      className="flex-1 text-[14px] text-brand-ink"
                      style={isChecked ? undefined : { opacity: 0.75 }}
                    >
                      {symptom.name}
                    </Text>
                  </Pressable>

                  {isChecked && (
                    <View className="mb-2 ml-8 gap-2.5 rounded-xl border border-brand-border bg-brand-mist p-3">
                      <View className="gap-1.5">
                        <Text
                          className="text-[11px] font-semibold text-brand-ink"
                          style={{ opacity: 0.5 }}
                        >
                          TINGKAT KEPARAHAN
                        </Text>
                        <View className="flex-row gap-2">
                          {SEVERITY_OPTIONS.map((sev) => {
                            const isActive = entry.severity === sev.value;
                            return (
                              <Pressable
                                accessibilityRole="button"
                                className={[
                                  "flex-1 h-8 items-center justify-center rounded-lg border",
                                  isActive
                                    ? "border-brand-ink bg-brand-ink"
                                    : "border-brand-border bg-brand-white",
                                ].join(" ")}
                                key={sev.value}
                                onPress={() =>
                                  setSymptomSeverity(symptom.id, sev.value)
                                }
                              >
                                <Text
                                  className={[
                                    "text-[12px] font-bold",
                                    isActive
                                      ? "text-brand-white"
                                      : "text-brand-ink",
                                  ].join(" ")}
                                  style={isActive ? undefined : { opacity: 0.55 }}
                                >
                                  {sev.label}
                                </Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      </View>

                      <View className="gap-1.5">
                        <Text
                          className="text-[11px] font-semibold text-brand-ink"
                          style={{ opacity: 0.5 }}
                        >
                          CATATAN{" "}
                          <Text style={{ opacity: 0.6, fontWeight: "400" }}>
                            (opsional)
                          </Text>
                        </Text>
                        <View className="min-h-[48px] rounded-lg border border-brand-border bg-brand-white px-3 py-2">
                          <RNTextInput
                            multiline
                            onChangeText={(v) => setSymptomNote(symptom.id, v)}
                            placeholder="Deskripsikan gejala ini..."
                            placeholderTextColor="rgba(38,50,56,0.3)"
                            style={{
                              color: "#263238",
                              fontSize: 13,
                              lineHeight: 20,
                            }}
                            value={entry.note}
                          />
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        <View className="gap-1.5">
          <Text className="text-[13px] font-semibold text-brand-ink">
            Catatan umum{" "}
            <Text style={{ opacity: 0.4 }}>(opsional)</Text>
          </Text>
          <View className="min-h-[72px] rounded-control border border-brand-border bg-brand-mist px-4 py-3">
            <RNTextInput
              multiline
              onChangeText={setGeneralNote}
              placeholder="Ada yang ingin kamu sampaikan?"
              placeholderTextColor="rgba(38,50,56,0.35)"
              style={{ color: "#263238", fontSize: 15, lineHeight: 22 }}
              value={generalNote}
            />
          </View>
        </View>
      </View>

      {submitError ? (
        <View className="rounded-control border border-red-200 bg-red-50 px-4 py-3">
          <Text className="text-[13px] leading-5 text-red-600">
            {submitError}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        className="h-[52px] items-center justify-center rounded-control bg-brand-ink"
        disabled={isSubmitting}
        onPress={handleSubmit}
        style={isSubmitting ? { opacity: 0.55 } : undefined}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-[16px] font-bold text-brand-white">
            Simpan check-in
          </Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
