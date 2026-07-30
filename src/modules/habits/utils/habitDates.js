export function localDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function parseLocalDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return localDateKey(date) === value ? date : null;
}

export function shiftDays(date, amount) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function weekDays(reference = new Date()) {
  const start = shiftDays(reference, -reference.getDay());
  return Array.from({ length: 7 }, (_, index) => {
    const date = shiftDays(start, index);
    return { date, key: localDateKey(date) };
  });
}
