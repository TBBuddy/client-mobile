import { router, Stack } from "expo-router";
import { Eye, EyeOff } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  TextInput as RNTextInput,
  type TextInput as RNTextInputType,
} from "react-native";

import { ApiError } from "../services/repository/api-error";
import { AuthService } from "../services/repository/auth-service";
import { useAuth } from "../context/auth-context";
import { Image, Pressable, ScrollView, Text, View } from "./tw";

export function LoginScreen() {
  const { signIn } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordRef = useRef<RNTextInputType>(null);

  async function handleLogin() {
    if (!identifier.trim()) {
      setError("Masukkan email atau username kamu.");
      return;
    }
    if (!password) {
      setError("Masukkan kata sandi kamu.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const loginData = await AuthService.login({ identifier: identifier.trim(), password });
      signIn(loginData.user);
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

  return (
    <>
      <Stack.Screen options={{ title: "" }} />

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
              Masuk
            </Text>
            <Text
              className="text-[15px] leading-5 text-brand-ink"
              style={{ opacity: 0.55 }}
            >
              Selamat datang kembali di TBuddy
            </Text>
          </View>

          <View className="gap-4">
            <View className="gap-1.5">
              <Text className="text-[13px] font-semibold text-brand-ink">
                Email atau username
              </Text>
              <View className="h-[50px] justify-center rounded-control border border-brand-border bg-brand-white px-4">
                <RNTextInput
                  autoCapitalize="none"
                  autoComplete="username"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onChangeText={(v) => {
                    setIdentifier(v);
                    if (error) setError(null);
                  }}
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  placeholder="Masukkan email atau username"
                  placeholderTextColor="rgba(38,50,56,0.35)"
                  returnKeyType="next"
                  style={{ color: "#263238", fontSize: 15 }}
                  value={identifier}
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
                  autoComplete="password"
                  autoCorrect={false}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (error) setError(null);
                  }}
                  onSubmitEditing={handleLogin}
                  placeholder="Masukkan kata sandi"
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

            <Pressable accessibilityRole="button" onPress={() => {}}>
              <Text className="text-[14px] font-semibold text-brand-aqua">
                Lupa kata sandi?
              </Text>
            </Pressable>

            {error ? (
              <View className="rounded-control border border-red-200 bg-red-50 px-4 py-3">
                <Text className="text-[13px] leading-5 text-red-600">
                  {error}
                </Text>
              </View>
            ) : null}
          </View>

          <Pressable
            accessibilityRole="button"
            className="h-[52px] items-center justify-center rounded-control bg-brand-ink"
            disabled={isLoading}
            onPress={handleLogin}
            style={isLoading ? { opacity: 0.7 } : undefined}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-[17px] font-bold text-brand-white">
                Masuk
              </Text>
            )}
          </Pressable>

          <View className="flex-row items-center justify-center gap-1">
            <Text
              className="text-[14px] text-brand-ink"
              style={{ opacity: 0.6 }}
            >
              Belum punya akun?
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/register")}
            >
              <Text className="text-[14px] font-bold text-brand-aqua">
                Buat akun
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
