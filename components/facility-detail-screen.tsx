import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Hospital,
  MapPin,
  Navigation,
  Phone,
  RefreshCw,
  Share2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Linking, Platform, Share } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ApiError } from "../services/repository/api-error";
import { FacilityService } from "../services/repository/facility-service";
import type { FacilityDetail } from "../services/repository/types";
import { OsmMap } from "./osm-map";
import { Pressable, ScrollView, Text, View } from "./tw";

export function FacilityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [facility, setFacility] = useState<FacilityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    FacilityService.getById(id, { signal: controller.signal })
      .then((data) => {
        setFacility(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
        setError(err instanceof ApiError ? err.message : "Gagal memuat detail.");
        setIsLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  function openMaps() {
    if (!facility) return;
    const { latitude, longitude, name } = facility;
    const label = encodeURIComponent(name);
    const url = Platform.select({
      ios: `maps://?q=${label}&ll=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  }

  function callFacility() {
    if (!facility?.phoneNumber) return;
    const dial = facility.phoneNumber.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${dial}`).catch(() => {});
  }

  async function shareFacility() {
    if (!facility) return;
    const mapsLink = `https://www.google.com/maps/search/?api=1&query=${facility.latitude},${facility.longitude}`;
    try {
      await Share.share({
        message: `${facility.name}\n${facility.address}, ${facility.city}, ${facility.province}\n${mapsLink}`,
      });
    } catch {
      // dibatalkan / gagal — abaikan
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-brand-mist">
        <ActivityIndicator color="#263238" size="large" />
      </View>
    );
  }

  if (error || !facility) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-brand-mist px-8">
        <Text className="text-center text-[15px] text-brand-ink" style={{ opacity: 0.6 }}>
          {error ?? "Fasilitas tidak ditemukan."}
        </Text>
        <Pressable
          className="h-11 flex-row items-center gap-2 rounded-control bg-brand-ink px-6"
          onPress={() => router.back()}
        >
          <RefreshCw color="#FFFFFF" size={15} strokeWidth={2} />
          <Text className="text-[14px] font-bold text-brand-white">Kembali</Text>
        </Pressable>
      </View>
    );
  }

  const isTb = facility.isTbServiceAvailable;

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="px-5 pb-10 gap-4"
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        className="h-10 w-10 items-center justify-center rounded-full border border-brand-border bg-brand-white"
        style={{ marginTop: insets.top + 12 }}
        onPress={() => router.back()}
      >
        <ArrowLeft color="#263238" size={20} strokeWidth={2} />
      </Pressable>

      {/* Hero */}
      <View className="flex-row items-start gap-3">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-aqua">
          <Hospital color="#263238" size={24} strokeWidth={2} />
        </View>
        <View className="flex-1 gap-1.5">
          <Text className="text-[22px] font-extrabold leading-7 text-brand-ink">
            {facility.name}
          </Text>
          <View className="flex-row flex-wrap items-center gap-2">
            <Text className="text-[13px] text-brand-ink" style={{ opacity: 0.55 }}>
              {facility.facilityType}
            </Text>
            {isTb && (
              <View className="rounded-full bg-brand-aqua px-2 py-0.5">
                <Text className="text-[10px] font-bold text-brand-ink">
                  Layanan TB ✓
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Mini-map lokasi (statis) */}
      <View style={{ height: 170 }}>
        <OsmMap
          center={{ lat: facility.latitude, lng: facility.longitude }}
          zoom={15}
          interactive={false}
          markers={[
            {
              id: facility.id,
              lat: facility.latitude,
              lng: facility.longitude,
              render: () => (
                <View
                  style={{
                    height: 40,
                    width: 40,
                    borderRadius: 999,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isTb ? "#A3E7E2" : "#FFFFFF",
                    borderWidth: isTb ? 3 : 2,
                    borderColor: isTb ? "#FFFFFF" : "#263238",
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    shadowOffset: { width: 0, height: 1 },
                    elevation: 4,
                  }}
                >
                  <Hospital color="#263238" size={20} strokeWidth={2} />
                </View>
              ),
            },
          ]}
        />
      </View>

      {/* Info card */}
      <View className="rounded-card border border-brand-border bg-brand-white p-4">
        <View className="flex-row items-start gap-3">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist">
            <MapPin color="#263238" size={16} strokeWidth={2} />
          </View>
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[11px] font-semibold text-brand-ink"
              style={{ opacity: 0.45 }}
            >
              Alamat
            </Text>
            <Text className="text-[14px] leading-5 text-brand-ink">
              {facility.address}, {facility.city}, {facility.province}
            </Text>
          </View>
        </View>

        {facility.phoneNumber && (
          <>
            <View
              style={{ height: 1, backgroundColor: "#D9E5E5", marginVertical: 12 }}
            />
            <View className="flex-row items-center gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist">
                <Phone color="#263238" size={16} strokeWidth={2} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className="text-[11px] font-semibold text-brand-ink"
                  style={{ opacity: 0.45 }}
                >
                  Telepon
                </Text>
                <Text className="text-[14px] text-brand-ink">
                  {facility.phoneNumber}
                </Text>
              </View>
            </View>
          </>
        )}

        {facility.operatingHours && (
          <>
            <View
              style={{ height: 1, backgroundColor: "#D9E5E5", marginVertical: 12 }}
            />
            <View className="flex-row items-start gap-3">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist">
                <Clock color="#263238" size={16} strokeWidth={2} />
              </View>
              <View className="flex-1 gap-0.5">
                <Text
                  className="text-[11px] font-semibold text-brand-ink"
                  style={{ opacity: 0.45 }}
                >
                  Jam operasional
                </Text>
                <Text className="text-[14px] leading-5 text-brand-ink">
                  {facility.operatingHours}
                </Text>
              </View>
            </View>
          </>
        )}
      </View>

      {/* CTA utama */}
      <Pressable
        className="h-[52px] flex-row items-center justify-center gap-2 rounded-control bg-brand-ink"
        onPress={openMaps}
      >
        <Navigation color="#FFFFFF" size={18} strokeWidth={2} />
        <Text className="text-[16px] font-bold text-brand-white">
          Navigasi ke sini
        </Text>
      </Pressable>

      {/* Aksi sekunder */}
      <View className="flex-row gap-3">
        {facility.phoneNumber && (
          <Pressable
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-control border border-brand-border bg-brand-white"
            onPress={callFacility}
          >
            <Phone color="#263238" size={17} strokeWidth={2} />
            <Text className="text-[14px] font-bold text-brand-ink">Telepon</Text>
          </Pressable>
        )}
        <Pressable
          className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-control border border-brand-border bg-brand-white"
          onPress={shareFacility}
        >
          <Share2 color="#263238" size={17} strokeWidth={2} />
          <Text className="text-[14px] font-bold text-brand-ink">Bagikan</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
