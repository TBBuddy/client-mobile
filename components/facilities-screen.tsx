import { useRouter } from "expo-router";
import { List, MapPin, RefreshCw, Search, ShieldCheck } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TextInput as RNTextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useCurrentLocation } from "../hooks/use-current-location";
import { ApiError } from "../services/repository/api-error";
import { FacilityService } from "../services/repository/facility-service";
import type { NearbyFacility } from "../services/repository/types";
import { FacilitiesMap } from "./facilities-map";
import { Pressable, ScrollView, Text, View } from "./tw";

type ViewMode = "list" | "map";

const RADIUS_KM = 30;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function FacilitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { state: location, retry: retryLocation } = useCurrentLocation();

  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [tbOnly, setTbOnly] = useState(false);
  const [cityQuery, setCityQuery] = useState("");

  const loadNearby = useCallback(
    (lat: number, lng: number, signal?: AbortSignal) => {
      setIsLoading(true);
      setError(null);
      FacilityService.getNearby(
        {
          lat,
          lng,
          radius: 30000,
          limit: 50,
          isTbServiceAvailable: tbOnly || undefined,
        },
        { signal },
      )
        .then((data) => {
          setFacilities(data);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
          setError(err instanceof ApiError ? err.message : "Gagal memuat fasilitas.");
          setIsLoading(false);
        });
    },
    [tbOnly],
  );

  const searchByCity = useCallback(
    (signal?: AbortSignal) => {
      const q = cityQuery.trim();
      if (!q) return;
      setIsLoading(true);
      setError(null);
      FacilityService.getFacilities(
        { search: q, limit: 50, isTbServiceAvailable: tbOnly || undefined },
        { signal },
      )
        .then((res) => {
          const origin = location.status === "granted" ? location : null;
          setFacilities(
            res.data.map((f) => ({
              ...f,
              distanceKm: origin
                ? haversineKm(origin.lat, origin.lng, f.latitude, f.longitude)
                : -1,
            })),
          );
          setIsLoading(false);
        })
        .catch((err) => {
          if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
          setError(err instanceof ApiError ? err.message : "Gagal mencari fasilitas.");
          setIsLoading(false);
        });
    },
    [cityQuery, tbOnly, location],
  );

  useEffect(() => {
    if (location.status !== "granted") return;
    // Skip nearby fetch ketika user sedang dalam mode search — biar hasil search
    // tidak ditimpa oleh GPS update.
    if (cityQuery.trim()) return;
    const controller = new AbortController();
    loadNearby(location.lat, location.lng, controller.signal);
    return () => controller.abort();
  }, [location, loadNearby, cityQuery]);

  const goDetail = (id: string) => router.push(`/facility/${id}`);
  const permissionDenied =
    location.status === "denied" || location.status === "error";

  function renderContent() {
    // Spinner hanya saat belum ada data sama sekali — GPS update berikutnya
    // refresh secara silent tanpa menghilangkan list yang sudah ada.
    if ((isLoading && facilities.length === 0) || location.status === "loading") {
      return (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#263238" size="large" />
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 items-center justify-center gap-3 px-5">
          <Text className="text-center text-[14px] text-brand-ink" style={{ opacity: 0.6 }}>
            {error}
          </Text>
          <Pressable
            className="h-11 flex-row items-center gap-2 rounded-control bg-brand-ink px-6"
            onPress={() =>
              location.status === "granted"
                ? loadNearby(location.lat, location.lng)
                : searchByCity()
            }
          >
            <RefreshCw color="#FFFFFF" size={15} strokeWidth={2} />
            <Text className="text-[14px] font-bold text-brand-white">Coba lagi</Text>
          </Pressable>
        </View>
      );
    }

    if (facilities.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-5">
          <Text className="text-center text-[14px] text-brand-ink" style={{ opacity: 0.5 }}>
            Tidak ada fasilitas ditemukan.
          </Text>
        </View>
      );
    }

    if (viewMode === "map" && location.status === "granted") {
      // Kalau user sedang search kota lain, center peta ke faskes pertama (bukan
      // ke lokasi user) — biar marker tidak off-screen.
      const mapCenter =
        cityQuery.trim() && facilities.length > 0
          ? { lat: facilities[0].latitude, lng: facilities[0].longitude }
          : { lat: location.lat, lng: location.lng };

      return (
        <View className="flex-1 px-5 pb-5 pt-2">
          <FacilitiesMap
            center={mapCenter}
            facilities={facilities}
            onSelect={goDetail}
          />
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-5 pb-10 pt-2"
        showsVerticalScrollIndicator={false}
      >
        {facilities.map((f) => (
          <Pressable
            key={f.id}
            className="rounded-card border border-brand-border bg-brand-white p-4 gap-1.5"
            onPress={() => goDetail(f.id)}
          >
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-[15px] font-bold text-brand-ink">{f.name}</Text>
              {f.isTbServiceAvailable && (
                <View className="rounded-full bg-brand-aqua px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-brand-ink">TB ✓</Text>
                </View>
              )}
            </View>
            <Text className="text-[12px] text-brand-ink" style={{ opacity: 0.55 }}>
              {f.facilityType} · {f.city}
            </Text>
            <Text className="text-[12px] leading-5 text-brand-ink" style={{ opacity: 0.5 }}>
              {f.address}
            </Text>
            {f.distanceKm >= 0 &&
              (f.distanceKm <= RADIUS_KM ? (
                <Text className="text-[12px] font-semibold text-brand-aqua">
                  {f.distanceKm.toFixed(1)} km dari kamu
                </Text>
              ) : (
                <Text
                  className="text-[12px] font-semibold text-brand-ink"
                  style={{ opacity: 0.4 }}
                >
                  Di luar jangkauan
                </Text>
              ))}
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  return (
    <View className="flex-1 bg-brand-mist">
      {/* Header + kontrol (fixed, tidak ikut scroll/gesture peta) */}
      <View
        className="gap-4 px-5 pb-2"
        style={{ paddingTop: insets.top + 12 }}
      >
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-1">
            <Text className="text-[28px] font-extrabold leading-8 text-brand-ink">
              Fasilitas Kesehatan
            </Text>
            <Text className="text-[14px] text-brand-ink" style={{ opacity: 0.55 }}>
              Temukan faskes terdekat untuk pengobatan TB
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Perbarui lokasi"
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white"
            onPress={retryLocation}
          >
            <RefreshCw color="#263238" size={18} strokeWidth={2} />
          </Pressable>
        </View>

        <View className="h-12 flex-row items-center gap-2 rounded-control border border-brand-border bg-brand-white px-3">
          <Search color="#263238" size={18} strokeWidth={2} style={{ opacity: 0.5 }} />
          <RNTextInput
            onChangeText={setCityQuery}
            onSubmitEditing={() => searchByCity()}
            placeholder="Cari kota / nama faskes…"
            placeholderTextColor="rgba(38,50,56,0.35)"
            returnKeyType="search"
            style={{ color: "#263238", fontSize: 15, flex: 1 }}
            value={cityQuery}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityRole="switch"
            className={[
              "h-9 flex-row items-center gap-1.5 rounded-full border px-3",
              tbOnly
                ? "border-brand-aqua bg-brand-aqua"
                : "border-brand-border bg-brand-white",
            ].join(" ")}
            onPress={() => setTbOnly((v) => !v)}
          >
            <ShieldCheck color="#263238" size={15} strokeWidth={2} />
            <Text className="text-[12px] font-bold text-brand-ink">Layanan TB</Text>
          </Pressable>

          <View className="flex-row gap-1 rounded-full border border-brand-border bg-brand-white p-1">
            {(["list", "map"] as ViewMode[]).map((m) => (
              <Pressable
                key={m}
                className={[
                  "h-8 flex-row items-center gap-1 rounded-full px-3",
                  viewMode === m ? "bg-brand-ink" : "",
                ].join(" ")}
                onPress={() => setViewMode(m)}
              >
                {m === "list" ? (
                  <List color={viewMode === m ? "#FFFFFF" : "#263238"} size={14} strokeWidth={2} />
                ) : (
                  <MapPin color={viewMode === m ? "#FFFFFF" : "#263238"} size={14} strokeWidth={2} />
                )}
                <Text
                  className={[
                    "text-[12px] font-bold",
                    viewMode === m ? "text-brand-white" : "text-brand-ink",
                  ].join(" ")}
                >
                  {m === "list" ? "List" : "Peta"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {permissionDenied && (
          <View className="rounded-control border border-brand-border bg-brand-white px-4 py-3 gap-1">
            <Text className="text-[13px] font-bold text-brand-ink">Lokasi tidak aktif</Text>
            <Text className="text-[12px] leading-5 text-brand-ink" style={{ opacity: 0.6 }}>
              Kamu tetap bisa mencari faskes lewat kolom pencarian di atas.
            </Text>
            <Pressable className="mt-1" onPress={retryLocation}>
              <Text className="text-[12px] font-bold text-brand-aqua">Aktifkan lokasi →</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Konten: peta full-height (di luar scroll) atau list (scrollable) */}
      {renderContent()}
    </View>
  );
}
