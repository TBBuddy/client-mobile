declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
    EXPO_OS?: 'android' | 'ios' | 'web';
  }
}
