// The backend now serializes checkinDate via toLocaleDateString('id-ID', { timeZone:
// 'Asia/Jakarta' }), i.e. "D/M/YYYY" (e.g. "25/6/2026", not zero-padded).
// Normalize to a canonical "YYYY-MM-DD" key (also tolerates the old ISO format).
export function normalizeCheckinDate(value: string): string {
  if (!value) return value;
  if (value.includes("/")) {
    const [d, m, y] = value.split("/");
    if (d && m && y) {
      return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  }
  return value;
}
