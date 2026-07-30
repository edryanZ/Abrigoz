export function localDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseLocalDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return localDateKey(date) === value ? date : null;
}

export function shiftLocalDate(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function resolvePeriod(kind, reference = new Date(), custom = {}) {
  const end = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  let start = end;
  if (kind === "7d") start = shiftLocalDate(end, -6);
  if (kind === "30d") start = shiftLocalDate(end, -29);
  if (kind === "month") start = new Date(end.getFullYear(), end.getMonth(), 1);
  if (kind === "year") start = new Date(end.getFullYear(), 0, 1);
  if (kind === "all") start = new Date(2000, 0, 1);
  if (kind === "custom") {
    start = parseLocalDate(custom.start) ?? end;
    const customEnd = parseLocalDate(custom.end);
    if (customEnd) return start <= customEnd
      ? { start: localDateKey(start), end: localDateKey(customEnd) }
      : { start: localDateKey(customEnd), end: localDateKey(start) };
  }
  return { start: localDateKey(start), end: localDateKey(end) };
}

export function previousPeriod(period) {
  const start = parseLocalDate(period.start);
  const end = parseLocalDate(period.end);
  const length = Math.round((end - start) / 86400000) + 1;
  return {
    start: localDateKey(shiftLocalDate(start, -length)),
    end: localDateKey(shiftLocalDate(start, -1)),
  };
}

export function inPeriod(value, period) {
  const key = String(value ?? "").slice(0, 10);
  return Boolean(parseLocalDate(key)) && key >= period.start && key <= period.end;
}

export function enumerateDays(period, maximum = 370) {
  const start = parseLocalDate(period.start);
  const end = parseLocalDate(period.end);
  if (!start || !end) return [];
  const result = [];
  for (let date = start; date <= end && result.length < maximum;
    date = shiftLocalDate(date, 1)) {
    result.push(localDateKey(date));
  }
  return result;
}
