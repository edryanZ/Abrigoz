function dateOf(item) {
  return String(item?.date ?? item?.createdAt ?? item?.updatedAt ?? item?.data ?? "").slice(0, 10);
}

function hash(text) {
  let value = 2166136261;
  for (const character of text) { value ^= character.charCodeAt(0); value = Math.imul(value, 16777619); }
  return value >>> 0;
}

export function collectMemoryMarkers(data) {
  const candidates = [
    ...data.diary.map((item) => ({ id: `reflection:${item.id}`, type: "Reflexão", date: dateOf(item) })),
    ...data.favorites.map((item) => ({ id: `favorite:${item.id}`, type: "Algo que faz bem", date: dateOf(item) })),
    ...data.calendar.map((item) => ({ id: `day:${item.id}`, type: "Meu Dia", date: dateOf(item) })),
  ].filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date));
  if (candidates.length <= 8) return candidates;
  const step = Math.max(1, Math.floor(candidates.length / 8));
  return candidates.filter((_, index) => index % step === 0).slice(0, 8);
}

export function buildAbstractMemoryMap(data) {
  return collectMemoryMarkers(data).map((item) => {
    const seed = hash(`${item.id}:${item.date}`);
    return { ...item, x: 10 + seed % 80, y: 12 + Math.floor(seed / 97) % 72 };
  });
}

export function buildSymbolicConstellation(data, date = new Date()) {
  if (!collectMemoryMarkers(data).length) return [];
  const seed = hash(`${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`);
  return Array.from({ length: 7 }, (_, index) => ({
    id: `symbol-${index}`,
    x: 8 + ((seed + index * 29) % 84),
    y: 12 + ((seed * (index + 3) + index * 17) % 72),
  }));
}
