const ACCESS_TOKEN_KEY = 'tbuddy.access-token';
let webToken: string | null = null;

export class TokenStorage {
  static async getAccessToken(): Promise<string | null> {
    if (!process.env.EXPO_OS || process.env.EXPO_OS === 'web') {
      return webToken;
    }

    const SecureStore = await import('expo-secure-store');
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  }

  static async setAccessToken(token: string): Promise<void> {
    if (!process.env.EXPO_OS || process.env.EXPO_OS === 'web') {
      webToken = token;
      return;
    }

    const SecureStore = await import('expo-secure-store');
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  }

  static async clearAccessToken(): Promise<void> {
    if (!process.env.EXPO_OS || process.env.EXPO_OS === 'web') {
      webToken = null;
      return;
    }

    const SecureStore = await import('expo-secure-store');
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  }
}
