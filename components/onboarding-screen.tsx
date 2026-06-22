import { Check, ChevronRight, UserPlus } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  type TextInput as RNTextInputType,
  View as RNView,
} from 'react-native';

import { useAuth } from '../context/auth-context';
import { ApiError } from '../services/repository/api-error';
import { PatientService } from '../services/repository/patient-service';
import { Pressable, ScrollView, Text, View } from './tw';

function maskDate(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

function maskTime(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function isValidDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

function isValidTime(s: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(s);
}

function FieldLabel({ children, optional }: { children: string; optional?: boolean }) {
  return (
    <View className="flex-row items-center gap-1">
      <Text className="text-[13px] font-semibold text-brand-ink">{children}</Text>
      {optional && (
        <Text className="text-[13px] font-normal text-brand-ink" style={{ opacity: 0.45 }}>
          (opsional)
        </Text>
      )}
    </View>
  );
}

function InputBox({ children }: { children: React.ReactNode }) {
  return (
    <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-white px-4">
      {children}
    </View>
  );
}

const INPUT_STYLE = { color: '#263238', fontSize: 15 } as const;

export function OnboardingScreen() {
  const { updateUser } = useAuth();

  const [step, setStep] = useState<1 | 2>(1);

  const [diagnosisDate, setDiagnosisDate] = useState('');
  const [medicineTime, setMedicineTime] = useState('');
  const [treatmentStartDate, setTreatmentStartDate] = useState('');
  const [hasDroppedBefore, setHasDroppedBefore] = useState(false);
  const [previousNote, setPreviousNote] = useState('');

  const [addPmo, setAddPmo] = useState(false);
  const [pmoName, setPmoName] = useState('');
  const [pmoRelationship, setPmoRelationship] = useState('');
  const [pmoPhone, setPmoPhone] = useState('');
  const [pmoWhatsapp, setPmoWhatsapp] = useState('');
  const [pmoEmail, setPmoEmail] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const medicineTimeRef = useRef<RNTextInputType>(null);
  const treatmentStartRef = useRef<RNTextInputType>(null);
  const pmoNameRef = useRef<RNTextInputType>(null);
  const pmoRelRef = useRef<RNTextInputType>(null);
  const pmoPhoneRef = useRef<RNTextInputType>(null);
  const pmoWhatsappRef = useRef<RNTextInputType>(null);
  const pmoEmailRef = useRef<RNTextInputType>(null);

  function validateStep1(): string | null {
    if (!diagnosisDate) return 'Tanggal diagnosis wajib diisi.';
    if (!isValidDate(diagnosisDate)) return 'Format tanggal diagnosis tidak valid. Gunakan YYYY-MM-DD.';
    if (!medicineTime) return 'Waktu minum obat wajib diisi.';
    if (!isValidTime(medicineTime)) return 'Format waktu tidak valid. Gunakan HH:MM.';
    if (treatmentStartDate && !isValidDate(treatmentStartDate))
      return 'Format tanggal mulai pengobatan tidak valid. Gunakan YYYY-MM-DD.';
    return null;
  }

  function validateStep2(): string | null {
    if (!addPmo) return null;
    if (!pmoName.trim()) return 'Nama PMO wajib diisi jika menambahkan kontak.';
    if (!pmoEmail.trim()) return 'Email PMO wajib diisi jika menambahkan kontak.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pmoEmail.trim()))
      return 'Format email PMO tidak valid.';
    return null;
  }

  function handleNextStep() {
    const err = validateStep1();
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  }

  async function handleSubmit() {
    const err = validateStep2();
    if (err) { setError(err); return; }
    setError(null);
    setIsLoading(true);

    try {
      await PatientService.onboarding({
        diagnosisDate,
        medicineTime,
        treatmentStartDate: treatmentStartDate || undefined,
        hasDroppedBefore,
        previousTreatmentNote: hasDroppedBefore && previousNote.trim()
          ? previousNote.trim()
          : undefined,
        pmo: addPmo
          ? {
              name: pmoName.trim(),
              relationship: pmoRelationship.trim() || undefined,
              phoneNumber: pmoPhone.trim() || undefined,
              whatsappNumber: pmoWhatsapp.trim() || undefined,
              email: pmoEmail.trim(),
            }
          : undefined,
      });

      updateUser({ isOnboardingCompleted: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === 'REQUEST_CANCELLED') return;
      setError(
        err instanceof ApiError
          ? err.message
          : 'Terjadi kesalahan. Coba lagi.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-brand-mist"
      contentContainerClassName="items-center px-5 pb-10 pt-12"
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="w-full gap-7" style={{ maxWidth: 430 }}>
        <View className="gap-1">
          <Text className="text-[28px] font-extrabold leading-[34px] text-brand-ink">
            {step === 1 ? 'Data pengobatan' : 'Kontak PMO'}
          </Text>
          <Text className="text-[15px] leading-5 text-brand-ink" style={{ opacity: 0.55 }}>
            {step === 1
              ? 'Bantu kami memahami perjalanan pengobatanmu.'
              : 'PMO (Pengawas Minum Obat) akan membantumu tetap konsisten.'}
          </Text>
        </View>

        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-[12px] font-semibold text-brand-ink" style={{ opacity: 0.4 }}>
              Langkah {step} dari 2
            </Text>
          </View>
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-brand-border">
            <RNView
              style={{
                height: '100%',
                width: step === 1 ? '50%' : '100%',
                backgroundColor: '#A3E7E2',
                borderRadius: 999,
              }}
            />
          </View>
        </View>

        {error ? (
          <View className="rounded-control border border-red-200 bg-red-50 px-4 py-3">
            <Text className="text-[13px] leading-5 text-red-600">{error}</Text>
          </View>
        ) : null}

        {step === 1 && (
          <View className="gap-5">
            <View className="gap-1.5">
              <FieldLabel>Tanggal diagnosis</FieldLabel>
              <InputBox>
                <RNTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    setDiagnosisDate(maskDate(v));
                    if (error) setError(null);
                  }}
                  onSubmitEditing={() => medicineTimeRef.current?.focus()}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  returnKeyType="next"
                  style={INPUT_STYLE}
                  value={diagnosisDate}
                />
              </InputBox>
              <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.4 }}>
                Contoh: 2024-03-15
              </Text>
            </View>

            <View className="gap-1.5">
              <FieldLabel>Waktu minum obat</FieldLabel>
              <InputBox>
                <RNTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    setMedicineTime(maskTime(v));
                    if (error) setError(null);
                  }}
                  onSubmitEditing={() => treatmentStartRef.current?.focus()}
                  placeholder="HH:MM"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={medicineTimeRef}
                  returnKeyType="next"
                  style={INPUT_STYLE}
                  value={medicineTime}
                />
              </InputBox>
              <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.4 }}>
                Contoh: 07:30 (format 24 jam)
              </Text>
            </View>

            <View className="gap-1.5">
              <FieldLabel optional>Tanggal mulai pengobatan</FieldLabel>
              <InputBox>
                <RNTextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="numeric"
                  onChangeText={(v) => {
                    setTreatmentStartDate(maskDate(v));
                    if (error) setError(null);
                  }}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={treatmentStartRef}
                  returnKeyType="done"
                  style={INPUT_STYLE}
                  value={treatmentStartDate}
                />
              </InputBox>
            </View>

            <View className="gap-2">
              <FieldLabel optional>Pernah putus pengobatan sebelumnya?</FieldLabel>
              <View className="flex-row gap-2">
                {([
                  { label: 'Pernah', value: true },
                  { label: 'Belum pernah', value: false },
                ] as const).map((opt) => {
                  const selected = hasDroppedBefore === opt.value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      className={[
                        'flex-1 h-[44px] items-center justify-center rounded-control border',
                        selected
                          ? 'border-brand-ink bg-brand-ink'
                          : 'border-brand-border bg-brand-white',
                      ].join(' ')}
                      key={String(opt.value)}
                      onPress={() => setHasDroppedBefore(opt.value)}
                    >
                      <Text
                        className={[
                          'text-[14px] font-bold',
                          selected ? 'text-brand-white' : 'text-brand-ink',
                        ].join(' ')}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {hasDroppedBefore && (
              <View className="gap-1.5">
                <FieldLabel optional>Catatan pengobatan sebelumnya</FieldLabel>
                <View
                  className="justify-center rounded-control border border-brand-border bg-brand-white px-4 py-3"
                  style={{ minHeight: 90 }}
                >
                  <RNTextInput
                    autoCapitalize="sentences"
                    autoCorrect
                    multiline
                    numberOfLines={3}
                    onChangeText={setPreviousNote}
                    placeholder="Ceritakan sedikit tentang pengobatan sebelumnya..."
                    placeholderTextColor="rgba(38,50,56,0.35)"
                    style={[INPUT_STYLE, { textAlignVertical: 'top' }]}
                    value={previousNote}
                  />
                </View>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              className="h-[52px] flex-row items-center justify-center gap-2 rounded-control bg-brand-ink"
              onPress={handleNextStep}
            >
              <Text className="text-[17px] font-bold text-brand-white">Lanjut</Text>
              <ChevronRight color="#FFFFFF" size={18} strokeWidth={2.5} />
            </Pressable>
          </View>
        )}

        {step === 2 && (
          <View className="gap-5">
            <Pressable
              accessibilityRole="button"
              className={[
                'flex-row items-center gap-3 rounded-card border p-4',
                addPmo
                  ? 'border-brand-ink bg-brand-ink'
                  : 'border-brand-border bg-brand-white',
              ].join(' ')}
              onPress={() => {
                setAddPmo((v) => !v);
                if (error) setError(null);
              }}
            >
              <View
                className={[
                  'h-6 w-6 items-center justify-center rounded-full border',
                  addPmo
                    ? 'border-brand-white bg-brand-white'
                    : 'border-brand-border bg-brand-mist',
                ].join(' ')}
              >
                {addPmo && <Check color="#263238" size={14} strokeWidth={3} />}
              </View>
              <View className="flex-1">
                <Text
                  className={[
                    'text-[14px] font-bold',
                    addPmo ? 'text-brand-white' : 'text-brand-ink',
                  ].join(' ')}
                >
                  Tambah kontak PMO
                </Text>
                <Text
                  className={[
                    'text-[12px] leading-4',
                    addPmo ? 'text-brand-white' : 'text-brand-ink',
                  ].join(' ')}
                  style={{ opacity: 0.6 }}
                >
                  Orang yang akan memantau minummu
                </Text>
              </View>
              <UserPlus
                color={addPmo ? '#FFFFFF' : '#263238'}
                size={20}
                strokeWidth={1.75}
                style={{ opacity: addPmo ? 1 : 0.3 }}
              />
            </Pressable>

            {addPmo && (
              <View className="gap-4">
                <View className="gap-1.5">
                  <FieldLabel>Nama PMO</FieldLabel>
                  <InputBox>
                    <RNTextInput
                      autoCapitalize="words"
                      autoCorrect={false}
                      onChangeText={(v) => { setPmoName(v); if (error) setError(null); }}
                      onSubmitEditing={() => pmoRelRef.current?.focus()}
                      placeholder="Nama lengkap"
                      placeholderTextColor="rgba(38,50,56,0.35)"
                      ref={pmoNameRef}
                      returnKeyType="next"
                      style={INPUT_STYLE}
                      value={pmoName}
                    />
                  </InputBox>
                </View>

                <View className="gap-1.5">
                  <FieldLabel optional>Hubungan</FieldLabel>
                  <InputBox>
                    <RNTextInput
                      autoCapitalize="words"
                      autoCorrect={false}
                      onChangeText={setPmoRelationship}
                      onSubmitEditing={() => pmoPhoneRef.current?.focus()}
                      placeholder="Contoh: Ibu, Kakak, Pasangan"
                      placeholderTextColor="rgba(38,50,56,0.35)"
                      ref={pmoRelRef}
                      returnKeyType="next"
                      style={INPUT_STYLE}
                      value={pmoRelationship}
                    />
                  </InputBox>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1.5">
                    <FieldLabel optional>No. HP</FieldLabel>
                    <InputBox>
                      <RNTextInput
                        autoCapitalize="none"
                        keyboardType="phone-pad"
                        onChangeText={setPmoPhone}
                        onSubmitEditing={() => pmoWhatsappRef.current?.focus()}
                        placeholder="08xxxxxxxx"
                        placeholderTextColor="rgba(38,50,56,0.35)"
                        ref={pmoPhoneRef}
                        returnKeyType="next"
                        style={INPUT_STYLE}
                        value={pmoPhone}
                      />
                    </InputBox>
                  </View>
                  <View className="flex-1 gap-1.5">
                    <FieldLabel optional>WhatsApp</FieldLabel>
                    <InputBox>
                      <RNTextInput
                        autoCapitalize="none"
                        keyboardType="phone-pad"
                        onChangeText={setPmoWhatsapp}
                        onSubmitEditing={() => pmoEmailRef.current?.focus()}
                        placeholder="08xxxxxxxx"
                        placeholderTextColor="rgba(38,50,56,0.35)"
                        ref={pmoWhatsappRef}
                        returnKeyType="next"
                        style={INPUT_STYLE}
                        value={pmoWhatsapp}
                      />
                    </InputBox>
                  </View>
                </View>

                <View className="gap-1.5">
                  <FieldLabel>Email PMO</FieldLabel>
                  <InputBox>
                    <RNTextInput
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      keyboardType="email-address"
                      onChangeText={(v) => { setPmoEmail(v); if (error) setError(null); }}
                      placeholder="email@contoh.com"
                      placeholderTextColor="rgba(38,50,56,0.35)"
                      ref={pmoEmailRef}
                      returnKeyType="done"
                      style={INPUT_STYLE}
                      value={pmoEmail}
                    />
                  </InputBox>
                </View>
              </View>
            )}

            <View className="gap-3">
              <Pressable
                accessibilityRole="button"
                className="h-[52px] items-center justify-center rounded-control bg-brand-ink"
                disabled={isLoading}
                onPress={handleSubmit}
                style={isLoading ? { opacity: 0.7 } : undefined}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-[17px] font-bold text-brand-white">
                    {addPmo ? 'Simpan & mulai' : 'Lewati & mulai'}
                  </Text>
                )}
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="h-[44px] items-center justify-center"
                disabled={isLoading}
                onPress={() => { setError(null); setStep(1); }}
              >
                <Text className="text-[14px] font-semibold text-brand-ink" style={{ opacity: 0.5 }}>
                  ← Kembali
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
