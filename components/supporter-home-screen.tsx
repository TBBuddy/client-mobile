import { router, type Href } from 'expo-router';
import {
  BookOpen,
  ChevronRight,
  HeartHandshake,
  History,
  MessageCircleHeart,
  Stethoscope,
} from 'lucide-react-native';

import { useAuth } from '../context/auth-context';
import { Pressable, ScrollView, Text, View } from './tw';

export function SupporterHomeScreen() {
  const { user } = useAuth();
  const firstName = user?.fullName?.trim().split(/\s+/)[0] || user?.username;
  const isRecovered = user?.treatmentStatus === 'RECOVERED';
  const needsRestart =
    user?.treatmentStatus === 'DROPPED' ||
    user?.treatmentStatus === 'CANCELLED';

  const treatmentTitle = isRecovered
    ? 'Pengobatanmu sudah selesai'
    : needsRestart
      ? 'Pengobatanmu belum selesai'
      : 'Butuh pendampingan pengobatan TB?';
  const treatmentDescription = isRecovered
    ? 'Riwayat pengobatanmu tetap tersimpan dan dapat dilihat kapan saja.'
    : needsRestart
      ? 'Mulai episode baru agar jadwal obat, check-in, dan stok dapat dipantau kembali.'
      : 'Kamu dapat memulai onboarding kapan saja jika sedang menjalani pengobatan.';
  const treatmentAction = isRecovered
    ? 'Mulai pengobatan baru'
    : needsRestart
      ? 'Mulai kembali pengobatan'
      : 'Mulai onboarding pasien';

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="gap-5 px-5 pb-10 pt-5"
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
    >
      <View className="gap-1">
        <Text className="text-[26px] font-extrabold text-brand-ink">
          Selamat datang, {firstName}
        </Text>
        <Text className="text-[14px] text-brand-ink" style={{ opacity: 0.55 }}>
          Mari berbagi dukungan untuk perjalanan melawan TB.
        </Text>
      </View>

      <View className="gap-4 rounded-card bg-brand-aqua p-5">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-brand-white">
          <Stethoscope color="#263238" size={24} strokeWidth={1.8} />
        </View>
        <View className="gap-1">
          <Text className="text-[20px] font-extrabold text-brand-ink">
            {treatmentTitle}
          </Text>
          <Text
            className="text-[13px] leading-5 text-brand-ink"
            style={{ opacity: 0.65 }}
          >
            {treatmentDescription}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          className="h-12 items-center justify-center rounded-control bg-brand-ink"
          onPress={() => router.push('/(onboarding)')}
        >
          <Text className="text-[15px] font-bold text-brand-white">
            {treatmentAction}
          </Text>
        </Pressable>
        {user?.hasPatientHistory ? (
          <Pressable
            accessibilityRole="button"
            className="h-11 flex-row items-center justify-center gap-2 rounded-control border border-brand-ink bg-brand-white"
            onPress={() => router.push('/history' as Href)}
          >
            <History color="#263238" size={18} strokeWidth={2} />
            <Text className="text-[14px] font-bold text-brand-ink">
              Lihat riwayat pengobatan
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View className="gap-3">
        <Text className="text-[16px] font-bold text-brand-ink">
          Yang bisa kamu lakukan
        </Text>
        <SupporterAction
          description="Baca pengalaman, berbagi informasi, dan berdiskusi dengan komunitas."
          icon={<MessageCircleHeart color="#263238" size={22} strokeWidth={1.8} />}
          onPress={() => router.push('/(tabs)/komunitas')}
          title="Buka komunitas"
        />
        <SupporterAction
          description="Berikan dukungan kepada pasien yang sedang menjalani pengobatan."
          icon={<HeartHandshake color="#263238" size={22} strokeWidth={1.8} />}
          onPress={() => router.push('/(tabs)/komunitas')}
          title="Berikan semangat"
        />
        <SupporterAction
          description="Pelajari informasi dasar agar dukunganmu tetap aman dan tepat."
          icon={<BookOpen color="#263238" size={22} strokeWidth={1.8} />}
          onPress={() => router.push('/(tabs)/komunitas')}
          title="Pelajari tentang TB"
        />
      </View>
    </ScrollView>
  );
}

function SupporterAction({
  description,
  icon,
  onPress,
  title,
}: {
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center gap-4 rounded-card border border-brand-border bg-brand-white p-4"
      onPress={onPress}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full bg-brand-aqua">
        {icon}
      </View>
      <View className="flex-1 gap-1">
        <Text className="text-[15px] font-bold text-brand-ink">{title}</Text>
        <Text
          className="text-[12px] leading-4 text-brand-ink"
          style={{ opacity: 0.55 }}
        >
          {description}
        </Text>
      </View>
      <ChevronRight color="#263238" size={18} strokeWidth={2} opacity={0.35} />
    </Pressable>
  );
}
