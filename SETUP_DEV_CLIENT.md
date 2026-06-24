# Setup Dev Client — TBuddy Mobile

Panduan ini untuk anggota tim yang mengonsumsi branch `feat/facilities-maps`.

---

## Mode demo — baca ini dulu

Branch ini memperkenalkan dua mode operasional yang berbeda:

| Mode | Tools | Kapan dipakai |
|---|---|---|
| **General demo** | Expo Go (`npx expo start`) | Beranda, Check-in, Komunitas, Profil |
| **Map demo** | Dev client APK + HP Android fisik | Tab Faskes → mode Peta |

**Expo Go tetap bisa dipakai untuk fitur non-map.** Kalau kamu buka tab Faskes di Expo Go,
mode **List** dan **Search** jalan normal. Mode **Peta** menampilkan placeholder
*"Peta tidak tersedia di Expo Go"* — ini bukan bug, ini by design.

Untuk demo fitur peta secara penuh, gunakan dev client APK yang diinstall ke
**HP Android fisik** (bukan emulator — GPS real device lebih reliable untuk demo).

---

## Prasyarat

Pastikan semua sudah terinstall di mesin kamu sebelum mulai:

| Tool | Versi minimal | Cek |
|---|---|---|
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Android Studio | Stable | buka Android Studio |
| EAS CLI | 12+ | `eas --version` |
| Java (JDK) | 17 atau 21 | `javac -version` |

### Install EAS CLI (kalau belum)
```bash
npm install -g eas-cli
```

### Pastikan JAVA_HOME sudah diset
JDK bawaan Android Studio ada di:
- **Windows**: `C:\Program Files\Android\Android Studio\jbr`
- **macOS**: `/Applications/Android Studio.app/Contents/jbr/Contents/Home`

Set di environment variable:
```bash
# Windows (PowerShell — jalankan sebagai admin atau user)
[Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")

# macOS / Linux
export JAVA_HOME=/Applications/Android Studio.app/Contents/jbr/Contents/Home
```

Restart terminal setelah set, lalu verifikasi:
```bash
javac -version
# Harus muncul: javac 17.x atau javac 21.x
```

---

## Step 1 — Merge branch

```bash
git checkout dev
git pull origin dev
git merge origin/feat/facilities-maps
```

Atau sesuai flow git tim (bisa juga lewat PR).

---

## Step 2 — Install dependencies

```bash
cd client-mobile
npm install
```

Package baru yang masuk dari branch ini:
- `@maplibre/maplibre-react-native` — peta OSM (native)
- `expo-location` — GPS / lokasi user (native)
- `expo-dev-client` — pengganti Expo Go

---

## Step 3 — Dapatkan dev client APK

Ada dua cara. Pilih salah satu.

---

### Cara A — Download APK dari EAS (direkomendasikan, paling mudah)

1. Minta link download APK dari **Rama** (build sudah ada di EAS)
2. Atau buka sendiri di: https://expo.dev → login → project `client-mobile` → **Builds**
3. Pilih build terbaru dengan profile `development`
4. Download file `.apk`

> Kamu butuh akses ke EAS project. Minta Rama tambahkan akunmu di:
> expo.dev → project → **Settings → Members → Invite**

---

### Cara B — Build sendiri via EAS

Gunakan ini kalau kamu menambahkan native package baru, atau tidak bisa akses build Rama.

**Login ke Expo dulu:**
```bash
eas login
# masukkan email & password akun Expo kamu
```

**Jalankan build:**
```bash
cd client-mobile
eas build --profile development --platform android
```

Jawab prompt yang muncul:
- *"Would you like to create a project?"* → **Y** (kalau project belum terhubung)
- *"Generate a new Android Keystore?"* → **Y**

Build berlangsung di cloud (~15-20 menit). Setelah selesai:
- EAS akan tanya *"Install and run on emulator?"* → **Y** (kalau emulator sudah nyala), atau
- Download APK dari link yang muncul di terminal

---

## Step 4A — Install APK ke HP Android fisik (untuk demo peta)

Ini yang dipakai untuk **demo fitur peta**. HP fisik memberikan GPS yang real,
lebih reliable untuk demo dibanding emulator.

### Aktifkan USB Debugging di HP kamu
1. Buka **Pengaturan** → **Tentang Ponsel**
2. Ketuk **Nomor Build** 7× sampai muncul *"Kamu sekarang seorang developer"*
3. Kembali ke **Pengaturan** → **Opsi Pengembang** → aktifkan **USB Debugging**

### Install via kabel USB
```bash
# Sambungkan HP ke PC via USB, lalu:
adb devices
# Harus muncul device ID (bukan "unauthorized")

adb install path/ke/file.apk
```

