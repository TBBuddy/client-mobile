import { CircleCheck, Flame, RefreshCw } from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  type TextInput as RNTextInputType,
} from "react-native";

import { ApiError } from "../services/repository/api-error";
import { CheckinService } from "../services/repository/checkin-service";
import { PatientService } from "../services/repository/patient-service";
import type { PatientDashboard } from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function formatFullDateID(date: Date): string {
  return `${date.getDate()} ${MONTHS_ID[date.getMonth()]} ${date.getFullYear()}`;
}

function maskTime(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function CheckInScreen() {
  const [dashboard, setDashboard] = useState<PatientDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const [hasTakenMedicine, setHasTakenMedicine] = useState<boolean | null>(null);
  const [takenAt, setTakenAt] = useState("");
  const [hasComplaint, setHasComplaint] = useState(false);
  const [generalNote, setGeneralNote] = useState("");
  const [skippedReason, setSkippedReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkedInNow, setCheckedInNow] = useState(false);

  const noteRef = useRef<RNTextInputType>(null);
  const reasonRef = useRef<RNTextInputType>(null);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadError(null);

    PatientService.getDashboard({ signal: controller.signal })
      .then((data) => {
        setDashboard(data);
        setTakenAt(data.medicineTime ?? "");
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(err instanceof ApiError ? err.message : "Gagal memuat data.");
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [refetchKey]);

  async function handleSubmit() {
    if (hasTakenMedicine === null) return;
    if (!hasTakenMedicine && !skippedReason.trim()) {
      setSubmitError("Masukkan alasan melewatkan minum obat.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await CheckinService.createCheckin({
        hasTakenMedicine,
        hasComplaint: hasTakenMedicine ? hasComplaint : false,
        takenAt: hasTakenMedicine && takenAt.length === 5 ? takenAt : undefined,
        skippedReason: !hasTakenMedicine ? skippedReason.trim() : undefined,
        generalNote: generalNote.trim() || undefined,
        symptoms: [],
      });
      setCheckedInNow(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setCheckedInNow(true);
        return;
      }
      setSubmitError(
        err instanceof ApiError
          ? err.message
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

  const canSubmit = hasTakenMedicine !== null;

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

      <View className="gap-3">
        <Text className="text-[15px] font-bold text-brand-ink">
          Sudah minum obat hari ini?
        </Text>
        <View className="flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            className={[
              "flex-1 h-14 items-center justify-center rounded-control border-2",
              hasTakenMedicine === true
                ? "border-brand-aqua bg-brand-aqua"
                : "border-brand-border bg-brand-white",
            ].join(" ")}
            onPress={() => {
              setHasTakenMedicine(true);
              setSubmitError(null);
            }}
          >
            <Text
              className={[
                "text-[15px] font-bold",
                hasTakenMedicine === true ? "text-brand-ink" : "text-brand-ink",
              ].join(" ")}
              style={hasTakenMedicine === true ? undefined : { opacity: 0.5 }}
            >
              ✓ Sudah
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            className={[
              "flex-1 h-14 items-center justify-center rounded-control border-2",
              hasTakenMedicine === false
                ? "border-brand-ink bg-brand-ink"
                : "border-brand-border bg-brand-white",
            ].join(" ")}
            onPress={() => {
              setHasTakenMedicine(false);
              setSubmitError(null);
            }}
          >
            <Text
              className={[
                "text-[15px] font-bold",
                hasTakenMedicine === false
                  ? "text-brand-white"
                  : "text-brand-ink",
              ].join(" ")}
              style={hasTakenMedicine === false ? undefined : { opacity: 0.5 }}
            >
              ✗ Belum
            </Text>
          </Pressable>
        </View>
      </View>

      {hasTakenMedicine === true && (
        <View className="gap-4 rounded-card border border-brand-border bg-brand-white p-4">
          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Waktu minum obat
            </Text>
            <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-mist px-4">
              <RNTextInput
                keyboardType="numeric"
                maxLength={5}
                onChangeText={(v) => setTakenAt(maskTime(v))}
                placeholder="08:00"
                placeholderTextColor="rgba(38,50,56,0.35)"
                returnKeyType="next"
                onSubmitEditing={() => noteRef.current?.focus()}
                style={{ color: "#263238", fontSize: 15 }}
                value={takenAt}
              />
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Ada keluhan?
            </Text>
            <Pressable
              accessibilityRole="switch"
              className={[
                "h-7 w-12 rounded-full",
                hasComplaint ? "bg-brand-aqua" : "bg-brand-border",
              ].join(" ")}
              onPress={() => setHasComplaint((v) => !v)}
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
            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Catatan keluhan
              </Text>
              <View className="min-h-[80px] rounded-control border border-brand-border bg-brand-mist px-4 py-3">
                <RNTextInput
                  multiline
                  onChangeText={setGeneralNote}
                  placeholder="Jelaskan keluhan yang kamu rasakan..."
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={noteRef}
                  style={{ color: "#263238", fontSize: 15, lineHeight: 22 }}
                  value={generalNote}
                />
              </View>
            </View>
          )}
        </View>
      )}

      {hasTakenMedicine === false && (
        <View className="gap-4 rounded-card border border-brand-border bg-brand-white p-4">
          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Alasan melewatkan{" "}
              <Text className="text-red-500">*</Text>
            </Text>
            <View className="min-h-[80px] rounded-control border border-brand-border bg-brand-mist px-4 py-3">
              <RNTextInput
                multiline
                onChangeText={(v) => {
                  setSkippedReason(v);
                  if (submitError) setSubmitError(null);
                }}
                placeholder="Contoh: lupa, efek samping, kehabisan obat..."
                placeholderTextColor="rgba(38,50,56,0.35)"
                ref={reasonRef}
                style={{ color: "#263238", fontSize: 15, lineHeight: 22 }}
                value={skippedReason}
              />
            </View>
          </View>

          <View className="gap-1.5">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Catatan tambahan{" "}
              <Text style={{ opacity: 0.4 }}>(opsional)</Text>
            </Text>
            <View className="min-h-[80px] rounded-control border border-brand-border bg-brand-mist px-4 py-3">
              <RNTextInput
                multiline
                onChangeText={setGeneralNote}
                placeholder="Ada yang ingin kamu sampaikan?"
                placeholderTextColor="rgba(38,50,56,0.35)"
                ref={noteRef}
                style={{ color: "#263238", fontSize: 15, lineHeight: 22 }}
                value={generalNote}
              />
            </View>
          </View>
        </View>
      )}

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
        disabled={!canSubmit || isSubmitting}
        onPress={handleSubmit}
        style={!canSubmit || isSubmitting ? { opacity: 0.45 } : undefined}
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
