function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function getTodayDateKey(now = new Date()) {
  return toDateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function parseSaleDateKey(value?: string | null): string | null {
  if (!value || typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
  }

  const slashDateMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashDateMatch) {
    const month = Number(slashDateMatch[1]);
    const day = Number(slashDateMatch[2]);
    const year = Number(slashDateMatch[3]);
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900) {
      return toDateKey(year, month, day);
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return toDateKey(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
}

export function isSaleExpired(saleEndRaw: string, todayDateKey = getTodayDateKey()) {
  const saleEndDateKey = parseSaleDateKey(saleEndRaw);
  if (!saleEndDateKey) return false;
  return saleEndDateKey < todayDateKey;
}

