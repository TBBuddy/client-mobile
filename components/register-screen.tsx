import { useHeaderHeight } from "@react-navigation/elements";
import { router, Stack } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput as RNTextInput,
  type TextInput as RNTextInputType,
} from "react-native";

import { ApiError } from "../services/repository/api-error";
import { AuthService } from "../services/repository/auth-service";
import type { UserRole } from "../services/repository/types";
import { Image, Pressable, ScrollView, Text, View } from "./tw";

type Role = Extract<UserRole, "PATIENT" | "SUPPORTER">;

const ROLES: { value: Role; label: string; description: string }[] = [
  {
    value: "PATIENT",
    label: "Pasien",
    description: "Saya sedang menjalani pengobatan TB",
  },
  {
    value: "SUPPORTER",
    label: "Pendukung",
    description: "Saya mendampingi pasien TB",
  },
];

export function RegisterScreen() {
  const headerHeight = useHeaderHeight();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<Role>("PATIENT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usernameRef = useRef<RNTextInputType>(null);
  const emailRef = useRef<RNTextInputType>(null);
  const passwordRef = useRef<RNTextInputType>(null);

  function validate(): string | null {
    if (!username.trim()) return "Username wajib diisi.";
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
      return "Username hanya boleh huruf, angka, dan garis bawah (3–30 karakter).";
    if (!email.trim()) return "Email wajib diisi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Format email tidak valid.";
    if (!password) return "Kata sandi wajib diisi.";
    if (password.length < 8) return "Kata sandi minimal 8 karakter.";
    return null;
  }

  async function handleRegister() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await AuthService.register({
        email: email.trim().toLowerCase(),
        username: username.trim().toLowerCase(),
        password,
        fullName: fullName.trim() || undefined,
        role,
      });

      router.replace("/(auth)/login");
    } catch (err) {
      if (err instanceof ApiError && err.code === "REQUEST_CANCELLED") return;
      setError(
        err instanceof ApiError
          ? err.message
          : "Terjadi kesalahan yang tidak diketahui. Coba lagi.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function clearError() {
    if (error) setError(null);
  }

  return (
    <>
      <Stack.Screen options={{ title: "" }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={headerHeight}
        style={{ flex: 1 }}
      >
      <ScrollView
        className="flex-1 bg-brand-mist"
        contentContainerClassName="items-center px-5 pb-10 pt-2"
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full gap-6" style={{ maxWidth: 430 }}>
          <Image
            accessibilityLabel="Ilustrasi TBuddy"
            className="aspect-[1.3077] w-full rounded-[28px] border border-brand-border bg-brand-white"
            contentFit="cover"
            source={require("../assets/images/welcome-hero.png")}
          />

          <View className="gap-1">
            <Text className="text-[32px] font-extrabold leading-[38px] text-brand-ink">
              Buat akun
            </Text>
            <Text
              className="text-[15px] leading-5 text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              Bergabung dengan TBuddy
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-[13px] font-semibold text-brand-ink">
              Saya adalah
            </Text>
            <View className="flex-row gap-2">
              {ROLES.map((r) => {
                const isSelected = role === r.value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    className={[
                      "flex-1 items-center justify-center rounded-control border py-3",
                      isSelected
                        ? "border-brand-ink bg-brand-ink"
                        : "border-brand-border bg-brand-white",
                    ].join(" ")}
                    key={r.value}
                    onPress={() => setRole(r.value)}
                  >
                    <Text
                      className={[
                        "text-[14px] font-bold",
                        isSelected ? "text-brand-white" : "text-brand-ink",
                      ].join(" ")}
                    >
                      {r.label}
                    </Text>
                    <Text
                      className={[
                        "mt-0.5 text-center text-[11px] leading-4",
                        isSelected ? "text-brand-white" : "text-brand-ink",
                      ].join(" ")}
                      style={{ opacity: isSelected ? 0.7 : 0.5 }}
                    >
                      {r.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Nama lengkap{" "}
                <Text
                  className="text-[13px] font-normal text-brand-ink"
                  style={{ opacity: 0.45 }}
                >
                  (opsional)
                </Text>
              </Text>
              <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-white px-4">
                <RNTextInput
                  autoCapitalize="words"
                  autoComplete="name"
                  autoCorrect={false}
                  onChangeText={(v) => {
                    setFullName(v);
                    clearError();
                  }}
                  onSubmitEditing={() => usernameRef.current?.focus()}
                  placeholder="Masukkan nama lengkap"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  returnKeyType="next"
                  style={{ color: "#263238", fontSize: 15 }}
                  value={fullName}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Username
              </Text>
              <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-white px-4">
                <RNTextInput
                  autoCapitalize="none"
                  autoComplete="username-new"
                  autoCorrect={false}
                  onChangeText={(v) => {
                    setUsername(v);
                    clearError();
                  }}
                  onSubmitEditing={() => emailRef.current?.focus()}
                  placeholder="Masukkan username"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={usernameRef}
                  returnKeyType="next"
                  style={{ color: "#263238", fontSize: 15 }}
                  value={username}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Email
              </Text>
              <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-white px-4">
                <RNTextInput
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={(v) => {
                    setEmail(v);
                    clearError();
                  }}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  placeholder="nama@email.com"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={emailRef}
                  returnKeyType="next"
                  style={{ color: "#263238", fontSize: 15 }}
                  value={email}
                />
              </View>
            </View>

            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Kata sandi
              </Text>
              <View className="h-[50px] flex-row items-center rounded-control border border-brand-border bg-brand-white px-4">
                <RNTextInput
                  autoCapitalize="none"
                  autoComplete="password-new"
                  autoCorrect={false}
                  onChangeText={(v) => {
                    setPassword(v);
                    clearError();
                  }}
                  onSubmitEditing={handleRegister}
                  placeholder="Minimal 8 karakter"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  ref={passwordRef}
                  returnKeyType="go"
                  secureTextEntry={!showPassword}
                  style={{ color: "#263238", flex: 1, fontSize: 15 }}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  accessibilityRole="button"
                  className="p-1"
                  onPress={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? (
                    <EyeOff
                      color="#263238"
                      size={20}
                      strokeWidth={2}
                      style={{ opacity: 0.4 }}
                    />
                  ) : (
                    <Eye
                      color="#263238"
                      size={20}
                      strokeWidth={2}
                      style={{ opacity: 0.4 }}
                    />
                  )}
                </Pressable>
              </View>
            </View>

            {error ? (
              <View className="rounded-control border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-[13px] leading-5 text-red-600">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="gap-3">
            <Pressable
              accessibilityRole="button"
              className="h-[52px] items-center justify-center rounded-control bg-brand-ink"
              disabled={isLoading}
              onPress={handleRegister}
              style={isLoading ? { opacity: 0.7 } : undefined}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-[17px] font-bold text-brand-white">
                  Buat akun
                </Text>
              )}
            </Pressable>
          </View>

          <View className="flex-row items-center justify-center gap-1">
            <Text
              className="text-[14px] text-brand-ink"
              style={{ opacity: 0.6 }}
            >
              Sudah punya akun?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text className="text-[14px] font-bold text-brand-aqua">
                Masuk
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
