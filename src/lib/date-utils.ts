const WEEKDAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"] as const;

const DEFAULT_TIME_ZONE = "America/Lima";

export function getWeekdayIndexFromISO(isoString: string, timeZone: string = DEFAULT_TIME_ZONE): number {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return -1;
  }

  const key = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone })
    .format(date)
    .toLowerCase() as (typeof WEEKDAY_KEYS)[number] | string;

  const normalizedKey = key.slice(0, 3) as (typeof WEEKDAY_KEYS)[number];
  return WEEKDAY_KEYS.indexOf(normalizedKey);
}

export function getMonthBoundsFromInput(monthInput?: string) {
  const now = new Date();
  let year = now.getFullYear();
  let monthIndex = now.getMonth();

  if (monthInput && /^\d{4}-\d{2}$/.test(monthInput)) {
    const [yearStr, monthStr] = monthInput.split("-");
    year = Number(yearStr);
    monthIndex = Number(monthStr) - 1;
  }

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  const inputValue = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

  return { start, end, inputValue };
}

export function getLastNDaysRange(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  return { start, end };
}
