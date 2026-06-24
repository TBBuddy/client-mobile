import { ArrowLeft, Check, RefreshCw } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError } from '../services/repository/api-error';
import { PatientService } from '../services/repository/patient-service';
import type { PatientPmo, UpdatePmoRequest } from '../services/repository/types';
import { Pressable, ScrollView, Text, View } from './tw';

const inputStyle = {
  borderWidth: 1.5,
  borderColor: '#D9E5E5',
  borderRadius: 10,
  paddingHorizontal: 14,
  paddingVertical: 11,
  fontSize: 15,
  color: '#263238',
  backgroundColor: '#F5FBFA',
} as const;

const labelStyle = { opacity: 0.65 } as const;

type Props = { id: string };

export function EditPmoScreen({ id }: Props) {
  const router = useRouter();

  const [pmo, setPmo] = useState<PatientPmo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);

  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setLoadError(null);

    PatientService.listPmos({ signal: controller.signal })
      .then((pmos) => {
        const found = pmos.find((p) => p.id === id);
        if (!found) {
          setLoadError('Data PMO tidak ditemukan.');
          setIsLoading(false);
          return;
        }
        setPmo(found);
        setName(found.name ?? '');
        setRelationship(found.relationship ?? '');
        setPhoneNumber(found.phoneNumber ?? '');
        setWhatsappNumber(found.whatsappNumber ?? '');
        setEmail(found.email ?? '');
        setIsPrimary(found.isPrimary);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'REQUEST_CANCELLED') return;
        setLoadError(
          err instanceof ApiError ? err.message : 'Gagal memuat data PMO.',
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [id, refetchKey]);

  async function handleSubmit() {
    if (isSubmitting) return;
    setError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Nama PMO wajib diisi.');
      return;
    }
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email PMO wajib diisi.');
      return;
    }

    const payload: UpdatePmoRequest = {
      name: trimmedName,
      relationship: relationship.trim(),
      phoneNumber: phoneNumber.trim(),
      whatsappNumber: whatsappNumber.trim(),
      email: trimmedEmail,
      isPrimary,
    };

    setIsSubmitting(true);
    try {
      await PatientService.updatePmo(id, payload);
      router.back();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Gagal memperbarui PMO. Coba lagi.',
      );
      setIsSubmitting(false);
    }
  }

  return (
    <View className="flex-1 bg-brand-mist">
      <View className="bg-brand-white border-b border-brand-border px-5 pt-14 pb-4 flex-row items-center gap-3">
        <Pressable
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#263238" size={18} strokeWidth={2} />
        </Pressable>
        <Text className="flex-1 text-[18px] font-extrabold text-brand-ink">
          Ubah PMO
        </Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#263238" />
        </View>
      ) : loadError ? (
        <View className="flex-1 items-center justify-center gap-3 px-8">
          <Text
            className="text-center text-[14px] text-brand-ink"
            style={{ opacity: 0.6 }}
          >
            {loadError}
          </Text>
          <Pressable
            accessibilityRole="button"
            className="h-9 flex-row items-center gap-2 rounded-control bg-brand-ink px-4 active:opacity-70"
            onPress={() => setRefetchKey((v) => v + 1)}
          >
            <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />
            <Text className="text-[13px] font-bold text-brand-white">
              Coba lagi
            </Text>
          </Pressable>
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="px-5 py-5 gap-4"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Nama *
              </Text>
              <TextInput
                onChangeText={setName}
                placeholder="Nama lengkap PMO"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={name}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Hubungan (opsional)
              </Text>
              <TextInput
                onChangeText={setRelationship}
                placeholder="Contoh: keluarga"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={relationship}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Email *
              </Text>
              <TextInput
                autoCapitalize="none"
                inputMode="email"
                onChangeText={setEmail}
                placeholder="email@contoh.com"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={email}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Nomor telepon (opsional)
              </Text>
              <TextInput
                inputMode="tel"
                onChangeText={setPhoneNumber}
                placeholder="+6281234567890"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={phoneNumber}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Nomor WhatsApp (opsional)
              </Text>
              <TextInput
                inputMode="tel"
                onChangeText={setWhatsappNumber}
                placeholder="+6281234567890"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={whatsappNumber}
              />
            </View>

            <View className="flex-row items-center justify-between rounded-card border border-brand-border bg-brand-white px-4 py-3.5">
              <View className="flex-1 pr-3 gap-0.5">
                <Text className="text-[14px] font-semibold text-brand-ink">
                  Jadikan PMO utama
                </Text>
                <Text
                  className="text-[12px] text-brand-ink"
                  style={{ opacity: 0.5 }}
                >
                  PMO utama menerima notifikasi pengingat.
                </Text>
              </View>
              <Switch
                onValueChange={setIsPrimary}
                trackColor={{ false: '#D9E5E5', true: '#A3E7E2' }}
                thumbColor="#FFFFFF"
                value={isPrimary}
              />
            </View>

            {error ? (
              <Text className="text-[13px]" style={{ color: '#EF4444' }}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              className="h-[50px] flex-row items-center justify-center gap-2 rounded-control bg-brand-ink active:opacity-70"
              disabled={isSubmitting}
              onPress={handleSubmit}
              style={isSubmitting ? { opacity: 0.6 } : undefined}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check color="#FFFFFF" size={16} strokeWidth={2.5} />
                  <Text className="text-[15px] font-bold text-brand-white">
                    Simpan perubahan
                  </Text>
                </>
              )}
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
}
