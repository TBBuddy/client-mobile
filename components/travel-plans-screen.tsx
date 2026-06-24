import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  MapPin,
  PackageCheck,
  PackageX,
  Plane,
  Plus,
  RefreshCw,
  X,
  XCircle,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TextInput,
} from "react-native";

import { ApiError } from "../services/repository/api-error";
import { TravelPlanService } from "../services/repository/travel-plan-service";
import type {
  CreateTravelPlanRequest,
  TravelPlan,
  TravelPlanStatus,
} from "../services/repository/types";
import { Pressable, ScrollView, Text, View } from "./tw";

type FormMode = { type: "create" } | { type: "edit"; plan: TravelPlan } | null;

type DateField = "departure" | "return";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const STATUS_COPY: Record<
  TravelPlanStatus,
  { label: string; color: string; backgroundColor: string }
> = {
  PLANNED: {
    label: "Terencana",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
  },
  ONGOING: {
    label: "Berlangsung",
    color: "#0F766E",
    backgroundColor: "#ECFDF5",
  },
  COMPLETED: {
    label: "Selesai",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
  },
  CANCELLED: {
    label: "Dibatalkan",
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
};

function parseDateOnly(value: string): Date | null {
  if (!DATE_PATTERN.test(value)) return null;

  const [year, month, day] = value.split("-").map((part) => Number(part));
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function todayDateOnly(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function formatDate(value: string): string {
  const date = parseDateOnly(value);
  if (!date) return value;
  return formatDisplayDate(date);
}

function formatDisplayDate(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function validateTravelPayload(
  payload: CreateTravelPlanRequest,
): string | null {
  const destination = payload.destination.trim();

  if (!destination) return "Tujuan perjalanan wajib diisi.";
  if (destination.length > 120) return "Tujuan maksimal 120 karakter.";

  const departure = parseDateOnly(payload.departureDate);
  if (!departure) return "Tanggal berangkat harus format YYYY-MM-DD.";

  const returnDate = parseDateOnly(payload.returnDate);
  if (!returnDate) return "Tanggal kembali harus format YYYY-MM-DD.";

  if (departure < todayDateOnly()) {
    return "Tanggal berangkat tidak boleh di masa lalu.";
  }

  if (returnDate < departure) {
    return "Tanggal kembali tidak boleh sebelum tanggal berangkat.";
  }

  return null;
}

function StatusBadge({ status }: { status: TravelPlanStatus }) {
  const copy = STATUS_COPY[status];

  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: copy.backgroundColor }}
    >
      <Text className="text-[11px] font-bold" style={{ color: copy.color }}>
        {copy.label}
      </Text>
    </View>
  );
}

function StockReadinessBadge({ plan }: { plan: TravelPlan }) {
  const readiness = plan.stockReadiness;
  const Icon = readiness.isAllStockEnough ? PackageCheck : PackageX;
  const color = readiness.isAllStockEnough ? "#10B981" : "#EF4444";
  const label = readiness.isAllStockEnough
    ? "Stok cukup"
    : `Kurang ${Math.max(0, readiness.totalNeeded - readiness.totalAvailable)}`;

  return (
    <View className="flex-row items-center gap-1.5">
      <Icon color={color} size={14} strokeWidth={2.25} />
      <Text className="text-[12px] font-bold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

function TravelPlanCard({
  plan,
  onOpen,
}: {
  plan: TravelPlan;
  onOpen: (plan: TravelPlan) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="rounded-card border border-brand-border bg-brand-white p-4 active:opacity-90"
      onPress={() => onOpen(plan)}
    >
      <View className="gap-3">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-1.5">
              <MapPin color="#263238" size={14} strokeWidth={2} />
              <Text
                className="flex-1 text-[16px] font-extrabold text-brand-ink"
                numberOfLines={1}
              >
                {plan.destination}
              </Text>
            </View>

            <Text
              className="text-[12px] text-brand-ink"
              style={{ opacity: 0.5 }}
            >
              {formatDate(plan.departureDate)} - {formatDate(plan.returnDate)}
            </Text>
          </View>

          <StatusBadge status={plan.status} />
        </View>

        <View className="flex-row items-center justify-between rounded-control bg-brand-mist px-3 py-2.5">
          <View className="flex-row items-center gap-1.5">
            <CalendarDays color="#263238" size={14} strokeWidth={2} />
            <Text className="text-[12px] font-semibold text-brand-ink">
              {plan.durationDays} hari
            </Text>
          </View>

          <StockReadinessBadge plan={plan} />
        </View>

        {!plan.isEditable ? (
          <Text
            className="text-[11px] text-brand-ink"
            style={{ opacity: 0.45 }}
          >
            Rencana ini hanya bisa dilihat.
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

function TravelPlanFormModal({
  mode,
  onClose,
  onSuccess,
}: {
  mode: FormMode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState<Date>(todayDateOnly());
  const [returnDate, setReturnDate] = useState<Date>(todayDateOnly());
  const [activeDateField, setActiveDateField] = useState<DateField | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const visible = mode !== null;

  useEffect(() => {
    if (!mode) {
      setDestination("");
      setDepartureDate(todayDateOnly());
      setReturnDate(todayDateOnly());
      setActiveDateField(null);
      setError(null);
      setIsSubmitting(false);
      return;
    }

    if (mode.type === "edit") {
      const parsedDeparture = parseDateOnly(mode.plan.departureDate);
      const parsedReturn = parseDateOnly(mode.plan.returnDate);

      setDestination(mode.plan.destination);
      setDepartureDate(parsedDeparture ?? todayDateOnly());
      setReturnDate(parsedReturn ?? parsedDeparture ?? todayDateOnly());
    } else {
      setDestination("");
      setDepartureDate(todayDateOnly());
      setReturnDate(todayDateOnly());
    }

    setActiveDateField(null);
    setError(null);
    setIsSubmitting(false);
  }, [mode]);

  async function handleSubmit() {
    if (!mode) return;

    const payload: CreateTravelPlanRequest = {
      destination: destination.trim(),
      departureDate: formatDateForApi(departureDate),
      returnDate: formatDateForApi(returnDate),
    };

    const validationError = validateTravelPayload(payload);

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (mode.type === "edit") {
        await TravelPlanService.updatePlan(mode.plan.id, payload);
      } else {
        await TravelPlanService.createPlan(payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal menyimpan rencana perjalanan.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDateChange(selectedDate?: Date) {
    if (!selectedDate || !activeDateField) return;

    const nextDate = new Date(selectedDate);
    nextDate.setHours(0, 0, 0, 0);

    if (activeDateField === "departure") {
      setDepartureDate(nextDate);
      if (returnDate < nextDate) setReturnDate(nextDate);
      return;
    }

    setReturnDate(nextDate < departureDate ? departureDate : nextDate);
  }

  const inputStyle = {
    borderWidth: 1.5,
    borderColor: "#D9E5E5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: "#263238",
    backgroundColor: "#F5FBFA",
  } as const;

  const datePickerValue =
    activeDateField === "return" ? returnDate : departureDate;

  const datePickerMinimum =
    activeDateField === "return" ? departureDate : todayDateOnly();

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={StyleSheet.absoluteFillObject}
          />

          <View
            className="overflow-hidden rounded-t-[20px] bg-brand-white"
            style={{
              backgroundColor: "#FFFFFF",
              maxHeight: "85%",
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <ScrollView
              contentContainerClassName="gap-4 px-5 pb-8 pt-5"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={{ backgroundColor: "#FFFFFF" }}
            >
              <View className="flex-row items-center justify-between">
                <Text className="text-[17px] font-bold text-brand-ink">
                  {mode?.type === "edit"
                    ? "Ubah Perjalanan"
                    : "Tambah Perjalanan"}
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
                <Text
                  className="text-[12px] font-semibold text-brand-ink"
                  style={{ opacity: 0.65 }}
                >
                  Tujuan
                </Text>

                <TextInput
                  maxLength={120}
                  onChangeText={setDestination}
                  placeholder="Contoh: Bandung, Jawa Barat"
                  placeholderTextColor="rgba(38,50,56,0.3)"
                  style={inputStyle}
                  value={destination}
                />
              </View>

              <View className="flex-row gap-3">
                <View className="flex-1 gap-1.5">
                  <Text
                    className="text-[12px] font-semibold text-brand-ink"
                    style={{ opacity: 0.65 }}
                  >
                    Berangkat
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[48px] flex-row items-center justify-between rounded-[10px] border border-brand-border bg-brand-mist px-3 py-3 active:opacity-80"
                    onPress={() => setActiveDateField("departure")}
                  >
                    <Text className="text-[14px] font-semibold text-brand-ink">
                      {formatDisplayDate(departureDate)}
                    </Text>

                    <CalendarDays color="#263238" size={17} strokeWidth={2} />
                  </Pressable>
                </View>

                <View className="flex-1 gap-1.5">
                  <Text
                    className="text-[12px] font-semibold text-brand-ink"
                    style={{ opacity: 0.65 }}
                  >
                    Kembali
                  </Text>

                  <Pressable
                    accessibilityRole="button"
                    className="min-h-[48px] flex-row items-center justify-between rounded-[10px] border border-brand-border bg-brand-mist px-3 py-3 active:opacity-80"
                    onPress={() => setActiveDateField("return")}
                  >
                    <Text className="text-[14px] font-semibold text-brand-ink">
                      {formatDisplayDate(returnDate)}
                    </Text>

                    <CalendarDays color="#263238" size={17} strokeWidth={2} />
                  </Pressable>
                </View>
              </View>

              {activeDateField ? (
                <View className="gap-2 rounded-card border border-brand-border bg-brand-mist p-3">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-[13px] font-bold text-brand-ink">
                      {activeDateField === "departure"
                        ? "Pilih tanggal berangkat"
                        : "Pilih tanggal kembali"}
                    </Text>

                    <Pressable
                      accessibilityRole="button"
                      className="rounded-full bg-brand-white px-3 py-1"
                      onPress={() => setActiveDateField(null)}
                    >
                      <Text className="text-[12px] font-bold text-brand-ink">
                        Selesai
                      </Text>
                    </Pressable>
                  </View>

                  <DateTimePicker
                    display={Platform.OS === "ios" ? "inline" : "calendar"}
                    minimumDate={datePickerMinimum}
                    mode="date"
                    onChange={(_, selectedDate) => {
                      handleDateChange(selectedDate);
                      if (Platform.OS !== "ios") setActiveDateField(null);
                    }}
                    value={datePickerValue}
                  />
                </View>
              ) : null}

              {error ? (
                <Text className="text-[13px]" style={{ color: "#EF4444" }}>
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
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function TravelPlanDetailModal({
  plan,
  isLoading,
  error,
  onClose,
  onEdit,
  onCancel,
}: {
  plan: TravelPlan | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onEdit: (plan: TravelPlan) => void;
  onCancel: (plan: TravelPlan) => void;
}) {
  const isVisible = Boolean(plan) || isLoading || Boolean(error);

  const shortage = plan
    ? Math.max(
        0,
        plan.stockReadiness.totalNeeded - plan.stockReadiness.totalAvailable,
      )
    : 0;

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={isVisible}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "flex-end",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <Pressable
          accessibilityRole="button"
          onPress={onClose}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          className="overflow-hidden rounded-t-[22px] bg-brand-white"
          style={{
            backgroundColor: "#FFFFFF",
            maxHeight: "90%",
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22,
          }}
        >
          <View className="flex-row items-center justify-between border-b border-brand-border bg-brand-white px-5 py-4">
            <View className="flex-1 gap-0.5 pr-3">
              <Text className="text-[17px] font-extrabold text-brand-ink">
                Detail Perjalanan
              </Text>

              {plan ? (
                <Text
                  className="text-[12px] text-brand-ink"
                  numberOfLines={1}
                  style={{ opacity: 0.5 }}
                >
                  {plan.destination}
                </Text>
              ) : null}
            </View>

            <Pressable
              accessibilityRole="button"
              className="h-8 w-8 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
              onPress={onClose}
            >
              <X color="#263238" size={16} strokeWidth={2} />
            </Pressable>
          </View>

          <ScrollView
            className="bg-brand-mist"
            contentContainerClassName="gap-4 px-5 py-5"
            showsVerticalScrollIndicator={false}
            style={{ backgroundColor: "#F5FBFA" }}
          >
            {isLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator color="#263238" />
              </View>
            ) : null}

            {!isLoading && error ? (
              <View className="rounded-card border border-brand-border bg-brand-white p-4">
                <Text className="text-[13px]" style={{ color: "#EF4444" }}>
                  {error}
                </Text>
              </View>
            ) : null}

            {!isLoading && plan ? (
              <>
                <View className="gap-3 rounded-card border border-brand-border bg-brand-white p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <View className="flex-row items-center gap-1.5">
                        <MapPin color="#263238" size={16} strokeWidth={2} />

                        <Text className="flex-1 text-[19px] font-extrabold text-brand-ink">
                          {plan.destination}
                        </Text>
                      </View>

                      <Text
                        className="text-[12px] text-brand-ink"
                        style={{ opacity: 0.55 }}
                      >
                        Rencana {plan.durationDays} hari
                      </Text>
                    </View>

                    <StatusBadge status={plan.status} />
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 gap-1 rounded-card border border-brand-border bg-brand-white p-3">
                    <View className="flex-row items-center gap-1.5">
                      <CalendarDays color="#263238" size={14} strokeWidth={2} />

                      <Text
                        className="text-[11px] font-bold text-brand-ink"
                        style={{ opacity: 0.5 }}
                      >
                        Berangkat
                      </Text>
                    </View>

                    <Text className="text-[14px] font-extrabold text-brand-ink">
                      {formatDate(plan.departureDate)}
                    </Text>
                  </View>

                  <View className="flex-1 gap-1 rounded-card border border-brand-border bg-brand-white p-3">
                    <View className="flex-row items-center gap-1.5">
                      <Clock3 color="#263238" size={14} strokeWidth={2} />

                      <Text
                        className="text-[11px] font-bold text-brand-ink"
                        style={{ opacity: 0.5 }}
                      >
                        Kembali
                      </Text>
                    </View>

                    <Text className="text-[14px] font-extrabold text-brand-ink">
                      {formatDate(plan.returnDate)}
                    </Text>
                  </View>
                </View>

                <View className="gap-3 rounded-card border border-brand-border bg-brand-white p-4">
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1 gap-1">
                      <Text className="text-[15px] font-bold text-brand-ink">
                        Kesiapan stok obat
                      </Text>

                      <Text
                        className="text-[12px] text-brand-ink"
                        style={{ opacity: 0.55 }}
                      >
                        Total tersedia {plan.stockReadiness.totalAvailable} dari{" "}
                        {plan.stockReadiness.totalNeeded} dosis
                      </Text>
                    </View>

                    <View
                      className="rounded-full px-3 py-1"
                      style={{
                        backgroundColor: plan.stockReadiness.isAllStockEnough
                          ? "#ECFDF5"
                          : "#FEF2F2",
                      }}
                    >
                      <Text
                        className="text-[11px] font-bold"
                        style={{
                          color: plan.stockReadiness.isAllStockEnough
                            ? "#10B981"
                            : "#EF4444",
                        }}
                      >
                        {plan.stockReadiness.isAllStockEnough
                          ? "Aman"
                          : "Kurang " + shortage}
                      </Text>
                    </View>
                  </View>

                  {plan.stockReadiness.stocks.length === 0 ? (
                    <View className="rounded-control bg-brand-mist px-4 py-3">
                      <Text
                        className="text-[13px] text-brand-ink"
                        style={{ opacity: 0.55 }}
                      >
                        Belum ada stok aktif untuk dihitung.
                      </Text>
                    </View>
                  ) : (
                    plan.stockReadiness.stocks.map((stock) => (
                      <View
                        className="gap-2 rounded-control border border-brand-border bg-brand-mist px-4 py-3"
                        key={stock.stockId}
                      >
                        <View className="flex-row items-center justify-between gap-3">
                          <Text className="flex-1 text-[14px] font-bold text-brand-ink">
                            {stock.medicineName}
                          </Text>

                          {stock.isEnough ? (
                            <CheckCircle2
                              color="#10B981"
                              size={17}
                              strokeWidth={2.25}
                            />
                          ) : (
                            <AlertTriangle
                              color="#EF4444"
                              size={17}
                              strokeWidth={2.25}
                            />
                          )}
                        </View>

                        <View className="flex-row gap-2">
                          <View className="flex-1 rounded-[8px] bg-brand-white px-3 py-2">
                            <Text
                              className="text-[10px] font-bold text-brand-ink"
                              style={{ opacity: 0.45 }}
                            >
                              Butuh
                            </Text>

                            <Text className="text-[14px] font-extrabold text-brand-ink">
                              {stock.neededQuantity}
                            </Text>
                          </View>

                          <View className="flex-1 rounded-[8px] bg-brand-white px-3 py-2">
                            <Text
                              className="text-[10px] font-bold text-brand-ink"
                              style={{ opacity: 0.45 }}
                            >
                              Tersedia
                            </Text>

                            <Text className="text-[14px] font-extrabold text-brand-ink">
                              {stock.availableQuantity}
                            </Text>
                          </View>

                          <View className="flex-1 rounded-[8px] bg-brand-white px-3 py-2">
                            <Text
                              className="text-[10px] font-bold text-brand-ink"
                              style={{ opacity: 0.45 }}
                            >
                              Kurang
                            </Text>

                            <Text
                              className="text-[14px] font-extrabold"
                              style={{
                                color:
                                  stock.shortageQuantity > 0
                                    ? "#EF4444"
                                    : "#263238",
                              }}
                            >
                              {stock.shortageQuantity}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>

                {!plan.isEditable ? (
                  <View className="rounded-card border border-brand-border bg-brand-white p-4">
                    <Text
                      className="text-[12px] text-brand-ink"
                      style={{ opacity: 0.55 }}
                    >
                      Rencana ini sudah tidak bisa diubah.
                    </Text>
                  </View>
                ) : null}
              </>
            ) : null}
          </ScrollView>

          {plan?.isEditable ? (
            <View className="flex-row gap-3 border-t border-brand-border bg-brand-white px-5 py-4">
              <Pressable
                accessibilityRole="button"
                className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-control bg-brand-ink active:opacity-70"
                onPress={() => onEdit(plan)}
              >
                <Edit3 color="#FFFFFF" size={15} strokeWidth={2} />

                <Text className="text-[14px] font-bold text-brand-white">
                  Ubah
                </Text>
              </Pressable>

              <Pressable
                accessibilityRole="button"
                className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-control border border-brand-border bg-brand-white active:opacity-70"
                onPress={() => onCancel(plan)}
              >
                <XCircle color="#EF4444" size={15} strokeWidth={2} />

                <Text
                  className="text-[14px] font-bold"
                  style={{ color: "#EF4444" }}
                >
                  Batalkan
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export function TravelPlansScreen() {
  const router = useRouter();

  const [plans, setPlans] = useState<TravelPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refetchKey, setRefetchKey] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [detailPlan, setDetailPlan] = useState<TravelPlan | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setLoadError(null);

    TravelPlanService.listPlans(
      { page: 1, limit: 50, sortBy: "departureDate", sortOrder: "asc" },
      { signal: controller.signal },
    )
      .then((response) => {
        setPlans(response.data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;

        setLoadError(
          err instanceof ApiError
            ? err.message
            : "Gagal memuat rencana perjalanan.",
        );

        setIsLoading(false);
      });

    return () => controller.abort();
  }, [refetchKey]);

  function refreshPlans() {
    setRefetchKey((value) => value + 1);
  }

  async function openDetail(plan: TravelPlan) {
    setDetailPlan(plan);
    setIsDetailLoading(true);
    setDetailError(null);

    try {
      const detail = await TravelPlanService.getPlan(plan.id);
      setDetailPlan(detail);
    } catch (err) {
      setDetailError(
        err instanceof ApiError
          ? err.message
          : "Gagal memuat detail perjalanan.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  }

  function handleEdit(plan: TravelPlan) {
    setDetailPlan(null);
    setFormMode({ type: "edit", plan });
  }

  function handleCancel(plan: TravelPlan) {
    Alert.alert(
      "Batalkan perjalanan?",
      `Rencana ke ${plan.destination} akan dibatalkan tanpa menghapus data.`,
      [
        { text: "Kembali", style: "cancel" },
        {
          text: "Batalkan",
          style: "destructive",
          onPress: () => {
            void submitCancel(plan);
          },
        },
      ],
    );
  }

  async function submitCancel(plan: TravelPlan) {
    setIsCancelling(true);

    try {
      await TravelPlanService.cancelPlan(plan.id);
      setDetailPlan(null);
      refreshPlans();
    } catch (err) {
      Alert.alert(
        "Gagal membatalkan",
        err instanceof ApiError
          ? err.message
          : "Rencana perjalanan belum berhasil dibatalkan.",
      );
    } finally {
      setIsCancelling(false);
    }
  }

  return (
    <View className="flex-1 bg-brand-mist">
      <View className="flex-row items-center gap-3 border-b border-brand-border bg-brand-white px-5 pb-4 pt-14">
        <Pressable
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
          onPress={() => router.back()}
        >
          <ArrowLeft color="#263238" size={18} strokeWidth={2} />
        </Pressable>

        <View className="flex-1">
          <Text className="text-[18px] font-extrabold text-brand-ink">
            Mode Perjalanan
          </Text>

          <Text className="text-[11px] text-brand-ink" style={{ opacity: 0.5 }}>
            Rencanakan stok obat sebelum bepergian
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Perbarui"
          accessibilityRole="button"
          className="h-9 w-9 items-center justify-center rounded-full bg-brand-mist active:opacity-70"
          onPress={refreshPlans}
        >
          <RefreshCw color="#263238" size={17} strokeWidth={2} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          className="h-9 flex-row items-center gap-1.5 rounded-control bg-brand-ink px-3 active:opacity-70"
          onPress={() => setFormMode({ type: "create" })}
        >
          <Plus color="#FFFFFF" size={15} strokeWidth={2} />

          <Text className="text-[12px] font-bold text-brand-white">Tambah</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-3 px-5 py-5"
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View className="items-center py-10">
            <ActivityIndicator color="#263238" />
          </View>
        ) : null}

        {!isLoading && loadError ? (
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
              onPress={refreshPlans}
            >
              <RefreshCw color="#FFFFFF" size={13} strokeWidth={2} />

              <Text className="text-[13px] font-bold text-brand-white">
                Coba lagi
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoading && !loadError && plans.length === 0 ? (
          <View className="items-center gap-3 rounded-card border border-brand-border bg-brand-white p-8">
            <Plane
              color="#263238"
              size={34}
              strokeWidth={1.6}
              style={{ opacity: 0.25 }}
            />

            <Text
              className="text-center text-[14px] text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              Belum ada rencana perjalanan.{"\n"}Tap Tambah untuk membuat
              rencana baru.
            </Text>
          </View>
        ) : null}

        {!isLoading &&
          !loadError &&
          plans.map((plan) => (
            <TravelPlanCard key={plan.id} onOpen={openDetail} plan={plan} />
          ))}
      </ScrollView>

      {isCancelling ? (
        <View
          className="absolute inset-0 items-center justify-center"
          style={{ backgroundColor: "rgba(245,251,250,0.55)" }}
        >
          <ActivityIndicator color="#263238" />
        </View>
      ) : null}

      <TravelPlanFormModal
        mode={formMode}
        onClose={() => setFormMode(null)}
        onSuccess={refreshPlans}
      />

      <TravelPlanDetailModal
        error={detailError}
        isLoading={isDetailLoading}
        onCancel={handleCancel}
        onClose={() => {
          setDetailPlan(null);
          setDetailError(null);
        }}
        onEdit={handleEdit}
        plan={detailPlan}
      />
    </View>
  );
}
