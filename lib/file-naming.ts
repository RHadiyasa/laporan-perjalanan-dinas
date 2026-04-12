const INDONESIAN_MONTHS: Record<string, number> = {
  januari: 0,
  februari: 1,
  maret: 2,
  april: 3,
  mei: 4,
  juni: 5,
  juli: 6,
  agustus: 7,
  september: 8,
  oktober: 9,
  november: 10,
  desember: 11,
};

/**
 * Parse an Indonesian date string into a Date object.
 *
 * Handles formats such as:
 *   "Rabu, 01 April 2026"
 *   "01 April 2026"
 *   "1 april 2026"
 *
 * Returns null if the string cannot be parsed.
 */
function parseIndonesianDate(raw: string): Date | null {
  if (!raw || !raw.trim()) return null;

  // Strip optional day-name prefix ("Rabu, ") and normalise whitespace
  const cleaned = raw.trim().replace(/^[^,]+,\s*/, "").trim();

  // Expect: "<day> <monthName> <year>"
  const parts = cleaned.split(/\s+/);
  if (parts.length < 3) return null;

  const day = parseInt(parts[0], 10);
  const monthKey = parts[1].toLowerCase();
  const year = parseInt(parts[parts.length - 1], 10);

  if (isNaN(day) || isNaN(year)) return null;

  const month = INDONESIAN_MONTHS[monthKey];
  if (month === undefined) return null;

  const date = new Date(year, month, day);

  // Sanity-check: Date constructor silently rolls over invalid days
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatYYYYMMDD(date: Date): string {
  const y = date.getFullYear().toString().padStart(4, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  return `${y}${m}${d}`;
}

/**
 * Generate a file name for the SPD document.
 *
 * @param hariTanggal - Indonesian date string, e.g. "Rabu, 01 April 2026"
 * @param perihal     - Meeting subject/topic
 * @returns e.g. "20260401_Laporan SPD Rapat Koordinasi Ketenagalistrikan"
 */
export function generateFileName(hariTanggal: string, perihal: string): string {
  const date = parseIndonesianDate(hariTanggal) ?? new Date();
  const yyyymmdd = formatYYYYMMDD(date);
  const safePerihal = perihal.trim() || "Laporan";
  return `${yyyymmdd}_Laporan SPD ${safePerihal}`;
}
