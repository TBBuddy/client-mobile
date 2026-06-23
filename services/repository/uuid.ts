function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  const cryptoObj =
    typeof globalThis !== 'undefined'
      ? (globalThis.crypto as Crypto | undefined)
      : undefined;

  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(bytes);
    return bytes;
  }

  // Hermes (Expo SDK 54 / RN 0.81) has no global Web Crypto. An idempotency
  // key only needs to be unique, not cryptographically secure, so fall back
  // to Math.random when getRandomValues is unavailable.
  for (let i = 0; i < length; i += 1) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function uuidV4(): string {
  const bytes = randomBytes(16);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  return [
    bytes.slice(0, 4),
    bytes.slice(4, 6),
    bytes.slice(6, 8),
    bytes.slice(8, 10),
    bytes.slice(10, 16),
  ]
    .map((seg) =>
      Array.from(seg)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    .join('-');
}
