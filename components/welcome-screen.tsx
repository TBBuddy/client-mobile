import { router } from "expo-router";
import { CircleCheck, MapPin, Pill, UsersRound } from "lucide-react-native";
import type { ComponentType } from "react";

import { Image, Pressable, ScrollView, Text, View } from "./tw";

type Feature = {
  label: string;
  icon: ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;
  tone: "aqua" | "lilac";
};

const FEATURES: Feature[] = [
  { label: "Ingatkan minum obat", icon: Pill, tone: "aqua" },
  { label: "Pantau kesehatan harian", icon: CircleCheck, tone: "aqua" },
  { label: "Temukan fasilitas terdekat", icon: MapPin, tone: "aqua" },
  { label: "Dukungan komunitas", icon: UsersRound, tone: "lilac" },
];

function FeatureRow({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const backgroundClass =
    feature.tone === "lilac" ? "bg-brand-lilac" : "bg-brand-aqua";

  return (
    <View className="flex-row items-center gap-3">
      <View
        className={`h-10 w-10 items-center justify-center rounded-full ${backgroundClass}`}
      >
        <Icon color="#263238" size={21} strokeWidth={2.25} />
      </View>
      <Text
        className="flex-1 text-[14px] font-semibold leading-5 text-brand-ink"
        selectable
      >
        {feature.label}
      </Text>
    </View>
  );
}

export function WelcomeScreen() {
  return (
    <View className="flex-1 items-center bg-brand-mist">
      <ScrollView
        className="w-full flex-1"
        contentContainerClassName="items-center px-5 pb-5 pt-4"
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-4" style={{ maxWidth: 430 }}>
          <Image
            accessibilityLabel="Ilustrasi perjalanan pasien bersama TBuddy"
            className="aspect-[1.3077] w-full rounded-[28px] border border-brand-border bg-brand-white"
            contentFit="cover"
            source={require("../assets/images/welcome-hero.png")}
          />

          <View className="items-center gap-2">
            <Image
              accessibilityLabel="Logo TBuddy"
              className="h-14 w-14"
              contentFit="contain"
              source={require("../assets/images/tbuddy-mark.png")}
            />
            <Text
              className="text-center text-[38px] font-extrabold leading-[44px] text-brand-ink"
              selectable
            >
              TBuddy
            </Text>
            <Text
              className="text-center text-[19px] font-bold leading-[25px] text-brand-ink"
              selectable
            >
              Teman perjalanan{"\n"}pengobatanmu
            </Text>
          </View>

          <View className="gap-2 px-5 py-1">
            {FEATURES.map((feature) => (
              <FeatureRow feature={feature} key={feature.label} />
            ))}
          </View>

          <View className="gap-2.5 pt-1">
            <Pressable
              accessibilityRole="button"
              className="h-[52px] items-center justify-center rounded-control bg-brand-ink"
              onPress={() => router.push("/(auth)/login")}
            >
              <Text className="text-[17px] font-bold text-brand-white">
                Masuk
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-12 items-center justify-center rounded-control border-2 border-brand-ink bg-brand-white"
              onPress={() => router.push("/(auth)/register")}
            >
              <Text className="text-[17px] font-bold text-brand-ink">
                Buat akun
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
