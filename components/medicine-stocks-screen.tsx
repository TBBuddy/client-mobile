import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  PackagePlus,
  Pill,
  RefreshCw,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ApiError } from '../services/repository/api-error';
import { MedicineStockService } from '../services/repository/medicine-stock-service';
import type { MedicineStock } from '../services/repository/types';
import { Pressable, ScrollView, Text, View } from './tw';

type ModalMode =
  | { type: 'restock'; stock: MedicineStock }
  | { type: 'add' }
  | null;

function StockStatusBadge({ isBelowThreshold }: { isBelowThreshold: boolean }) {
  if (isBelowThreshold) {
    return (
      <View className="flex-row items-center gap-1 rounded-full bg-red-50 px-2 py-0.5">
        <AlertTriangle color="#EF4444" size={10} strokeWidth={2.5} />
        <Text className="text-[10px] font-bold" style={{ color: '#EF4444' }}>
          Stok Menipis
        </Text>
      </View>
    );
  }
  return (
    <View className="flex-row items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5">
      <CheckCircle2 color="#10B981" size={10} strokeWidth={2.5} />
      <Text className="text-[10px] font-bold" style={{ color: '#10B981' }}>
        Aman
      </Text>
    </View>
  );
}

function StockCard({
  stock,
  onRestock,
}: {
  stock: MedicineStock;
  onRestock: (stock: MedicineStock) => void;
}) {
  return (
    <View className="rounded-card border border-brand-border bg-brand-white overflow-hidden">
      <View className="px-4 pt-4 pb-3 gap-2">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1 gap-0.5">
            <Text className="text-[15px] font-bold text-brand-ink" numberOfLines={1}>
              {stock.medicineName}
            </Text>
            {stock.medicineType ? (
              <Text
                className="text-[11px] text-brand-ink"
                style={{ opacity: 0.5 }}
              >
                {stock.medicineType}
              </Text>
            ) : null}
          </View>
          <StockStatusBadge isBelowThreshold={stock.isBelowThreshold} />
        </View>

        <View className="flex-row gap-4">
          <View className="gap-0.5">
            <Text
              className="text-[10px] font-semibold text-brand-ink"
              style={{ opacity: 0.45 }}
            >
              Stok
            </Text>
            <Text className="text-[18px] font-extrabold leading-5 text-brand-ink">
              {stock.quantity}
              <Text
                className="text-[12px] font-semibold text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                {' '}
                {stock.unit}
              </Text>
            </Text>
          </View>

          <View className="gap-0.5">
            <Text
              className="text-[10px] font-semibold text-brand-ink"
              style={{ opacity: 0.45 }}
            >
              Sisa
            </Text>
            <Text className="text-[18px] font-extrabold leading-5 text-brand-ink">
              {stock.daysRemaining}
              <Text
                className="text-[12px] font-semibold text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                {' '}
                hari
              </Text>
            </Text>
          </View>

          <View className="gap-0.5">
            <Text
              className="text-[10px] font-semibold text-brand-ink"
              style={{ opacity: 0.45 }}
            >
              Dosis/hari
            </Text>
            <Text className="text-[18px] font-extrabold leading-5 text-brand-ink">
              {stock.dailyDose}
              <Text
                className="text-[12px] font-semibold text-brand-ink"
                style={{ opacity: 0.55 }}
              >
                {' '}
                {stock.unit}
              </Text>
            </Text>
          </View>
        </View>

        {stock.nextEstimatedEmptyDate ? (
          <Text
            className="text-[11px] text-brand-ink"
            style={{ opacity: 0.4 }}
          >
            Perkiraan habis: {stock.nextEstimatedEmptyDate}
          </Text>
        ) : null}
      </View>

      <View className="border-t border-brand-border mx-0">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center justify-center gap-1.5 py-2.5 active:opacity-70"
          onPress={() => onRestock(stock)}
        >
          <PackagePlus color="#263238" size={14} strokeWidth={2} />
          <Text className="text-[13px] font-semibold text-brand-ink">
            Tambah Stok
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function RestockModal({
  stock,
  visible,
  onClose,
  onSuccess,
}: {
  stock: MedicineStock | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [quantity, setQuantity] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setQuantity('');
      setNote('');
      setError(null);
    }
  }, [visible]);

  async function handleSubmit() {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError('Jumlah harus lebih dari 0.');
      return;
    }
    if (!stock) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await MedicineStockService.restock(stock.id, {
        quantity: qty,
        note: note.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal menambah stok. Coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        style={{ flex: 1 }}
      >
        <Pressable
          className="flex-1"
          onPress={onClose}
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
        />
        <View className="bg-brand-white rounded-t-[20px] px-5 pt-5 pb-8 gap-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-brand-ink">
              Tambah Stok
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
              onPress={onClose}
            >
              <X color="#263238" size={16} strokeWidth={2} />
            </Pressable>
          </View>

          {stock ? (
            <Text
              className="text-[13px] text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              {stock.medicineName} — stok saat ini: {stock.quantity} {stock.unit}
            </Text>
          ) : null}

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={{ opacity: 0.65 }}>
              Jumlah yang ditambahkan
            </Text>
            <TextInput
              inputMode="numeric"
              onChangeText={setQuantity}
              placeholder="Contoh: 30"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={{
                borderWidth: 1.5,
                borderColor: '#D9E5E5',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 11,
                fontSize: 15,
                color: '#263238',
                backgroundColor: '#F5FBFA',
              }}
              value={quantity}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={{ opacity: 0.65 }}>
              Catatan (opsional)
            </Text>
            <TextInput
              multiline
              numberOfLines={2}
              onChangeText={setNote}
              placeholder="Contoh: Pengambilan dari puskesmas"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={{
                borderWidth: 1.5,
                borderColor: '#D9E5E5',
                borderRadius: 10,
                paddingHorizontal: 14,
                paddingVertical: 11,
                fontSize: 14,
                color: '#263238',
                backgroundColor: '#F5FBFA',
                minHeight: 64,
                textAlignVertical: 'top',
              }}
              value={note}
            />
          </View>

          {error ? (
            <Text className="text-[13px]" style={{ color: '#EF4444' }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="h-[50px] items-center justify-center rounded-control bg-brand-ink active:opacity-70"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={isSubmitting ? { opacity: 0.6 } : undefined}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] font-bold text-brand-white">
                Simpan
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AddStockModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('tablet');
  const [dailyDose, setDailyDose] = useState('');
  const [thresholdQuantity, setThresholdQuantity] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setMedicineName('');
      setMedicineType('');
      setQuantity('');
      setUnit('tablet');
      setDailyDose('');
      setThresholdQuantity('');
      setError(null);
    }
  }, [visible]);

  async function handleSubmit() {
    if (!medicineName.trim()) {
      setError('Nama obat wajib diisi.');
      return;
    }
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) {
      setError('Jumlah stok harus lebih dari 0.');
      return;
    }
    const dose = parseInt(dailyDose, 10);
    if (!dose || dose <= 0) {
      setError('Dosis harian harus lebih dari 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await MedicineStockService.createStock({
        medicineName: medicineName.trim(),
        medicineType: medicineType.trim() || undefined,
        quantity: qty,
        unit: unit.trim() || 'tablet',
        dailyDose: dose,
        thresholdQuantity: parseInt(thresholdQuantity, 10) || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Gagal menambahkan obat. Coba lagi.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

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

  const labelStyle = {
    opacity: 0.65,
  } as const;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)' }}
          onPress={onClose}
        />
        <ScrollView
          className="bg-brand-white rounded-t-[20px]"
          contentContainerClassName="px-5 pt-5 pb-8 gap-4"
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: '85%' }}
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-[17px] font-bold text-brand-ink">
              Tambah Obat Baru
            </Text>
            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
              onPress={onClose}
            >
              <X color="#263238" size={16} strokeWidth={2} />
            </Pressable>
          </View>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
              Nama obat *
            </Text>
            <TextInput
              onChangeText={setMedicineName}
              placeholder="Contoh: Rifampicin 600mg"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={inputStyle}
              value={medicineName}
            />
          </View>

          <View className="gap-1.5">
            <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
              Tipe obat (opsional)
            </Text>
            <TextInput
              onChangeText={setMedicineType}
              placeholder="Contoh: OAT"
              placeholderTextColor="rgba(38,50,56,0.3)"
              style={inputStyle}
              value={medicineType}
            />
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Jumlah stok *
              </Text>
              <TextInput
                inputMode="numeric"
                onChangeText={setQuantity}
                placeholder="60"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={quantity}
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Satuan
              </Text>
              <TextInput
                onChangeText={setUnit}
                placeholder="tablet"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={unit}
              />
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Dosis/hari *
              </Text>
              <TextInput
                inputMode="numeric"
                onChangeText={setDailyDose}
                placeholder="1"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={dailyDose}
              />
            </View>
            <View className="flex-1 gap-1.5">
              <Text className="text-[12px] font-semibold text-brand-ink" style={labelStyle}>
                Batas minimum
              </Text>
              <TextInput
                inputMode="numeric"
                onChangeText={setThresholdQuantity}
                placeholder="7"
                placeholderTextColor="rgba(38,50,56,0.3)"
                style={inputStyle}
                value={thresholdQuantity}
              />
            </View>
          </View>

          {error ? (
            <Text className="text-[13px]" style={{ color: '#EF4444' }}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            className="h-[50px] items-center justify-center rounded-control bg-brand-ink active:opacity-70"
            disabled={isSubmitting}
            onPress={handleSubmit}
            style={isSubmitting ? { opacity: 0.6 } : undefined}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[15px] font-bold text-brand-white">
                Simpan
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function MedicineStocksScreen() {
  const router = useRouter();
  const [stocks, setStocks] = useState<MedicineStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setLoadError(null);

    MedicineStockService.listStocks({ signal: controller.signal })
      .then((res) => {
        setStocks(res.data.filter((s) => s.isActive));
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === 'REQUEST_CANCELLED') return;
        setLoadError(
          err instanceof ApiError ? err.message : 'Gagal memuat data stok obat.',
        );
        setIsLoading(false);
      });

    return () => controller.abort();
  }, [refetchKey]);

  const belowThresholdCount = stocks.filter((s) => s.isBelowThreshold).length;

  return (
    <View className="flex-1 bg-brand-mist">
      <View
        className="bg-brand-white border-b border-brand-border px-5 pt-14 pb-4 flex-row items-center gap-3"
      >
        <Pressable
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#263238" size={18} strokeWidth={2} />
        </Pressable>
        <View className="flex-1">
          <Text className="text-[18px] font-extrabold text-brand-ink">
            Stok Obat
          </Text>
          {belowThresholdCount > 0 && !isLoading ? (
            <Text className="text-[11px]" style={{ color: '#EF4444' }}>
              {belowThresholdCount} obat stok menipis
            </Text>
          ) : null}
        </View>
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-1.5 rounded-control bg-brand-ink px-3 py-2 active:opacity-70"
          onPress={() => setModalMode({ type: 'add' })}
        >
          <Pill color="#FFFFFF" size={14} strokeWidth={2} />
          <Text className="text-[12px] font-bold text-brand-white">
            Tambah
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 py-5 gap-3"
        showsVerticalScrollIndicator={false}
      >
        {isLoading && (
          <View className="items-center py-10">
            <ActivityIndicator color="#263238" />
          </View>
        )}

        {!isLoading && loadError && (
          <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-6">
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

        {!isLoading && !loadError && stocks.length === 0 && (
          <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-8">
            <Pill color="#263238" size={32} strokeWidth={1.5} style={{ opacity: 0.25 }} />
            <Text
              className="text-center text-[14px] text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              Belum ada stok obat.{'\n'}Tap "Tambah" untuk menambahkan.
            </Text>
          </View>
        )}

        {!isLoading &&
          !loadError &&
          stocks.map((stock) => (
            <StockCard
              key={stock.id}
              onRestock={(s) => setModalMode({ type: 'restock', stock: s })}
              stock={stock}
            />
          ))}
      </ScrollView>

      <RestockModal
        onClose={() => setModalMode(null)}
        onSuccess={() => setRefetchKey((v) => v + 1)}
        stock={modalMode?.type === 'restock' ? modalMode.stock : null}
        visible={modalMode?.type === 'restock'}
      />

      <AddStockModal
        onClose={() => setModalMode(null)}
        onSuccess={() => setRefetchKey((v) => v + 1)}
        visible={modalMode?.type === 'add'}
      />
    </View>
  );
}
