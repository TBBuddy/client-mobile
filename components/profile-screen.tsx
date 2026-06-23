import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock,
  Flame,
  LogOut,
  Pencil,
  Phone,
  Pill,
  RefreshCw,
  Users,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "../context/auth-context";
import { ApiError } from "../services/repository/api-error";
import { AuthService } from "../services/repository/auth-service";
import { MedicineStockService } from "../services/repository/medicine-stock-service";
import { PatientService } from "../services/repository/patient-service";
import type {
  ClosePatientProfileRequest,
  MedicineStock,
  PatientProfile,
} from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

const MONTHS_ID = [
  "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
  "Jul", "Agu", "Sep", "Okt", "Nov", "Des",
];

const ROLE_LABEL: Record<string, string> = {
  PATIENT: "Pasien",
  SUPPORTER: "Pendukung",
  ADMIN: "Admin",
};

function formatDateID(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getDate()} ${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`;
}

function getInitials(fullName: string | null, username: string): string {
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  }
  return username[0].toUpperCase();
}

export function ProfileScreen() {
  const { user, signOut, refreshSession } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(
    user?.role === "PATIENT",
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isClosingEpisode, setIsClosingEpisode] = useState(false);
  const [stocks, setStocks] = useState<MedicineStock[]>([]);

  useEffect(() => {
    if (!user?.hasActivePatientProfile) return;

    const controller = new AbortController();
    setIsLoadingProfile(true);
    setLoadError(null);

    PatientService.getProfile({ signal: controller.signal })
      .then((data) => {
        setProfile(data);
        setIsLoadingProfile(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setLoadError(err instanceof ApiError ? err.message : "Gagal memuat profil.");
        setIsLoadingProfile(false);
      });

    return () => controller.abort();
  }, [refetchKey, user?.hasActivePatientProfile]);

  useEffect(() => {
    if (!user?.hasActivePatientProfile) return;
    const controller = new AbortController();
    MedicineStockService.listStocks({ signal: controller.signal })
      .then((res) => setStocks(res.data.filter((s) => s.isActive)))
      .catch(() => {});
    return () => controller.abort();
  }, [user?.hasActivePatientProfile]);

  async function handleCloseEpisode(
    outcome: ClosePatientProfileRequest["outcome"],
  ) {
    setIsClosingEpisode(true);
    try {
      await PatientService.closeProfile({ outcome });
      await refreshSession();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Gagal menutup pengobatan",
        error instanceof ApiError
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setIsClosingEpisode(false);
    }
  }

  function confirmCloseEpisode(
    outcome: ClosePatientProfileRequest["outcome"],
    title: string,
    message: string,
  ) {
    Alert.alert(title, message, [
      { text: "Kembali", style: "cancel" },
      {
        text: outcome === "RECOVERED" ? "Konfirmasi" : "Tutup pengobatan",
        style: outcome === "RECOVERED" ? "default" : "destructive",
        onPress: () => void handleCloseEpisode(outcome),
      },
    ]);
  }

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await AuthService.logout();
    } catch {
    } finally {
      setIsLoggingOut(false);
    }
    signOut();
  }

  if (!user) return null;

  const initials = getInitials(user.fullName, user.username);
  const isPatient = user.role === "PATIENT" && user.hasActivePatientProfile;
  const activePmos = profile?.pmos.filter((p) => p.isActive) ?? [];

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-10 pt-6 gap-5"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="items-center gap-3 py-2">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-aqua">
          <Text className="text-[30px] font-extrabold text-brand-ink">
            {initials}
          </Text>
        </View>

        <View className="items-center gap-1">
          <Text className="text-[22px] font-extrabold text-brand-ink">
            {user.fullName ?? user.username}
          </Text>
          <Text
            className="text-[14px] text-brand-ink"
            style={{ opacity: 0.5 }}
          >
            @{user.username}
          </Text>
          <Text
            className="text-[13px] text-brand-ink"
            style={{ opacity: 0.45 }}
          >
            {user.email}
          </Text>
        </View>

        <View className="rounded-full bg-brand-aqua px-3 py-1">
          <Text className="text-[12px] font-bold text-brand-ink">
            {ROLE_LABEL[user.role] ?? user.role}
          </Text>
        </View>
      </View>

      {isPatient && isLoadingProfile && (
        <View className="items-center py-6">
          <ActivityIndicator color="#263238" />
        </View>
      )}

      {isPatient && loadError && (
        <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-5">
          <Text
            className="text-center text-[14px] text-brand-ink"
            style={{ opacity: 0.6 }}
          >
            {loadError}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="h-9 flex-row items-center gap-2 rounded-control bg-brand-ink px-4"
            onPress={() => setRefetchKey((v) => v + 1)}
          >
            <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />
            <Text className="text-[13px] font-bold text-brand-white">
              Coba lagi
            </Text>
          </Pressable>
        </View>
      )}

      {isPatient && stocks.length > 0 && (
        <Pressable
          accessibilityRole="button"
          className="rounded-card border border-brand-border bg-brand-white overflow-hidden active:opacity-75"
          onPress={() => router.push("/medicine-stocks")}
        >
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist">
              <Pill color="#263238" size={17} strokeWidth={2} />
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[14px] font-semibold text-brand-ink">
                Stok Obat
              </Text>
              {stocks.some((s) => s.isBelowThreshold) ? (
                <View className="flex-row items-center gap-1">
                  <AlertTriangle color="#EF4444" size={11} strokeWidth={2.5} />
                  <Text className="text-[12px]" style={{ color: "#EF4444" }}>
                    {stocks.filter((s) => s.isBelowThreshold).length} obat stok menipis
                  </Text>
                </View>
              ) : (
                <Text
                  className="text-[12px] text-brand-ink"
                  style={{ opacity: 0.5 }}
                >
                  {stocks.length} obat terdaftar · semua aman
                </Text>
              )}
            </View>
            <View className="items-end gap-0.5">
              <Text className="text-[18px] font-extrabold text-brand-ink">
                {stocks.length}
              </Text>
              <Text
                className="text-[10px] text-brand-ink"
                style={{ opacity: 0.4 }}
              >
                obat
              </Text>
            </View>
            <ChevronRight
              color="#263238"
              size={16}
              strokeWidth={2}
              style={{ opacity: 0.3 }}
            />
          </View>
        </Pressable>
      )}

      {isPatient && stocks.length === 0 && (
        <Pressable
          accessibilityRole="button"
          className="rounded-card border border-brand-border bg-brand-white overflow-hidden active:opacity-75"
          onPress={() => router.push("/medicine-stocks")}
        >
          <View className="flex-row items-center gap-3 px-4 py-3.5">
            <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist">
              <Pill color="#263238" size={17} strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="text-[14px] font-semibold text-brand-ink">
                Stok Obat
              </Text>
              <Text
                className="text-[12px] text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Belum ada stok obat. Tap untuk menambahkan.
              </Text>
            </View>
            <ChevronRight
              color="#263238"
              size={16}
              strokeWidth={2}
              style={{ opacity: 0.3 }}
            />
          </View>
        </Pressable>
      )}

      {isPatient && profile && (
        <>
          <View className="flex-row gap-3">
            <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-0.5">
              <Text
                className="text-[11px] font-semibold text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Streak aktif
              </Text>
              <View className="flex-row items-end gap-1">
                <Text className="text-[28px] font-extrabold leading-8 text-brand-ink">
                  {profile.currentStreak}
                </Text>
                <Flame
                  color="#FF6B35"
                  size={18}
                  strokeWidth={1.75}
                  style={{ marginBottom: 3 }}
                />
              </View>
              <Text
                className="text-[11px] text-brand-ink"
                style={{ opacity: 0.45 }}
              >
                hari
              </Text>
            </View>

            <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-0.5">
              <Text
                className="text-[11px] font-semibold text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Total check-in
              </Text>
              <Text className="text-[28px] font-extrabold leading-8 text-brand-ink">
                {profile.totalCheckins}
              </Text>
              <Text
                className="text-[11px] text-brand-ink"
                style={{ opacity: 0.45 }}
              >
                hari tercatat
              </Text>
            </View>

            <View className="flex-1 rounded-card border border-brand-border bg-brand-white p-4 gap-0.5">
              <Text
                className="text-[11px] font-semibold text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                Terlewat
              </Text>
              <Text className="text-[28px] font-extrabold leading-8 text-brand-ink">
                {profile.totalMissedDays}
              </Text>
              <Text
                className="text-[11px] text-brand-ink"
                style={{ opacity: 0.45 }}
              >
                hari
              </Text>
            </View>
          </View>

          <View className="rounded-card border border-brand-border bg-brand-white divide-y divide-brand-border overflow-hidden">
            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
                <CalendarDays color="#263238" size={16} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[11px] font-semibold text-brand-ink"
                  style={{ opacity: 0.45 }}
                >
                  Mulai pengobatan
                </Text>
                <Text className="text-[14px] font-semibold text-brand-ink">
                  {profile.treatmentStartDate
                    ? formatDateID(profile.treatmentStartDate)
                    : "—"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-3 px-4 py-3.5">
              <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
                <Clock color="#263238" size={16} strokeWidth={2} />
              </View>
              <View className="flex-1">
                <Text
                  className="text-[11px] font-semibold text-brand-ink"
                  style={{ opacity: 0.45 }}
                >
                  Jadwal minum obat
                </Text>
                <Text className="text-[14px] font-semibold text-brand-ink">
                  {profile.medicineTime}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                className="flex-row items-center gap-1"
              >
                <Text className="text-[12px] font-semibold text-brand-aqua">
                  Ubah
                </Text>
                <ChevronRight color="#A3E7E2" size={13} strokeWidth={2.5} />
              </Pressable>
            </View>
          </View>

          {activePmos.length > 0 && (
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-[15px] font-bold text-brand-ink">
                  Pengawas Minum Obat
                </Text>
                <Pressable
                  accessibilityRole="button"
                  className="flex-row items-center gap-0.5"
                >
                  <Text className="text-[13px] font-semibold text-brand-aqua">
                    Kelola
                  </Text>
                  <ChevronRight color="#A3E7E2" size={13} strokeWidth={2.5} />
                </Pressable>
              </View>

              <View className="rounded-card border border-brand-border bg-brand-white overflow-hidden">
                {activePmos.map((pmo, index) => (
                  <View
                    className={[
                      "flex-row items-center gap-3 px-4 py-3.5",
                      index < activePmos.length - 1
                        ? "border-b border-brand-border"
                        : "",
                    ].join(" ")}
                    key={pmo.id}
                  >
                    <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-aqua">
                      <Users color="#263238" size={16} strokeWidth={2} />
                    </View>
                    <View className="flex-1 gap-0.5">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-[14px] font-semibold text-brand-ink">
                          {pmo.name}
                        </Text>
                        {pmo.isPrimary && (
                          <View className="rounded-full bg-brand-aqua px-2 py-0.5">
                            <Text className="text-[10px] font-bold text-brand-ink">
                              Utama
                            </Text>
                          </View>
                        )}
                      </View>
                      {pmo.relationship ? (
                        <Text
                          className="text-[12px] text-brand-ink"
                          style={{ opacity: 0.5 }}
                        >
                          {pmo.relationship}
                        </Text>
                      ) : null}
                    </View>
                    {(pmo.phoneNumber ?? pmo.whatsappNumber) ? (
                      <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
                        <Phone color="#263238" size={14} strokeWidth={2} />
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}

      {user.hasPatientHistory && (
        <Pressable
          accessibilityRole="button"
          className="rounded-card border border-brand-border bg-brand-white overflow-hidden active:opacity-70"
          onPress={() => router.push("/history")}
        >
          <View className="flex-row items-center gap-3 px-4 py-4">
            <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
              <Clock color="#263238" size={15} strokeWidth={2} />
            </View>
            <Text className="flex-1 text-[15px] font-semibold text-brand-ink">
              Riwayat pengobatan
            </Text>
            <ChevronRight
              color="#263238"
              size={16}
              strokeWidth={2}
              style={{ opacity: 0.3 }}
            />
          </View>
        </Pressable>
      )}

      {user.hasActivePatientProfile && (
        <View className="gap-2 rounded-card border border-brand-border bg-brand-white p-4">
          <Text className="text-[15px] font-bold text-brand-ink">
            Status pengobatan
          </Text>
          <Text
            className="text-[12px] leading-5 text-brand-ink"
            style={{ opacity: 0.55 }}
          >
            Menutup pengobatan akan memindahkan data episode ini ke riwayat.
          </Text>
          <Pressable
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-control bg-brand-aqua"
            disabled={isClosingEpisode}
            onPress={() =>
              confirmCloseEpisode(
                "RECOVERED",
                "Tandai sudah sembuh?",
                "Episode pengobatan aktif akan ditutup sebagai selesai.",
              )
            }
          >
            <Text className="text-[14px] font-bold text-brand-ink">
              Tandai sudah sembuh
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-control border border-brand-border"
            disabled={isClosingEpisode}
            onPress={() =>
              confirmCloseEpisode(
                "DROPPED",
                "Hentikan pengobatan?",
                "Episode ini akan ditutup dengan status putus pengobatan.",
              )
            }
          >
            <Text className="text-[14px] font-semibold text-brand-ink">
              Hentikan pengobatan
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            className="h-11 items-center justify-center rounded-control border border-red-200"
            disabled={isClosingEpisode}
            onPress={() =>
              confirmCloseEpisode(
                "CANCELLED",
                "Batalkan pengobatan?",
                "Gunakan ini jika onboarding atau episode dibuat secara keliru.",
              )
            }
          >
            {isClosingEpisode ? (
              <ActivityIndicator color="#DC2626" />
            ) : (
              <Text className="text-[14px] font-semibold text-red-600">
                Batalkan pengobatan
              </Text>
            )}
          </Pressable>
        </View>
      )}

      <View className="rounded-card border border-brand-border bg-brand-white overflow-hidden">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-3 px-4 py-4 active:opacity-70"
        >
          <View className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist">
            <Pencil color="#263238" size={15} strokeWidth={2} />
          </View>
          <Text className="flex-1 text-[15px] font-semibold text-brand-ink">
            Edit profil
          </Text>
          <ChevronRight color="#263238" size={16} strokeWidth={2} style={{ opacity: 0.3 }} />
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        className="h-[52px] flex-row items-center justify-center gap-2 rounded-control border-2 border-brand-ink bg-brand-white"
        disabled={isLoggingOut}
        onPress={handleLogout}
        style={isLoggingOut ? { opacity: 0.6 } : undefined}
      >
        {isLoggingOut ? (
          <ActivityIndicator color="#263238" />
        ) : (
          <>
            <LogOut color="#263238" size={18} strokeWidth={2} />
            <Text className="text-[16px] font-bold text-brand-ink">Keluar</Text>
          </>
        )}
      </Pressable>
    </ScrollView>
  );
}
