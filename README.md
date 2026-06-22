# TBuddy Mobile

Mobile client TBuddy berbasis Expo Router, TypeScript, NativeWind, dan Axios.

## Prasyarat

- Node.js 20 atau lebih baru
- npm
- Expo Go yang mendukung Expo SDK 54

## Menjalankan aplikasi

```bash
npm install
npx expo start
```

Salin konfigurasi environment jika ingin mengganti API:

```bash
copy .env.example .env
```

Default API development:

```text
https://dev-api-tbuddy.taulikha.site/api/v1
```

Nilai dengan prefix `EXPO_PUBLIC_` tersedia di bundle client. Jangan menyimpan
secret, private key, token, password, atau credential server di file tersebut.

## Pemeriksaan

```bash
npm run lint
npm run typecheck
npm run doctor
```

## Struktur utama

- `app/`: route Expo Router.
- `components/`: komponen UI dan wrapper NativeWind.
- `services/repository/`: Axios client, token storage, DTO, dan service class.
- `assets/images/`: logo dan ilustrasi welcome TBuddy.

Contoh pemanggilan API:

```ts
import { AuthService } from './services/repository';

const session = await AuthService.login({
  identifier: 'aulia@example.com',
  password: 'Aman12345',
});
```
