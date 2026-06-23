import { router, type Href } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert } from "react-native";

import { useAuth } from "../../context/auth-context";
import { ApiError } from "../../services/repository/api-error";
import { AuthService } from "../../services/repository/auth-service";
import { PatientService } from "../../services/repository/patient-service";
import type { ClosePatientProfileRequest } from "../../services/repository/types";
import { Pressable, ScrollView, Text, View } from "../../components/tw";

export default function ProfilRoute() {
  const { refreshSession, signOut, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } catch {
    } finally {
      setIsLoading(false);
    }

    signOut();
  }

  function confirmClose(
    outcome: ClosePatientProfileRequest["outcome"],
    title: string,
  ) {
    Alert.alert(
      title,
      "Episode aktif akan ditutup. Riwayat tetap tersimpan dan tidak dapat diubah.",
      [
        { text: "Kembali", style: "cancel" },
        {
          text: "Tutup episode",
          style: outcome === "RECOVERED" ? "default" : "destructive",
          onPress: () => void handleClose(outcome),
        },
      ],
    );
  }

  async function handleClose(outcome: ClosePatientProfileRequest["outcome"]) {
    setIsLoading(true);
    try {
      await PatientService.closeProfile({ outcome });
      await refreshSession();
      router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Episode belum ditutup",
        error instanceof ApiError
          ? error.message
          : "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="flex-grow items-center justify-center gap-6 px-8 py-12"
      contentInsetAdjustmentBehavior="automatic"
    >
      <View className="h-20 w-20 items-center justify-center rounded-full bg-brand-aqua">
        <Text className="text-[32px] font-extrabold text-brand-ink">T</Text>
      </View>
      <Text className="text-center text-[30px] font-extrabold text-brand-ink">
        Profil
      </Text>
      <Text
        className="max-w-[280px] text-center text-[15px] leading-6 text-brand-ink"
        style={{ opacity: 0.5 }}
      >
        Layar profil akan dibangun di sini.
      </Text>

      {user?.hasPatientHistory ? (
        <Pressable
          accessibilityRole="button"
          className="h-[52px] w-full items-center justify-center rounded-control bg-brand-aqua"
          onPress={() => router.push("/history" as Href)}
        >
          <Text className="text-[17px] font-bold text-brand-ink">
            Riwayat pengobatan
          </Text>
        </Pressable>
      ) : null}

      {user?.hasActivePatientProfile ? (
        <View className="w-full gap-2">
          <Text className="text-center text-[13px] font-semibold text-brand-ink">
            Akhiri episode pengobatan
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              className="h-[46px] flex-1 items-center justify-center rounded-control border border-brand-border bg-brand-white"
              disabled={isLoading}
              onPress={() => confirmClose("RECOVERED", "Pengobatan selesai?")}
            >
              <Text className="text-[13px] font-bold text-brand-ink">
                Sembuh
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-[46px] flex-1 items-center justify-center rounded-control border border-brand-border bg-brand-white"
              disabled={isLoading}
              onPress={() => confirmClose("DROPPED", "Pengobatan terhenti?")}
            >
              <Text className="text-[13px] font-bold text-brand-ink">
                Terhenti
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-[46px] flex-1 items-center justify-center rounded-control border border-red-200 bg-red-50"
              disabled={isLoading}
              onPress={() => confirmClose("CANCELLED", "Batalkan episode?")}
            >
              <Text className="text-[13px] font-bold text-red-600">
                Batalkan
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        className="h-[52px] w-full items-center justify-center rounded-control border-2 border-brand-ink bg-brand-white"
        disabled={isLoading}
        onPress={handleLogout}
        style={isLoading ? { opacity: 0.6 } : undefined}
      >
        {isLoading ? (
          <ActivityIndicator color="#263238" />
        ) : (
          <Text className="text-[17px] font-bold text-brand-ink">Keluar</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}
