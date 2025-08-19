/**
 * Normalize PSGC codes to comparable province-level strings.
 * - Provinces from PSGC API are typically 9 digits (e.g., 034900000)
 * - Our ADM2 codes may be 9 or 10 digits depending on source
 * Strategy: if length is 10, trim to first 9 digits.
 */
export function normalizeProvincePsgc(code: string | number | null | undefined): string | null {
  if (code == null) return null
  const s = String(code).trim()
  if (!s) return null
  if (s.length === 9) return s
  if (s.length === 10) {
    // Many ADM2 codes in the 2023 dataset insert a 0 at index 2 for regions >= 10.
    // Example: '1001300000' -> remove char at index 2 => '101300000' (Bukidnon)
    return (s.slice(0, 2) + s.slice(3)).slice(0, 9)
  }
  return s
}