### Install langsung dari HP (tanpa kabel)
1. Download file `.apk` dari link yang dibagikan Rama langsung ke HP
2. Buka file manager → tap file `.apk` → **Install**
3. Kalau muncul *"Install dari sumber tidak dikenal"* → izinkan dari browser/file manager kamu

Setelah install, app **TBuddy** muncul di drawer aplikasi HP.

---

## Step 4B — Setup emulator Android (opsional, untuk non-map testing)

> Lewati kalau kamu hanya butuh demo peta (gunakan HP fisik di Step 4A).
> Emulator berguna untuk testing fitur non-map tanpa HP.

1. Buka **Android Studio** → **Device Manager** (ikon HP kanan atas)
2. Klik **Create Device**
3. Pilih: **Pixel 9 Pro** → Next
4. System Image: **API 35**, **Google Play**, **x86_64** — pilih yang **bukan** `16 KB Page Size`
5. Klik **Finish**
6. Klik tombol ▶ untuk nyalakan emulator
7. Drag & drop file `.apk` ke jendela emulator untuk install, atau:
   ```bash
   adb install path/ke/file.apk
   ```

---

## Step 5 — Jalankan Metro

Di terminal (di folder `client-mobile`):
```bash
npx expo start --dev-client
```

Output yang diharapkan:
```
Using development build
Metro waiting on http://localhost:8081
```

---

## Step 6 — Connect app ke Metro

### HP fisik (via USB atau WiFi)
1. Sambungkan HP ke PC via USB (atau pastikan HP & PC satu jaringan WiFi)
2. Buka app **TBuddy** di HP
3. Muncul launcher *"TBuddy Development Build"*
4. Di terminal Metro, tekan **`a`** untuk auto-connect (USB), atau
5. Di launcher screen: tap **Enter URL manually** → isi `http://<IP-PC-kamu>:8081`
   - Cek IP PC kamu: `ipconfig` (Windows) → cari IPv4 di adapter WiFi

### Emulator (kalau pakai emulator)
1. Buka app **TBuddy** di emulator
2. Di terminal Metro, tekan **`a`** untuk auto-connect

App TBuddy akan load dan masuk ke halaman login/welcome.

---

## Kapan perlu build ulang?

| Situasi | Perlu build ulang APK? |
|---|---|
| Merge `feat/facilities-maps` (ini) | ✅ Ya — ada native package baru |
| Edit file `.tsx`, `.ts`, hook, komponen | ❌ Tidak — hot reload langsung |
| Tambah/hapus native package (`npm install xyz`) | ✅ Ya |
| Ubah `app.json` plugins | ✅ Ya |
| Ubah env variable / API URL | ❌ Tidak — cukup restart Metro |

> **Aturan praktis**: kalau kamu `npm install` sesuatu yang punya folder `android/` atau `ios/` di dalam package-nya → butuh build ulang.

---

## Troubleshooting

### Mode Peta menampilkan placeholder, bukan peta
→ Kamu sedang membuka app di **Expo Go**. Ini normal — peta membutuhkan dev client APK.
Gunakan HP fisik + APK dari Step 4A untuk fitur peta.

### "No Java compiler found" saat build lokal
→ `JAVA_HOME` belum diset atau masih mengarah ke JRE (bukan JDK).
Ikuti langkah set `JAVA_HOME` di bagian Prasyarat di atas.

### "SDK location not found"
→ Buat file `android/local.properties` dengan isi:
```
sdk.dir=C:/Users/<NamaKamu>/AppData/Local/Android/Sdk
```
(Windows) atau
```
sdk.dir=/Users/<NamaKamu>/Library/Android/sdk
```
(macOS)

### "Filename longer than 260 characters" (Windows)
→ Ini batasan path Windows. Gunakan EAS cloud build (Cara A atau B di Step 3) — build di cloud Linux, bebas dari batasan ini.

### App terbuka tapi blank / tidak load
→ Pastikan Metro sudah jalan (`npx expo start --dev-client`), lalu tekan `r` di terminal Metro untuk reload.

### Lokasi tidak terbaca di emulator
→ Buka **Extended Controls** (tombol `...` di toolbar emulator) → **Location** → cari lokasi → klik **Set Location**.
Untuk langsung update lokasi tanpa restart app:
```bash
adb emu geo fix <longitude> <latitude>
# contoh Jakarta:
adb emu geo fix 106.8272 -6.1754
```

---

## Catatan untuk tim backend

`FacilitiesController` saat ini hanya memiliki `@ApiBearerAuth()` yang merupakan
**anotasi Swagger saja, bukan guard nyata**. Endpoint faskes saat ini bisa diakses
tanpa token. Jika endpoint faskes seharusnya membutuhkan autentikasi, perlu
ditambahkan `@UseGuards(AuthGuard)` di controller.

---

## Kontak

Pertanyaan soal setup ini → **Rama** (author branch `feat/facilities-maps`)
